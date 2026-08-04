---
type: execution-spec
artifact_kind: feature-mobile
status: DRAFT
version: 1
tier: T4
tier_role: mobile
platform: mobile
owner_authority: "Delivery Authority + Architecture Authority"
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
experience: "garage-mobile"
source: "manual-author"
source_feat_id: "FEAT-INV-MOBILE-MENU"
source_ref: "Product/features/FEAT-INV-MOBILE-MENU.md"
source_feat_version: 2
generated_at: "2026-06-30T10:00:00Z"
last_reviewed: "2026-06-30"
boundary: "garage-mobile"
boundaries_affected: ["garage-mobile"]
modifies: []
change_type: "new-capability"
consumes_backend_feats: []
consumes_bff_feats: []
screens_touched:
  - "lib/ui/inventory_catalog/hub/inventory_hub_page.dart"
  - "lib/ui/inventory_catalog/hub/widgets/feature_tile.dart"
flutter_packages:
  - "flutter_bloc"
  - "freezed"
  - "get_it"
  - "injectable"
  - "auto_route"
  - "gap"
  - "easy_localization"
figma_refs:
  - "Product/ux/figma-mobile/wave03-inv-mobile-menu.md (node 21729:24201 / inner 21519:27371 — Quản lý kho hàng hub, 1 frame 6-tile grid)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  source_feat_sha: "FEAT-INV-MOBILE-MENU v2 (2026-06-29)"
reviewer_verdict: null
---

# FEAT-INV-MOBILE-MENU (Mobile): Màn quản lý kho hàng — hub điều hướng mobile

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual — `Product/ux/figma-mobile/wave03-inv-mobile-menu.md` (node `21729:24201` / inner frame `21519:27371`). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INV-MOBILE-MENU` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) — **mobile-only**, web KHÔNG có hub tile tương đương |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `inventory_hub_page` (+ shared widget `feature_tile`) |
| Flutter packages | `flutter_bloc`, `freezed`, `get_it`, `injectable`, `auto_route`, `gap`, `easy_localization` |
| Cross-tier consume | BE: — \| BFF: — (pure client navigation hub, no BFF call) |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + re-author tier spec.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INV-MOBILE-MENU.md`](../../../../../Product/features/FEAT-INV-MOBILE-MENU.md) |
| Source version | v2 (2026-06-29) |
| Figma spec | [`Product/ux/figma-mobile/wave03-inv-mobile-menu.md`](../../../../../Product/ux/figma-mobile/wave03-inv-mobile-menu.md) v7 ACTIVE |
| Generated at | 2026-06-30T10:00:00Z |

---

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần một entry điểm duy nhất trên app Garage để truy cập nhanh tới toàn bộ module Quản lý kho hàng V2 (6 sub-module xuyên W03–W06). Màn hub điều hướng dạng tile (icon + nhãn) thay vì sidebar/menu dài giúp người dùng quan sát toàn cảnh module kho và tap 1 lần là vào đúng chức năng. Đây là canonical entry-point cho toàn bộ luồng nghiệp vụ kho mobile sau W03.

## 2. Trách nhiệm Mobile (garage-mobile)

- Render màn hình `InventoryHubPage` (`/inventory/hub`) với `AppBarCustom` (title "Quản lý kho hàng" + back chevron, KHÔNG trailing action) + scroll body chứa `GridView.count(crossAxisCount: 2)` 6-tile (3 row × 2 col theo Figma) — chỉ render tile đã enable theo wave state matrix (§3 AC-4).
- Build shared widget `FeatureTile(icon, label, onTap)` (167.5×104, BG `AppColors.bgBase`, radius 8, shadow `AppShadow.itemBoxShadow`, padding vertical 8) — Column[Container 48×48 circle BG `AppColors.bgBadgeProcessing` chứa icon, Gap 8, Text label `AppTextStyle.textSubtitleS5` `AppColors.textPrimary`] — reuse pattern cho 6 tile.
- Quản lý trạng thái: `InventoryHubCubit` (`BaseCubit<InventoryHubState>`) scope hẹp — KHÔNG fetch data, chỉ expose `visibleTiles` list (compile-time const theo wave state matrix) + handler `navigate(BuildContext, route)` debounce 300ms.
- Điều hướng `auto_route 10.1.0+1`: tile "Sản phẩm" → push `InternalProductListRoute` (FEAT-CAT-PROD-LIST, đã ship W03), tile "Nhóm vật tư" → push `MaterialGroupListRoute` (FEAT-CAT-GRP-LIST, đã ship W03). 4 tile khác (Phiếu nhập W05 / Phiếu xuất W05 / Tồn kho W06 / Tồn đầu kỳ W04) **ẨN HOÀN TOÀN** trong W03 (KHÔNG render placeholder, KHÔNG badge).
- KHÔNG BFF / GraphQL call — hub là pure client navigation. KHÔNG cần permission native. KHÔNG offline cache.
- **i18n MANDATORY** per `rules-mobile` §4.1 (M-30): toàn bộ display string (AppBar title + 6 tile label) phải qua `LocaleKeys.<key>.tr()` — KHÔNG hardcode Vietnamese literal trong `lib/ui/**`.

---

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: 8 source AC-IDs phải xuất hiện ở §3 hoặc §4.

### Cluster A — Render hub

#### AC-1 → Mở màn hub

- **Khi**: Người dùng tap entry-point "Quản lý kho hàng" từ màn chính (entry-point cụ thể **NEED CONFIRMATION** — vẫn pending từ source FEAT v2; W03 DEV mark TODO tại main shell, BA confirm trước /qc-start).
- **Mobile phải**: `auto_route` push `InventoryHubRoute` → render `InventoryHubPage` với `AppBarCustom(title: LocaleKeys.inventoryHub_title.tr(), hasBack: true)` + body grid 2-col.
- **State transition**: `initial` → `loaded` ngay lập tức (không async data, state minimal — chỉ giữ `visibleTiles` list).
- **Widget**: `lib/ui/inventory_catalog/hub/inventory_hub_page.dart`.
- **Ref**: Figma node `21519:27371` AppBar block.

#### AC-2 → Header "Quản lý kho hàng" verbatim

- **Khi**: Page render.
- **Mobile phải**: `AppBarCustom` title bind `LocaleKeys.inventoryHub_title.tr()` → value verbatim Figma "Quản lý kho hàng" (preserve diacritics: ả/ý). Leading = back chevron (`Assets.icons.icBack.path SVG (auto via AppBarCustom)` 24px `AppColors.textPrimary` — `AppBarCustom` tự render). KHÔNG trailing action.
- **i18n key**: `inventoryHub_title` (vi: "Quản lý kho hàng" / en: "Inventory management").
- **Ref**: Figma `21519:27371` AppBar `_png_verified`.

#### AC-3 → Grid 2 cột render tile

- **Khi**: Page render với `visibleTiles.length >= 1`.
- **Mobile phải**: Body = `SafeArea(bottom: false)` → `SingleChildScrollView(padding: EdgeInsets.all(AppSizes.spacing16))` → `GridView.count(crossAxisCount: 2, mainAxisSpacing: AppSizes.spacing8, crossAxisSpacing: AppSizes.spacing8, childAspectRatio: 167.5/104 ≈ 1.61, padding: EdgeInsets.zero, shrinkWrap: true, physics: NeverScrollableScrollPhysics(), children: visibleTiles)`. Mỗi `FeatureTile` Column[IconCircle 48 + Gap 8 + Text label].
- **Widget**: `lib/ui/inventory_catalog/hub/widgets/feature_tile.dart` (NEW — shared, reusable cho future hub).
- **Ref**: Figma `21519:27371` body + `FeatureTile` block.

### Cluster B — State matrix (visibility per wave)

#### AC-4 → ẨN HOÀN TOÀN tile chưa ship — W03 chỉ 2 tile

- **Khi**: App build W03 release.
- **Mobile phải**: `InventoryHubCubit` expose **compile-time const list** chỉ chứa 2 tile config:
  - Tile 1: label `LocaleKeys.inventoryHub_tile_product.tr()` ("Sản phẩm"), icon placeholder `Icons.inventory_2_outlined`, route `/catalog/internal-products` → FEAT-CAT-PROD-LIST.
  - Tile 2: label `LocaleKeys.inventoryHub_tile_group.tr()` ("Nhóm vật tư"), icon placeholder `Icons.category_outlined`, route `/catalog/material-groups` → FEAT-CAT-GRP-LIST.
- **KHÔNG render**: 4 tile khác (Phiếu nhập / Phiếu xuất / Tồn kho / Tồn đầu kỳ) — KHÔNG entry trong list, KHÔNG conditional `Visibility(visible: false)` (waste), KHÔNG badge "Sắp ra mắt" (BA decision 2026-06-29).
- **Layout reflow**: grid tự reflow giữ thứ tự gốc — W03 hiện 1 row × 2 col (2 tile cùng row 1).
- **W04+ expansion**: tile mới được add bằng append vào list (compile-time gate qua feature_flag hoặc wave constant) — không refactor.
- **Ref**: source FEAT-INV-MOBILE-MENU v2 §3 state matrix W03 column + BR-INV-MENU-002.

### Cluster C — Navigation

#### AC-5 → Tap tile → push route + preserve back stack

- **Khi**: Người dùng tap `FeatureTile`.
- **Mobile phải**: `InkWell.onTap` → debounce 300ms (anti-double-tap EC-3) → `cubit.navigate(context, route)` → `context.pushRoute(route)` (auto_route preserve back stack — back từ sub-module quay về hub, không phải về root).
- **Mapping W03**:
  - "Sản phẩm" → `context.pushRoute(const InternalProductListRoute())` → `InternalProductListPage`.
  - "Nhóm vật tư" → `context.pushRoute(const MaterialGroupListRoute())` → `MaterialGroupListPage`.
- **Widget**: `FeatureTile.onTap` callback.
- **Ref**: source FEAT v2 AC-5 + BR-INV-MENU-004.

### Cluster D — Permission & tenant

#### AC-6 → Cả 2 role thấy đủ tile (no role gate ở hub)

- **Khi**: Bất kỳ user đăng nhập (garage-owner hoặc accountant) mở hub.
- **Mobile phải**: KHÔNG filter tile theo role tại hub layer — cả 2 role thấy đúng `visibleTiles` (Critical Rule #6 dual-persona). Route guard `AuthGuard` (auto_route) gắn ở `/inventory/hub` route → require valid JWT; per-sub-module role check ở route đích.
- **Ref**: source FEAT v2 AC-6 + BR-INV-MENU-003.

#### AC-7 → Tenant isolation — hub không gọi BFF

- **Khi**: User đăng nhập garage X mở hub.
- **Mobile phải**: KHÔNG có GraphQL call / REST call → KHÔNG có tenant boundary risk tại hub. Tenant isolation enforce ở sub-module sau khi tap (BFF/BE responsibility per Critical Rule #4).
- **N/A cho Mobile**: kiểm tra cross-tenant là sub-module responsibility.

### Cluster E — Scope

#### AC-8 → Mobile-only

- **Khi**: BA review platform scope.
- **Mobile phải**: Implement đầy đủ feature trên `garage-mobile`. Web sidebar dùng nav riêng — KHÔNG có hub tile counterpart, nên KHÔNG có cross-platform contract cần align tại visual layer (chỉ label sync qua glossary `Product/ux/figma-glossary-vn-en.md`).

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT — node 21519:27371)

- Design tokens lấy từ `lib/core/common/styles/` — **TUYỆT ĐỐI KHÔNG** hardcode `Color(0xFF…)` / `TextStyle(...)` literal.
- **AppBar**: BG `AppColors.bgBase`, title `AppTextStyle.textSubtitleS4` (16/SemiBold/24) `AppColors.textPrimary` centered. Leading back chevron 24px `AppColors.textPrimary`. KHÔNG trailing. (M-28 hard rule: AppBar title nav-bar = `textSubtitleS4`, KHÔNG đoán per-screen.)
- **Body BG**: `AppColors.bgSecondary` (light grey scroll bg) — `CustomScaffold(backgroundColor: AppColors.bgSecondary)`.
- **Tile card**: 167.5×104 (childAspectRatio ≈ 1.61), BG `AppColors.bgBase`, radius `BorderRadius.circular(8)`, shadow `AppShadow.itemBoxShadow`, padding `EdgeInsets.symmetric(vertical: AppSizes.spacing8)`.
- **IconCircle**: 48×48 circle, BG `AppColors.bgBadgeProcessing` (light-blue per Figma "PrimaryColor.s50 #edf7ff", token gần nhất). Icon Material placeholder size 32, color `AppColors.primary` — SVG illustration assets pending designer export (NEED CONFIRMATION — flag `needs_review`).
- **Tile label**: `AppTextStyle.textSubtitleS5` (14/SemiBold) `AppColors.textPrimary`, `textAlign: TextAlign.center`, `maxLines: 1`, overflow ellipsis.
- **Grid spacing**: `mainAxisSpacing: AppSizes.spacing8`, `crossAxisSpacing: AppSizes.spacing8`. Body outer padding `EdgeInsets.all(AppSizes.spacing16)`.

### 4.2 State machine + error handling

- `InventoryHubCubit` extends `BaseCubit<InventoryHubState>`. State minimal — KHÔNG loading/error/empty (compile-time tile list). Single emit init.
- KHÔNG retry / SnackBar / Dialog — hub không async.

### 4.3 Native interaction + permission

- KHÔNG cần permission (camera/storage/location).
- KHÔNG deeplink vào hub trong W03 scope.

### 4.4 Offline + connectivity

- Hub render offline-capable (pure client). KHÔNG check connectivity.
- Tap tile → sub-module tự handle offline state.

### 4.5 i18n + a11y

- **LocaleKeys MANDATORY** per `rules-mobile` §4.1 M-30: 7 entries phải add vào `assets/localizations/{vi,en}.json` + codegen `lib/generated/locale_keys.gen.dart` (xem §11.1). KHÔNG hardcode VN literal trong `lib/ui/inventory_catalog/hub/**`.
- a11y: `Semantics(label: '${tile.label} button', button: true)` wrap mỗi `FeatureTile`; `InkWell` đảm bảo tap target ≥ 48dp (tile 167.5×104 >> 48 ✓). Contrast WCAG AA đạt qua tokens.
- TalkBack: từng tile screen-reader đọc nhãn + role "Nút" — auto via `Semantics(button: true)`.

### 4.6 RBAC render + feature flag

- Route `/inventory/hub` guard bởi `AuthGuard` (auto_route) — redirect login nếu JWT invalid.
- KHÔNG feature flag riêng cho hub W03. Tile visibility = compile-time constant; future wave thêm tile = code change + release.

### 4.7 Business rule secondary (UI hint)

- BR primary mobile tier:
  - **BR-INV-MENU-001**: Thứ tự + label 6 tile cố định Figma — enforce qua compile-time const list (không expose reorder API).
  - **BR-INV-MENU-002**: Tile chưa GA = ẨN HOÀN TOÀN — enforce qua const list (4 tile khác KHÔNG có entry).
  - **BR-INV-MENU-003**: Cả 2 role thấy đủ tile — enforce qua KHÔNG filter ở hub layer.
  - **BR-INV-MENU-004**: Tap preserve back stack — enforce qua `context.pushRoute` (auto_route default behavior).

### 4.8 Performance

- Build 1 lần per page mount (const list). `const FeatureTile(...)` constructor — tránh rebuild khi parent rebuild.
- KHÔNG N+1 (no API call).
- Asset SVG (future) load qua `flutter_svg` + asset bundle (offline-capable).

### 4.9 Error code mapping

N/A — hub không gọi BFF.

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`.

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Change type | Figma node | AC ref |
|---|---|---|---|---|
| `InventoryHubPage` | `/inventory/hub` | NEW | `21519:27371` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-8 |

### 5.2 Widgets

| Widget | Path | Change type | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|
| `FeatureTile` | `lib/ui/inventory_catalog/hub/widgets/feature_tile.dart` | BUILD-NEW | StatelessWidget | Shared widget reuse-able cho future hub feature (icon + label + onTap composition); no fit ở `lib/ui/widgets/**` after scan | AC-3, AC-5 |
| `AppBarCustom` | `lib/ui/widgets/custom_app_bar.dart` | REUSE | StatelessWidget | Canonical `AppBarCustom(title: titleWidget, hasBack: true)` | AC-1, AC-2 |
| `CustomScaffold` | `lib/ui/widgets/custom_scaffold.dart` | REUSE | StatelessWidget | Canonical scaffold | AC-1 |

### 5.3 Navigation

| Route | Page | Guard | Args | AC ref |
|---|---|---|---|---|
| `/inventory/hub` | `InventoryHubPage` | `AuthGuard` | — | AC-1, AC-6 |
| `/catalog/internal-products` (target) | `InternalProductListPage` (FEAT-CAT-PROD-LIST) | `AuthGuard` | — | AC-5 |
| `/catalog/material-groups` (target) | `MaterialGroupListPage` (FEAT-CAT-GRP-LIST) | `AuthGuard` | — | AC-5 |

> auto_route `router.dart` MUST add `@RoutePage()` entry cho `InventoryHubPage` + `AutoRoute(page: InventoryHubRoute.page, guards: [AuthGuard()])`. (Wave-spec note: DEV cycle thực tế cần wire trong cùng commit; nếu router.dart edit blocked → defer task to `needs_review`.)

### 5.4 State management (Cubit)

| Concern | Pattern | File | States | AC ref |
|---|---|---|---|---|
| Hub state | Cubit | `lib/ui/inventory_catalog/hub/inventory_hub_cubit.dart` | `@freezed InventoryHubState { initial(visibleTiles=[]) / loaded(visibleTiles) }` (@Injectable) | AC-1, AC-3, AC-4 |

> `InventoryHubCubit` extends `BaseCubit<InventoryHubState>`. Constructor emit `loaded(visibleTiles: _W03_TILES)` ngay ở init. KHÔNG `launch()` async (no I/O).

---

## 6. Data integration

### 6.1 GraphQL operations consumed

**N/A** — hub là pure client navigation, KHÔNG gọi BFF.

### 6.2 REST endpoints consumed direct

**N/A**.

### 6.3 Offline strategy

Hub fully offline-capable (const list + Material icons). Tap tile → sub-module tự handle offline (List page có connectivity banner riêng).

### 6.4 Platform-specific behaviors

| Concern | iOS | Android | Notes |
|---|---|---|---|
| Back navigation | Swipe from left edge | System back button | auto_route handle, back về parent (drawer/main shell) |

---

## 7. File/module impact map

> Path glob ⊆ `mobile/gf-garage-app/lib/**`.

| Layer | Path glob | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/inventory_catalog/hub/` | `inventory_hub_page.dart` | NEW | Page `@RoutePage`, BasePage<Cubit,State> | ~80 | AC-1, AC-2, AC-3, AC-5 |
| `lib/ui/inventory_catalog/hub/` | `inventory_hub_cubit.dart` | NEW | Cubit `BaseCubit<InventoryHubState>`, `@Injectable` | ~40 | AC-3, AC-4 |
| `lib/ui/inventory_catalog/hub/` | `inventory_hub_state.dart` | NEW | `@freezed` union state | ~30 | AC-3, AC-4 |
| `lib/ui/inventory_catalog/hub/widgets/` | `feature_tile.dart` | NEW | StatelessWidget shared | ~70 | AC-3, AC-5 |
| `lib/core/router/` | `router.dart` (+ `router.gr.dart` codegen) | MODIFY (additive — add `AutoRoute(page: InventoryHubRoute.page, guards: [AuthGuard()])`) | auto_route 10.1.0+1 | ~3 | AC-1 |
| `assets/localizations/` | `vi.json` + `en.json` | ADDITIVE (7 entries) | easy_localization | ~14 | AC-2, AC-3, AC-4 |
| `lib/generated/` | `locale_keys.gen.dart` (codegen artifact) | REGEN (CI) | easy_localization codegen | auto | — |
| `test/ui/inventory_catalog/hub/` | `inventory_hub_cubit_test.dart` | NEW | `bloc_test` | ~40 | AC-3, AC-4 |
| `test/ui/inventory_catalog/hub/` | `inventory_hub_page_test.dart` | NEW | widget_test + golden | ~60 | AC-1, AC-2, AC-3 |

---

## 8. Implementation sequence DAG

```
S6  Mobile UI wire (Flutter)
    Entry: Figma confirmed + LocaleKeys entries added + W03 sub-routes (FEAT-CAT-GRP-LIST + FEAT-CAT-PROD-LIST) exist or stub
    Exit: widget_test + bloc_test green; manual smoke nav 2 tiles
    └─► (hand-off QA mobile-e2e — smoke 1 tile tap each)
```

| Step | Action | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Add LocaleKeys entries `inventoryHub_*` + codegen | `assets/localizations/` | Figma label confirmed | `vi.json` + `en.json` updated, `locale_keys.gen.dart` regenerated | — |
| S6.2 | `FeatureTile` widget + golden test | `lib/ui/inventory_catalog/hub/widgets/` | S6.1 | Widget compile, golden snapshot ready | S6.1 |
| S6.3 | `InventoryHubCubit` + state (const tile list W03) | `lib/ui/inventory_catalog/hub/` | S6.1 | bloc_test green (init → loaded with 2 tiles) | S6.1 |
| S6.4 | `InventoryHubPage` + Scaffold + AppBar + GridView | `lib/ui/inventory_catalog/hub/` | S6.2, S6.3 | Widget test green (2 tiles visible, tap callback) | S6.2, S6.3 |
| S6.5 | Router wire `AutoRoute(page: InventoryHubRoute.page, guards: [AuthGuard()])` | `lib/core/router/router.dart` | S6.4 | `flutter build apk --debug` clean | S6.4 |
| S6.6 | Manual smoke: nav from hub → product list + back; nav from hub → group list + back | device | S6.5 | 2 nav flow green | S6.5 |

---

## 9. Business Rules to enforce (Mobile)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-INV-MENU-001` | NORMAL | Thứ tự + label 6 tile cố định Figma | `inventory_hub_cubit.dart` — `_W03_TILES` const list | AC-3 | Compile-time enforce, không runtime config |
| `BR-INV-MENU-002` | NORMAL | Tile chưa GA = ẨN HOÀN TOÀN, không badge | `inventory_hub_cubit.dart` — const list chỉ chứa 2 tile W03 | AC-4 | BA decision 2026-06-29 |
| `BR-INV-MENU-003` | NORMAL | Cả 2 role thấy đủ tile (không filter ở hub) | `inventory_hub_page.dart` — không có conditional theo role | AC-6 | Per-sub-module gate ở route đích |
| `BR-INV-MENU-004` | NORMAL | Tap preserve back stack | `feature_tile.dart` onTap → `context.pushRoute` | AC-5 | auto_route default |

---

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (page mount) | test-mobile-ui | Verify AppBar render + title text + back leading; KHÔNG trailing |
| AC-2 | Widget test (header verbatim) | test-mobile-ui | Assert `find.text('Quản lý kho hàng')` xuất hiện 1 lần |
| AC-3 | Widget test (grid 2-col) | test-mobile-ui | Verify `GridView.count` crossAxisCount=2, 2 children visible; each `FeatureTile` render icon+label |
| AC-4 | bloc_test + widget test (hide 4 tile) | test-mobile-ui | Assert `visibleTiles.length == 2` cho W03; assert KHÔNG có `find.text('Phiếu nhập')` / `'Phiếu xuất'` / `'Tồn kho'` / `'Tồn đầu kỳ'` trên hub |
| AC-5 | Widget test (tap navigation) | test-mobile-ui | Mock router, tap tile 1 → assert `pushRoute(InternalProductListRoute())` called; tap tile 2 → `pushRoute(MaterialGroupListRoute())` |
| AC-6 | Widget test (role render) | test-mobile-ui | Render hub với role=garage-owner + role=accountant → assert cả 2 cùng `visibleTiles` |
| AC-7 | N/A | — | Hub không gọi BFF |
| AC-8 | N/A | — | Scope sanity |
| (smoke) | Patrol E2E happy path | test-mobile-e2e | Login → nav to hub → tap Sản phẩm → back → tap Nhóm vật tư → back |

---

## 11. i18n & a11y

### 11.1 i18n keys (easy_localization JSON — MANDATORY per rules-mobile §4.1)

> Verify files tồn tại: `mobile/gf-garage-app/assets/localizations/vi.json` + `en.json`. Codegen `lib/generated/locale_keys.gen.dart` sau khi add entries.

| Key | vi | en | AC ref | Status W03 |
|---|---|---|---|---|
| `inventoryHub_title` | "Quản lý kho hàng" | "Inventory management" | AC-1, AC-2 | NEW |
| `inventoryHub_tile_product` | "Sản phẩm" | "Products" | AC-3, AC-4 | NEW (visible W03) |
| `inventoryHub_tile_group` | "Nhóm vật tư" | "Material groups" | AC-3, AC-4 | NEW (visible W03) |
| `inventoryHub_tile_importNote` | "Phiếu nhập" | "Receipt notes" | AC-3, AC-4 | NEW (hidden W03, visible W05) |
| `inventoryHub_tile_exportNote` | "Phiếu xuất" | "Delivery notes" | AC-3, AC-4 | NEW (hidden W03, visible W05) |
| `inventoryHub_tile_stock` | "Tồn kho" | "Stock balance" | AC-3, AC-4 | NEW (hidden W03, visible W06) |
| `inventoryHub_tile_openingStock` | "Tồn đầu kỳ" | "Opening stock" | AC-3, AC-4 | NEW (hidden W03, visible W04) |

> 7 entries seed cho cả 6 tile (4 hidden trong W03 vẫn add key để tránh churn W04-W06). VN labels verbatim Figma — preserve diacritics.

### 11.2 a11y (Semantics)

| AC | a11y requirement | Implementation |
|---|---|---|
| AC-1 | AppBar back chevron có `Semantics(label, button)` | `AppBarCustom` tự render (`IconButton(icon: Icon(Assets.icons.icBack.path SVG (auto via AppBarCustom)))` — Flutter auto) |
| AC-3 | Mỗi `FeatureTile` có `Semantics(label, button: true)` | `Semantics(label: label, button: true, child: InkWell(...))` |
| AC-5 | Tap target ≥ 48dp | Tile 167.5×104 >> 48 ✓ |
| (all) | Contrast WCAG AA | Tokens `AppColors.*` enforce |

---

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | — | N/A | Hub không touch BE |
| BFF | — | N/A | Hub không gọi BFF |
| FE Web | — | N/A | Web KHÔNG có hub counterpart (sidebar điều hướng riêng) — KHÔNG có cross-platform contract visual |

**NEED CONFIRMATION markers**:
1. **NC-INV-MENU-01**: Entry point hub từ đâu? Tile từ màn chính / drawer item / bottom-nav? Source FEAT v2 vẫn pending. W03 DEV mark TODO; BA confirm trước /qc-start. Workaround W03: gắn entry tạm từ drawer "Quản lý kho hàng" hoặc skip entry — chỉ test direct nav `context.pushRoute(<TypedRoute>())`.
2. **NC-INV-MENU-02**: Icon SVG asset cho 6 tile chưa export từ designer. W03 DEV dùng Material Icon placeholders (`Icons.inventory_2_outlined` cho Sản phẩm, `Icons.category_outlined` cho Nhóm vật tư). Designer export `assets/icons/inventory-{product,group,import,export,stock,opening-stock}.svg` → DEV swap sang `SvgPicture.asset` trong follow-up CR.

---

## 13. References

- **Source**: [`Product/features/FEAT-INV-MOBILE-MENU.md`](../../../../../Product/features/FEAT-INV-MOBILE-MENU.md) v2
- **Figma mobile**: [`Product/ux/figma-mobile/wave03-inv-mobile-menu.md`](../../../../../Product/ux/figma-mobile/wave03-inv-mobile-menu.md) v7 ACTIVE (node `21729:24201` / inner `21519:27371`, 1 frame, screenshot `assets/wave03-inv-mobile-menu/21519-27371.png`)
- **Sub-module targets**:
  - [`features/mobile/FEAT-CAT-PROD-LIST.md`](FEAT-CAT-PROD-LIST.md) — tile "Sản phẩm" target
  - [`features/mobile/FEAT-CAT-GRP-LIST.md`](FEAT-CAT-GRP-LIST.md) — tile "Nhóm vật tư" target
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md) §3.0 (hub mobile)
- **PKG**: [`Execution/work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.4 (mobile hub added)
- **Rules**: [`.claude/skills/rules-mobile/SKILL.md`](../../../../../.claude/skills/rules-mobile/SKILL.md) §4.1 LocaleKeys MANDATORY
- **BR refs**: `BR-INV-MENU-001`, `BR-INV-MENU-002`, `BR-INV-MENU-003`, `BR-INV-MENU-004` (xem [`BR-GF-INVENTORY.md`](../../../../../Product/business-rules/BR-GF-INVENTORY.md) §2.6)

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-30 | 1 | Delivery Authority + agent-dev-garage-mobile | Initial Mobile-tier spec cho `FEAT-INV-MOBILE-MENU` W03 (post-hoc fan-out — source FEAT v2 đã có ở T2 từ 2026-06-29; wave-spec tier file vừa được tạo để fill bookkeeping gap cho W03 mobile scope expansion). §1 mục đích nghiệp vụ (hub điều hướng entry-point), §2 trách nhiệm Mobile (4 bullet: page render, FeatureTile shared widget, Cubit minimal state, auto_route nav), §3 behaviour map 8 AC-IDs (5 cluster A render / B state matrix / C navigation / D permission+tenant / E scope), §4 visual fidelity (design tokens, AppBar textSubtitleS4 hard rule M-28, FeatureTile 167.5×104 spec), §5 1 page + 1 widget shared + Cubit (build-new FeatureTile justified — no fit ở `lib/ui/widgets/**`), §6 N/A BFF, §7 file map 8 entries ⊆ `mobile/gf-garage-app/lib/**`, §8 DAG S6.1→S6.6 (LocaleKeys → widget → cubit → page → router → smoke), §9 4 BR secondary, §10 test scope 8 AC + smoke E2E, §11 7 LocaleKeys entries (MANDATORY per rules-mobile §4.1 M-30) + 4 a11y reqs, §12 N/A cross-tier (mobile-only) + 2 NEED CONFIRMATION (entry-point, SVG assets). Source FEAT v2 chỉ audit. W03 ship 2 tile visible (Sản phẩm + Nhóm vật tư); 4 tile khác HIDDEN HOÀN TOÀN per AC-4 (BA decision 2026-06-29). |
