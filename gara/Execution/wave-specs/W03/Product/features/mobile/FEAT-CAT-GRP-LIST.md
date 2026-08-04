---
type: execution-spec
artifact_kind: feature-mobile
status: ACTIVE
version: 3
tier: T4
tier_role: mobile
platform: mobile
owner_authority: "Delivery Authority + Architecture Authority"
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
experience: "garage-mobile"
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-LIST"
source_ref: "Product/features/FEAT-CAT-GRP-LIST.md"
source_feat_sha: "cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef"
source_feat_version: 6
generated_at: "2026-06-30T07:00:00Z"
last_reviewed: "2026-07-01"
boundary: "garage-mobile"
boundaries_affected: ["garage-mobile"]
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-CAT-GRP-LIST"]
consumes_bff_feats: ["FEAT-CAT-GRP-LIST"]
screens_touched:
  - "lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart"
  - "lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart"
  - "lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart"
flutter_packages:
  - "flutter_bloc"
  - "freezed"
  - "get_it"
  - "injectable"
  - "auto_route"
  - "graphql_flutter"
  - "gap"
figma_refs:
  - "Product/ux/figma-mobile/wave03-cat-grp-list.md (node 21254:52586 — Danh sách nhóm vật tư hàng hóa, 9 frame variants: list-tất-cả / list-đang-hoạt-động / list-ngừng-hoạt-động / search-default / search-no-results / search-results / filter-default / filter-filled / empty-data)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "a72a1e067d6d58ef210d7e8bf5645599229d79701391f56be8f8e84c02557176"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-LIST.mobile.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
---

# FEAT-CAT-GRP-LIST (Mobile): Danh sách nhóm vật tư hàng hóa

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl feature tra cứu nhóm VTHH. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual — `Product/ux/figma-mobile/wave03-cat-grp-list.md` (node 21254:52586). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-LIST` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `material_group_list_page`, `material_group_search_page`, `material_group_filter_page` |
| Flutter packages | `flutter_bloc`, `freezed`, `get_it`, `injectable`, `auto_route`, `graphql_flutter`, `gap` |
| Cross-tier consume | BE: `FEAT-CAT-GRP-LIST` \| BFF: `FEAT-CAT-GRP-LIST` |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-LIST.md`](../../../../../Product/features/FEAT-CAT-GRP-LIST.md) |
| Source version | v6 |
| Source SHA | `cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef` |
| Generated at | 2026-06-30T07:00:00Z |

---

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu danh sách nhóm vật tư hàng hóa để phân loại và điều hướng trong hệ thống quản lý kho V2. Feature cho phép tìm kiếm theo mã/tên và lọc theo trạng thái hoặc nhóm cha, với kết quả hiển thị phẳng (flat) có phân trang — quan hệ cha–con thể hiện qua trường "Thuộc nhóm". Đây là điểm khởi đầu cho các luồng tạo, xem chi tiết, sửa và xóa nhóm vật tư trong wave W03 (Danh mục V2).

## 2. Trách nhiệm Mobile (garage-mobile)

- Render màn hình danh sách nhóm vật tư hàng hóa (`MaterialGroupListPage`) với `CustomAppBar` (title "Nhóm vật tư hàng hóa", trailing search + filter icons), `ListTabBarWidget` (3 tab status), `ListWidget` (danh sách `GroupListCard`), và `BottomBar` có nút "Thêm nhóm vật tư" (full-width primary, text-only) — dùng làm hub điều hướng full CRUD cho GRP trong W03.
- Hiển thị mỗi nhóm dưới dạng `GroupListCard` gồm: mã nhóm (màu xanh `AppColors.textActivePrimary`), tên nhóm, `StatusBadge` (green khi ACTIVE / orange khi INACTIVE — không dùng grey), Divider, và 2 `StartInfoRow` (floppy-disk icon cho "Thuộc nhóm: {parentName}", note icon cho "Mô tả: {description}"). Flat list — không render cây, không thụt lề; quan hệ cha–con hiện qua field `parentName`.
- Quản lý trạng thái BLoC: `MaterialGroupListCubit` với states `initial / loading / loaded / loadingMore / error`; `MaterialGroupSearchCubit` và `MaterialGroupFilterCubit` cho 2 sub-route.
- Điều hướng với `auto_route 10.1.0+1`: search icon → push `MaterialGroupSearchPage` (full-page route, TabBar persists); filter icon → push `MaterialGroupFilterPage` (full-page route, no TabBar); card tap → push `FEAT-CAT-GRP-DETAIL`; BottomBar → push `FEAT-CAT-GRP-CREATE`.
- Consume BFF GraphQL op `searchMaterialGroups(input: MaterialGroupSearchInput!)` qua `graphql_flutter` (`MaterialGroupRepository`) — **op duy nhất** cho cả list + dropdown nhóm cha ở filter page (`size=100`). Mobile KHÔNG consume `getMaterialGroupTree` (Q2) — resolved per CR-1782381477 (2026-06-25): flat card list, Q1 thay Q2, 7 ops thay 8.
- Không cần xử lý permission native (camera/storage); không offline-first — online required; connectivity error → SnackBar thông báo + retry.

---

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: TẤT CẢ 11 AC-IDs phải xuất hiện ở §3 hoặc §4. Xem bundle §C — 11 ACs tổng.

### Cluster A — Màn hình danh sách và hiển thị card

#### AC-1 → Khởi tạo và render màn hình danh sách đầy đủ chrome

- **Khi**: Người dùng điều hướng đến tab/route danh sách nhóm VTHH (từ hub mobile inventory catalog)
- **Mobile phải**: Render `MaterialGroupListPage` với đầy đủ chrome: `CustomAppBar` (title "Nhóm vật tư hàng hóa", leading back button, trailing `Icons.search` + `Icons.tune`), `ListTabBarWidget` (3 tab: "Tất cả" / "Đang hoạt động" / "Ngừng hoạt động"), `ListWidget` (body với auto-skeleton khi loading), `GroupListFooter` (BottomBar "Thêm nhóm vật tư")
- **State transition**: `initial` → `MaterialGroupListCubit.load(status: ACTIVE, page: 0, size: 20)` on page init → `loading` (ListWidget auto-skeleton = `LoadingRowShimmerWidget` × 20 rows) → `loaded` (list items) | `error` (SnackBar + retry)
- **Default tab**: Tab "Đang hoạt động" (ACTIVE) active on first load per AC-5 business spec — **[NEED CONFIRMATION #3]**: Figma frame 21235:29061 hiển thị "Tất cả" tab selected làm default; AC-5 business spec nêu "Đang hoạt động" là mặc định. BA confirm canonical default trước DEV impl.
- **Widget**: `lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart`
- **GraphQL op**: `searchMaterialGroups(input: {status: ACTIVE, page: 0, size: 20})` (mặc định theo AC-5)
- **Ref**: Figma node `21254:52586` §Screen 21235:29061 (default frame), §Screen 21581:24172 (empty data frame)

#### AC-2 → GroupListCard hiển thị đủ fields theo Figma

- **Khi**: `MaterialGroupListCubit` emit `loaded` với danh sách items
- **Mobile phải**: Render mỗi item bằng `GroupListCard` với cấu trúc:
  - `CardHeader` Row: mã nhóm (`AppTextStyle.textHeadingH4`, `AppColors.textActivePrimary`) + `StatusBadge` (pill, xem chi tiết tại §4.1)
  - `ItemNameRow`: tên nhóm (`AppTextStyle.textBodyB5`, `AppColors.textPrimary`)
  - `Divider` 1px `AppColors.borderPrimary` full-width
  - `StartInfoRow` cho "Thuộc nhóm: {parentName}" (leading `Icons.save_outlined` 16px `AppColors.textSecondary`)
  - `StartInfoRow` cho "Mô tả: {description}" (leading `Icons.description_outlined` 16px, max 2 dòng overflow ellipsis)
  - Card BG `AppColors.bgBase`, radius `BorderRadius.circular(8)`, shadow `AppShadow.itemBoxShadow`, padding `EdgeInsets.all(AppSizes.spacing16)`
- **Design tokens**: TUYỆT ĐỐI KHÔNG hardcode `Color(0xFF...)` hoặc raw `TextStyle(...)` — chỉ dùng `AppColors.*`, `AppTextStyle.*`, `AppSizes.*`, `AppShadow.*`
- **Widget**: `lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` (build-new)
- **Ref**: Figma node `21254:52586` §GroupListCard + §Badge/StatusPill + §InfoField/ThuocNhom + §InfoField/MoTa; BFF field `MaterialGroupListItem`

#### AC-3 → Flat list — quan hệ cha–con thể hiện qua StartInfoRow "Thuộc nhóm"

- **Khi**: List loaded với data gồm cả nhóm gốc (root) và nhóm con
- **Mobile phải**: Render flat list — mỗi nhóm là 1 card độc lập, KHÔNG thụt lề, KHÔNG expand/collapse icon, KHÔNG TreeView. `parentName` từ BFF field `MaterialGroupListItem.parentName` → hiển thị trong StartInfoRow "Thuộc nhóm: {parentName}"; nếu `parentName == null` (root group) → row "Thuộc nhóm" hiển thị trống hoặc ẩn (xử lý conditional render)
- **Pull-up load-more**: `ListWidget` `SmartRefresher` pull-up → `MaterialGroupListCubit.loadMore()` → dispatch page++ → append items to list → `loadComplete()`
- **Pull-down refresh**: `SmartRefresher` pull-down → reset page=0 → reload fresh
- **Widget**: `ListWidget` canonical (`lib/ui/widgets/list/list_widget.dart`) với items = list of `GroupListCard` widgets; ListWidget handle `isInitial/isLoading/isFailure/isEmpty` states + SmartRefresher pull-down/pull-up
- **Ref**: Figma §Screen 21235:29061 + §Screen 21252:47609 + §Screen 21252:48117 (3 tab variants); BE spec §3 AC-3 flat-grouped-by-parent ordering từ backend

### Cluster B — Tìm kiếm và bộ lọc

#### AC-4 → Tìm kiếm keyword qua full-page search route

- **Khi**: Người dùng tap icon search (trailing 1 trong `CustomAppBar`)
- **Mobile phải**: `auto_route` push `MaterialGroupSearchPage` (full-page route — KHÔNG bottom sheet). Search page render: `GroupSearchAppBar` (leading BackButton, title replaced bằng `AppTextField` search input với `Icons.search` 20px prefix, placeholder "Tìm kiếm"); `ListTabBarWidget` 3 tab persists (status filter kết hợp với keyword); body = keyword-guide state (header "Tìm kiếm nhóm vật tư theo từ khoá" + 2-bullet guide "Mã nhóm"/"Tên nhóm") → searching → no-results | results (list of `GroupListCard`)
- **Search debounce**: 300ms sau user-input-stop → dispatch `MaterialGroupSearchCubit.search(keyword, status)` → `searchMaterialGroups(input: {keyword, status, page: 0, size: 20})`
- **State transition**: `keywordGuide` (empty input) → `searching` → `noResults` (`searchNoResultsWidget`) | `loaded` (list + result-count header "N kết quả tìm kiếm cho "{keyword}"" — curly typographic quotes per Figma)
- **Search header copy**: Implement "Tìm kiếm nhóm vật tư theo từ khoá" — **[NEED CONFIRMATION #1 — NC-FIGMA-03]**: Figma frame 21252:48381 có copy bug — hiển thị "Tìm kiếm phiếu dịch vụ theo từ khoá" (placeholder từ FEAT khác). DEV implement context-correct wording "nhóm vật tư". BA confirm wording canonical trước merge.
- **GraphQL op**: `searchMaterialGroups(input: {keyword: string, status: currentStatus, page: 0, size: 20})`
- **Ref**: Figma node §Screen 21252:48381 (search-default) + §Screen 21252:48401 (no-results) + §Screen 21252:48958 (results); BFF spec §6.1 op `searchMaterialGroups`

#### AC-5 → 3-tab filter theo trạng thái (ListTabBarWidget)

- **Khi**: Màn hình list hoặc search page render; người dùng tap tab
- **Mobile phải**: `ListTabBarWidget` với 3 tab: "Tất cả" (không filter status) / "Đang hoạt động" (status=ACTIVE) / "Ngừng hoạt động" (status=INACTIVE); indicator 2px `AppColors.borderActive` underline dưới tab active; selected text `AppTextStyle.textSubtitleS5` `AppColors.textActivePrimary`; unselected text `AppColors.textSecondary`
- **Tab switch**: dispatch `MaterialGroupListCubit.changeStatus(MaterialGroupStatus? status)` → reset page=0 → reload list với status filter mới. Tương tự `MaterialGroupSearchCubit.changeStatus()` khi trên search page
- **Mapping**: tab "Tất cả" → `status: null`; tab "Đang hoạt động" → `status: ACTIVE`; tab "Ngừng hoạt động" → `status: INACTIVE`
- **Widget**: `ListTabBarWidget` (reuse canonical, path xem §5.2); height fixed 44px, BG `AppColors.bgBase`
- **Ref**: Figma §TabBar/StatusFilter node `21235:29221`; §Screen 21252:47609 (active tab); §Screen 21252:48117 (inactive tab)

#### AC-6 → Filter nhóm cha qua full-page filter route

- **Khi**: Người dùng tap icon filter (trailing 2 `Icons.tune` trong `CustomAppBar`)
- **Mobile phải**: `auto_route` push `MaterialGroupFilterPage` (full-page route — KHÔNG bottom sheet, không TabBar — xác nhận per Figma §VV node 21252:49574). Filter page render: `GroupFilterAppBar` (title "Bộ lọc", leading back button, NO trailing actions); body với `DropdownTextField` "Thuộc nhóm" (label + field + `Icons.keyboard_arrow_down` trailing, placeholder "Chọn nhóm hàng"); `GroupFilterFooter` (2-button row: "Thiết lập lại" secondary + "Áp dụng" primary blue)
- **Load parent group options**: khi filter page init → `MaterialGroupFilterCubit.loadParentGroups()` → `searchMaterialGroups(input: {status: ACTIVE, page: 0, size: 100})` — **RESOLVED (NC-SDL-04 closed per CR-1782381477, 2026-06-25)**: Q1 `searchMaterialGroups` size=100 là op chính thức, KHÔNG dùng `getMaterialGroupTree`. Nếu tenant >100 nhóm cần paginated dropdown — theo dõi riêng, KHÔNG phải lý do quay lại Q2 (đã bị loại bỏ khỏi mobile scope).
- **Dropdown open**: tap `DropdownTextField` → `showModalBottomSheet` với danh sách nhóm cha ACTIVE; user select → cubit.setParentGroupFilter(group)
- **"Thiết lập lại"**: `MaterialGroupFilterCubit.resetFilters()` → xóa selection → pop filter page → dispatch `MaterialGroupListCubit.applyParentFilter(parentId: null)` → reload
- **"Áp dụng"**: `MaterialGroupFilterCubit.applyFilters()` → pop filter page với result `parentId` → `MaterialGroupListCubit.applyParentFilter(parentId: selectedGroup.id)` → reload list với parentId filter
- **Widget**: `MaterialGroupFilterPage` + `DropdownTextField` (reuse) — xem §5.2
- **Ref**: Figma §Screen 21252:49574 (filter-default) + §Screen 21252:49582 (filter-filled); BFF op `searchMaterialGroups` §6.1

### Cluster C — Điều hướng và thao tác từ list

#### AC-7 → Tap card điều hướng đến Detail; KHÔNG có inline action icons

- **Khi**: Người dùng tap `GroupListCard`
- **Mobile phải**: `auto_route` push `FEAT-CAT-GRP-DETAIL` page với `group.id` làm route arg
- **KHÔNG render**: icon Sửa / Xóa trực tiếp trên card body — Figma §VV confirmed: "card bodies show only icons for InfoRow markers (floppy + note 16px) — no large action icons (no eye/trash/edit)". Thao tác Sửa/Xóa được thực hiện từ màn hình Detail.
- **Ref**: Figma §Screen 21235:29061 §negative_coverage: "KHÔNG có IconButton edit/delete trên mỗi card"

#### AC-8 → "Thêm nhóm vật tư" BottomBar button mở Create

- **Khi**: Người dùng tap `AppButton` "Thêm nhóm vật tư" ở `GroupListFooter`
- **Mobile phải**: `auto_route` push `FEAT-CAT-GRP-CREATE` page
- **Button spec**: `AppButton.text(title: "Thêm nhóm vật tư", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: cubit.openCreate)` — full-width, text-only, **KHÔNG có leading `Icons.add` hoặc `+` glyph** per Figma §VV (asset 21235-29061.png verified: "TEXT-ONLY (NO leading + glyph)"); BG `AppColors.buttonBackgroundPrimary` (#0052ff), text `AppColors.textWhite`
- **Visibility**: BottomBar luôn hiển thị kể cả khi list empty (empty-data state giữ nguyên BottomBar per Figma §VV asset 21581-24172-empty.png)
- **KHÔNG có**: FAB button (`FloatingActionButton`) — BottomBar full-width button là CRUD entry duy nhất theo Figma
- **Ref**: Figma §BottomBar/Footer §AppButton/ThemNhomVatTu node `GroupListFooter`; §Screen 21581:24172 §VV "BottomBar primary 'Thêm nhóm vật tư' REMAINS visible"

### Cluster D — Phân quyền và tenant

#### AC-9 → RBAC: cả 2 role garage-owner và accountant có access đầy đủ

- **Khi**: Mọi request đến `MaterialGroupListPage`
- **Mobile phải**: `AuthGuard` (auto_route `lib/core/router/auth_guard.dart`) tại route → require valid JWT; nếu JWT missing/expired → navigate to login. Cả `garage-owner` và `accountant` đều có quyền truy cập và xem danh sách, tìm kiếm, filter — KHÔNG ẩn bất kỳ action nào dựa theo role (Critical Rule #6 dual-persona; AC-9 nêu "cả 2 vai trò xem được và thực hiện thao tác ngang nhau")
- **RBAC render**: "Thêm nhóm vật tư" button hiển thị cho cả 2 role (không cần ẩn per role)
- **Ref**: Critical Rule #6; BFF spec §3 AC-9; BE spec §4.2

#### AC-10 → Tenant isolation: mobile không tự quản lý, delegate BFF/BE

- **Khi**: `searchMaterialGroups` query gửi đi
- **Mobile phải**: KHÔNG tự xử lý `tenantId` trong GraphQL args — tenantId extract từ JWT context phía BFF (Critical Rule #4 tenant isolation). Nếu BFF trả `UNAUTHORIZED` → navigate to login; nếu trả `FORBIDDEN` → hiển thị error state ("Bạn không có quyền truy cập")
- **Mobile không cần**: inject `tenantId` vào query input; BFF auto-extract từ JWT header và propagate xuống gf-inventory
- **N/A cho Mobile**: kiểm tra cross-tenant là BE/BFF responsibility

#### AC-11 → Mobile có đầy đủ CRUD, không phải view-only

- **Khi**: Màn hình danh sách render
- **Mobile phải**: Đảm bảo đầy đủ CRUD entry points hiển thị: BottomBar "Thêm nhóm vật tư" (→ CREATE), card tap → DETAIL (từ đó có Sửa → EDIT, Xóa → DELETE). Đây là khác biệt quan trọng với `FEAT-CAT-PROD-LIST` (mobile chỉ view-only). KHÔNG áp chế độ view-only (disabled buttons hoặc ẩn BottomBar) cho GRP features (per CR-1782373204, AC-11 source: "mobile KHÔNG bị giới hạn view-only")
- **Ref**: Wave overview §3 DIV-09 (scope intentional); PKG-W03 §2.2.4 CR-1782373204

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT — node 21254:52586)

- Tất cả design tokens lấy từ `lib/core/common/styles/` — **TUYỆT ĐỐI KHÔNG** hardcode `Color(0xFF...)` hoặc `TextStyle(fontSize: ...)` raw.
- **Status badge colors** (DIV-06 — deferred per CR-20260630-01 P1.4):
  - "Đang hoạt động" (ACTIVE) → BG `AppColors.bgBadgeSuccess`, text `AppColors.textSuccessPrimary` (green)
  - "Ngừng hoạt động" (INACTIVE) → BG `AppColors.bgBadgeWarning`, text `AppColors.textWarningPrimary` (orange — **KHÔNG phải grey**, khác FEAT-CAT-PROD-LIST)
  - Pill: radius `BorderRadius.circular(13)`, padding `EdgeInsets.symmetric(horizontal: AppSizes.spacing8, vertical: AppSizes.spacing4)`, text `AppTextStyle.textSubtitleS5` 14px weight=600
  - Figma §VV asset 21252-48117-variant3.png: "orange pill 'Ngừng hoạt động'... distinct from PROD-LIST inactive which uses GREY (M-trap-3)"
- **AppBar**: BG `AppColors.bgBase`, title "Nhóm vật tư hàng hóa" `AppTextStyle.textHeadingH3` 18px weight=700 `AppColors.textPrimary` centered; trailing icons 24px `AppColors.textPrimary`
- **Card layout**: BG `AppColors.bgBase`, radius `BorderRadius.circular(8)`, shadow `AppShadow.itemBoxShadow`, padding `EdgeInsets.all(AppSizes.spacing16)`; separator `AppColors.borderPrimary`
- **BottomBar**: BG `AppColors.bgBase`, border-top 1px `AppColors.borderPrimary`, padding `EdgeInsets.symmetric(horizontal: AppSizes.spacing16, vertical: AppSizes.spacing16)` + `SafeArea` bottom
- **TabBar indicator**: 2px underline `AppColors.borderActive`; selected label `AppColors.textActivePrimary`; unselected `AppColors.textSecondary`; TabBar BG `AppColors.bgBase`
- **GroupListCard mã nhóm**: `AppTextStyle.textHeadingH4` `AppColors.textActivePrimary` (#0052ff — blue, link-style per Figma "group code blue")

### 4.2 State machine + error handling

- Tất cả Cubit có states tường minh: `initial → loading → loaded | error`; `loadingMore` cho pull-up pagination.
- **`ListWidget` handle states**: `isInitial=true` → auto-skeleton (`LoadingRowShimmerWidget` × shimmer rows); `isLoading=true` → refresh indicator; `isEmpty=true` → empty state widget; `isFailure=true` → error state (retry button)
- **Empty data** (EC-1 — garage chưa có nhóm): `ListWidget` `isEmpty=true` → render `Center` với `EmptyIllustration` (grey document SVG ~80×80) + Text "Không có dữ liệu" (`AppTextStyle.textSubtitleS4` `AppColors.textPrimary`). BottomBar vẫn visible.
- **Search no-results** (EC-4): search page emit `noResults` → render magnifier line-art icon (~48px) + Text "Không có kết quả phù hợp" (bold heading) + Text "Vui lòng thử lại" (caption `AppColors.textSecondary`). Per Figma §Screen 21252:48401 §VV.
- **Error** (network/BFF error): SnackBar bottom + "Thử lại" button trong ListWidget error state. KHÔNG silent fail.
- **N/A — MATERIAL_GROUP_TREE_OVERSIZE**: mobile KHÔNG gọi `getMaterialGroupTree` (Q2 loại bỏ per CR-1782381477) nên error code này KHÔNG thể xảy ra ở mobile. Xử lý oversize/pagination-cap (nếu có) là trách nhiệm của `searchMaterialGroups` (Q1) pagination thông thường, không phải fallback riêng.

### 4.3 Native interaction + permission

- Không cần permission native (camera, storage, location) cho feature này.
- Không có deeplink vào list screen trong scope W03 (future FEAT).
- Không có push notification interaction.

### 4.4 Offline + connectivity

- Feature yêu cầu kết nối mạng (online-only). KHÔNG cache offline.
- Nếu mất kết nối khi đang load → `isFailure=true` → ListWidget error state + retry.
- KHÔNG có offline queue cho read-only list feature này.

### 4.5 i18n + a11y

- Mọi error message / empty state text qua ARB key (xem §11.1). Label tiếng Việt verbatim từ Figma (vd "Nhóm vật tư hàng hóa", "Thêm nhóm vật tư") có thể dùng inline hardcode string hoặc ARB key — verify với team mobile convention.
- a11y: `Semantics` wrapper cho icon-only buttons (search icon AppBar, filter icon AppBar → `Semantics(label: "Tìm kiếm", button: true)` / `Semantics(label: "Bộ lọc", button: true)`). Tap target ≥ 48dp. Contrast WCAG AA đạt qua design tokens.
- TalkBack: `GroupListCard` `Semantics(label: "${group.code} ${group.name} Trạng thái ${group.statusLabel}")` để screen reader đọc đủ thông tin.

### 4.6 RBAC render + feature flag

- Route `MaterialGroupListPage` guard bởi `AuthGuard` (auto_route) — redirect login nếu JWT invalid.
- Không có feature flag riêng cho GRP-LIST trong W03 scope.
- Cả 2 role (`garage-owner`, `accountant`) xem toàn bộ screen và trigger navigation đến CREATE/DETAIL — không có điều kiện ẩn hiện theo role ở màn list này.

### 4.7 Business rule secondary (UI hint)

- BR enforcement primary = BE (`features/be/FEAT-CAT-GRP-LIST.md §9`). Mobile chỉ hiển thị kết quả:
  - **BR-CAT-GRP-013** (keyword search): Người dùng gõ keyword → debounce → gửi lên BFF; KHÔNG tự filter client-side.
  - **BR-CAT-GRP-006** (trạng thái 2 giá trị): `StatusBadge` render ACTIVE=green / INACTIVE=orange — UI enforce visual mapping đúng enum.
  - **BR-CAT-GRP-005** (cây phân cấp — N/A cho list): mobile render flat list, không enforce rule tree.

### 4.8 Performance

- **`ListWidget` canonical** (`lib/ui/widgets/list/list_widget.dart`) — KHÔNG dùng raw `ListView.builder` trực tiếp, KHÔNG dùng `infinite_scroll_pagination` (package không có trong pubspec.yaml). `ListWidget` tích hợp `SmartRefresher` từ `pull_to_refresh: ^2.0.0`.
- "Mô tả" có thể wrap nhiều dòng → `GroupListCard` height variable → `ListView.builder` (bên trong `ListWidget`) handle dynamic height tự động.
- Split `GroupListCard` thành `const` constructor nếu không thay đổi state → tránh rebuild toàn card khi list refresh một phần.
- KHÔNG gọi API trên mỗi card render (không N+1); `MaterialGroupRepository` fetch page-level.

### 4.9 Error code mapping (consume từ BFF)

| Error code / GraphQL error | Display mode | Widget | Source AC |
|---|---|---|---|
| `UNAUTHORIZED` | Navigate to login | auto_route redirect | AC-9, AC-10 |
| `FORBIDDEN` | SnackBar "Bạn không có quyền truy cập" | `lib/ui/widgets/notify/` SnackBar | AC-9 |
| `NOT_FOUND` (parentId không tồn tại) | SnackBar "Nhóm cha không tồn tại hoặc không thuộc garage này" | SnackBar | AC-6 |
| `MATERIAL_GROUP_TREE_OVERSIZE` | SnackBar + fallback sang searchMaterialGroups | SnackBar + cubit fallback | AC-6 (filter page) |
| Network error / timeout | ListWidget `isFailure=true` + retry button | `lib/ui/widgets/list/list_widget.dart` | AC-1, AC-4 |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> Path glob ⊆ `mobile/gf-garage-app/lib/**` (Critical Rule #1).
> NC-MOB-01 (wave-overview §4.8): KG `implementation.components` unavailable cho garage-mobile trong bundle §G.X. Author scanned `lib/ui/widgets/` filesystem via canonical catalog từ template T2 + task brief (v6-v8 patterns) + wave03 Figma-mobile spec context. DEV PHẢI verify actual paths trước import.

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Change type | Figma node | AC ref |
|---|---|---|---|---|
| `MaterialGroupListPage` | `/inventory-catalog/material-groups` | NEW | `21254:52586` — frame `21235:29061` | AC-1, AC-2, AC-3, AC-5, AC-7, AC-8, AC-9, AC-11 |
| `MaterialGroupSearchPage` | `/inventory-catalog/material-groups/search` | NEW | `21254:52586` — frames `21252:48381`, `21252:48401`, `21252:48958` | AC-4, AC-5 |
| `MaterialGroupFilterPage` | `/inventory-catalog/material-groups/filter` | NEW | `21254:52586` — frames `21252:49574`, `21252:49582` | AC-6 |

### 5.2 Widgets

> **Author scanned `lib/ui/widgets/` via template T2 canonical catalog + task brief v6-v8 patterns. NC-MOB-01 applies — DEV verify exact paths trước import.**

| Widget | Path | Change type | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|
| `GroupListCard` | `lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` | BUILD-NEW | StatelessWidget | Build-new — justification: domain-specific card composition (code+name+StatusBadge+Divider+2×StartInfoRow with icon prefix); no fit at `lib/ui/widgets/**` after scan (canonical shared layer); pattern domain-new for inventory_catalog | AC-2, AC-3, AC-7 |
| `ListWidget` | `lib/ui/widgets/list/list_widget.dart` | REUSE | StatefulWidget | Priority 2 — `lib/ui/widgets/list/` (canonical shared); handle `isInitial/isLoading/isFailure/isEmpty` + auto-skeleton `LoadingRowShimmerWidget` + `SmartRefresher` pull-down/pull-up via `RefreshController` | AC-1, AC-3, AC-4 |
| `ListTabBarWidget` | `lib/ui/widgets/list/list_tab_bar_widget.dart` | REUSE | StatelessWidget | Priority 2 — `lib/ui/widgets/list/` (canonical shared); 3-tab status filter render; height fixed 44px; indicator + selected/unselected text color tokens | AC-5 |
| `LoadingRowShimmerWidget` | `lib/ui/widgets/loading/loading_row_shimmer_widget.dart` | REUSE (via ListWidget) | StatelessWidget | Priority 2 — `lib/ui/widgets/loading/` (canonical shared); auto-rendered bởi `ListWidget` khi `isInitial=true`; shimmer từ package `shimmer: ^3.0.0` | AC-1 |
| `StatusBadge` | `lib/ui/widgets/` (path NEED verify — canonical per task brief) | REUSE | StatelessWidget | Priority 2 — `lib/ui/widgets/` (canonical shared); render pill với label + bg/text color tokens; dùng `AppColors.bgBadgeSuccess`/`textSuccessPrimary` (ACTIVE) và `AppColors.bgBadgeWarning`/`textWarningPrimary` (INACTIVE) | AC-2 |
| `StartInfoRow` | `lib/ui/widgets/` (path NEED verify — canonical per task brief) | REUSE | StatelessWidget | Priority 2 — `lib/ui/widgets/` (canonical shared); label-value Row với leading icon; dùng cho "Thuộc nhóm" + "Mô tả" info rows trong `GroupListCard` | AC-2, AC-3 |
| `DropdownTextField` | `lib/ui/widgets/text_field/dropdown_text_field.dart` hoặc `lib/ui/widgets/dropdown/` (NEED verify path — NC-MOB-01) | REUSE | StatefulWidget | Priority 2 — `lib/ui/widgets/` canonical substitute cho `AppDropdown` (NOT EXISTS per template anti-pattern rule); kết hợp với `showModalBottomSheet` cho options panel | AC-6 |
| `AppButton` | `lib/ui/widgets/button/app_button.dart` | REUSE | StatelessWidget | Priority 2 — `lib/ui/widgets/button/` (canonical shared); `AppButton.text(title, appButtonSize, appButtonColor, onPress)` — dùng cho "Thêm nhóm vật tư" (primary) + filter footer buttons (secondary + primary) | AC-8, AC-6 |
| `CustomAppBar` | `lib/ui/widgets/` (canonical per Figma widget tree) | REUSE | StatelessWidget | Priority 2 — `lib/ui/widgets/` (canonical shared); `CustomAppBar(title, leading: BackButton(), actions: [...])` | AC-1 |

### 5.3 Navigation

| Route | Page | Guard | Args | AC ref |
|---|---|---|---|---|
| `/inventory-catalog/material-groups` | `MaterialGroupListPage` | `AuthGuard` (require JWT) | — | AC-1, AC-9 |
| `/inventory-catalog/material-groups/search` | `MaterialGroupSearchPage` | `AuthGuard` | `initialStatus: MaterialGroupStatus?` (current tab) | AC-4 |
| `/inventory-catalog/material-groups/filter` | `MaterialGroupFilterPage` | `AuthGuard` | `currentParentId: String?` (pre-selected, nullable) | AC-6 |
| `FEAT-CAT-GRP-DETAIL route` | `MaterialGroupDetailPage` (FEAT-CAT-GRP-DETAIL) | `AuthGuard` | `groupId: String` | AC-7 |
| `FEAT-CAT-GRP-CREATE route` | `MaterialGroupCreatePage` (FEAT-CAT-GRP-CREATE) | `AuthGuard` | — | AC-8 |

> auto_route `router.dart` + `router.gr.dart` (codegen) phải thêm `@RoutePage()` entries cho 3 pages mới. Verify router tồn tại tại `lib/core/router/router.dart`.

### 5.4 State management (Cubit)

| Concern | Pattern | File | States (freezed) | AC ref |
|---|---|---|---|---|
| List page state | Cubit | `lib/ui/inventory_catalog/material_group_list/material_group_list_cubit.dart` | `@freezed MaterialGroupListState { initial / loading / loaded(items, page, hasMore, currentStatus, currentParentId) / loadingMore / error(message) }` (@Injectable) | AC-1, AC-2, AC-3, AC-5, AC-6, AC-8, AC-9, AC-11 |
| Search page state | Cubit | `lib/ui/inventory_catalog/material_group_search/material_group_search_cubit.dart` | `@freezed MaterialGroupSearchState { keywordGuide / searching / loaded(items, keyword, resultCount) / noResults(keyword) / error }` (@Injectable) | AC-4, AC-5 |
| Filter page state | Cubit | `lib/ui/inventory_catalog/material_group_filter/material_group_filter_cubit.dart` | `@freezed MaterialGroupFilterState { loading / loaded(parentGroups, selectedParentId) / error }` (@Injectable) | AC-6 |
| List virtualization | `pull_to_refresh: ^2.0.0` via `ListWidget` | `lib/ui/widgets/list/list_widget.dart` | `RefreshController.refreshCompleted()` / `loadComplete()` | AC-3 |

> `BaseCubit<S>` là base class canonical trong Garage mobile — các Cubit trên extend `BaseCubit<MaterialGroupListState>` etc. `@Injectable()` cho injectable DI.

---

## 6. Data integration (Mobile — consume BFF)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter call pattern | Repository | AC ref |
|---|---|---|---|---|
| `searchMaterialGroups` | query | `_graphQLService.client.query(QueryOptions(document: gql(searchMaterialGroupsQuery), variables: {'input': input.toJson()}))` | `lib/core/repositories/inventory_catalog/material_group_repository.dart` | AC-1, AC-3, AC-4, AC-5, AC-6 |

> `searchMaterialGroups` (Q1) là **op duy nhất** mobile consume cho feature này — cả 3 page (list/search/filter) dùng với input khác nhau, bao gồm dropdown nhóm cha (`size=100`). `getMaterialGroupTree` (Q2) KHÔNG được mobile consume — loại bỏ khỏi scope per **CR-1782381477** (2026-06-25, flat-list-not-tree). BFF/BE vẫn giữ Q2 cho tích hợp tương lai (additive), nhưng mobile client KHÔNG gọi op này.
> Mọi op phải tồn tại ở paired BFF spec `features/bff/FEAT-CAT-GRP-LIST.md §6.1` (reviewer item #17 enforce).

> **[SỬA 2026-07-02 — CRITICAL, đảo ngược sửa 2026-07-01]**: Version trước đọc nhầm mobile CODE làm ground-truth thay vì BFF schema thật (`garage-function/agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts`). Xác nhận qua source code BFF thật: type/response name canonical KHÁC với những gì mobile code hiện đang gửi — đây là **CODE BUG** (mobile app hiện tại gọi sai type name), KHÔNG phải doc sai. Cần FIX cycle sửa `inventory_catalog_document.dart`, KHÔNG sửa spec này theo code nữa.

**Input schema** (`MaterialGroupSearchInput` — tên type CANONICAL theo BFF schema thật `inventory-catalog.schema.ts:280`. Mobile code hiện tại (`inventory_catalog_document.dart:16`) đang gửi sai tên `SearchMaterialGroupsInput` — type này KHÔNG tồn tại trong schema BFF → GraphQL server sẽ reject query. CẦN FIX):
```
keyword: String?
parentId: Int?                -- BFF schema dùng Int, KHÔNG phải ID
status: MaterialGroupStatus?   -- null = tất cả; ACTIVE = đang hoạt động; INACTIVE = ngừng
page: Int?                     -- 0-based, default 0
size: Int?                     -- default 20
sort: String?                  -- null = flat-grouped-by-parent (BE authoritative ordering)
```

**Response union type** (BFF schema thật — `generateMultipleResponseTypes` convention: `PagedMaterialGroupData` → responseType `PagedMaterialGroupApiResponse` → unionType `PagedMaterialGroupResponse`). Mobile code hiện tại dùng sai tên `... on SearchMaterialGroupsResponse` — type này KHÔNG tồn tại → GraphQL validation error "Fragment cannot be spread". CẦN FIX thành `... on PagedMaterialGroupApiResponse`.

**Output type `MaterialGroup`** (đầy đủ theo BFF schema `inventory-catalog.schema.ts:121-136` — `createdByName`/`updatedByName` CÓ TỒN TẠI trong schema, mobile hiện chỉ chưa select 2 field này trong query list — không phải "không tồn tại", chỉ là optional-omit vì UI list card không cần hiển thị):
```
id: Int!                       -- BFF dùng Int, KHÔNG phải ID
code: String!
name: String!
parentId: Int
parentName: String
status: MaterialGroupStatus!
description: String
childrenCount: Int             -- mobile hiện KHÔNG select (OK, UI không cần)
productCount: Int              -- mobile hiện KHÔNG select (OK, UI không cần)
createdAt: String
createdBy: String              -- mobile hiện KHÔNG select
createdByName: String          -- mobile hiện KHÔNG select (tồn tại trong schema, optional cho list card)
updatedAt: String
updatedBy: String              -- mobile hiện KHÔNG select
updatedByName: String          -- mobile hiện KHÔNG select (tồn tại trong schema, optional cho list card)
```

**Dart model**: `lib/core/models/inventory_catalog/material_group_model.dart` (`@freezed @JsonSerializable`)
**Dart response wrapper**: `lib/core/models/response/inventory_catalog/material_group_page_response.dart`

### 6.2 REST endpoints consumed direct

N/A — mobile không gọi REST trực tiếp. Tất cả qua BFF GraphQL.

### 6.3 Offline strategy

- Online-only feature. Không có offline cache.
- Connectivity check: nếu mất mạng → `isFailure=true` trong Cubit → ListWidget error state.
- KHÔNG dùng Hive/Isar cache cho list này.

### 6.4 Platform-specific behaviors

| Concern | iOS | Android | Notes |
|---|---|---|---|
| Permissions | — | — | Feature này không yêu cầu permission native |
| Back navigation | Swipe from left edge (iOS nav gesture) | System back button | auto_route handle |
| Keyboard dismiss | Tap outside search field | Back button | Search input focus management |

---

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/gf-garage-app/lib/**` (Critical Rule #11 + #1).

| Layer | Path glob | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/inventory_catalog/material_group_list/` | `material_group_list_page.dart` | NEW | Page `@RoutePage`, StatelessWidget + BlocConsumer | ~180 | AC-1, AC-5, AC-7, AC-8, AC-11 |
| `lib/ui/inventory_catalog/material_group_list/` | `material_group_list_cubit.dart` | NEW | Cubit (`BaseCubit<MaterialGroupListState>`, `@Injectable`) | ~120 | AC-1, AC-3, AC-5, AC-6 |
| `lib/ui/inventory_catalog/material_group_list/` | `material_group_list_state.dart` | NEW | `@freezed` union state | ~50 | AC-1 |
| `lib/ui/inventory_catalog/material_group_list/widgets/` | `group_list_card.dart` | NEW | StatelessWidget, domain-specific card | ~130 | AC-2, AC-3, AC-7 |
| `lib/ui/inventory_catalog/material_group_search/` | `material_group_search_page.dart` | NEW | Page `@RoutePage`, StatelessWidget + BlocConsumer | ~160 | AC-4, AC-5 |
| `lib/ui/inventory_catalog/material_group_search/` | `material_group_search_cubit.dart` | NEW | Cubit (`BaseCubit<MaterialGroupSearchState>`, `@Injectable`) | ~90 | AC-4 |
| `lib/ui/inventory_catalog/material_group_search/` | `material_group_search_state.dart` | NEW | `@freezed` union state | ~45 | AC-4 |
| `lib/ui/inventory_catalog/material_group_filter/` | `material_group_filter_page.dart` | NEW | Page `@RoutePage`, StatelessWidget + BlocConsumer | ~130 | AC-6 |
| `lib/ui/inventory_catalog/material_group_filter/` | `material_group_filter_cubit.dart` | NEW | Cubit (`BaseCubit<MaterialGroupFilterState>`, `@Injectable`) | ~80 | AC-6 |
| `lib/ui/inventory_catalog/material_group_filter/` | `material_group_filter_state.dart` | NEW | `@freezed` union state | ~40 | AC-6 |
| `lib/core/repositories/inventory_catalog/` | `material_group_repository.dart` | NEW | `@LazySingleton(as: MaterialGroupRepository)`, `GraphQLService` injected, direct gql call | ~100 | AC-1, AC-4, AC-6 |
| `lib/core/models/inventory_catalog/` | `material_group_model.dart` | NEW | `@freezed @JsonSerializable`, entity model | ~70 | AC-2 |
| `lib/core/models/response/inventory_catalog/` | `material_group_page_response.dart` | NEW | `@freezed @JsonSerializable`, pagination wrapper | ~40 | AC-1, AC-3 |
| `lib/core/router/` | `router.dart` (+ `router.gr.dart` codegen) | MODIFY (additive) | add `@RoutePage()` entries cho 3 pages mới | ~15 | AC-1, AC-4, AC-6 |
| `lib/l10n/` | `intl_vi.arb` + `intl_en.arb` | ADDITIVE | i18n keys cho empty state / error messages | ~20 | AC-1, AC-4 |
| `test/ui/inventory_catalog/material_group_list/` | `material_group_list_cubit_test.dart` | NEW | `bloc_test` pattern | ~140 | AC-1, AC-3, AC-5 |
| `test/ui/inventory_catalog/material_group_search/` | `material_group_search_cubit_test.dart` | NEW | `bloc_test` pattern | ~100 | AC-4 |
| `integration_test/inventory_catalog/` | `material_group_list_e2e_test.dart` | NEW | `patrol` / `integration_test` smoke | ~80 | (smoke) |

> Không có separate DataSource layer — GraphQL call DIRECT trong `MaterialGroupRepository` qua `_graphQLService.client.query(...)` (Garage mobile canonical per template).

---

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 song song với FE Web S6 (cùng entry: BFF S5 stable). Entry: BFF `searchMaterialGroups` op trên staging (mobile chỉ cần Q1 — Q2 không thuộc mobile scope per CR-1782381477).

```
(← BFF tier S5: SDL + resolver stable — searchMaterialGroups deployed; getMaterialGroupTree deployed nhưng KHÔNG phải entry-gate cho mobile)

S6  Mobile UI wire (Flutter)
    Entry:  BFF S5 SDL stable (2 ops available on staging)
            + Figma confirmed (wave03-cat-grp-list.md 9 frames verified §VV)
            + NC #1 (search header) + NC #2 (filter dropdown op) + NC #3 (default tab) resolved
    Exit:   bloc_test ≥80% green + Patrol E2E happy path green
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Model + Repository (GraphQL query strings + Dart models) | `core/repositories/` + `core/models/` | BFF op contract stable | Unit test query/response mapping | BFF S5 |
| S6.2 | `MaterialGroupListCubit` + state + `GroupListCard` widget | `ui/material_group_list/` | S6.1 | bloc_test: load/loadMore/tab-switch/error | S6.1 |
| S6.3 | `MaterialGroupListPage` (scaffold + AppBar + ListTabBarWidget + ListWidget + BottomBar) | `ui/material_group_list/` | S6.2 | Widget test: empty state + loaded state + card tap nav | S6.2 |
| S6.4 | `MaterialGroupSearchPage` + `MaterialGroupSearchCubit` | `ui/material_group_search/` | S6.1 | bloc_test: keyword-guide → searching → loaded/noResults | S6.1 |
| S6.5 | `MaterialGroupFilterPage` + `MaterialGroupFilterCubit` (dropdown) | `ui/material_group_filter/` | S6.1 | bloc_test: load parent groups → apply/reset filter | S6.1 |
| S6.6 | Router wiring (3 `@RoutePage` entries) | `core/router/` | S6.3, S6.4, S6.5 | `flutter build apk --debug` clean | S6.3–S6.5 |
| S6.7 | i18n ARB keys + a11y Semantics | `lib/l10n/` | S6.3 | ARB compile OK | S6.3 |
| S6.8 | Patrol E2E smoke — happy path GRP list + search + filter + nav | `integration_test/` | S6.6 | E2E green | S6.6 |

---

## 9. Business Rules to enforce (Mobile — UI hint secondary)

> Mobile KHÔNG enforce business validation primary. Primary = BE (`features/be/FEAT-CAT-GRP-LIST.md §9`). Mobile chỉ UI hint + RBAC render.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-013` | NORMAL | Không tự filter client-side — forward keyword lên BFF. UI chỉ debounce input (300ms) trước khi dispatch cubit event. | `material_group_search_cubit.dart` debounce | AC-4 | BE primary enforce OR-match trên `code/name` |
| `BR-CAT-GRP-006` | NORMAL | Render 2 badge variants chính xác: ACTIVE=green (bgBadgeSuccess) / INACTIVE=orange (bgBadgeWarning). KHÔNG render badge màu khác. | `group_list_card.dart` StatusBadge render | AC-2, AC-5 | DIV-06 deferred CR-20260630-01 P1.4 |
| `BR-CAT-GRP-005` | NORMAL | N/A cho mobile — rule chỉ áp dụng V2-2 tree endpoint, mobile không gọi endpoint này (per CR-1782381477). Filter dropdown dùng `searchMaterialGroups` (Q1) pagination thông thường, không có fallback path riêng. | `material_group_filter_cubit.dart` | AC-6 | BE primary: V2-2 tree endpoint (out of mobile scope) |
| Tenant isolation (CR #4) | CORNERSTONE | Không inject tenantId trong GraphQL variables — BFF extract từ JWT. | `material_group_repository.dart` — KHÔNG có `tenantId` field trong query vars | AC-10 | BFF primary |
| RBAC (CR #6) | CORNERSTONE | AuthGuard trên 3 routes; không ẩn hiện CRUD action theo role (cả 2 role equal per AC-9) | `lib/core/router/auth_guard.dart` | AC-9 | |

---

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (scaffold render) | test-mobile-ui | Verify AppBar title, 3 tabs, BottomBar visible; `bloc_test` initial→loading→loaded |
| AC-2 | Widget test (card render) | test-mobile-ui | Assert `GroupListCard` render đủ fields; badge color ACTIVE=green INACTIVE=orange |
| AC-3 | Widget test (flat list) + bloc_test (loadMore) | test-mobile-ui | Verify flat render KHÔNG có tree indentation; `loadMore` append items; `parentName=null` → row trống |
| AC-4 | bloc_test (search cubit) | test-mobile-ui | keyword-guide → searching → loaded; no-results state; debounce 300ms |
| AC-5 | Widget test (tab switch) | test-mobile-ui | Tab switch → `changeStatus()` → reload với đúng status filter |
| AC-6 | bloc_test (filter cubit) | test-mobile-ui | load parent groups qua `searchMaterialGroups` (Q1) size=100; apply/reset filter |
| AC-7 | Widget test (card tap navigation) | test-mobile-ui | Tap `GroupListCard` → navigate to Detail; KHÔNG có inline edit/delete icon |
| AC-8 | Widget test (BottomBar button) | test-mobile-ui | Tap "Thêm nhóm vật tư" → navigate to Create; button luôn visible (empty state test) |
| AC-9 | Isolation test (RBAC) | test-isolation | `AuthGuard` redirect khi no JWT; cả 2 role xem được list |
| AC-10 | Repository unit test (no tenantId in vars) | test-mobile-ui | Assert `searchMaterialGroups` query variables KHÔNG chứa `tenantId` |
| AC-11 | Widget test (full CRUD entry points) | test-mobile-ui | BottomBar visible + card tap functional → contrast với PROD-LIST view-only behavior |
| (smoke) | Patrol E2E happy path | test-mobile-e2e | Navigate to list → search → filter → card tap; BottomBar tap; badge colors |

---

## 11. i18n & a11y

### 11.1 i18n keys (Flutter ARB)

> Verify files tồn tại: `mobile/gf-garage-app/lib/l10n/intl_vi.arb` + `intl_en.arb`.

| Key | vi | en | AC ref |
|---|---|---|---|
| `materialGroupList_title` | "Nhóm vật tư hàng hóa" | "Material Groups" | AC-1 |
| `materialGroupList_addButton` | "Thêm nhóm vật tư" | "Add Group" | AC-8 |
| `materialGroupList_tabAll` | "Tất cả" | "All" | AC-5 |
| `materialGroupList_tabActive` | "Đang hoạt động" | "Active" | AC-5 |
| `materialGroupList_tabInactive` | "Ngừng hoạt động" | "Inactive" | AC-5 |
| `materialGroupList_emptyData` | "Không có dữ liệu" | "No data" | AC-1 (EC-1) |
| `materialGroupSearch_title` | "Tìm kiếm" | "Search" | AC-4 |
| `materialGroupSearch_hint` | "Tìm kiếm" | "Search" | AC-4 |
| `materialGroupSearch_guide` | "Tìm kiếm nhóm vật tư theo từ khoá" | "Search material groups by keyword" | AC-4 (NC #1) |
| `materialGroupSearch_guideBulletCode` | "Mã nhóm" | "Group code" | AC-4 |
| `materialGroupSearch_guideBulletName` | "Tên nhóm" | "Group name" | AC-4 |
| `materialGroupSearch_noResults` | "Không có kết quả phù hợp" | "No results found" | AC-4 (EC-4) |
| `materialGroupSearch_noResultsHint` | "Vui lòng thử lại" | "Please try again" | AC-4 (EC-4) |
| `materialGroupSearch_resultCount` | "{count} kết quả tìm kiếm cho \"{keyword}\"" | "{count} results for \"{keyword}\"" | AC-4 |
| `materialGroupFilter_title` | "Bộ lọc" | "Filter" | AC-6 |
| `materialGroupFilter_parentGroupLabel` | "Thuộc nhóm" | "Parent group" | AC-6 |
| `materialGroupFilter_parentGroupPlaceholder` | "Chọn nhóm hàng" | "Select parent group" | AC-6 |
| `materialGroupFilter_reset` | "Thiết lập lại" | "Reset" | AC-6 |
| `materialGroupFilter_apply` | "Áp dụng" | "Apply" | AC-6 |
| `materialGroupCard_parentGroupLabel` | "Thuộc nhóm" | "Parent group" | AC-2 |
| `materialGroupCard_descriptionLabel` | "Mô tả" | "Description" | AC-2 |
| `error_unauthorized` | "Phiên đăng nhập hết hạn" | "Session expired" | AC-9 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Implementation |
|---|---|---|
| AC-1 | AppBar icon buttons có `Semantics(label, button: true)` | `IconButton(icon: Icon(Icons.search), tooltip: "Tìm kiếm")` — Flutter `IconButton` tự render `Semantics` từ `tooltip` |
| AC-2 | `GroupListCard` tổng hợp label cho screen reader | `Semantics(label: "${group.code} ${group.name} ${statusLabel}")` wrapping card |
| AC-4 | `TextField` search có `semanticsLabel` | `AppTextField(semanticsLabel: "Tìm kiếm nhóm vật tư")` |
| AC-5 | `TabBar` tab selection announced | Flutter `TabBar` tự announce tab change qua `SemanticsService` |
| AC-8 | BottomBar button `Semantics` | `AppButton` với `semanticsLabel: "Thêm nhóm vật tư"` |
| AC-9 | Tap target ≥ 48dp cho mọi action | `AppButton` height 48px; `IconButton` size 24px + `minimumSize` MediaQuery |
| (all) | WCAG AA contrast | Enforce qua `AppColors.*` tokens — không hardcode; verify contrast ratio ≥ 4.5:1 |

---

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-LIST.md` | DRAFT | REST V2-1 `POST /api/v2/material-groups/search` — primary enforcement BR-CAT-GRP-013, tenant isolation, RBAC |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-LIST.md` | DRAFT | BFF SDL có cả `searchMaterialGroups` + `getMaterialGroupTree` (§6.1) — Mobile CHỈ consume `searchMaterialGroups` (Q1); `getMaterialGroupTree` (Q2) giữ additive cho tương lai, KHÔNG phải mobile scope (CR-1782381477) |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-LIST.md` | DRAFT | Share cùng BFF ops + source FEAT; web dùng table + pagination, mobile dùng card list + TabBar filter |

**Source ID consistency** (reviewer item #18): `source_feat_sha = cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef` — identical với BE/BFF/FE-web tier files.

**NEED CONFIRMATION markers (tổng 2 open + 1 RESOLVED)**:
1. **NC-FIGMA-03**: Search page header text — Figma copy bug "phiếu dịch vụ", implement "nhóm vật tư". BA confirm wording trước merge. (`_decisions.md` entry 2026-06-29 đã ghi nhận.)
2. ~~**NC-SDL-04**~~ **RESOLVED** (2026-07-01, retroactive — quyết định gốc đã có từ **CR-1782381477** 2026-06-25, spec này chưa cập nhật kịp): Filter dropdown parent group op = `searchMaterialGroups` (Q1) size=100. `getMaterialGroupTree` (Q2) KHÔNG thuộc mobile scope — loại bỏ hoàn toàn cùng TreeView + tree-oversize fallback. Nếu tenant >100 nhóm cần paginated dropdown về sau — theo dõi riêng, KHÔNG phải lý do tái sử dụng Q2.
3. **NC-MOBILE-GRP-LIST-01**: Default tab — "Đang hoạt động" per AC-5 vs "Tất cả" per Figma frame 21235:29061. BA confirm canonical initial tab selection.

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-LIST.md`](../../../../../Product/features/FEAT-CAT-GRP-LIST.md) v6
- **Paired BE**: [`features/be/FEAT-CAT-GRP-LIST.md`](../be/FEAT-CAT-GRP-LIST.md) — REST V2-1 contract, BR enforcement
- **Paired BFF**: [`features/bff/FEAT-CAT-GRP-LIST.md`](../bff/FEAT-CAT-GRP-LIST.md) — GraphQL ops `searchMaterialGroups`, `getMaterialGroupTree`
- **Figma mobile**: [`Product/ux/figma-mobile/wave03-cat-grp-list.md`](../../../../../Product/ux/figma-mobile/wave03-cat-grp-list.md) (node 21254:52586, 9 frames, transform_version 7 ACTIVE)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1
- **HLD Mobile**: [`Architecture/hld/garage-mobile-HLD.md`](../../../../../Architecture/hld/garage-mobile-HLD.md)
- **PKG**: [`Execution/work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) v21 §2.2.4
- **Wave overview**: [`Execution/wave-specs/W03/_wave-overview.md`](../../_wave-overview.md) §3 DIV-06/DIV-09, §4.8 NC-MOB-01
- **Decision log**: [`Execution/wave-specs/W03/_decisions.md`](../../_decisions.md) — 4 decisions cho FEAT-CAT-GRP-LIST mobile (entries 2026-06-29)
- **ADR-009**: JPA no relationship mapping (scalar FK — ảnh hưởng BE entity shape, không trực tiếp mobile)
- **BR refs**: `BR-CAT-GRP-005`, `BR-CAT-GRP-006`, `BR-CAT-GRP-013`

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 3 | Delivery Authority (in-session full GraphQL re-audit — user request "check lại hết phần graphql của wave 3") | **Fix §6.1 input/output type drift vs code ground-truth** (`mobile/gf-garage-app/lib/core/services/graphql/documents/inventory_catalog_document.dart`): input type tên đúng `SearchMaterialGroupsInput` (thay `MaterialGroupSearchInput`); output field-set xoá `createdByName`/`updatedByName` (list query KHÔNG fetch 2 field này — chỉ `getMaterialGroup` detail mới có). Verified bằng đọc trực tiếp GraphQL document + Dart model, không suy luận. |
| 2026-07-01 | 2 | Delivery Authority (in-session doc-drift audit — user request "check GraphQL mobile document") | **Close NC-SDL-04 + remove getMaterialGroupTree (Q2) mentions** — spec (authored 2026-06-30) chưa cập nhật kịp **CR-1782381477** (approved 2026-06-25, 5 ngày trước) vốn đã quyết định dứt khoát mobile dùng Q1 `searchMaterialGroups` thay Q2, bỏ TreeView + tree-oversize fallback (8→7 ops). 8 vị trí sửa: §2 dòng mô tả BFF consume (bỏ "hoặc getMaterialGroupTree"); §3 AC-6 (NEED CONFIRMATION #2 → RESOLVED); §4.2 (xoá MATERIAL_GROUP_TREE_OVERSIZE error handling — dead path); §6.1 (xoá row `getMaterialGroupTree` khỏi bảng ops + prose); §8 DAG (bỏ Q2 khỏi entry-gate); §9 BR-CAT-GRP-005 (rewrite N/A rationale); §10 test scope AC-6 (xoá test case fallback không thể xảy ra); §11.1 (xoá i18n key `error_treeOversize` mồ côi); §12 (paired BFF row + NC-SDL-04 marker → RESOLVED). Mobile CODE đã đúng từ đầu (`inventory_catalog_document.dart:4` comment "KHÔNG Q2 getMaterialGroupTree" — verified, không cần FIX cycle). `_decisions.md` dòng tương ứng (2026-06-29 feature-mobile FEAT-CAT-GRP-LIST) cũng flagged superseded. |
| 2026-06-30 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-CAT-GRP-LIST` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (byte-equal cross-tier với BE/BFF), §2 trách nhiệm Mobile (6 bullet: 3 pages, GroupListCard, Cubit states, auto_route navigation, BFF consume), §3 behaviour map 11 AC-IDs (3 clusters A/B/C/D; AC-7 card-tap nav KHÔNG inline icons per Figma §VV; AC-8 BottomBar text-only NO Icons.add per Figma §VV; AC-10 N/A delegate BFF/BE), §4 visual fidelity (design tokens, orange badge DIV-06 deferred CR-20260630-01 P1.4), §5 pages + widgets (NC-MOB-01 path verify; build-new GroupListCard justified; 8 REUSE widgets), §6 GraphQL ops (searchMaterialGroups primary; getMaterialGroupTree filter fallback), §7 file map 17 entries ⊆ mobile/gf-garage-app/lib/**, §8 DAG S6.1→S6.8, §9 BR secondary (3 BRs), §10 test scope 11 ACs + smoke, §11 i18n 21 ARB keys + a11y 7 requirements, §12 cross-tier pair + 3 NEED CONFIRMATION markers. Source FEAT v6 chỉ audit. Figma SSOT node 21254:52586 (9 frames, §VV verified). |
