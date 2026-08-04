---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/features/FEAT-CAT-PROD-DETAIL.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-DETAIL"
source_feat_sha: "1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d"
generated_at: "2026-06-30T00:00:00+00:00"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
experience: "garage-mobile"
platform: mobile
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-CAT-PROD-DETAIL"]
consumes_bff_feats: ["FEAT-CAT-PROD-DETAIL"]
screens_touched:
  - "lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart"
flutter_packages:
  - "flutter_bloc"
  - "freezed"
  - "get_it"
  - "injectable"
  - "auto_route"
  - "graphql_flutter"
  - "gap"
figma_refs:
  - figma_url: "https://www.figma.com/file/5YU4H3iY726P8KNxI9oCYF?node-id=21555-24017"
    node_id: "21555:24017"
    description: "FEAT-CAT-PROD-DETAIL mobile section — 2 screens: active (21526:45088) + inactive (21528:24629). View-only per CR-1782373204."
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "a72a1e067d6d58ef210d7e8bf5645599229d79701391f56be8f8e84c02557176"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-DETAIL.mobile.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-PROD-DETAIL (Mobile): Xem chi tiết mã sản phẩm nội bộ

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (§5). Mobile scope = **view-only** per CR-1782373204 + source AC-12. Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-DETAIL` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `internal_product_detail_page.dart` |
| Flutter packages | `flutter_bloc, freezed, get_it, injectable, auto_route, graphql_flutter, gap` |
| Cross-tier consume | BE: `FEAT-CAT-PROD-DETAIL` \| BFF: `FEAT-CAT-PROD-DETAIL` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-DETAIL.md`](../../../../../Product/features/FEAT-CAT-PROD-DETAIL.md) |
| Source version | v10 |
| Source SHA | `1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d` |
| Generated at | 2026-06-30T00:00:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu đầy đủ thông tin một mã sản phẩm nội bộ — thông tin chung, đơn vị tính quy đổi, SKU được gắn, và tệp đính kèm — để nắm bản chất vật tư và cập nhật mapping ngay trên màn hình chi tiết mà không phải vào form sửa riêng. Feature này là điểm tra cứu trung tâm trong luồng quản lý danh mục mã SP nội bộ V2, hỗ trợ nền dữ liệu vật tư phục vụ tính tồn và báo cáo toàn hệ thống Garage.

## 2. Trách nhiệm Mobile (garage-mobile)

- Render màn hình **"Chi tiết sản phẩm"** (`InternalProductDetailPage`) gồm 4 thẻ thông tin xếp dọc theo thiết kế Figma node `21555:24017`: ProductHeaderCard / GeneralInfoCard / TechnicalSpecCard / SpecificationDescriptionCard — **read-only hoàn toàn, không có action button nào**.
- Điều hướng từ danh sách mã SP nội bộ → detail qua `auto_route` với `productId` param; AppBar tiêu đề "Sản phẩm" + leading BackButton (không trailing action per Figma `§negative_coverage`).
- Quản lý state 3 trạng thái: `loading` (shimmer skeleton) → `loaded` (render 4 cards) → `error` (SnackBar "Không tìm thấy sản phẩm") qua `InternalProductDetailCubit`.
- Reuse canonical widgets: `SafeArea`, `StartInfoRow` (label-value, từng cặp nhãn/giá trị), `StatusBadge` (grey cho INACTIVE per PROD convention — "Ngưng hoạt động" diacritic 'ư', badge màu `AppColors.bgBadgeOpen`, KHÔNG orange), `CustomAppBar`; card layout dùng `AppColors.bgBase` + `AppShadows.itemBoxShadow` + `BorderRadius.circular(8)`.
- Consume duy nhất BFF GraphQL query `getInternalProduct(id: Int!)` via `graphql_flutter` trong `InternalProductDetailRepository` — **KHÔNG call bất kỳ mutation nào** (view-only per AC-12).
- **Out-of-scope tuyệt đối** (mobile W03): Chỉnh sửa thông tin chung, gắn/bỏ gắn SKU, thêm/sửa/xóa ĐVT quy đổi, upload/xóa đính kèm — tất cả chỉ có trên web boundary. Xem §11.3.

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: 11 source AC-IDs (AC-1..AC-8, AC-10, AC-11, AC-12 — AC-9 đã bị bỏ ở source v3). Mọi AC xuất hiện trong §3 hoặc §4.

### Cluster A — Màn hình chi tiết & thông tin chung

#### AC-1 → Mobile mở màn hình chi tiết và fetch dữ liệu qua `getInternalProduct`

- **Khi**: người dùng tap vào một hàng trong `InternalProductListPage` (hoặc deeplink `garage://inventory-catalog/internal-product/{id}`)
- **Mobile phải**: navigate tới `InternalProductDetailPage(productId: id)` qua `auto_route`; cubit dispatch `loadDetail(id)` → emit `loading` → gọi `InternalProductDetailRepository.fetchDetail(id)` → nhận `GetInternalProductResponse`
- **State transition**: `initial → loading` (render shimmer `LoadingRowShimmerWidget`) → `loaded(InternalProductDetail)` (render 4 cards) | `→ error(message)` (render SnackBar + retry button)
- **Widget**: `InternalProductDetailPage` + `CustomAppBar(title: "Sản phẩm")` — KHÔNG có trailing icon/button
- **GraphQL op**: `getInternalProduct(id: ID!): GetInternalProductResponse!` (BFF §6.1) — **sửa 2026-07-01**: scalar đúng `ID!` (không phải `Int!`) theo `inventory_catalog_document.dart` thật
- **i18n key (ARB)**: `internal_product_detail_title` = "Sản phẩm" / "Product" (NEED CONFIRMATION §11.1 i18n policy)
- **a11y**: `Semantics(label: "Chi tiết sản phẩm ${product.code}", container: true)` cho page root
- **Ref**: BFF `FEAT-CAT-PROD-DETAIL.md §6.1` op `getInternalProduct`, Figma node `21526:45088` (active), `21528:24629` (inactive)

#### AC-2 → Mobile render 4 info cards với đầy đủ fields thông tin chung

- **Khi**: cubit emit `loaded(InternalProductDetail data)` — data từ `getInternalProduct` response
- **Mobile phải**: render 4 card sections theo Figma, mỗi card dùng `AppColors.bgBase` BG + `AppShadows.itemBoxShadow` + `BorderRadius.circular(8)` + `EdgeInsets.all(AppSizes.spacing16)` padding:

  **[SỬA 2026-07-01 — toàn bộ §AC-2 rewrite khớp `internal_product_detail_page.dart` thật, spec cũ mô tả sai cấu trúc + field name không tồn tại]**

  **_HeaderCard** (Figma node `21526:45088` §ProductHeaderCard — verified thật CHỈ 3 phần, KHÔNG có Divider/ĐVT/Thương hiệu như spec cũ claim):
  - Row `mainAxis: spaceBetween`: code text style `AppTextStyle.textHeadingH4` color `AppColors.textActivePrimary` (blue) — LEFT; `StatusBadge(status: detail.status)` — RIGHT
  - `Gap(AppSizes.spacing4)`
  - Text tên sản phẩm `AppTextStyle.textHeadingH3` color `AppColors.textPrimary`
  - **KHÔNG có** `Divider`, **KHÔNG có** ĐVT/Thương hiệu row trong card này (2 field đó nằm ở card khác — xem dưới)

  **_GeneralInfoCard** (Figma node §GeneralInfoCard — verified thật: 4 row đơn cột dọc, KHÔNG phải 2×2 grid `Row([Expanded, Expanded])` như spec cũ claim):
  - Section title `LocaleKeys.catProd_generalInfo` = "Thông tin chung" `AppTextStyle.textHeadingH4`
  - `Gap(12)` *(figma binding scale 12 — no exact AppSizes match)*
  - `StartInfoRow(catProd_type = "Tính chất", detail.productType?.label ?? '--')` — field Dart là `productType` (enum `InternalProductType`, KHÔNG phải `nature`)
  - `Gap(AppSizes.spacing8)`
  - `StartInfoRow(catProd_materialGroup = "Nhóm hàng", detail.materialGroupName ?? '--')`
  - `Gap(AppSizes.spacing8)`
  - `StartInfoRow(catProd_brand = "Thương hiệu", detail.brand ?? '--')`
  - `Gap(AppSizes.spacing8)`
  - `StartInfoRow(catProd_origin = "Xuất xứ", detail.originDisplayName ?? detail.origin ?? '--')`
  - **KHÔNG có** field "Phương pháp tính giá"/`pricingMethod` — field này KHÔNG tồn tại trong `InternalProductDetail` model lẫn `getInternalProduct` GraphQL query (spec cũ bịa field không có thật)

  **_TechnicalSpecCard** (Figma node §TechnicalSpecCard — verified thật: 1 row duy nhất "Đơn vị tính", KHÔNG phải free-text field `technicalSpec`):
  - Section title `LocaleKeys.catProd_technicalSpec` `AppTextStyle.textHeadingH4` — **lưu ý riêng**: ARB thật hiện ghi "Thông số **kỹ** thuật" (dấu `ỹ`), khác claim cũ trong spec này ("kĩ" theo Figma PNG) — đây là drift diacritic RIÊNG (Figma-fidelity, không phải GraphQL), flag follow-up riêng, KHÔNG tự sửa ARB trong lần audit GraphQL này
  - `Gap(12)` *(figma binding scale 12 — no exact AppSizes match)*
  - `StartInfoRow(catProd_unit = "Đơn vị tính", detail.mainUnitDisplayName ?? detail.mainUnit ?? '--')` — **KHÔNG có** field `technicalSpec` (không tồn tại trong model/query)

  **_SpecDescriptionCard** (Figma node §SpecificationDescriptionCard — verified thật: title gộp "Mô tả & quy cách", `description` LUÔN hiển thị trước, `specification` conditional sau — thứ tự ngược + field name khác spec cũ):
  - Section title `LocaleKeys.catProd_descriptionAndSpec` = "Mô tả & quy cách" (title gộp 1 section — KHÔNG tách 2 title riêng như spec cũ)
  - `Text(detail.description ?? '--')` — LUÔN hiển thị (không điều kiện)
  - **Nếu** `detail.specification` non-empty: thêm `Gap(12)` + label `LocaleKeys.catProd_specification` = "Quy cách" + `Text(detail.specification!)` — **KHÔNG có** field `productSpec` (không tồn tại — field thật tên `specification`)

- **Label style** cho tất cả `StartInfoRow`: label `AppTextStyle.textCaptionC7` color `AppColors.textTertiary`; value `AppTextStyle.textBodyB5` color `AppColors.textPrimary`
- **StatusBadge variant**:
  - `ACTIVE` → text "Đang hoạt động", BG `AppColors.bgBadgeSuccess`, text `AppColors.textSuccessPrimary`
  - `INACTIVE` → text "Ngưng hoạt động" (diacritic **'ư' — KHÔNG 'ừ'** per Figma node `21528:24629`), BG `AppColors.bgBadgeOpen` (grey neutral), text `AppColors.textSecondary`
- **Scroll**: body = `SingleChildScrollView → Column` với `gap: Gap(AppSizes.spacing8)` giữa các cards; padding `EdgeInsets.all(AppSizes.spacing16)` page-level
- **GraphQL op**: data map từ `getInternalProduct → InternalProductDetail`
- **Ref**: Figma node `21526:45088` §VV claims verified (4 cards, token bindings, badge variants)

#### AC-3 → N/A (NEED CONFIRMATION — Figma mobile không có AuditCard)

- Figma extract (node `21526:45088`) chỉ render 4 info cards — không có AuditCard hiển thị `createdAt/By`, `updatedAt/By`. Per Figma SSOT policy, mobile KHÔNG render UI không có trong Figma. BA cần xác nhận và cung cấp Figma node bổ sung nếu muốn audit trail hiển thị trên mobile. Đến khi confirm: mobile bỏ qua audit fields trong response. Xem decisions log 2026-06-29. Audit trail đầy đủ tại `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-3`.

#### AC-4 → NEED CONFIRMATION — Tabs ĐVT / SKU / Đính kèm chưa được xác nhận trong Figma extract mobile

- Figma section `21555:24017` extract 2 screens (active + inactive) — mỗi screen chỉ hiển thị 4 info cards; không có tab component hay list section cho ĐVT quy đổi / Mã SKU / Đính kèm file. Spawn instruction đề cập "đơn vị tính / SKU list (read-only) / tệp đính kèm (download/preview only)" nhưng Figma chưa confirm UI pattern trên mobile. BA/Design phải cung cấp Figma node bổ sung trước khi impl tab sections. Đến khi confirm: mobile CHỈ render 4 info cards đã verified. Xem decisions log 2026-06-29.

### Cluster B — ĐVT quy đổi (write-only trên web)

#### AC-5 → N/A (mobile view-only per AC-12; tab NEED CONFIRMATION)

- CRUD ĐVT quy đổi (thêm/sửa/xóa) là write action — out-of-scope tuyệt đối trên mobile per CR-1782373204. Mobile KHÔNG render tab "ĐVT quy đổi" với action buttons. Mutations `addInternalProductConversionUnit` / `removeInternalProductConversionUnit` (BFF §6.1) KHÔNG được call từ mobile. Nếu read-only list ĐVT cần hiển thị → BA confirm per AC-4 NEED CONFIRMATION trước. Xem `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-5`.

### Cluster C — SKU mapping (write-only trên web)

#### AC-6 → N/A (mobile view-only per AC-12)

- Gắn SKU (modal "Gắn SKU", mutation `linkSkuToInternalProduct`) là write action — out-of-scope. Mobile KHÔNG render nút "Gắn SKU" hay modal tìm kiếm SKU. Mutation `linkSkuToInternalProduct` + query `searchSkus` KHÔNG call từ mobile. Xem `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-6`.

#### AC-7 → N/A hard (Figma negative_coverage + mobile view-only per AC-12)

- Bỏ gắn SKU (mutation `unlinkSkuFromInternalProduct`) là write action — hard N/A. Figma `§negative_coverage` xác nhận: "KHÔNG có IconButton trailing trong AppBar", "KHÔNG có BottomBar Edit/Delete". Không có UI trigger nào trên mobile. Xem `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-7`.

### Cluster D — Đính kèm file

#### AC-8 → NEED CONFIRMATION — Tab đính kèm chưa được xác nhận trong Figma mobile extract

- Figma extract không có tab đính kèm hay file list component. Spawn instruction đề cập "tệp đính kèm (download/preview only, NO edit/upload)" nhưng Figma không confirm UI. Nếu BA xác nhận và cung cấp Figma node: mobile render danh sách tệp read-only (tên file, dung lượng, nút xem/tải) — KHÔNG có nút upload/xóa (per AC-12 view-only). Endpoints `V2-18`, `V2-19` (upload/delete) KHÔNG call từ mobile. Đến khi confirm: skip tab. Xem `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-8`.

### Cluster E — Hành động & phân quyền

#### AC-10 → N/A hard (Figma negative_coverage + mobile view-only per AC-12)

- Figma `§negative_coverage` explicit: "KHÔNG có BottomBar Edit/Delete", "KHÔNG có IconButton trailing". AppBar không có trailing action. Mobile KHÔNG render nút "Chỉnh sửa", "Gắn SKU", "Thêm ĐVT quy đổi". Mọi write action redirect về web boundary. Xem `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-10`.

#### AC-11 → Mobile render đồng nhất cho cả hai persona (view-only, không có conditional action render)

- **Khi**: `garage-owner` hoặc `accountant` navigate tới màn chi tiết
- **Mobile phải**: cả hai persona xem cùng màn hình read-only; không có write action nào cần ẩn/hiện → không có conditional render phân quyền trong feature này
- **RBAC gate**: `AuthGuard` tại `auto_route` đảm bảo JWT hợp lệ với role `garage-owner` hoặc `accountant` trước khi render `InternalProductDetailPage`
- **i18n key**: không phân biệt role trong display
- **Ref**: Critical Rule #6 (dual persona only)

#### AC-12 → Enforce view-only scope — zero write action trên mobile

- **Mobile phải**: `InternalProductDetailPage` + `InternalProductDetailCubit` KHÔNG inject write repositories, KHÔNG call bất kỳ GraphQL mutation nào. Cubit chỉ inject `InternalProductDetailRepository` với method `fetchDetail` duy nhất.
- **Code review gate**: PR reviewer PHẢI verify không có `MutationOptions(...)` / `mutate(...)` call trong toàn bộ feature slice `lib/ui/inventory_catalog/internal_product_detail/`.
- **Figma confirmation**: `§negative_coverage` verified — zero action UI elements trong 2 screens.
- **Ref**: CR-1782373204, source AC-12, PKG-W03-inventory-catalog §2.2.4

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám Figma node `21555:24017` — không re-invent layout, spacing, màu sắc.
- Design tokens **bắt buộc** từ `lib/core/common/styles/`:
  - `AppColors.bgSecondary` — page scaffold background (light grey)
  - `AppColors.bgBase` — card background (white)
  - `AppColors.borderPrimary` — Divider color
  - `AppShadows.itemBoxShadow` — card elevation
  - `AppColors.textActivePrimary` — product code (blue `#0052ff`)
  - `AppColors.bgBadgeSuccess` / `AppColors.textSuccessPrimary` — badge ACTIVE
  - `AppColors.bgBadgeOpen` / `AppColors.textSecondary` — badge INACTIVE (grey)
  - `AppTextStyle.textHeadingH3` — AppBar title "Sản phẩm" (18px weight=700)
  - `AppTextStyle.textHeadingH4` — section titles + product name (16px weight=700)
  - `AppTextStyle.textCaptionC7` — field labels (12px weight=400)
  - `AppTextStyle.textBodyB5` — field values (14px weight=500)
  - `AppSizes.spacing8` — gap giữa cards (`Gap(AppSizes.spacing8)`)
  - `AppSizes.spacing16` — card padding + page padding
- **KHÔNG hardcode** `Color(0xFF...)` / `TextStyle(...)` literal / raw `SizedBox(height: 8)`.
- **StatusBadge text verbatim** (per Figma M-22 rule):
  - ACTIVE: "Đang hoạt động" (KHÔNG viết tắt)
  - INACTIVE: "**Ngưng** hoạt động" (diacritic **'ư'**, KHÔNG '**ừ**') — khác PROD convention so với GRP list dùng "**Ngừng** hoạt động" ('ừ', orange badge). Hai variant khác nhau hoàn toàn.
- **Section title verbatim**: "Thông số **kĩ** thuật" (diacritic **'kĩ'**, KHÔNG '**kỹ**') — per Figma PNG evidence.
- Responsive: phone (375px compact) confirmed từ Figma. Tablet: `LayoutBuilder` chuyển sang 2-column grid view nếu breakpoint > 600dp — NEED CONFIRMATION (Figma chỉ spec phone).

### 4.2 State machine + error handling

- Cubit state tường minh: `initial → loading → loaded(data)` | `→ error(message)`.
- `loading` state: render `LoadingRowShimmerWidget` shimmer skeleton thay vì blank screen.
- `error` state: render SnackBar "Không tìm thấy sản phẩm" (product not found) hoặc "Đã xảy ra lỗi, vui lòng thử lại" (generic) + retry button.
- KHÔNG silent fail — log error qua Sentry/observability trước khi emit error state.
- `loaded` null fields: render "—" (em dash) thay vì để trống (`brand`, `originDisplayName`, `materialGroupName`, `mainUnitDisplayName`, `specification`, `description` đều nullable — **sửa 2026-07-01**: bỏ `technicalSpec`/`productSpec` không tồn tại trong model thật, thêm `mainUnitDisplayName`).

### 4.3 Native interaction + permission

- Không cần native permission (không có camera, file picker, push — view-only screen).
- Deeplink `garage://inventory-catalog/internal-product/{id}` — route param `id: int` qua `auto_route` `@RoutePage()`.

### 4.4 Offline + connectivity

- Feature online-required: `getInternalProduct` query cần network. Không offline cache (detail screen mutable).
- Khi offline: `ConnectivityBanner` hiển thị; cubit emit `error` nếu fetch fail; retry on banner dismiss.
- Không lưu detail vào Hive/Isar (không cần offline-first cho view-only detail).

### 4.5 i18n + a11y

- Mọi label string qua ARB key (`lib/l10n/intl_vi.arb` + `intl_en.arb`). NEED CONFIRMATION: PKG-W03-inventory-catalog G8 có thể mandate fixed VN labels inline (per FEAT-CAT-GRP-CREATE precedent trong cùng PKG). Nếu BA confirm fixed-VN → replace ARB key lookups bằng hardcode string tiếng Việt; cập nhật `i18n_keys: []` trong frontmatter.
- a11y:
  - `Semantics(label: "Chi tiết sản phẩm")` cho `InternalProductDetailPage` root
  - `Semantics(label: "Mã ${code}")` cho product code text
  - `Semantics(label: "${status == ACTIVE ? "Đang hoạt động" : "Ngưng hoạt động"}")` cho `StatusBadge`
  - `Semantics(label: "${label}: ${value}")` cho mỗi `StartInfoRow` — label + value hợp thành label semantic
  - Tap target ≥ 48dp; contrast ratio WCAG AA cho `textCaptionC7` (grey label) trên `bgBase` (white) — verify contrast.

### 4.6 RBAC render + feature flag

- Không cần feature flag riêng cho màn này (EP-INVENTORY-CATALOG bật toàn bộ W03).
- `AuthGuard` gate tại `auto_route` — JWT invalid → redirect login.
- Cả `garage-owner` + `accountant` đều access view-only — không có conditional widget ẩn/hiện trong feature này.

### 4.7 Business rule secondary (UI hint)

- Không có client-side validation trong view-only screen (không có form input).
- `BR-CAT-CMN-002` (audit fields): mobile N/A pending Figma confirm (AC-3 NEED CONFIRMATION).
- `BR-CAT-PROD-013` / `BR-CAT-PROD-014` / `BR-CAT-PROD-011/012/015`: tất cả là BE/web primary — mobile không enforce, không display.
- **View-only enforcement**: primary BR cho mobile = AC-12 zero-mutation rule (xem §4.1 code review gate).

### 4.8 Performance

- `SingleChildScrollView` với Column — không dùng `ListView.builder` (số cards cố định 4 items, không cần virtualization).
- Image: `imageUrl` không hiển thị trên mobile per Figma `§negative_coverage` "KHÔNG có Thumbnail/Image". Nếu requirement thay đổi → dùng `cached_network_image`.
- Avoid rebuild: `BlocBuilder<InternalProductDetailCubit, InternalProductDetailState>` granular — KHÔNG wrap toàn page trong `BlocBuilder`.
- `const` constructor cho 4 card widgets khi có thể.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| `INTERNAL_PRODUCT_NOT_FOUND` | SnackBar "Không tìm thấy sản phẩm" | `AppSnackBar` | AC-1 |
| `FORBIDDEN` | SnackBar "Không có quyền truy cập" | `AppSnackBar` | AC-11 |
| Generic network/timeout | SnackBar "Đã xảy ra lỗi, vui lòng thử lại" + retry | `AppSnackBar` | AC-1 |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`. Canonical Garage mobile layout: `lib/ui/{domain}/{sub_feature}/{name}_page.dart`.

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Change type | Figma node-id | AC ref |
|---|---|---|---|---|
| `InternalProductDetailPage` | `/inventory-catalog/internal-product/:id` | NEW | `21526:45088` (active), `21528:24629` (inactive) | AC-1, AC-2, AC-11, AC-12 |

### 5.2 Widgets

> **Reuse pattern (priority: customs > share > ui)**. Widget paths NEED CONFIRMATION do bundle §G.X KG missing (xem decisions log 2026-06-29 FEAT-CAT-PROD-DETAIL). Dev phải scan `lib/` thực tế trước S6.3.

| Widget | Path | Change type | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|
| `InternalProductDetailPage` | `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | NEW | StatelessWidget (@RoutePage) | Build-new — page entry point, view-only scope enforcer | AC-1, AC-11, AC-12 |
| `InternalProductDetailCubit` | `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_cubit.dart` | NEW | Cubit (@Injectable) | Build-new — `BaseCubit<InternalProductDetailState>`; chỉ inject read repository | AC-1, AC-2 |
| `InternalProductDetailState` | `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_state.dart` | NEW | @freezed | Build-new — `initial / loading / loaded(InternalProductDetail) / error(String)` | AC-1 |
| `ProductHeaderCard` | `lib/ui/inventory_catalog/internal_product_detail/widgets/product_header_card.dart` | NEW | StatelessWidget | Build-new — justification: domain-specific card composition (code+badge+name+2-col attrs); no fit at customs/share/ui after §G.X scan | AC-2 |
| `GeneralInfoCard` | `lib/ui/inventory_catalog/internal_product_detail/widgets/general_info_card.dart` | NEW | StatelessWidget | Build-new — justification: 2×2 grid layout domain-specific; no fit at 3 layers | AC-2 |
| `TechnicalSpecCard` | `lib/ui/inventory_catalog/internal_product_detail/widgets/technical_spec_card.dart` | NEW | StatelessWidget | Build-new — justification: single multi-line free-text value card; no generic match at 3 layers | AC-2 |
| `SpecificationDescriptionCard` | `lib/ui/inventory_catalog/internal_product_detail/widgets/specification_description_card.dart` | NEW | StatelessWidget | Build-new — justification: 2-row single-col attrs card domain-specific; no fit at 3 layers | AC-2 |
| `CustomAppBar` | NEED CONFIRMATION path — naming convention inference: Priority 1 — customs/ (`Custom*` prefix → customs/ layer) | REUSE | StatelessWidget | Priority 1 — customs/ (inference; dev verify actual path `lib/...`) | AC-1 |
| `StartInfoRow` | NEED CONFIRMATION path — naming convention inference: Priority 2 — share/ (label-value canonical per spawn + template note) | REUSE | StatelessWidget | Priority 2 — share/ (inference; dev verify path; implements label-above-value Column: label `textCaptionC7 textTertiary`, value `textBodyB5 textPrimary`) | AC-2 |
| `StatusBadge` | NEED CONFIRMATION path — inference: Priority 2 — share/ or ui/ | REUSE | StatelessWidget | Priority 2 — share/ or Priority 3 — ui/ (dev verify; needs `ACTIVE`/`INACTIVE` variant props) | AC-2 |
| `LoadingRowShimmerWidget` | `lib/ui/widgets/loading/loading_row_shimmer_widget.dart` | REUSE | StatelessWidget | Priority 2 — `lib/ui/widgets/` canonical shimmer for loading state | AC-1 |

### 5.3 Navigation

| Route | Page | Loader/Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `/inventory-catalog/internal-product/:id` | `InternalProductDetailPage` | `AuthGuard` (garage-owner + accountant) | `garage://inventory-catalog/internal-product/{id}` | AC-1, AC-11 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | States | AC ref |
|---|---|---|---|---|
| Page fetch + render | Cubit | `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_cubit.dart` | `initial / loading / loaded(InternalProductDetail data) / error(String message)` (extends `BaseCubit<InternalProductDetailState>`, @Injectable) | AC-1..AC-2, AC-11, AC-12 |

---

## 6. Data integration (Mobile — consume BFF)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter pattern | Repository class | AC ref |
|---|---|---|---|---|
| `getInternalProduct` | query | `_graphQLService.client.query(QueryOptions(document: gql(InventoryCatalogDocument.getInternalProduct), variables: {'id': id}))` | `lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` (`InventoryCatalogRepository`, consolidated cross-domain — **sửa 2026-07-01**: KHÔNG có file per-domain `internal_product_repository.dart` riêng) | AC-1, AC-2 |

> Tất cả op phải tồn tại ở BFF `FEAT-CAT-PROD-DETAIL.md §6.1` (reviewer item #17). Mobile chỉ consume query `getInternalProduct` — KHÔNG consume `searchSkus`, `linkSkuToInternalProduct`, `unlinkSkuFromInternalProduct`, `addInternalProductConversionUnit`, `removeInternalProductConversionUnit` (web-only mutations per AC-12).

**Response mapping** (verified khớp `internal_product_models.dart` + `internal_product_detail_page.dart` thật — **sửa toàn bộ 2026-07-01**): `GetInternalProductResponse → InternalProductDetail` (fields verbatim: `id`, `code`, `name`, `status`, `productType`, `materialGroupId`, `materialGroupName`, `mainUnit`, `mainUnitDisplayName`, `brand`, `origin`, `originDisplayName`, `description`, `specification`, `createdAt`, `createdBy`, `createdByName`, `updatedAt`, `updatedBy`, `updatedByName`). **KHÔNG tồn tại** field `nature`/`pricingMethod`/`productSpec`/`technicalSpec`/`notes` (spec cũ bịa 5 field không có thật). **KHÔNG có** `skuMappings[]`/`conversionUnits[]`/`attachments[]` trong query thật — GraphQL document `getInternalProduct` KHÔNG fetch 3 nested array này (khác spec cũ claim "được parse nhưng chỉ render nếu BA confirm"); nếu AC-4/AC-8 tab sections được confirm sau này, cần bổ sung field selection vào query trước khi implement — hiện tại KHÔNG có data để render dù UI có build.

### 6.2 REST endpoints consumed direct

Không có — mobile chỉ qua BFF GraphQL.

### 6.3 Offline-first strategy

| Concern | Pattern | Notes |
|---|---|---|
| Online required | Network fetch mỗi lần mở màn | Detail screen mutable — không cache |
| Offline fallback | `ConnectivityBanner` + error state + retry | KHÔNG lưu Hive/Isar cho màn view-only này |

### 6.4 Platform-specific behaviors

| Concern | iOS | Android | Notes |
|---|---|---|---|
| Deeplink | Universal Link `garage://...` | App Link `garage://...` | NEED CONFIRMATION: scheme + host config |
| Back gesture | `WillPopScope` / `Navigator.pop()` | Back button hardware | auto_route handle |

---

## 7. File/module impact map (Mobile — Flutter feature slice)

> Paths ⊆ `mobile/gf-garage-app/lib/**` (Critical Rule #1). KHÔNG cross-boundary.

| Layer | Path glob | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| Page | `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | NEW | StatelessWidget + BlocBuilder | ~120 | AC-1, AC-11, AC-12 |
| Cubit | `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_cubit.dart` | NEW | BaseCubit<State>, @Injectable | ~55 | AC-1, AC-2 |
| State | `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_state.dart` | NEW | @freezed union | ~40 | AC-1 |
| Local widgets (4 cards) | `lib/ui/inventory_catalog/internal_product_detail/widgets/*.dart` | NEW (×4) | StatelessWidget domain-specific cards | ~80 each (~320 total) | AC-2 |
| Repository | `lib/core/repositories/inventory_catalog/internal_product_repository.dart` | NEW or ADDITIVE (nếu đã tồn tại từ FEAT-CAT-PROD-LIST) | @LazySingleton(as: InternalProductRepository), GraphQLService injected | ~65 | AC-1 |
| Model | `lib/core/models/inventory_catalog/internal_product_detail_model.dart` | NEW | @freezed + @JsonSerializable | ~90 | AC-1, AC-2 |
| Router | `lib/core/router/router.dart` + `router.gr.dart` (codegen) | MODIFY additive (@RoutePage entry) | auto_route 10.1.0+1 | ~10 | AC-1 |
| i18n | `lib/l10n/intl_vi.arb` + `intl_en.arb` | ADDITIVE | flutter_localizations | ~20 keys | AC-1, AC-2 |
| Unit test | `test/features/inventory_catalog/internal_product_detail_cubit_test.dart` | NEW | bloc_test + mocktail | ~130 | AC-1, AC-2, AC-12 |
| Widget test | `test/features/inventory_catalog/internal_product_detail_page_test.dart` | NEW | flutter_test golden snapshot | ~100 | AC-2, AC-11 |

---

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 song song với FE Web S6. Entry: BFF S5 `getInternalProduct` SDL stable.

```
(← BFF tier S5: getInternalProduct SDL + resolver stable)

S6  Mobile UI wire (Flutter — view-only)
    Entry: BFF S5 stable + Figma node 21555:24017 verified + view-only scope confirmed
    Hành động:
      S6.1 Model + Repository
            - InternalProductDetailModel @freezed (fields per BFF SDL §5.1 InternalProductDetail type)
            - InternalProductDetailRepository.fetchDetail(int id) → gql GET_INTERNAL_PRODUCT_QUERY
            - Exit: model JSON parse test green
      S6.2 Cubit + State
            - InternalProductDetailState @freezed (initial/loading/loaded/error)
            - InternalProductDetailCubit.loadDetail(id) → repo → emit states
            - Exit: bloc_test unit test green (happy + error paths)
      S6.3 4 Card widgets
            - ProductHeaderCard / GeneralInfoCard / TechnicalSpecCard / SpecificationDescriptionCard
            - Token bindings per Figma §4.1; StatusBadge variant; StartInfoRow reuse
            - Exit: widget test golden snapshot pass (active + inactive badge variants)
      S6.4 Page + Router
            - InternalProductDetailPage (@RoutePage) + route /inventory-catalog/internal-product/:id
            - AuthGuard; ConnectivityBanner; BlocBuilder; KHÔNG injection write repo
            - Exit: page renders end-to-end in debug; code review gate (zero mutation call)
      S6.5 i18n ARB + a11y Semantics
            - Add keys intl_vi.arb + intl_en.arb; Semantics wrapper per §4.5
            - Exit: flutter test localization pass
    Exit: Patrol E2E smoke test happy path green; code review confirm zero mutation
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Model + Repository | core/models, core/repositories | BFF S5 SDL stable | Parse test green | BFF S5 |
| S6.2 | Cubit + State | lib/ui/…/cubit + state | S6.1 | bloc_test green | S6.1 |
| S6.3 | 4 Card widgets | lib/ui/…/widgets/ | S6.2 + Figma confirmed | Widget test golden green | S6.2 |
| S6.4 | Page + Router | lib/ui/…/page + router | S6.3 | Code review gate pass | S6.3 |
| S6.5 | i18n + a11y | l10n/ | S6.4 | Localization test pass | S6.4 |

---

## 9. Business Rules to enforce (Mobile — UI hint + secondary)

> Mobile KHÔNG enforce business validation primary. Mobile chỉ: RBAC render + view-only enforcement.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `AC-12 view-only rule` | CORNERSTONE | Cubit không inject write repo; page không có mutation call; PR gate | `internal_product_detail_cubit.dart` | AC-12 | Enforce by code structure — không phải runtime check |
| `RBAC dual-persona` | CORNERSTONE | `AuthGuard` — cả `garage-owner` + `accountant` access; no conditional render | `lib/core/router/router.dart` | AC-11 | Critical Rule #6 |
| `BR-CAT-CMN-002` | secondary | N/A mobile (Figma không có AuditCard) | — | AC-3 (NEED CONFIRM) | BE enforce primary; mobile pending |
| `BR-CAT-PROD-013..015` | secondary | N/A mobile (write actions web-only) | — | AC-5..AC-8 N/A | BE enforce primary |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-PROD-DETAIL.md §9`).

---

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (navigation + state) | test-mobile-ui | Tap list item → LoadingState skeleton → Loaded 4 cards; error → SnackBar |
| AC-2 | Widget test (golden snapshot) | test-mobile-ui | Active variant: green badge "Đang hoạt động" + 4 cards; Inactive variant: grey badge "Ngưng hoạt động"; token bindings `textHeadingH4`, `textCaptionC7`, `textBodyB5` |
| AC-3 | SKIP (NEED CONFIRMATION) | — | Pending BA Figma audit node confirm |
| AC-4 | SKIP (NEED CONFIRMATION) | — | Pending BA Figma tab sections confirm |
| AC-5 | N/A (web-only write) | — | — |
| AC-6 | N/A (web-only write) | — | — |
| AC-7 | N/A (web-only write) | — | — |
| AC-8 | SKIP (NEED CONFIRMATION) | — | Pending BA Figma attachment tab confirm |
| AC-10 | Widget test (negative — no action button) | test-mobile-ui | Assert zero `GestureDetector`/`IconButton` with write intent in page widget tree |
| AC-11 | Widget test (RBAC both persona) | test-mobile-ui | Mock `garage-owner` + `accountant` JWT → both render same page |
| AC-12 | Widget test (view-only enforcement) | test-mobile-ui | Assert cubit has no write repository injection; assert page has zero mutation call |
| (smoke) | Mobile E2E happy path | test-mobile-e2e | Navigate → detail → verify 4 cards visible → back; connectivity offline → banner |

---

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

> NEED CONFIRMATION: PKG-W03-inventory-catalog G8 có thể mandate **fixed VN labels inline** (per FEAT-CAT-GRP-CREATE mobile precedent trong cùng PKG). Nếu BA confirm policy fixed-VN: replace toàn bộ ARB key lookups bằng hardcoded tiếng Việt; update `i18n_keys: []` frontmatter.

| Key | vi | en | AC ref |
|---|---|---|---|
| `internal_product_detail_title` | "Sản phẩm" | "Product" | AC-1 |
| `internal_product_detail_section_general_info` | "Thông tin chung" | "General Information" | AC-2 |
| `internal_product_detail_section_technical_spec` | "Thông số kĩ thuật" | "Technical Specifications" | AC-2 |
| `internal_product_detail_section_spec_description` | "Quy cách mô tả" | "Specification & Description" | AC-2 |
| `internal_product_detail_label_uom` | "ĐVT" | "Unit" | AC-2 |
| `internal_product_detail_label_brand` | "Thương hiệu" | "Brand" | AC-2 |
| `internal_product_detail_label_nature` | "Tính chất" | "Nature" | AC-2 |
| `internal_product_detail_label_group` | "Nhóm" | "Group" | AC-2 |
| `internal_product_detail_label_origin` | "Xuất xứ" | "Origin" | AC-2 |
| `internal_product_detail_label_pricing_method` | "Phương pháp tính giá" | "Pricing Method" | AC-2 |
| `internal_product_detail_label_product_spec` | "Quy cách" | "Specification" | AC-2 |
| `internal_product_detail_label_description` | "Mô tả" | "Description" | AC-2 |
| `internal_product_detail_status_active` | "Đang hoạt động" | "Active" | AC-2 |
| `internal_product_detail_status_inactive` | "Ngưng hoạt động" | "Inactive" | AC-2 |
| `internal_product_detail_error_not_found` | "Không tìm thấy sản phẩm" | "Product not found" | AC-1 |
| `internal_product_detail_error_generic` | "Đã xảy ra lỗi, vui lòng thử lại" | "An error occurred, please try again" | AC-1 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `Semantics(label: "Chi tiết sản phẩm", container: true)` cho page root | TalkBack/VoiceOver entry |
| AC-2 | `Semantics(label: "${label}: ${value}")` cho mỗi `StartInfoRow` pair | Screen reader reads label + value together |
| AC-2 | `Semantics(label: "Trạng thái: ${statusText}")` cho `StatusBadge` | State announcement |
| AC-2 | `excludeSemantics: true` cho `Divider` và card decorative elements | Avoid noise |
| AC-1 | Tap target BackButton ≥ 48dp | iOS + Android |
| AC-11 | Contrast ratio WCAG AA: `textCaptionC7` (grey) trên `bgBase` (white) | Verify contrast tool |

### 11.3 Out-of-Scope (mobile W03 — per CR-1782373204 + PKG-W03 §2.2.4)

Các tính năng sau **tuyệt đối không triển khai** trên mobile trong W03:

| Tính năng | Lý do | Spec web |
|---|---|---|
| Chỉnh sửa thông tin chung | Write action — web-only | `fe-web/FEAT-CAT-PROD-DETAIL.md` + `FEAT-CAT-PROD-EDIT` |
| Gắn SKU (modal + mutation) | Write action — web-only | `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-6` |
| Bỏ gắn SKU | Write action — web-only | `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-7` |
| Thêm / Sửa / Xóa ĐVT quy đổi | Write action — web-only | `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-5` |
| Upload tệp đính kèm | Write action — web-only | `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-8` |
| Xóa tệp đính kèm | Write action — web-only | `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-8` |
| Nút "Chỉnh sửa" / "Gắn SKU" / "Thêm ĐVT" trong header | UI write trigger — web-only | AC-10 N/A |
| Tab ĐVT quy đổi + SKU + Đính kèm (read-only list) | Figma chưa confirm — NEED CONFIRMATION (BA) | AC-4, AC-8 NEED CONFIRM |
| Thông tin audit (createdAt/By, updatedAt/By) | Figma chưa confirm — NEED CONFIRMATION (BA) | AC-3 NEED CONFIRM |

---

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-DETAIL.md` | DRAFT | BR primary enforcement; `V2-8 GET /api/v2/internal-products/{id}` contract source |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-DETAIL.md` | DRAFT | Mobile consume duy nhất: `getInternalProduct(id: Int!)` query; mutations không dùng |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-DETAIL.md` | DRAFT | Full write scope (AC-5/6/7/8/10); mobile scope phân biệt rõ via AC-12 |

**Source ID consistency** (item #18): `source_feat_sha = 1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d` — identical với BE/BFF/FE files.

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-DETAIL.md`](../../../../../Product/features/FEAT-CAT-PROD-DETAIL.md) v10
- **Paired BE**: [`features/be/FEAT-CAT-PROD-DETAIL.md`](../be/FEAT-CAT-PROD-DETAIL.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-PROD-DETAIL.md`](../bff/FEAT-CAT-PROD-DETAIL.md) (op: `getInternalProduct`)
- **Figma mobile**: [`Product/ux/figma-mobile/wave03-cat-prod-detail.md`](../../../../../Product/ux/figma-mobile/wave03-cat-prod-detail.md) — Figma URL node `21555:24017`
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md) §3.2, §3.3
- **PKG**: [`work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.4
- **ADR-017**: InternalProduct + MaterialGroup additive aggregates; migration sequence (W03 new entity)
- **ADR-009**: JPA no relationship mapping — scalar FK only
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **CR-1782373204**: PROD VIEW-ONLY on mobile — authoritative scope restriction
- **Decisions log**: [`_decisions.md`](../../_decisions.md) — entries 2026-06-29 FEAT-CAT-PROD-DETAIL mobile

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 2 | Delivery Authority (in-session full GraphQL re-audit — user request "check lại hết phần graphql của wave 3") | **Rewrite toàn bộ §3 AC-2 + §4.2 + §6.1 khớp code thật** (`internal_product_models.dart` + `internal_product_detail_page.dart` + `inventory_catalog_document.dart`) — spec cũ bịa 5 field không tồn tại (`nature`, `pricingMethod`, `productSpec`, `technicalSpec`, `notes`; field thật: `productType`, `specification`, KHÔNG có pricingMethod/notes) VÀ mô tả sai cấu trúc 4 card (HeaderCard spec cũ claim có Divider+ĐVT+Thương hiệu — thật KHÔNG có; GeneralInfoCard spec cũ claim 2×2 grid — thật là 4 row đơn cột dọc; TechnicalSpecCard spec cũ claim free-text field — thật chỉ 1 row "Đơn vị tính"; SpecDescriptionCard spec cũ tách 2 title — thật gộp 1 title "Mô tả & quy cách", description luôn hiện trước specification conditional sau). Sửa `getInternalProduct(id: Int!)` → `id: ID!`. Sửa repository path → `inventory_catalog_repository.dart` consolidated. Xoá claim sai "skuMappings/conversionUnits/attachments được parse" — query thật KHÔNG fetch 3 field này. Flag riêng (không tự sửa): diacritic "Thông số kỹ thuật" (ARB thật dùng 'kỹ') vs claim cũ 'kĩ' theo Figma — cần Figma re-verify riêng, ngoài scope audit GraphQL. |
| 2026-06-30 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec `FEAT-CAT-PROD-DETAIL` W03. Policy v2 tier-authoritative: §0 audit slim, §1 identical cross-tier (BE byte-equal), §2 mobile trách nhiệm view-only (4 info cards, zero write), §3 behaviour map 11 AC-IDs (AC-1/2/11/12 active; AC-3 N/A NEED CONFIRM Figma; AC-4/8 NEED CONFIRM Figma tabs; AC-5/6/7/10 N/A hard view-only; per decisions log 2026-06-29), §4 visual fidelity Figma tokens + StatusBadge verbatim (Ngưng/ư) + section title kĩ verbatim + state machine + RBAC + BR secondary, §5 page/widget/state map (4 build-new cards + 3 REUSE paths NEED CONFIRM), §6 data integration (getInternalProduct only), §7 file map, §8 S6 DAG, §9 BR secondary, §10 test scope, §11 i18n ARB + a11y + out-of-scope table, §12 cross-tier pair. NEED CONFIRMATION count: 7 (AC-3, AC-4, AC-8, StartInfoRow path, StatusBadge path, CustomAppBar path, i18n policy). |
