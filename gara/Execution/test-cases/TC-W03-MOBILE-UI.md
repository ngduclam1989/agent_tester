---
document_id: 'GMS-TC-W03-MOBILE-UI'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'garage-mobile'
wave: 'W03'
owner: 'QA Authority'
last_reviewed: '2026-06-30'
---

# Test Case W03 — Mobile UI Layer (Flutter)

## 1. General Info

| Field | Value |
| --- | --- |
| Document ID | `GMS-TC-W03-MOBILE-UI` |
| Wave | W03 |
| Boundary(ies) | `garage-mobile` |
| Feature(s) | `FEAT-INV-MOBILE-MENU` (hub), `FEAT-CAT-GRP-LIST`, `FEAT-CAT-GRP-CREATE`, `FEAT-CAT-GRP-DETAIL`, `FEAT-CAT-GRP-EDIT`, `FEAT-CAT-GRP-DELETE`, `FEAT-CAT-PROD-LIST` (view-only), `FEAT-CAT-PROD-DETAIL` (view-only) |
| Owner | `QA Authority` |
| Last Reviewed | 2026-06-30 |
| Work Package | `Execution/work-packages/PKG-W03-inventory-catalog.md` |

---

## 2. Scope

### In Scope (Mobile partial scope — CR-1782373204 + CR-1782381477)

- **Hub navigation** `FEAT-INV-MOBILE-MENU` — màn "Quản lý kho hàng" grid 2 cột tối đa 6 tile; W03 hiện 2 tile: "Sản phẩm" + "Nhóm vật tư"; 4 tile khác ẨN HOÀN TOÀN (không có badge, không có placeholder)
- **Nhóm VTHH — FULL CRUD trên mobile** (5 page + 1 cubit delete):
  - `MaterialGroupListPage` — flat card list (KHÔNG TreeView per CR-1782381477) với `ListWidget` + `ListTabBarWidget` 3-tab status + filter sub-page + footer text-button (KHÔNG Material FAB)
  - `AddMaterialGroupPage` (route `/catalog/material-groups/add`)
  - `EditMaterialGroupPage` (route `/catalog/material-groups/:id/edit`)
  - `MaterialGroupDetailPage` — render 6 field qua `StartInfoRow` + footer 2-action Xoá/Sửa
  - `MaterialGroupDeleteCubit` — dialog xác nhận được kích hoạt từ List (long-press / action menu) + Detail footer
- **Mã sản phẩm nội bộ — VIEW-ONLY trên mobile** (2 page):
  - `InternalProductListPage` (FEAT-CAT-PROD-LIST v6) — `ListWidget` pattern, search + filter sub-page; AppBar KHÔNG có nút `+ Tạo mới` / `↓ Import` / `↑ Export`
  - `InternalProductDetailPage` (FEAT-CAT-PROD-DETAIL v8) — `SmartRefresher` + 4 cards (ProductHeaderCard + GeneralInfoCard + TechnicalSpecCard + SpecificationDescriptionCard); KHÔNG có Tabs widget, KHÔNG có Edit/Delete/AppBar trailing/BottomBar
- **Kiểm tra mẫu tái sử dụng canonical** (v24):
  - `ListWidget` (`lib/ui/widgets/list/list_widget.dart`) — xử lý `isInitial/isLoading/isFailure/isEmpty` + auto-skeleton + SmartRefresher pull-down/pull-up
  - `ListTabBarWidget` (`lib/ui/widgets/list/list_tab_bar_widget.dart`)
  - `LoadingRowShimmerWidget` (`lib/ui/widgets/loading/loading_row_shimmer_widget.dart`, package `shimmer: ^3.0.0`)
  - `LoadEmpty` + `LoadError` + `StatusBadge` + `StartInfoRow` cross-domain reuse
  - `SafeArea` bottom mandatory cho mọi page có BottomBar/Footer
  - `SmartRefresher` pull-to-refresh cho List/Detail
- **GraphQL ops mobile** — 4 Query + 3 Mutation = 7 ops: Q1 `searchMaterialGroups`, Q3 `getMaterialGroup`, Q4 `searchInternalProducts`, Q5 `getInternalProduct`, M1/M2/M3 (create/update/delete material group)
- **Permission C-2** — cả 2 role (chủ garage + kế toán) thấy tile + dùng được CRUD nhóm
- **Độ bao phủ nhãn Semantics** cho widget tương tác
- **Responsive** điện thoại + máy tính bảng

### Out of Scope

- **Mobile Product CRUD/Import/Export** — 5 FEAT `FEAT-CAT-PROD-{CREATE, EDIT, DELETE, IMPORT, EXPORT}` = web-only (CR-1782373204)
- **Mobile Q2 `getMaterialGroupTree`** — mobile flat list per CR-1782381477 (BFF Q2 vẫn giữ nhưng mobile KHÔNG gọi)
- **TreeView widget mobile** — drop hẳn (CR-1782381477)
- **Hub: 4 tile khác** (Phiếu nhập / Phiếu xuất / Tồn kho / Tồn đầu kỳ) — chưa GA W03, ẨN HOÀN TOÀN
- **API contract** (thuộc TC-W03-API)
- **Cross-platform sync Web ↔ Mobile** (thuộc TC-W03-MOBILE-E2E nếu tách)
- **Performance / load test**
- **A11y screen reader chi tiết** — chỉ kiểm tra Semantics labels có mặt

### Test Environment & Data

| Item | Required Data / Setup | Notes |
| --- | --- | --- |
| Flutter app | Build staging với flag `wave3_catalog_enabled = true` | Flutter 3.41 + Cubit |
| Device | Android 13 (phone Pixel 6) + iOS 17 (iPhone 14) + Android tablet (Pixel Tab) | Responsive kiểm tra |
| Backend | `agg-garage-graph` GraphQL endpoint cấu hình `.env.staging` | Mobile gọi GraphQL |
| Master data | gf-erp-mdm UNIT + COUNTRY seeded | Dropdown |
| Auth | Token `accountant` + `garage-owner` cho tenant `garage-a` | RBAC test |
| Seed Group | Cấu trúc đa tầng: 3 cha + 5 con ACTIVE + 1 INACTIVE | Cho cascade test |
| Seed Product | ≥ 10 mã ACTIVE + ≥ 2 INACTIVE | View-only test |
| Patrol harness | Tái dùng từ W01/W02 | Widget test + golden |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| --- | --- | --- |
| Automated | N/A | — |
| Manual | 52 | 52 READY |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-MOBILE-UI-001 | FEAT-INV-MOBILE-MENU | garage-mobile | UX-FLOW §3.0 | MUI | Wave | P1 | Mở Hub "Quản lý kho hàng" render grid 2 cột với đúng 2 tile (trạng thái W03) | Đăng nhập token kế toán tenant `garage-a`; flag W03 enabled | 1. Tap entry point "Quản lý kho hàng" (drawer/bottom-nav/tile chính).<br>2. Quan sát màn hub. | - Màn `HUB_PAGE` hiển thị.<br>- Grid 2 cột, đúng 2 tile: "Sản phẩm" (📦) + "Nhóm vật tư" (📁).<br>- 4 tile khác ẨN HOÀN TOÀN — không có placeholder, không có badge.<br>- Header "← Quản lý kho hàng" + status bar. | READY | N/A |
| TC-W03-MOBILE-UI-002 | FEAT-INV-MOBILE-MENU | garage-mobile | UX-FLOW §3.0 hành vi | MUI | Wave | P1 | Tap tile "Sản phẩm" push route `InternalProductListPage` + preserve back stack | Đang ở hub | 1. Tap tile "Sản phẩm".<br>2. Quan sát route.<br>3. Tap nút back Android. | - Push `/catalog/internal-products`.<br>- `InternalProductListPage` mount.<br>- Tap back → quay về hub (preserve stack). | READY | N/A |
| TC-W03-MOBILE-UI-003 | FEAT-INV-MOBILE-MENU | garage-mobile | UX-FLOW §3.0 | MUI | Wave | P1 | Tap tile "Nhóm vật tư" push `MaterialGroupListPage` | Đang ở hub | 1. Tap tile "Nhóm vật tư".<br>2. Quan sát. | - Push `/catalog/material-groups`.<br>- `MaterialGroupListPage` mount.<br>- Back về hub. | READY | N/A |
| TC-W03-MOBILE-UI-004 | FEAT-INV-MOBILE-MENU | garage-mobile | UX-FLOW §3.0 | MUI | Wave | P2 | Cả 2 role (chủ garage + kế toán) thấy đủ 2 tile | Đăng nhập từng role | 1. Đăng nhập `garage-owner` → mở hub.<br>2. Đăng nhập `accountant` → mở hub. | - Cả 2 role thấy 2 tile như nhau.<br>- Permission per sub-module gate ở route đích, không ở hub. | READY | N/A |
| TC-W03-MOBILE-UI-005 | FEAT-CAT-GRP-LIST | garage-mobile | AC-1, AC-3 (CR-1782381477) | MUI | Wave | P1 | `MaterialGroupListPage` render **flat card list** (KHÔNG TreeView) với `ListWidget` | Tenant có ≥ 5 nhóm ACTIVE | 1. Mở List page.<br>2. Quan sát layout. | - Card list flat (KHÔNG indent, KHÔNG expand/collapse).<br>- Mỗi card: code blue header + `StatusBadge` + name + divider + 2 InfoRow ("Thuộc nhóm" + "Mô tả").<br>- `ListWidget` được dùng (kiểm tra qua Semantics).<br>- `ListView.builder` KHÔNG được triển khai lại. | READY | N/A |
| TC-W03-MOBILE-UI-006 | FEAT-CAT-GRP-LIST | garage-mobile | AC-1 layout | MUI | Wave | P1 | AppBar có title + search icon + filter icon; footer text-button "Thêm nhóm vật tư" với SafeArea bottom | Đang ở List page | 1. Quan sát AppBar + footer. | - AppBar: title "Nhóm vật tư hàng hóa" + search icon (🔍) + filter icon (⚙).<br>- Footer `GroupListFooter` — text-button "Thêm nhóm vật tư" full-width + border-top + **SafeArea bottom**.<br>- KHÔNG có Material FAB ⊕ (per Figma + AC-8).<br>- Pull-down + pull-up được bật (SmartRefresher). | READY | N/A |
| TC-W03-MOBILE-UI-007 | FEAT-CAT-GRP-LIST | garage-mobile | AC-5, BR-CAT-GRP-006 | MUI | Wave | P1 | `ListTabBarWidget` 3-tab (Tất cả / Đang hoạt động / Ngừng hoạt động) — tap tab refilter | Có ≥ 1 nhóm INACTIVE | 1. Quan sát tab bar.<br>2. Tap từng tab. | - 3 tab hiển thị, default focus "Đang hoạt động".<br>- Tap "Tất cả" → list hiển thị cả ACTIVE + INACTIVE.<br>- Tap "Ngừng hoạt động" → chỉ INACTIVE.<br>- Counter optional per tab. | READY | N/A |
| TC-W03-MOBILE-UI-008 | FEAT-CAT-GRP-LIST | garage-mobile | AC-4, AC-6 filter | MUI | Wave | P2 | Tap filter icon mở `MaterialGroupFilterPage` (full-page route) với search + filter parent | Đang ở List | 1. Tap filter icon.<br>2. Quan sát route. | - Push `/catalog/material-groups/filter`.<br>- Full-page với search box + dropdown "Nhóm cha" (chỉ ACTIVE) + nút "Áp dụng" / "Đặt lại".<br>- Apply → quay List với filter active + indicator. | READY | N/A |
| TC-W03-MOBILE-UI-009 | FEAT-CAT-GRP-LIST | garage-mobile | LoadingRowShimmer | MUI | Wave | P2 | Khi `isInitial = true` (lần đầu load), hiển thị `LoadingRowShimmerWidget` skeleton — KHÔNG CircularProgressIndicator | Mở Group List lần đầu | 1. Mở app lần đầu (cold start) → mở Group List.<br>2. Quan sát loading state. | - Skeleton shimmer hiển thị (package `shimmer: ^3.0.0`).<br>- KHÔNG có `CircularProgressIndicator` centered.<br>- Sau khi load xong → fade in card list. | READY | N/A |
| TC-W03-MOBILE-UI-010 | FEAT-CAT-GRP-LIST | garage-mobile | SmartRefresher | MUI | Wave | P1 | Pull-down refresh — call `refreshCompleted` sau khi reload thành công | List có data | 1. Pull-down từ top list.<br>2. Quan sát loader.<br>3. Kiểm tra list reload. | - Custom loader xuất hiện top.<br>- Call Q1 `searchMaterialGroups` mới.<br>- Loader biến mất sau `refreshCompleted`.<br>- List update.<br>- Test pull-down khi network fail → `refreshFailed` + giữ data cũ. | READY | N/A |
| TC-W03-MOBILE-UI-011 | FEAT-CAT-GRP-LIST | garage-mobile | EC-11 (UX-FLOW) | MUI | Wave | P2 | Empty state — tenant rỗng dùng `LoadEmpty` widget | Tenant `garage-empty` | 1. Đăng nhập tenant rỗng.<br>2. Mở Group List. | - `LoadEmpty` hiển thị với icon + text "Không có dữ liệu".<br>- Vẫn giữ AppBar + tab bar + footer button.<br>- KHÔNG dùng custom widget. | READY | N/A |
| TC-W03-MOBILE-UI-012 | FEAT-CAT-GRP-LIST | garage-mobile | error | MUI | Wave | P2 | Error state — network fail dùng `LoadError` widget | Mock network 500 | 1. Mock GraphQL 500.<br>2. Mở Group List. | - `LoadError` hiển thị với icon + text + nút "Thử lại".<br>- Tap "Thử lại" → re-call Q1. | READY | N/A |
| TC-W03-MOBILE-UI-013 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-1 | MUI | Wave | P1 | Tap footer "Thêm nhóm vật tư" push `AddMaterialGroupPage` với form widget dùng chung | List page | 1. Tap "Thêm nhóm vật tư".<br>2. Quan sát route + layout. | - Push `/catalog/material-groups/add`.<br>- `AddMaterialGroupPage` mount với `MaterialGroupForm(isEdit: false)`.<br>- 5 trường: Mã / Tên / Thuộc nhóm / Trạng thái / Mô tả.<br>- AppBar: ← Thêm nhóm vật tư + nút "Lưu".<br>- SafeArea bottom. | READY | N/A |
| TC-W03-MOBILE-UI-014 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-2 | MUI | Wave | P1 | Mã field — regex BR-CAT-GRP-002 + autoUppercase | AddPage | 1. Nhập `grp@01` (chữ thường + ký tự đặc biệt).<br>2. Quan sát. | - Tự động chuyển thành chữ HOA: `GRP@01`.<br>- Inline error "Mã nhóm không được chứa ký tự đặc biệt".<br>- Nút Lưu disabled. | READY | N/A |
| TC-W03-MOBILE-UI-015 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-4, BR-CAT-GRP-008 | MUI | Wave | P1 | Dropdown "Thuộc nhóm" chỉ ACTIVE + cho bỏ trống | AddPage | 1. Tap dropdown Thuộc nhóm. | - Bottom sheet với search + list nhóm ACTIVE.<br>- INACTIVE không xuất hiện.<br>- Option "Không thuộc nhóm nào" / clear. | READY | N/A |
| TC-W03-MOBILE-UI-016 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-2, AC-3 dialog xác nhận cascade INACTIVE | MUI | Wave | P2 | Khi chọn parent INACTIVE — hiển thị dialog xác nhận cascade INACTIVE | AddPage có parent INACTIVE trong dropdown khi filter tất cả | 1. Chọn parent (trường hợp hiếm nếu BR-008 đã filter — kiểm tra biên).<br>2. Quan sát. | - Theo BR-CAT-GRP-008 không cho chọn parent INACTIVE.<br>- Nếu vô tình → dialog xác nhận cascade hoặc từ chối submit. | READY | N/A |
| TC-W03-MOBILE-UI-017 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-8 | MUI | Wave | P1 | Submit valid → toast + navigate back List | Form hợp lệ | 1. Nhập đủ trường valid.<br>2. Tap "Lưu". | - Toast/snackbar "Tạo thành công".<br>- Pop back stack → quay List.<br>- List reload tự động (refetch Q1). | READY | N/A |
| TC-W03-MOBILE-UI-018 | FEAT-CAT-GRP-EDIT | garage-mobile | AC-1 | MUI | Wave | P1 | Tap card trên List → push DetailPage; từ Detail tap "Sửa" → push EditPage pre-filled | Có nhóm `GRP-EDIT` | 1. Tap card `GRP-EDIT` → DetailPage.<br>2. Tap footer "Sửa".<br>3. Quan sát EditPage. | - Push `/catalog/material-groups/<id>/edit`.<br>- `EditMaterialGroupPage` mount với `MaterialGroupForm(isEdit: true)`.<br>- Pre-filled từ Q3 `getMaterialGroup`.<br>- Mã field disabled. | READY | N/A |
| TC-W03-MOBILE-UI-019 | FEAT-CAT-GRP-EDIT | garage-mobile | AC-5 cascade INACTIVE | MUI | Wave | P1 | Đổi status ACTIVE → INACTIVE cho nhóm có 2 con — xác nhận cascade | Nhóm `GRP-PARENT-A` có 2 con ACTIVE | 1. Mở Edit `GRP-PARENT-A`.<br>2. Đổi status INACTIVE.<br>3. Tap "Lưu". | - Bottom sheet/dialog xác nhận: "Thay đổi này kéo theo 2 nhóm con cũng chuyển ngừng hoạt động. Xác nhận?".<br>- "Xác nhận" → submit M2 + cascade BE.<br>- "Huỷ" → giữ form. | READY | N/A |
| TC-W03-MOBILE-UI-020 | FEAT-CAT-GRP-EDIT | garage-mobile | AC-7 | MUI | Wave | P2 | Submit valid → toast + back to Detail (cập nhật) | Form hợp lệ | 1. Sửa tên.<br>2. Tap "Lưu". | - Toast "Cập nhật thành công".<br>- Pop back → DetailPage reflect tên mới.<br>- Audit Người sửa/Ngày sửa cập nhật. | READY | N/A |
| TC-W03-MOBILE-UI-021 | FEAT-CAT-GRP-DETAIL | garage-mobile | AC-1, AC-2 layout v6 | MUI | Wave | P1 | DetailPage layout: header + 6 `StartInfoRow` field + footer 2-action | Có nhóm `GRP-DET` | 1. Tap card → DetailPage. | - `CustomScaffold` → Column.<br>- Header: tên nhóm + StatusBadge.<br>- 6 `StartInfoRow`: Tên / Thuộc nhóm / Mô tả / Trạng thái-badge / Người tạo / Người cập nhật.<br>- `SafeArea(top: false)` cho Footer.<br>- `GroupDetailFooter` 104px với 2 action button: "Xoá" + "Sửa".<br>- SmartRefresher pull-down (no pull-up) cho reload detail. | READY | N/A |
| TC-W03-MOBILE-UI-022 | FEAT-CAT-GRP-DETAIL | garage-mobile | LoadingRowShimmer | MUI | Wave | P2 | Detail load lần đầu hiển thị 2 slot skeleton (Header + FieldList) + Gap separator | Mở Detail lần đầu (cold start) | 1. Mở lần đầu (cold start) Detail page. | - Skeleton 2 slot: Header ~100 + FieldList ~280 (heights cụ thể).<br>- `Gap(AppSizes.spacing8)` separator.<br>- Sau load → fade vào layout thật. | READY | N/A |
| TC-W03-MOBILE-UI-023 | FEAT-CAT-GRP-DETAIL | garage-mobile | StatusBadge cross-domain | MUI | Wave | P2 | StatusBadge reuse `lib/ui/inventory/widgets/status_badge.dart` qua adapter `MaterialGroupStatus implements InventoryStatusInterface` | DetailPage có status field | 1. Kiểm tra StatusBadge widget.<br>2. Kiểm tra reuse path. | - Widget path: `lib/ui/inventory/widgets/status_badge.dart`.<br>- Adapter ~15 LOC tại `lib/core/models/inventory_catalog/material_group_status_extension.dart`.<br>- ACTIVE: green badge; INACTIVE: orange badge. | READY | N/A |
| TC-W03-MOBILE-UI-024 | FEAT-CAT-GRP-DELETE | garage-mobile | AC-1, AC-2 | MUI | Wave | P1 | Tap "Xoá" footer Detail mở dialog xác nhận | Nhóm trống `GRP-DEL` | 1. Mở Detail `GRP-DEL`.<br>2. Tap "Xoá".<br>3. Quan sát dialog. | - Dialog: tiêu đề "Xác nhận xoá" + nội dung "Bạn có chắc muốn xoá '[tên nhóm]'?".<br>- 2 nút: "Xoá" + "Huỷ".<br>- `MaterialGroupDeleteCubit` initial state. | READY | N/A |
| TC-W03-MOBILE-UI-025 | FEAT-CAT-GRP-DELETE | garage-mobile | AC-4, ERR-INV-004 | MUI | Wave | P1 | Xoá nhóm có mã sản phẩm — dialog block "Không thể xoá" | `GRP-HAS-PROD` | 1. Mở Detail → "Xoá".<br>2. Quan sát. | - Dialog "Không thể xoá" với text "Nhóm đã phát sinh mã sản phẩm nên không xoá được".<br>- Chỉ 1 nút "Đóng".<br>- Cubit transition: confirmPending → error. | READY | N/A |
| TC-W03-MOBILE-UI-026 | FEAT-CAT-GRP-DELETE | garage-mobile | AC-5, ERR-INV-005 | MUI | Wave | P1 | Xoá nhóm còn con — dialog block | `GRP-PARENT` có 2 con | 1. Mở Detail → "Xoá". | - Dialog "Không thể xoá" với text "Phải xoá hết nhóm con trước".<br>- Nút "Đóng". | READY | N/A |
| TC-W03-MOBILE-UI-027 | FEAT-CAT-GRP-DELETE | garage-mobile | AC-1 (kích hoạt từ List) | MUI | Wave | P2 | Long-press card trong List mở action menu "Xoá" → kích hoạt cùng `MaterialGroupDeleteCubit` | List có card | 1. Long-press card.<br>2. Tap "Xoá". | - Bottom sheet action menu hiện với "Xoá".<br>- Tap → dialog confirmation.<br>- Submit xoá → toast + reload List. | READY | N/A |
| TC-W03-MOBILE-UI-028 | FEAT-CAT-GRP-DELETE | garage-mobile | RBAC | MUI | Wave | P2 | Cubit RBAC gate: cả 2 role được phép xoá | Đăng nhập từng role | 1. Đăng nhập `accountant` → xoá.<br>2. Đăng nhập `garage-owner` → xoá. | - Cả 2 đều submit M3 thành công.<br>- Permission C-2 verified. | READY | N/A |
| TC-W03-MOBILE-UI-029 | FEAT-CAT-PROD-LIST | garage-mobile | AC-11 view-only | MUI | Wave | P1 | `InternalProductListPage` mobile KHÔNG có nút "Tạo mới" / "Tải lên" / "Xuất file" | Tap tile "Sản phẩm" từ hub | 1. Vào Product List.<br>2. Quan sát AppBar + footer. | - AppBar: title "Mã sản phẩm nội bộ" + search + filter icon.<br>- **KHÔNG có** nút `+ Tạo mới` / `↓ Import` / `↑ Export` (test riêng AC-11).<br>- Footer KHÔNG có text-button thêm sản phẩm. | READY | N/A |
| TC-W03-MOBILE-UI-030 | FEAT-CAT-PROD-LIST | garage-mobile | AC-1 layout | MUI | Wave | P1 | List dùng `ListWidget` pattern giống Group List (cards, pull-to-refresh, skeleton) | List có data | 1. Mở Product List.<br>2. Kiểm tra layout components. | - Card list flat.<br>- Mỗi card: mã + tên + ĐVT + nhóm + StatusBadge.<br>- SmartRefresher pull-down enabled.<br>- Skeleton lần đầu load. | READY | N/A |
| TC-W03-MOBILE-UI-031 | FEAT-CAT-PROD-LIST | garage-mobile | AC-3 search | MUI | Wave | P2 | Search box LIKE-match 3-col (code/name/SKU) | Mã `PROD-A` có SKU `SKU-001` mapped | 1. Tap search icon.<br>2. Nhập "SKU-001". | - List filter chỉ `PROD-A`.<br>- Debounce search. | READY | N/A |
| TC-W03-MOBILE-UI-032 | FEAT-CAT-PROD-LIST | garage-mobile | AC-11 (view-only tap row) | MUI | Wave | P1 | Tap card → push DetailPage (view-only) | List có card | 1. Tap card `PROD-VIEW`. | - Push `/catalog/internal-products/<id>`.<br>- `InternalProductDetailPage` mount.<br>- Back về List. | READY | N/A |
| TC-W03-MOBILE-UI-033 | FEAT-CAT-PROD-DETAIL | garage-mobile | AC-1, AC-12 view-only (v8) | MUI | Wave | P1 | DetailPage view-only — KHÔNG Tabs, KHÔNG Edit/Delete/BottomBar | DetailPage mở | 1. Quan sát layout + actions. | - 4 cards scroll Column (`SingleChildScrollView`): ProductHeaderCard + GeneralInfoCard + TechnicalSpecCard + SpecificationDescriptionCard.<br>- **KHÔNG có Tabs widget** (per FEAT v8 refactor).<br>- **KHÔNG có** AppBar trailing icons / Edit button / Delete button / BottomBar.<br>- `SafeArea(top: false, bottom: true)`.<br>- SmartRefresher pull-down (no pull-up). | READY | N/A |
| TC-W03-MOBILE-UI-034 | FEAT-CAT-PROD-DETAIL | garage-mobile | AC-2 render | MUI | Wave | P1 | Hiển thị enrichment field: `mainUnitDisplayName` / `originDisplayName` (R18) / `materialGroupName` / `brand` free-text | Mã `PROD-FULL` đầy đủ field | 1. Mở Detail. | - Tên ĐVT hiển thị "Cái" / "Hộp" (giá trị hiển thị, không phải code).<br>- Xuất xứ "Việt Nam" / "Nhật Bản" (R18 enrich).<br>- Nhóm hiển thị tên.<br>- Thương hiệu hiển thị string free-text. | READY | N/A |
| TC-W03-MOBILE-UI-035 | FEAT-CAT-PROD-DETAIL | garage-mobile | StatusBadge GREY | MUI | Wave | P2 | StatusBadge INACTIVE = GREY (khác Group — Group orange) | Mã `PROD-INACTIVE` | 1. Mở Detail mã INACTIVE.<br>2. Quan sát badge color. | - Badge "Ngừng hoạt động" với màu GREY.<br>- Adapter `InternalProductStatus implements InventoryStatusInterface`.<br>- Khác với Group (orange) — tested cross-feature. | READY | N/A |
| TC-W03-MOBILE-UI-036 | FEAT-CAT-PROD-DETAIL | garage-mobile | LoadingRowShimmer 4 cards | MUI | Wave | P2 | Cold load: 4 cards skeleton với heights khác nhau | Mở Product Detail lần đầu (cold start) | 1. Mở lần đầu (cold start) Detail. | - 4 skeleton slot (heights 120/180/100/150) + `Gap(AppSizes.spacing8)`.<br>- Sau load → fade thay 4 cards thật. | READY | N/A |
| TC-W03-MOBILE-UI-037 | FEAT-CAT-* | garage-mobile | Canonical reuse audit | MUI | Wave | P2 | KHÔNG có ListView.builder/Tab/RefreshIndicator/CircularProgressIndicator/Material FAB custom — chỉ reuse | Kiểm tra code base | 1. grep code base mobile.<br>2. Đối chiếu danh sách canonical. | - 0 instance `ListView.builder` trong 7 page mới (dùng `ListWidget` thay).<br>- 0 instance `RefreshIndicator` (dùng `SmartRefresher`).<br>- 0 instance `CircularProgressIndicator` centered (dùng `LoadingRowShimmerWidget`).<br>- 0 instance Material FAB (dùng footer text-button).<br>- 0 instance custom TabBar (dùng `ListTabBarWidget`). | READY | N/A |
| TC-W03-MOBILE-UI-038 | FEAT-CAT-GRP-* | garage-mobile | Semantics labels | MUI | Wave | P2 | Mọi widget interactive có Semantics label đúng convention | Các page mới | 1. Kiểm tra Semantics tree (Flutter inspector).<br>2. Kiểm tra naming. | - `row-group-{groupCode}` cho mỗi card.<br>- `tab-status-{all|active|inactive}` cho 3 tab.<br>- `field-group-{name|code|description}` cho form.<br>- `button-create-group` cho footer.<br>- `row-product-{code}` cho Product card.<br>- `detail-row-{key}` cho `StartInfoRow`. | READY | N/A |
| TC-W03-MOBILE-UI-039 | FEAT-CAT-* | garage-mobile | Responsive tablet | MUI | Wave | P2 | Tablet portrait + landscape — list giữ flat card, không split-pane | Pixel Tab device | 1. Mở app trên tablet.<br>2. Xoay ngang (landscape).<br>3. Quan sát Group List + Product Detail. | - List card width fit tablet (KHÔNG full-bleed image).<br>- Landscape: padding tăng, card width nhỏ hơn portrait scale.<br>- KHÔNG split-pane (per CR-1782381477 drop tree).<br>- Layout không vỡ. | READY | N/A |
| TC-W03-MOBILE-UI-040 | FEAT-CAT-* | garage-mobile | iOS specific | MUI | Wave | P2 | iOS — back swipe gesture pop route đúng | iPhone 14 simulator | 1. Điều hướng từ hub → ProductList → ProductDetail.<br>2. Vuốt sang phải từ mép trái tại Detail.<br>3. Vuốt lần nữa tại List. | - Vuốt tại Detail → pop về List.<br>- Vuốt tại List → pop về Hub.<br>- KHÔNG crash, animation mượt. | READY | N/A |
| TC-W03-MOBILE-UI-041 | FEAT-CAT-PROD-LIST | garage-mobile | filter pagination | MUI | Wave | P2 | Pull-up load-more — pagination next page | Tenant có > 20 mã | 1. Pull-up cuối list.<br>2. Quan sát. | - SmartRefresher gọi `onLoading`.<br>- Gọi Q4 trang tiếp theo.<br>- Nối thêm vào list.<br>- Hết dữ liệu → footer "Hết dữ liệu". | READY | N/A |
| TC-W03-MOBILE-UI-042 | FEAT-INV-MOBILE-MENU | garage-mobile | Permission per sub-module | MUI | Wave | P2 | Permission gate ở route đích (không ở hub) — kiểm tra khi vào sub-module | Token hợp lệ | 1. Tap tile "Nhóm vật tư".<br>2. Kiểm tra route mount + GraphQL call. | - Hub không kiểm permission.<br>- Sub-module route mount → kiểm token + tenant context.<br>- Nếu thiếu permission → redirect login hoặc error page. | READY | N/A |
| TC-W03-MOBILE-UI-043 | FEAT-CAT-GRP-DELETE | garage-mobile | AC-3 | MUI | Wave | P2 | Tap "Huỷ" trong dialog xác nhận xóa nhóm (mobile) — đóng dialog, không xóa | Nhóm `GRP-KEEP-M` trống, mở từ Detail hoặc long-press List | 1. Tap "Xoá" (footer Detail hoặc action menu List) → dialog xác nhận xuất hiện.<br>2. Tap "Huỷ". | - Dialog đóng ngay.<br>- KHÔNG gọi mutation `deleteMaterialGroup`.<br>- `MaterialGroupDeleteCubit` quay về state initial, nhóm vẫn còn trong List/Detail. | READY | N/A |
| TC-W03-MOBILE-UI-044 | FEAT-CAT-GRP-LIST | garage-mobile | Pull-up load-more | MUI | Wave | P2 | Pull-up load-more — phân trang trang tiếp theo cho Group List | Tenant có > 20 nhóm ACTIVE | 1. Pull-up cuối list.<br>2. Quan sát. | - SmartRefresher gọi `onLoading`.<br>- Gọi Q1 `searchMaterialGroups` trang tiếp theo.<br>- Nối thêm vào list.<br>- Hết dữ liệu → footer "Hết dữ liệu".<br>- Đối xứng với TC-MOBILE-UI-041 (đã có cho Product List) — trước đây Group List chỉ có mô tả layout "pull-up enabled", chưa test hành động load thêm trang thật. | READY | N/A |
| TC-W03-MOBILE-UI-045 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-2 | MUI | Wave | P1 | Mã field ký tự đặc biệt hiển thị inline error riêng biệt (không chỉ auto-uppercase) | AddPage | 1. Nhập `GRP@01` (đã viết hoa sẵn, có ký tự đặc biệt).<br>2. Tap "Lưu". | - Inline error "Mã nhóm không được chứa ký tự đặc biệt" hiển thị dưới field Mã.<br>- Nút "Lưu" disabled hoặc submit bị chặn.<br>- Đối xứng với TC-UI-012 (Web). | READY | N/A |
| TC-W03-MOBILE-UI-046 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-3 | MUI | Wave | P1 | Trường Tên bỏ trống — inline error "Tên nhóm là bắt buộc" | AddPage | 1. Bỏ trống Tên (chỉ điền Mã).<br>2. Tap "Lưu". | - Inline error "Tên nhóm là bắt buộc" hiển thị dưới field Tên.<br>- KHÔNG gọi mutation `createMaterialGroup`.<br>- Đối xứng với TC-UI-014 (Web). | READY | N/A |
| TC-W03-MOBILE-UI-047 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-6, ERR-INV-016 | MUI | Wave | P2 | Mô tả > 255 ký tự — inline error, chặn submit | AddPage | 1. Nhập 256 ký tự vào Mô tả.<br>2. Tap "Lưu". | - Counter hoặc inline error "Mô tả không quá 255 ký tự".<br>- Nút "Lưu" disabled hoặc submit bị chặn.<br>- Đối xứng với TC-UI-016 (Web). | READY | N/A |
| TC-W03-MOBILE-UI-048 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-7, ERR-INV-002 | MUI | Wave | P1 | Submit trùng mã — toast/inline error "Mã nhóm đã tồn tại" | Đã có nhóm `GRP-DUP` | 1. Nhập mã `GRP-DUP` (đã tồn tại) + tên hợp lệ.<br>2. Tap "Lưu". | - Toast hoặc inline error "Mã nhóm đã tồn tại" (server trả ERR-INV-002).<br>- Form KHÔNG đóng, dữ liệu đã nhập vẫn giữ nguyên để sửa lại.<br>- Đối xứng với TC-UI-017 (Web). | READY | N/A |
| TC-W03-MOBILE-UI-049 | FEAT-CAT-GRP-CREATE | garage-mobile | AC-9 | MUI | Wave | P2 | Tap "Huỷ bỏ" — đóng form AddPage, không lưu, quay về List | AddPage đã nhập dở vài trường | 1. Nhập vài trường (mã, tên).<br>2. Tap nút "Huỷ bỏ" (hoặc icon back AppBar).<br>3. Quan sát. | - Form đóng, pop back về List.<br>- KHÔNG gọi mutation `createMaterialGroup`.<br>- List không có nhóm mới nào.<br>- Đối xứng với TC-UI-019 (Web) — mobile trước đây chưa test nhánh huỷ bỏ này. | READY | N/A |
| TC-W03-MOBILE-UI-050 | FEAT-CAT-GRP-EDIT | garage-mobile | AC-2 | MUI | Wave | P1 | EditPage — Mã field disabled + helper text "Không được sửa mã nhóm sau khi tạo" | Có nhóm `GRP-EDIT-LOCK` | 1. Mở Edit `GRP-EDIT-LOCK`.<br>2. Quan sát field Mã. | - Field Mã disabled (không nhập được).<br>- Helper text hiển thị "Không được sửa mã nhóm sau khi tạo".<br>- Đối xứng với TC-UI-022 (Web). | READY | N/A |
| TC-W03-MOBILE-UI-051 | FEAT-CAT-GRP-EDIT | garage-mobile | AC-4, BR-CAT-GRP-008/009 | MUI | Wave | P1 | Dropdown "Thuộc nhóm" trong EditPage loại bỏ chính nhóm đang sửa + toàn bộ descendant | Cây `GRP-A → GRP-B → GRP-C`; sửa `GRP-A` | 1. Mở Edit `GRP-A`.<br>2. Tap dropdown "Thuộc nhóm". | - Bottom sheet dropdown KHÔNG có `GRP-A` (self), KHÔNG có `GRP-B` (con), KHÔNG có `GRP-C` (cháu).<br>- Có thể chọn nhóm khác nhánh.<br>- Đối xứng với TC-UI-023 (Web) — client-side guard trước khi submit. | READY | N/A |
| TC-W03-MOBILE-UI-052 | FEAT-CAT-GRP-EDIT | garage-mobile | AC-8 | MUI | Wave | P2 | Tap "Huỷ bỏ" trong EditPage (nút chính của form, KHÔNG phải nút Huỷ trong dialog cascade) — đóng form, không lưu | Nhóm `GRP-EDIT-CANCEL` ACTIVE | 1. Mở Edit `GRP-EDIT-CANCEL`.<br>2. Sửa vài trường (tên, mô tả) — KHÔNG đổi trạng thái (tránh trigger dialog cascade).<br>3. Tap "Huỷ bỏ".<br>4. Quan sát. | - Form đóng, pop back về Detail/List.<br>- KHÔNG gọi mutation `updateMaterialGroup`.<br>- Dữ liệu nhóm giữ nguyên như trước khi sửa.<br>- Đối xứng với TC-UI-097 (Web) — phân biệt rõ với nút "Huỷ" trong dialog cascade (TC-MOBILE-UI-019). | READY | N/A |

---

## 5. Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-06-30 | Tạo từ `Execution/test-cases/TC-TEMPLATE.md` — manual TC mobile bao phủ 5 page Group full CRUD + 2 page Product view-only + hub navigation `FEAT-INV-MOBILE-MENU` (trạng thái W03 2 tile). Scope partial theo CR-1782373204 + flat list theo CR-1782381477 + canonical reuse pattern v24. | QA Authority |
| 2026-06-30 | Bổ sung 1 TC (043) sau audit AC-by-AC: FEAT-CAT-GRP-DELETE AC-3 (nhánh Huỷ trong dialog xác nhận xóa) chưa từng test trên mobile — trước đây chỉ test nhánh Xoá thành công. | QA Authority |
| 2026-07-01 | Bổ sung 8 TC (045-052) sau khi user chỉ ra mobile UI ít test hơn hẳn Web dù Group có scope giống hệt nhau (full CRUD cả 2 platform). Lấp gap parity: GRP-CREATE thiếu 5 test (ký tự đặc biệt, Tên bắt buộc, Mô tả boundary, trùng mã, Huỷ bỏ — mobile trước đó KHÔNG có test Huỷ bỏ ở bất kỳ đâu); GRP-EDIT thiếu 3 test (Mã field khóa, dropdown loại self/descendant, Huỷ bỏ form chính). | QA Authority |
| 2026-07-01 | Bổ sung 1 TC (044): Group List mobile thiếu test pull-up load-more thực sự (chỉ Product List có TC-041 trước đó) — user phát hiện khi rà soát coverage phân trang giữa các màn danh sách. | QA Authority |
