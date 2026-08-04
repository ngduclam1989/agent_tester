---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/features/FEAT-CAT-PROD-LIST.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-LIST"
source_feat_sha: "d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118"
generated_at: "2026-06-30T00:00:00Z"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
experience: "garage-mobile"
platform: mobile
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-CAT-PROD-LIST"]
consumes_bff_feats: ["FEAT-CAT-PROD-LIST"]
screens_touched:
  - "lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart"
  - "lib/ui/inventory_catalog/internal_product_list/internal_product_search_page.dart"
  - "lib/ui/inventory_catalog/internal_product_list/internal_product_filter_page.dart"
flutter_packages:
  - flutter_bloc
  - freezed
  - get_it
  - injectable
  - auto_route
  - graphql_flutter
  - gap
figma_refs:
  - "Product/ux/figma-mobile/wave03-cat-prod-list.md (node 21254:52585 — FEAT-CAT-PROD-LIST 9 screen variants, file 5YU4H3iY726P8KNxI9oCYF)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "a72a1e067d6d58ef210d7e8bf5645599229d79701391f56be8f8e84c02557176"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-LIST.mobile.md"
  bundle_generated_at: "2026-06-30T00:00:00Z"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-PROD-LIST (Mobile): Danh sách mã sản phẩm nội bộ

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (`Product/ux/figma-mobile/wave03-cat-prod-list.md`). Cross-tier coordination ở §12.
> **Scope CR-1782373204**: PROD mobile = view-only (LIST + DETAIL). Không có Create/Edit/Delete/Import/Export trên mobile.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-LIST` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `internal_product_list_page.dart`, `internal_product_search_page.dart`, `internal_product_filter_page.dart` |
| Flutter packages | `flutter_bloc`, `freezed`, `get_it`, `injectable`, `auto_route`, `graphql_flutter`, `gap` |
| Cross-tier consume | BE: `FEAT-CAT-PROD-LIST` \| BFF: `FEAT-CAT-PROD-LIST` |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-LIST.md`](../../../../../Product/features/FEAT-CAT-PROD-LIST.md) |
| Source version | v7 |
| Source SHA | `d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118` |
| Generated at | 2026-06-30T00:00:00Z |

---

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu nhanh danh sách mã sản phẩm nội bộ — chuẩn dùng để tính tồn kho và mapping SKU — để định vị sản phẩm cụ thể, kiểm tra trạng thái/tính chất, và truy cập các thao tác quản lý. Feature là điểm vào chính của subsystem catalog-v2 trong gf-inventory, cung cấp nền dữ liệu cho toàn bộ nghiệp vụ nhập/xuất/tồn kho V2. Kết quả tra cứu được phân trang và lọc đa chiều (từ khóa, trạng thái, tính chất, nhóm vật tư).

## 2. Trách nhiệm Mobile (garage-mobile)

- Render `InternalProductListPage` hiển thị danh sách mã sản phẩm nội bộ dạng card (`InternalProductListCard`) trong `CustomScaffold` — entry point catalog-v2 trên mobile, **view-only** per CR-1782373204.
- Cung cấp 3-tab status filter (Tất cả / Đang hoạt động / Ngừng hoạt động) qua `ListTabBarWidget`; AppBar trailing: icon search (mở `InternalProductSearchPage`) + icon filter (mở `InternalProductFilterPage`) — cả hai là full-page route (KHÔNG bottom-sheet per Figma VV).
- Render `InternalProductSearchPage` full-page với SearchInput trong AppBar, 3 trạng thái: keyword prompt (mặc định) → no-results (khi query trả rỗng) → results (khi có kết quả + count header).
- Render `InternalProductFilterPage` full-page với 2 dropdown (Tính chất + Nhóm hàng) + footer 2 nút (Thiết lập lại + Áp dụng) — KHÔNG có dropdown Trạng thái (status filter xử lý qua TabBar ở màn list).
- Quản lý state machine qua 3 Cubit: `InternalProductListCubit` (list + tab filter), `InternalProductSearchCubit` (search), `InternalProductFilterCubit` (filter form). Skeleton loading qua `LoadingRowShimmerWidget` (auto-rendered bởi `ListWidget` khi `isInitial=true`); pull-to-refresh + pull-up load-more qua `SmartRefresher`.
- Consume GraphQL op `searchInternalProducts` (BFF §6.1) qua `graphql_flutter` + `InternalProductRepository` — không có write operation nào.
- **KHÔNG render** nút Thêm/Sửa/Xóa/Import/Export trên bất kỳ màn nào (scope CR-1782373204). Tap card code → navigate sang `FEAT-CAT-PROD-DETAIL` (scope riêng).

---

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: 11 source AC-IDs (AC-1..AC-11). Mỗi AC xuất hiện ở §3 hoặc §4.

### Cluster A — Màn danh sách chính

#### AC-1 → Mobile render màn danh sách sản phẩm nội bộ với AppBar + TabBar + card list

- **Khi**: người dùng navigate đến `InternalProductListPage`
- **Mobile phải**: render `CustomAppBar` với title "Sản phẩm" + trailing icons [Icons.search, Icons.tune]; `ListTabBarWidget` 3 tab (Tất cả / Đang hoạt động / Ngừng hoạt động); `ListWidget` với `InternalProductListCard` per item; `SmartRefresher` pull-to-refresh
- **State transition**: `InternalProductListState.initial` → cubit.load() → `loading` (skeleton 20 rows `LoadingRowShimmerWidget`) → `loaded(content)` / `loadedEmpty` / `error`
- **Widget**: `InternalProductListPage` → `ListWidget` → `InternalProductListCard` (xem §5.2)
- **GraphQL op**: `searchInternalProducts(input: {})` — default: page=0, size=20, tab="Tất cả" (xem NEED CONFIRMATION §AC-4)
- **i18n key (ARB)**: `internalProductList_title` → "Sản phẩm" / "Products"
- **a11y**: `Semantics(label: "Danh sách mã sản phẩm nội bộ")` trên `ListView`
- **Ref**: BFF `searchInternalProducts` op §6.1; Figma `wave03-cat-prod-list.md` §Screen 21526:44347 + §ProductListAppBar

#### AC-2 → Mobile render card sản phẩm với đầy đủ thông tin hiển thị

- **Khi**: `ListWidget` render mỗi item trong `content[]` từ BFF
- **Mobile phải**: render `InternalProductListCard` với layout:
  - Row trên: mã code dạng link-style xanh (`AppColors.textBluePrimary` hoặc `AppColors.textActivePrimary`) + `StatusBadge` (ACTIVE=green, INACTIVE=grey per M-trap-3 — xem §4.1)
  - Tên sản phẩm → `AppTextStyle.textHeadingH4` color=`AppColors.textPrimary`
  - Divider 1px `AppColors.borderPrimary`
  - 2x2 attribute grid: Row 1 [Tính chất / {nature display} | Nhóm / {materialGroupName}]; Row 2 [ĐVT / {mainUnitDisplayName} | Thương hiệu / {brand}]
  - KHÔNG có icon prefix trên attribute rows (phân biệt với GRP-LIST — per Figma §ProductListCard _negative_coverage)
  - KHÔNG có thumbnail/image trên card (imageUrl dùng ở detail screen)
- **State transition**: không riêng — inline trong `loaded` state
- **Widget**: `InternalProductListCard` (local, Build-new — xem §5.2)
- **GraphQL op**: fields từ `InternalProductListItem` — `code`, `name`, `status`, `nature`, `mainUnitCode`, `mainUnitDisplayName`, `materialGroupId`, `materialGroupName`, `brand`, `imageUrl`, `id`
- **i18n key (ARB)**: attribute labels (`internalProductList_labelNature`, `internalProductList_labelGroup`, `internalProductList_labelUnit`, `internalProductList_labelBrand`)
- **a11y**: `Semantics(label: "${product.code} — ${product.name}")` trên card
- **Ref**: Figma §Screen 21526:44347 §ProductListCard; BFF `InternalProductListItem` SDL (bff/FEAT-CAT-PROD-LIST.md §5.1)

---

### Cluster B — Tìm kiếm

#### AC-3 → Mobile cung cấp full-page search route với 3 trạng thái

- **Khi**: người dùng tap icon search (AppBar trailing) trên `InternalProductListPage`
- **Mobile phải**: navigate sang `InternalProductSearchPage` (full-page route, KHÔNG bottom-sheet per Figma VV); AppBar thay thế title bằng `AppTextField` SearchInput với prefix Icons.search (20px, `AppColors.iconSecondary`) + placeholder "Tìm kiếm"; TabBar 3 tab giữ nguyên từ parent route (Figma §Screen 21235:24802)
  - **State 1 — Keyword prompt** (input rỗng): body hiển thị header "Tìm kiếm sản phẩm theo từ khoá" + 3 bullet (Mã nội bộ / Tên sản phẩm / SKU liên kết); cubit emit `searchDefaultPrompt`
  - **State 2 — No results** (input không rỗng, kết quả rỗng): magnifying-glass illustration + "Không có kết quả phù hợp" bold + "Vui lòng thử lại" caption; cubit emit `searchNoResults`
  - **State 3 — Results** (input không rỗng, có kết quả): count header '1 kết quả tìm kiếm cho "{keyword}"' (curly quotes Unicode — không dùng ASCII straight quotes) + `ListWidget` `InternalProductListCard`; cubit emit `searchLoaded(items, count, keyword)`
  - Clear-× icon (Icons.cancel, 20px, `AppColors.iconTertiary`) xuất hiện trailing SearchInput khi input.text != ""
- **State transition**: `searchDefaultPrompt` → (user types) → `searchLoading` → `searchLoaded` / `searchNoResults`; back-button → pop sang `InternalProductListPage`
- **Widget**: `InternalProductSearchPage` + `InternalProductSearchCubit` (xem §5.4)
- **GraphQL op**: `searchInternalProducts(input: {keyword: "...", status: <tab filter>, page: 0, size: 20})`
- **i18n key (ARB)**: `internalProductSearch_placeholder` "Tìm kiếm"; `internalProductSearch_prompt` "Tìm kiếm sản phẩm theo từ khoá"; `internalProductSearch_noResults` "Không có kết quả phù hợp"; `internalProductSearch_retry` "Vui lòng thử lại"
- **a11y**: `Semantics(label: "Nhập từ khóa tìm kiếm")` cho SearchInput; `SemanticsService.announce` khi kết quả thay đổi
- **Ref**: Figma §Screen 21235:24802 (prompt), §Screen 21235:24823 (no-results), §Screen 21526:40447 (results với curly-quote count header)

---

### Cluster C — Bộ lọc

#### AC-4 → Mobile status filter qua 3-tab TabBar; mặc định tab "Tất cả"

- **Khi**: người dùng tap tab trong `ListTabBarWidget` (Tất cả / Đang hoạt động / Ngừng hoạt động)
- **Mobile phải**: re-call `searchInternalProducts` với `status` mapping: "Đang hoạt động" → `ACTIVE`, "Ngừng hoạt động" → `INACTIVE`, "Tất cả" → **NEED CONFIRMATION**: intent là hiển thị TẤT CẢ (active + inactive), Figma §Screen 21526:44347 VV xác nhận mixed badges khi tab "Tất cả" active. Nếu BE defaults null → ACTIVE, BFF cần bổ sung `status=ALL` enum hoặc cơ chế explicit "no filter". Spec mobile: tab "Tất cả" KHÔNG truyền `status` arg (null) — dev xác nhận behavior với Architecture Authority trước S6.3.
  - Tab indicator underline di chuyển theo tab được chọn — MAY KHÔNG mirror Figma anomaly của frame 21528:25516 (frame đó vẫn hiển thị tab "Đang hoạt động" active khi filter=Ngừng hoạt động — DEV implement underline trên đúng tab đang active theo state, bất kể Figma frame lag)
- **State transition**: tab change → cubit.changeTab(status) → `loading` → `loaded` / `loadedEmpty`
- **Widget**: `ListTabBarWidget` (`lib/ui/widgets/list/list_tab_bar_widget.dart`) — Priority 2 share/
  - Selected tab: `AppTextStyle.textSubtitleS5` color=`AppColors.textActivePrimary`; indicator color=`AppColors.borderActive`
  - Unselected: same style color=`AppColors.textSecondary`
- **i18n key (ARB)**: `internalProductList_tabAll` "Tất cả"; `internalProductList_tabActive` "Đang hoạt động"; `internalProductList_tabInactive` "Ngừng hoạt động"
- **Ref**: Figma §TabBar/StatusFilter [identifier: ProductStatusTabBar]; BE default ACTIVE per be/FEAT-CAT-PROD-LIST.md §3 AC-4

#### AC-5 → Mobile filter page có dropdown Tính chất (4 giá trị GOODS/TOOL/SERVICE/OTHER)

- **Khi**: người dùng tap icon filter (Icons.tune) trên `InternalProductListPage` → navigate sang `InternalProductFilterPage`
- **Mobile phải**: render dropdown "Tính chất" với label "Tính chất" + placeholder "Chọn tính chất hàng hoá" (diacritic 'hoá' — verbatim Figma §VV 21235:25937) + 4 options:
  - `GOODS` → "Vật tư hàng hóa"
  - `TOOL` → "CCDC"
  - `SERVICE` → "Dịch vụ"
  - `OTHER` → "Khác"
  - Widget: `DropdownTextField` (canonical Garage mobile dropdown substitute — KHÔNG `AppDropdown`, NOT EXISTS)
- **State transition**: selection → `InternalProductFilterCubit.selectNature(value)`
- **GraphQL op**: `searchInternalProducts(input: {nature: "GOODS", ...})` — truyền sau khi user tap "Áp dụng"
- **i18n key (ARB)**: `internalProductFilter_labelNature` "Tính chất"; `internalProductFilter_placeholderNature` "Chọn tính chất hàng hoá"
- **Ref**: Figma §Screen 21235:25937 + §Screen 21235:27908 (filled); BR-CAT-PROD-019 (4 nature values); BFF `InternalProductNature` enum (bff/FEAT-CAT-PROD-LIST.md §5.1)

#### AC-6 → Mobile filter page có dropdown Nhóm hàng (options từ BFF)

- **Khi**: người dùng tap dropdown "Nhóm hàng" trong `InternalProductFilterPage`
- **Mobile phải**: render dropdown "Nhóm hàng" với label "Nhóm hàng" + placeholder "Chọn nhóm hàng" + options populate từ BFF query (xem §6.1). Lựa chọn selected hiển thị text trong field + chevron-down; options là text-only rows (KHÔNG có checkbox/radio per Figma §VV 21235:27908).
  - Widget: `DropdownTextField` canonical
- **Filter page footer**: 2-button row — "Thiết lập lại" (secondary, `AppColors.buttonBackgroundSecondary`) left + "Áp dụng" (primary blue, `AppColors.buttonBackgroundPrimary`) right; KHÔNG xếp dọc
  - AppBar title filter page = "Bộ lọc" (verbatim — KHÔNG "Bộ lọc sản phẩm" per Figma §VV 21235:25937)
- **State transition**: `InternalProductFilterCubit.selectGroup(id)` → "Áp dụng" tap → pop + emit filters → `InternalProductListCubit.applyFilters(nature, materialGroupId)` → reload list
  - "Thiết lập lại" → `InternalProductFilterCubit.reset()` → clear both dropdowns
- **GraphQL op**: `searchInternalProducts(input: {materialGroupId: "uuid", ...})`; options load: query `searchMaterialGroups` (Q1) — **RESOLVED** per CR-1782381477 (2026-06-25): mobile chỉ dùng Q1, KHÔNG `getMaterialGroupTree` (Q2). Xem §6.1.
- **i18n key (ARB)**: `internalProductFilter_labelGroup` "Nhóm hàng"; `internalProductFilter_placeholderGroup` "Chọn nhóm hàng"; `internalProductFilter_btnReset` "Thiết lập lại"; `internalProductFilter_btnApply` "Áp dụng"
- **Ref**: Figma §Screen 21235:25937 §AppButton/ThietLapLai + §AppButton/ApDung; Figma §Screen 21235:27908 (filled + dropdown open)

---

### Cluster D — Phân trang

#### AC-7 → Mobile implement pull-up load-more thay cho phân trang kiểu web

- **Khi**: người dùng scroll xuống cuối danh sách (pull-up gesture) hoặc pull-down để refresh
- **Mobile phải**: dùng `SmartRefresher` + `RefreshController` từ `pull_to_refresh: ^2.0.0` (package đã có trong pubspec — KHÔNG `infinite_scroll_pagination`, NOT in pubspec) qua `ListWidget` canonical:
  - Pull-down: refresh → reload page=0, giữ filter hiện tại → `refreshController.refreshCompleted()`
  - Pull-up (load-more): page++, append items → `refreshController.loadComplete()` / `loadNoData()` khi totalPages reached
  - Default: `page=0`, `size=20`, `sort` mặc định (code,asc)
- **State transition**: pull-down → `InternalProductListCubit.refresh()` → `loading` → `loaded`; pull-up → `loadMore()` → append items
- **Widget**: `ListWidget` (`lib/ui/widgets/list/list_widget.dart`) với `SmartRefresher` + `RefreshController`
- **Ref**: BFF `PageInfo { page, size, totalElements, totalPages, hasNext }` → `hasNext=false` khi `loadNoData()`; be/FEAT-CAT-PROD-LIST.md §3 AC-7 (Spring Pageable default page=0 size=20)

---

### Cluster E — Thao tác

#### AC-8 → N/A (Row actions per status — mobile view-only, không có Sửa/Xóa)

Mobile scope CR-1782373204 loại bỏ mọi row action (Sửa/Xóa/Kích hoạt). `InternalProductListCard` KHÔNG có action icon nào. Status ACTIVE vs INACTIVE chỉ ảnh hưởng màu `StatusBadge` (xem §4.1). Tap card code → navigate sang FEAT-CAT-PROD-DETAIL (scope riêng). Xem `fe-web/FEAT-CAT-PROD-LIST.md §3 AC-8` cho web row actions.

#### AC-9 → N/A (Toolbar actions — web-only per CR-1782373204)

Nút "Thêm sản phẩm", "Tải lên" (import), "Xuất file" (export) chỉ có trên web. Mobile KHÔNG render FAB, BottomBar "Thêm", hoặc action sheet với các nút này. Figma §Screen 21526:44347 _negative_coverage xác nhận "KHÔNG BottomBar/FAB". Xem `fe-web/FEAT-CAT-PROD-LIST.md §3 AC-9`.

---

### Cluster F — Phân quyền & tenant

#### AC-10 → Mobile hiển thị đúng phạm vi tenant, cả 2 vai trò xem ngang nhau

- **Khi**: mọi call `searchInternalProducts`
- **Mobile phải**: KHÔNG truyền `tenantId` qua GraphQL arg; BFF extract từ JWT `X-Tenant-Id` header và scope query về gf-inventory. Mobile chỉ render items trả về từ BFF — không có client-side filtering theo tenant.
- Cả `garage-owner` và `accountant` thấy cùng danh sách read-only — không split role ở mobile. Không có action nào cần kiểm tra permission riêng (view-only scope).
- **Failure mode**: JWT hết hạn → BFF trả `UNAUTHENTICATED` → SnackBar "Phiên đăng nhập hết hạn" → redirect login via auto_route `AuthGuard`
- **Ref**: Critical Rule #4 (tenant isolation); be/FEAT-CAT-PROD-LIST.md §3 AC-10; bff/FEAT-CAT-PROD-LIST.md §3 AC-10

#### AC-11 → Mobile = view-only; mọi write action bị loại bỏ tường minh

- **Mobile phải**: đây là ràng buộc phạm vi cốt lõi — không render bất kỳ nút nào trigger CRUD/Import/Export; KHÔNG có route target cho create/edit/delete/import/export từ màn list. Nếu tương lai có yêu cầu thêm write action → cần CR mới nâng scope.
- Tap mã sản phẩm (blue code text) trên card → navigate sang `FEAT-CAT-PROD-DETAIL` mobile spec (scope riêng, ngoài FEAT-CAT-PROD-LIST)
- **Ref**: CR-1782373204; PKG-W03-inventory-catalog §2.2.4 + §2.3 "Mobile — Internal Product CRUD / Import / Export = web-only"

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám sát 9 screen variants Figma `wave03-cat-prod-list.md` — đặc biệt:
  - **M-trap-3 MANDATORY**: `StatusBadge` "Ngừng hoạt động" trên PROD-LIST = **GREY** (`AppColors.bgBadgeOpen` + `AppColors.textSecondary`). KHÔNG dùng orange như GRP-LIST (GRP-LIST dùng `AppColors.bgBadgeWarning`). Figma §Screen 21526:44347 §Badge/StatusPill VV xác nhận: "card2 shows GREY 'Ngừng hoạt động' (NOT orange)".
  - **Tab indicator Figma anomaly**: frame 21528:25516 "Ngừng hoạt động" Figma vẫn hiển thị tab 2 "Đang hoạt động" active (visual lag). DEV PHẢI implement underline trên tab 3 "Ngừng hoạt động" khi filter đó active — không mirror Figma bug.
  - **Filter AppBar title**: "Bộ lọc" (2 syllable) — KHÔNG "Bộ lọc sản phẩm". Figma §VV 21235:25937 claim 1 ✓.
  - **Filter placeholder diacritic**: "Chọn tính chất hàng hoá" (dấu 'hoá' — KHÔNG 'hóa'). Figma §VV 21235:25937 claim 2 ✓.
  - **Search curly quotes**: count header dùng curly double quotes Unicode (" ") — KHÔNG ASCII straight ("). Figma §Screen 21526:40447 §VV claim 2 ✓.
  - **Card attribute rows**: KHÔNG có leading icon prefix (phân biệt với GRP-LIST). Figma §ProductListCard _negative_coverage ✓.
  - **NO FAB / BottomBar / Create button** trên bất kỳ màn nào — view-only mobile. Figma §VV 21526:44347 claim 3 ✓.
- Design tokens lấy từ `lib/core/common/styles/{app_colors,app_text_styles,app_sizes,app_shadows}.dart`. **KHÔNG** hardcode `Color(0xFF…)` / `TextStyle(...)` / raw int spacing.
  - Card bg: `AppColors.bgBase`; Scaffold bg: `AppColors.bgSecondary`
  - Card shadow: `AppShadows.itemBoxShadow`; card border radius: 8dp
  - Card padding: `EdgeInsets.all(AppSizes.spacing16)`; list separator: `Gap(AppSizes.spacing16)`
  - ACTIVE badge: `AppColors.bgBadgeSuccess` + `AppColors.textSuccessPrimary`
  - INACTIVE badge: `AppColors.bgBadgeOpen` + `AppColors.textSecondary` (GREY — M-trap-3)
  - AppBar title: `AppTextStyle.textHeadingH3` color=`AppColors.textPrimary`
  - Product name in card: `AppTextStyle.textHeadingH4` color=`AppColors.textPrimary`
  - Tab selected: `AppTextStyle.textSubtitleS5` color=`AppColors.textActivePrimary`; indicator=`AppColors.borderActive`
  - Button labels: `AppTextStyle.textSubtitleS4`

### 4.2 State machine + error handling

- Cubit state tường minh: `initial | loading | loaded | loadedEmpty | loadMore | error`
- `ListWidget` tự xử lý: `isInitial=true` → 20 rows `LoadingRowShimmerWidget` skeleton; `isEmpty=true` → `LoadEmpty` (xem §3 AC-1 empty variants)
- Empty state 2 variants phân biệt:
  - EC-1 (no data): grey document illustration (`assets/illustrations/empty_data.svg` hoặc `Icons.description_outlined`) + "Không có dữ liệu" → `AppTextStyle.textSubtitleS4` color=`AppColors.textPrimary`
  - EC-4 (no search results): magnifying-glass illustration (line-art) + "Không có kết quả phù hợp" bold + "Vui lòng thử lại" caption — dùng ở `InternalProductSearchPage` state `searchNoResults`
- Error → SnackBar (KHÔNG Dialog cho list error) — xem §4.9
- KHÔNG silent fail — log qua Sentry/equivalent

### 4.3 Native interaction + permission

- KHÔNG cần camera, photo library, storage, location, microphone permissions cho feature này (view-only list, không upload)
- Không có deeplink hiện tại cho màn list này
- Back gesture (iOS swipe-back / Android back) từ `InternalProductSearchPage` và `InternalProductFilterPage` → pop về `InternalProductListPage` (auto_route pop)

### 4.4 Offline + connectivity

- Feature này yêu cầu kết nối mạng (graphql_flutter query) — KHÔNG offline-first
- Không cần Hive/Isar cache cho list (dữ liệu catalog thay đổi thường xuyên)
- Khi offline: `SmartRefresher` pull-to-refresh trả error → SnackBar "Không có kết nối mạng"; list giữ state cuối đã load
- Retry: pull-to-refresh khi reconnect

### 4.5 i18n + a11y

- Mọi label string qua ARB key (`mobile/gf-garage-app/lib/l10n/intl_en.arb` + `intl_vi.arb`) — KHÔNG hardcode tiếng Việt inline trong widget code (trừ display strings trong widget tree test/debug)
- a11y: `Semantics(label: ...)` cho icon-only buttons (search icon, filter icon, back button); `excludeSemantics` cho decorative divider
- Tap target ≥ 48dp cho mọi interactive element
- Contrast ratio WCAG AA cho StatusBadge (ACTIVE green text + INACTIVE grey text on badge bg)
- Screen reader (TalkBack/VoiceOver): announce khi search results thay đổi via `SemanticsService.announce`

### 4.6 RBAC render + feature flag

- Cả `garage-owner` và `accountant` có quyền xem danh sách — không cần split role
- Không có action button yêu cầu permission check ở mobile (view-only)
- Route guard: `AuthGuard` trên auto_route cho cả 3 pages (yêu cầu đăng nhập) — KHÔNG `PermissionGuard` riêng cho view-only route này

### 4.7 Business rule secondary (UI hint)

BE tier (`be/FEAT-CAT-PROD-LIST.md §9`) là primary enforcement. Mobile chỉ UI hint:
- **BR-CAT-PROD-007**: Mobile render list chỉ items từ BFF response (đã tenant-scoped) — không thêm client filter
- **BR-CAT-PROD-008**: Mã INACTIVE hiển thị `StatusBadge` grey → user nhận biết không dùng trong phiếu mới (mobile view-only, không có action Xem/Sửa row riêng)
- **BR-CAT-PROD-019**: 4 giá trị tính chất populate dropdown filter — hardcode enum display values trên client (GOODS/TOOL/SERVICE/OTHER → display labels)
- **BR-CAT-CMN-003**: Mobile không tự filter keyword — pass keyword xuống BFF/BE nguyên vẹn

### 4.8 Performance

- `ListWidget` canonical (`lib/ui/widgets/list/list_widget.dart`) — KHÔNG raw `ListView.builder`; KHÔNG `infinite_scroll_pagination` (NOT in pubspec)
- `SmartRefresher` + `RefreshController` từ `pull_to_refresh: ^2.0.0` — pull-down refresh + pull-up load-more
- `const` constructor cho `InternalProductListCard` khi không có dynamic prop
- `BlocBuilder` granular — KHÔNG rebuild toàn page; split `InternalProductListCard` thành `const` StatelessWidget

### 4.9 Error code mapping (consume từ BFF)

| Error code (GraphQL) | Display mode | i18n key | Source AC |
|---|---|---|---|
| `UNAUTHENTICATED` (JWT hết hạn) | SnackBar + redirect login | `error_session_expired` | AC-10 |
| `INTERNAL_SERVER_ERROR` (gf-inventory 500) | SnackBar | `error_system_retry` "Lỗi hệ thống, vui lòng thử lại" | AC-1 |
| `BAD_USER_INPUT` (enum filter invalid) | SnackBar | `error_invalid_param` "Tham số không hợp lệ" | AC-4, AC-5 |
| gf-erp-mdm enrichment null (soft-fail) | `mainUnitDisplayName` / `originDisplayName` hiển thị dấu gạch `—` | N/A (fallback display) | AC-2 |
| Network error / timeout | SnackBar | `error_network` "Không có kết nối mạng" | AC-7 |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`. CANONICAL path: `lib/ui/{domain}/{sub_feature}/{name}_page.dart`.

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `InternalProductListPage` | `/inventory/internal-products` | NEW | `21526:44347` (default), `21579:23956` (empty), `21528:25362` (active), `21528:25516` (inactive) | AC-1, AC-2, AC-4, AC-7, AC-10, AC-11 |
| `InternalProductSearchPage` | `/inventory/internal-products/search` | NEW | `21235:24802` (prompt), `21235:24823` (no-results), `21526:40447` (results) | AC-3 |
| `InternalProductFilterPage` | `/inventory/internal-products/filter` | NEW | `21235:25937` (default), `21235:27908` (filled) | AC-5, AC-6 |

### 5.2 Widgets

> Author đã scan `lib/components/{customs,share,ui}/` theo naming-convention inference (bundle §G.X KG implementation.components missing — NEED CONFIRMATION cho actual paths). DEV phải verify paths thực tế trước S6.3. Reuse pattern column header: **"Reuse pattern (priority: customs > share > ui)"**.

| Widget | Path | Change type | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|
| `InternalProductListCard` | `lib/ui/inventory_catalog/internal_product_list/widgets/internal_product_list_card.dart` | NEW | StatelessWidget | Build-new — justification: domain-specific card composition (2x2 attribute grid without icon prefix, code link + StatusBadge layout); no fit at customs/share/ui after scan; pattern domain-new W03 | AC-2 |
| `ListWidget` | `lib/ui/widgets/list/list_widget.dart` | REUSE | StatefulWidget | **Priority 2 — share/** (canonical list pattern) — handles `isInitial/isLoading/isFailure/isEmpty` + auto-skeleton `LoadingRowShimmerWidget` + `SmartRefresher` pull-down/pull-up via `RefreshController` | AC-1, AC-7 |
| `ListTabBarWidget` | `lib/ui/widgets/list/list_tab_bar_widget.dart` | REUSE | StatefulWidget | **Priority 2 — share/** (canonical 3-tab status filter pattern used across GRP-LIST + PROD-LIST) | AC-4 |
| `LoadingRowShimmerWidget` | `lib/ui/widgets/loading/loading_row_shimmer_widget.dart` | REUSE (via ListWidget, indirect) | StatelessWidget | **Priority 2 — share/** (shimmer skeleton, `shimmer: ^3.0.0`; auto-rendered khi `ListWidget.isInitial=true`) | AC-1 |
| `StatusBadge` | `lib/ui/inventory/widgets/status_badge.dart` | REUSE (cross-domain) | StatelessWidget | **Priority 2 — share/** (inventory shared badge; implement `InternalProductStatus implements InventoryStatusInterface` adapter — INACTIVE color = GREY `AppColors.bgBadgeOpen` per M-trap-3, KHÔNG orange) | AC-2 |
| `CustomAppBar` | `lib/components/customs/app_bar/custom_app_bar.dart` *(NEED CONFIRMATION path)* | REUSE | StatelessWidget | **Priority 1 — customs/** (naming convention infer; DEV verify actual path) | AC-1, AC-3 |
| `CustomScaffold` | `lib/components/customs/scaffold/custom_scaffold.dart` *(NEED CONFIRMATION path)* | REUSE | StatelessWidget | **Priority 1 — customs/** (naming convention infer) | AC-1 |
| `DropdownTextField` | canonical Garage mobile dropdown (path NEED CONFIRMATION) | REUSE | StatefulWidget | **Priority 2 — share/** (canonical substitute cho phantom `AppDropdown` — NOT EXISTS; `DropdownTextField` là correct class per template §5.2 note) | AC-5, AC-6 |
| `AppButton` | `lib/components/share/button/app_button.dart` *(NEED CONFIRMATION)* | REUSE | StatelessWidget | **Priority 2 — share/** (filter footer buttons: `AppButton.text` pattern) | AC-6 |

### 5.3 Navigation

| Route | Page | Guard | Notes | AC ref |
|---|---|---|---|---|
| `/inventory/internal-products` | `InternalProductListPage` | `AuthGuard` | Entry point list màn | AC-1, AC-10, AC-11 |
| `/inventory/internal-products/search` | `InternalProductSearchPage` | `AuthGuard` | Push từ AppBar search icon tap | AC-3 |
| `/inventory/internal-products/filter` | `InternalProductFilterPage` | `AuthGuard` | Push từ AppBar filter icon tap; pop → trả `FilterResult` sang ListCubit | AC-5, AC-6 |
| *(out-of-scope)* | `FEAT-CAT-PROD-DETAIL` page | — | Navigate khi tap code link trên card — scope FEAT-CAT-PROD-DETAIL spec riêng | AC-11 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | States | AC ref |
|---|---|---|---|---|
| List + tab filter | Cubit | `lib/ui/inventory_catalog/internal_product_list/internal_product_list_cubit.dart` | `initial \| loading \| loaded(List<InternalProductListItem>, bool hasMore) \| loadedEmpty \| loadMoreLoading \| error(String)` | AC-1,2,4,7,10,11 |
| List state (freezed) | @freezed | `lib/ui/inventory_catalog/internal_product_list/internal_product_list_state.dart` | union state với @freezed | AC-1..7 |
| Search | Cubit | `lib/ui/inventory_catalog/internal_product_list/internal_product_search_cubit.dart` | `defaultPrompt \| searchLoading \| searchLoaded(items, count, keyword) \| searchNoResults \| searchError` | AC-3 |
| Search state | @freezed | `lib/ui/inventory_catalog/internal_product_list/internal_product_search_state.dart` | union state | AC-3 |
| Filter form | Cubit | `lib/ui/inventory_catalog/internal_product_list/internal_product_filter_cubit.dart` | `filterDefault \| filterDirty(nature?, groupId?) \| filterApplied` | AC-5, AC-6 |
| Filter state | @freezed | `lib/ui/inventory_catalog/internal_product_list/internal_product_filter_state.dart` | union state | AC-5, AC-6 |

---

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | How | Repository class | AC ref |
|---|---|---|---|---|
| `searchInternalProducts` | query | `_graphQLService.client.query(QueryOptions(document: gql(searchInternalProductsQuery), variables: {...}))` | `lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` (`InventoryCatalogRepository`, consolidated cross-domain — **sửa 2026-07-01**: KHÔNG có file per-domain `internal_product_repository.dart` riêng) | AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-10 |
| `searchMaterialGroups` *(material group options)* | query | Q1 — **RESOLVED** per CR-1782381477 (2026-06-25): mobile chỉ dùng `searchMaterialGroups`, KHÔNG `getMaterialGroupTree` (Q2). Cùng op + pattern với FEAT-CAT-GRP-LIST mobile §6.1 | `lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` (consolidated, reuse) | AC-6 |

> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #17 enforce). `searchInternalProducts` confirmed tại bff/FEAT-CAT-PROD-LIST.md §6.1.

**Input mapping `searchInternalProducts`**:
```
tab "Tất cả"          → { status: null,      page: 0, size: 20 }  [NEED CONFIRMATION: null → all items]
tab "Đang hoạt động"  → { status: "ACTIVE",   page: 0, size: 20 }
tab "Ngừng hoạt động" → { status: "INACTIVE", page: 0, size: 20 }
keyword search        → { keyword: "abc", status: <current tab>, page: 0, size: 20 }
filter applied        → { nature: "GOODS", materialGroupId: "uuid", status: <tab>, page: 0, size: 20 }
load-more (page++)    → { ..., page: currentPage + 1 }
```

### 6.2 REST endpoints consumed direct (bypass BFF)

Không có — feature này hoàn toàn qua GraphQL BFF.

### 6.3 Offline-first strategy

Feature này online-required. Không implement offline queue hay local Hive cache (catalog thay đổi thường xuyên, không có consistent invalidation trigger).

### 6.4 Platform-specific behaviors

| Concern | iOS | Android | Notes |
|---|---|---|---|
| Back gesture | Swipe-right back gesture | Android back button | pop `InternalProductSearchPage` / `InternalProductFilterPage` → `InternalProductListPage` |
| Font rendering | SF Pro (system) | Roboto / Noto Sans (system) | Không cần font config riêng; `AppTextStyle.*` tự resolve |

---

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/gf-garage-app/lib/**` (Critical Rule #1 boundary isolation).

| Layer | Path glob | Change type | Reuse pattern | Est LoC | AC ref |
|---|---|---|---|---|---|
| Page | `lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart` | NEW | `@RoutePage`, StatelessWidget, BlocProvider | ~200 | AC-1,2,4,7,10,11 |
| Page | `lib/ui/inventory_catalog/internal_product_list/internal_product_search_page.dart` | NEW | `@RoutePage`, StatelessWidget, BlocProvider | ~180 | AC-3 |
| Page | `lib/ui/inventory_catalog/internal_product_list/internal_product_filter_page.dart` | NEW | `@RoutePage`, StatelessWidget, BlocProvider | ~150 | AC-5,6 |
| Local widget | `lib/ui/inventory_catalog/internal_product_list/widgets/internal_product_list_card.dart` | NEW | StatelessWidget (const), `InternalProductListItem` input | ~120 | AC-2 |
| Cubit | `lib/ui/inventory_catalog/internal_product_list/internal_product_list_cubit.dart` | NEW | `BaseCubit<InternalProductListState>`, `@Injectable` | ~120 | AC-1,4,7,10 |
| State | `lib/ui/inventory_catalog/internal_product_list/internal_product_list_state.dart` | NEW | `@freezed` union | ~60 | AC-1 |
| Cubit | `lib/ui/inventory_catalog/internal_product_list/internal_product_search_cubit.dart` | NEW | `BaseCubit<InternalProductSearchState>`, `@Injectable` | ~100 | AC-3 |
| State | `lib/ui/inventory_catalog/internal_product_list/internal_product_search_state.dart` | NEW | `@freezed` union | ~50 | AC-3 |
| Cubit | `lib/ui/inventory_catalog/internal_product_list/internal_product_filter_cubit.dart` | NEW | `BaseCubit<InternalProductFilterState>`, `@Injectable` | ~80 | AC-5,6 |
| State | `lib/ui/inventory_catalog/internal_product_list/internal_product_filter_state.dart` | NEW | `@freezed` union | ~40 | AC-5,6 |
| Repository | `lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` | SHARED (consolidated — **sửa 2026-07-01**: code thật KHÔNG tách per-domain repository riêng, dùng chung 1 `InventoryCatalogRepository` cho cả Group+Product, khớp pattern BUG-W03-013 đã ratify) | `abstract class InventoryCatalogRepository` + `InventoryCatalogRepositoryImpl`, inject `GraphQLService` | — | AC-1,3,4,5,6,7 |
| Model | `lib/core/models/inventory_catalog/internal_product_list_item_model.dart` | NEW | `@freezed` + `@JsonSerializable` | ~70 | AC-2 |
| Model | `lib/core/models/response/inventory_catalog/internal_product_page_response.dart` | NEW | `@freezed` + `@JsonSerializable`; wraps `List<InternalProductListItem>` + `PageInfo` | ~50 | AC-7 |
| Router | `lib/core/router/router.dart` (+ `router.gr.dart` codegen) | MODIFY (add 3 `@RoutePage` entries) | auto_route 10.1.0+1 | ~20 | AC-1 |
| i18n | `lib/l10n/intl_vi.arb` + `intl_en.arb` | ADDITIVE | flutter_localizations | ~35 | AC-1..7 |
| Test | `test/features/inventory_catalog/internal_product_list/internal_product_list_cubit_test.dart` | NEW | bloc_test + widget_test | ~180 | AC-1,4,7,10 |
| Test | `test/features/inventory_catalog/internal_product_list/internal_product_search_cubit_test.dart` | NEW | bloc_test | ~120 | AC-3 |

---

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 entry depends on BFF S5 (`searchInternalProducts` SDL stable). Song song với FE-web S6.

```
(← BFF tier S5: searchInternalProducts SDL + resolver stable)

S6  Mobile UI wire (Flutter)
    Entry: BFF S5 stable + Figma wave03-cat-prod-list.md confirmed (9 screens ACTIVE)
           + NEED CONFIRMATION resolved (Tất cả tab API mapping; material group options op name)
    Exit: Patrol E2E happy path green (list load → tab filter → search → filter apply)
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Models + Repository | `lib/core/models/` + `lib/core/repositories/` | BFF S5 SDL stable | `searchInternalProducts` query compile + unit test | BFF S5 |
| S6.2 | Cubits + States (@freezed) | `lib/ui/inventory_catalog/internal_product_list/` | S6.1 | Cubit unit tests (bloc_test) ≥12 green | S6.1 |
| S6.3 | Pages + Widgets + Router | pages + local widgets + router.dart | S6.2 | Widget test green; `flutter analyze` clean | S6.2 |
| S6.4 | i18n ARB keys | `lib/l10n/intl_*.arb` | S6.3 | No hardcode string lint warning | S6.3 |
| S6.5 | E2E Patrol test | `integration_test/` | S6.4 | Patrol happy path: list load → tab "Đang hoạt động" → search "dầu" → filter Tính chất=GOODS → pull-refresh | S6.4 |

---

## 9. Business Rules to enforce (Mobile — UI hint + RBAC secondary)

> Primary enforcement = BE tier (`be/FEAT-CAT-PROD-LIST.md §9`). Mobile chỉ UI hint + RBAC render.

| BR ID | Severity | UI behavior | Where | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-007` | NORMAL | Render list items từ BFF response (đã tenant-scoped) — không client-filter tenant | `InternalProductListPage` (cubit state) | AC-10 | BE primary; mobile secondary passthrough |
| `BR-CAT-PROD-008` | NORMAL | `StatusBadge` INACTIVE = grey (`AppColors.bgBadgeOpen`) — visual hint mã không dùng cho phiếu mới | `InternalProductListCard` §StatusBadge | AC-2 | M-trap-3 enforce |
| `BR-CAT-PROD-019` | NORMAL | Dropdown Tính chất populate 4 giá trị cố định (GOODS/TOOL/SERVICE/OTHER → display labels); schema-validated tại BFF layer | `InternalProductFilterPage` §DropdownTextField | AC-5 | BFF GraphQL enum reject ngoài range |
| `BR-CAT-CMN-003` | NORMAL | Mobile truyền keyword nguyên vẹn xuống BFF — không tự filter client | `InternalProductSearchCubit` | AC-3 | BE OR-match 3 cột; mobile KHÔNG filter local |
| CR-1782373204 | SCOPE | KHÔNG render bất kỳ write action nào — view-only scope | Toàn bộ 3 pages | AC-9, AC-11 | Hard scope constraint W03 mobile |

---

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (list render + skeleton) | test-mobile-ui | Assert `ListWidget` isInitial → shimmer skeleton; loaded → `InternalProductListCard` count match |
| AC-2 | Widget test (card layout) | test-mobile-ui | Assert card has code text, `StatusBadge` (green active / grey inactive per M-trap-3), name, 2x2 attr grid; KHÔNG có edit/delete icon |
| AC-3 | Widget test (search 3 states) | test-mobile-ui | State transitions: defaultPrompt → searchLoading → searchLoaded (count header with curly quotes) / searchNoResults |
| AC-4 | Widget test (tab filter + indicator) | test-mobile-ui | Tab switch → cubit.changeTab(status); assert tab indicator moves correctly (KHÔNG mirror Figma 21528:25516 anomaly) |
| AC-5 | Widget test (filter Tính chất) | test-mobile-ui | Dropdown options = 4 values (GOODS→Vật tư hàng hóa, TOOL→CCDC, SERVICE→Dịch vụ, OTHER→Khác) |
| AC-6 | Widget test (filter Nhóm hàng + Apply/Reset) | test-mobile-ui | Apply → emit filters → ListCubit.applyFilters(); Reset → clear both dropdowns |
| AC-7 | Widget test (pull-to-refresh + load-more) | test-mobile-ui | pull-down → refresh page=0; pull-up → loadMore page++; `hasNext=false` → loadNoData |
| AC-10 | Widget test (tenant scope) | test-isolation | Render list with mock BFF response — assert no client-side tenantId filter; JWT expired mock → SnackBar + redirect |
| AC-11 (view-only) | Widget test (negative — no write actions) | test-mobile-ui | Assert: NO FAB, NO "Thêm" button, NO edit/delete icon on card; all 3 pages; CRITICAL gate |
| E2E smoke | Patrol integration test | test-mobile-e2e | List load → tab "Đang hoạt động" → search "dầu" keyword → filter Tính chất=GOODS Nhóm=X → pull-refresh |

---

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

| Key | vi | en | AC ref |
|---|---|---|---|
| `internalProductList_title` | "Sản phẩm" | "Products" | AC-1 |
| `internalProductList_tabAll` | "Tất cả" | "All" | AC-4 |
| `internalProductList_tabActive` | "Đang hoạt động" | "Active" | AC-4 |
| `internalProductList_tabInactive` | "Ngừng hoạt động" | "Inactive" | AC-4 |
| `internalProductList_labelNature` | "Tính chất" | "Type" | AC-2 |
| `internalProductList_labelGroup` | "Nhóm" | "Group" | AC-2 |
| `internalProductList_labelUnit` | "ĐVT" | "Unit" | AC-2 |
| `internalProductList_labelBrand` | "Thương hiệu" | "Brand" | AC-2 |
| `internalProductList_emptyData` | "Không có dữ liệu" | "No data" | AC-1 (EC-1) |
| `internalProductSearch_placeholder` | "Tìm kiếm" | "Search" | AC-3 |
| `internalProductSearch_prompt` | "Tìm kiếm sản phẩm theo từ khoá" | "Search products by keyword" | AC-3 |
| `internalProductSearch_bulletCode` | "Mã nội bộ" | "Internal code" | AC-3 |
| `internalProductSearch_bulletName` | "Tên sản phẩm" | "Product name" | AC-3 |
| `internalProductSearch_bulletSku` | "SKU liên kết" | "Linked SKU" | AC-3 |
| `internalProductSearch_noResults` | "Không có kết quả phù hợp" | "No results found" | AC-3 (EC-4) |
| `internalProductSearch_retry` | "Vui lòng thử lại" | "Please try again" | AC-3 (EC-4) |
| `internalProductFilter_title` | "Bộ lọc" | "Filter" | AC-5,6 |
| `internalProductFilter_labelNature` | "Tính chất" | "Type" | AC-5 |
| `internalProductFilter_placeholderNature` | "Chọn tính chất hàng hoá" | "Select product type" | AC-5 |
| `internalProductFilter_labelGroup` | "Nhóm hàng" | "Product group" | AC-6 |
| `internalProductFilter_placeholderGroup` | "Chọn nhóm hàng" | "Select product group" | AC-6 |
| `internalProductFilter_btnReset` | "Thiết lập lại" | "Reset" | AC-6 |
| `internalProductFilter_btnApply` | "Áp dụng" | "Apply" | AC-6 |
| `error_session_expired` | "Phiên đăng nhập hết hạn" | "Session expired" | AC-10 |
| `error_system_retry` | "Lỗi hệ thống, vui lòng thử lại" | "System error, please try again" | AC-1 |
| `error_network` | "Không có kết nối mạng" | "No network connection" | AC-7 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `Semantics(label: "Danh sách mã sản phẩm nội bộ")` trên ListView | TalkBack/VoiceOver — announce list container |
| AC-2 | `Semantics(label: "${code} — ${name} — ${statusLabel}")` trên `InternalProductListCard` | Screen reader đọc card đầy đủ |
| AC-3 | `Semantics(label: "Nhập từ khóa tìm kiếm")` trên SearchInput; `SemanticsService.announce(...)` khi kết quả thay đổi | Live region announce cho screen reader |
| AC-4 | Tab widget: `Semantics(label: "Lọc theo ${tabLabel}", selected: isSelected)` | TalkBack tab navigation |
| AC-5 | `Semantics(label: "Chọn tính chất")` cho `DropdownTextField` Tính chất | Dropdown a11y |
| AC-6 | `Semantics(label: "Chọn nhóm hàng")` cho `DropdownTextField` Nhóm hàng | Dropdown a11y |
| AC-11 | `excludeSemantics` cho decorative icon search/filter nếu AppBar button đã có `Semantics(label: ...)` | Avoid duplicate announcement |

---

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-LIST.md` | DRAFT | Primary BR enforcement; V2-7 `POST /api/v2/internal-products/search` contract source |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-LIST.md` | DRAFT | GraphQL op `searchInternalProducts` (§6.1); SDL `InternalProductListItem` type (§5.1); DataLoader enrichment (§6.3) |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-LIST.md` | DRAFT | Cùng BFF op; web có full CRUD + toolbar actions; mobile chỉ view-only |

**Source ID consistency** (item #18): `source_feat_sha = d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118` — identical với BE/BFF/FE-web tier files.

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-LIST.md`](../../../../../Product/features/FEAT-CAT-PROD-LIST.md) v7
- **Paired BE**: [`features/be/FEAT-CAT-PROD-LIST.md`](../be/FEAT-CAT-PROD-LIST.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-PROD-LIST.md`](../bff/FEAT-CAT-PROD-LIST.md)
- **Figma mobile**: [`Product/ux/figma-mobile/wave03-cat-prod-list.md`](../../../../../Product/ux/figma-mobile/wave03-cat-prod-list.md) — 9 screens, node 21254:52585
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md) §3.2
- **PKG**: [`Execution/work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.4
- **HLD Mobile**: `Architecture/hld/garage-mobile-HLD.md`
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **BR**: `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` — BR-CAT-PROD-007/008/019, BR-CAT-CMN-003
- **ADR-009**: No JPA relationship mapping (scalar FK)
- **CR-1782373204**: Mobile PROD view-only scope

---

## 14. Out-of-Scope Mobile (per CR-1782373204)

Liệt kê tường minh để dev không bị nhầm:

| Chức năng | Scope | Nơi thực hiện |
|---|---|---|
| Thêm sản phẩm (Create) | **WEB-ONLY** | `fe-web/FEAT-CAT-PROD-CREATE.md` |
| Sửa sản phẩm (Edit) | **WEB-ONLY** | `fe-web/FEAT-CAT-PROD-EDIT.md` |
| Xóa sản phẩm (Delete) | **WEB-ONLY** | `fe-web/FEAT-CAT-PROD-DELETE.md` |
| Import (.xlsx) | **WEB-ONLY** | `fe-web/FEAT-CAT-PROD-IMPORT.md` |
| Export (.xlsx) | **WEB-ONLY** | `fe-web/FEAT-CAT-PROD-EXPORT.md` |
| Row action buttons (Sửa/Xóa icon per card) | **WEB-ONLY** | — |
| FAB / BottomBar "Thêm sản phẩm" | **NOT EXIST on mobile** | — |
| Chi tiết mã sản phẩm (Detail) | **Scope riêng** | `mobile/FEAT-CAT-PROD-DETAIL.md` |

---

## 15. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 3 | Delivery Authority (in-session full GraphQL re-audit — user request "check lại hết phần graphql của wave 3") | **Fix repository path/class drift** §6.1 + §7 file map: `internal_product_repository.dart` / `material_group_repository.dart` (per-domain, không tồn tại) → `inventory_catalog_repository.dart` (`InventoryCatalogRepository` consolidated, khớp code thật + BUG-W03-013 đã ratify). |
| 2026-07-01 | 2 | Delivery Authority (in-session doc-drift audit — user request "check GraphQL mobile document") | **Resolve NEED CONFIRMATION §6.1 material-group-options op** — spec (2026-06-30) chưa cite **CR-1782381477** (2026-06-25) khi để ngỏ `searchMaterialGroups` vs `getMaterialGroupTree` cho filter dropdown "Nhóm hàng". CR đã quyết định Q1 cho toàn bộ mobile scope. Sửa §3 AC-6 dòng GraphQL op + §6.1 bảng ops — verbatim `searchMaterialGroups`, xoá NEED CONFIRMATION framing. |
| 2026-06-30 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho FEAT-CAT-PROD-LIST W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier byte-equal từ BE), §2 trách nhiệm Mobile view-only, §3 Mobile behaviour map 11 AC (AC-1..7/10/11 triển khai, AC-8/9 khai báo N/A view-only CR-1782373204), §4 visual + state + i18n + a11y + RBAC + BR secondary + perf + error, §5 3 pages + 9 widgets + 3 Cubits, §6 GraphQL `searchInternalProducts`, §7 file map, §8 S6 DAG, §9 BR secondary, §10 test scope, §11 i18n 24 ARB keys + a11y, §12 cross-tier, §14 out-of-scope explicit. Key decisions: INACTIVE badge GREY not orange (M-trap-3 Figma VV), filter/search = full-page route (Figma VV), Figma tab anomaly noted (21528:25516 DEV override), NEED CONFIRMATION: Tất cả tab API mapping + material group options op name. |
