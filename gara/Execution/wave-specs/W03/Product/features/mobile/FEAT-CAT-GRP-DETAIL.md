---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/features/FEAT-CAT-GRP-DETAIL.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-DETAIL"
source_feat_sha: "d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2"
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
consumes_backend_feats: ["FEAT-CAT-GRP-DETAIL"]
consumes_bff_feats: ["FEAT-CAT-GRP-DETAIL"]
screens_touched:
  - "lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart"
flutter_packages:
  - "flutter_bloc"
  - "freezed"
  - "get_it"
  - "injectable"
  - "auto_route"
  - "graphql_flutter"
  - "gap"
figma_refs:
  - "Product/ux/figma-mobile/wave03-cat-grp-detail.md (node 21555:24248 — Chi tiết nhóm vật tư hàng hoá, screen 21254:51661)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "a72a1e067d6d58ef210d7e8bf5645599229d79701391f56be8f8e84c02557176"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-DETAIL.mobile.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-GRP-DETAIL (Mobile): Chi tiết nhóm vật tư hàng hóa

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (`Product/ux/figma-mobile/wave03-cat-grp-detail.md`, node `21555:24248`). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DETAIL` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` |
| Flutter packages | `flutter_bloc`, `freezed`, `get_it`, `injectable`, `auto_route`, `graphql_flutter`, `gap` |
| Cross-tier consume | BE: `FEAT-CAT-GRP-DETAIL` \| BFF: `FEAT-CAT-GRP-DETAIL` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-DETAIL` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-DETAIL.md`](../../../../../Product/features/FEAT-CAT-GRP-DETAIL.md) |
| Source version | v4 |
| Source SHA | `d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2` |
| Generated at | 2026-06-30T00:00:00+00:00 |

## 1. Mục đích nghiệp vụ

Feature cung cấp khả năng tra cứu toàn bộ thông tin của một nhóm vật tư hàng hóa (MaterialGroup) trong danh mục kho, bao gồm thông tin mô tả, trạng thái, cấu trúc phân cấp, và lịch sử tạo/cập nhật (audit trail). Chủ garage và kế toán cần thấy đầy đủ nội dung nhóm trước khi quyết định chỉnh sửa hoặc xóa, giảm rủi ro thao tác nhầm. Feature này là điểm đọc trung tâm trong luồng CRUD nhóm VTHH của EP-INVENTORY-CATALOG, phục vụ nền dữ liệu vật tư chuẩn hóa cho toàn bộ nghiệp vụ kho V2 downstream.

## 2. Trách nhiệm Mobile (garage-mobile)

- Render màn **"Chi tiết nhóm vật tư hàng hoá"** (Figma node `21254:51661`) — phone 375×812px, `CustomScaffold` + `CustomAppBar` (leading back chevron, không trailing action) + scrollable body + `GroupDetailFooter` (BottomBar 2 nút cố định ở đáy).
- Tải dữ liệu nhóm qua GraphQL query `getMaterialGroup(id)` (BFF §6.1) — trạng thái `loading → loaded | error` điều phối bởi `MaterialGroupDetailCubit`; `loadDetail(id)` gọi khi page khởi tạo.
- Hiển thị read-only: `GroupSummaryHeader` (mã nhóm blue H4, ngày tạo compact C7, badge trạng thái) + tên nhóm (H3 bold) + 6 `StartInfoRow` (Thuộc nhóm, Mô tả, Ngày tạo, Người tạo, Ngày sửa, Người sửa).
- Điều hướng từ `MaterialGroupListPage` (FEAT-CAT-GRP-LIST) vào detail qua `auto_route` `MaterialGroupDetailRoute(id: id)`; quay lại bằng back gesture / leading BackButton → `context.router.pop()`.
- Render 2 action buttons trong `GroupDetailFooter`: **"Sửa"** (AppButton primary, push FEAT-CAT-GRP-EDIT) + **"Xoá"** (AppButton secondary, trigger FEAT-CAT-GRP-DELETE confirm flow) — cả hai hiển thị trên mobile per AC-7; RBAC-gated riêng per permission key [NEED CONFIRMATION — §4.6].
- Badge trạng thái: ACTIVE = "Đang hoạt động" (`bgBadgeSuccess`/`textSuccessPrimary` green) · INACTIVE = "Đã ẩn" màu **orange** (`bgBadgeWarning`) per GRP-LIST mobile convention [NEED CONFIRMATION — Figma detail spec ghi `bgBadgeOpen` grey; Pass 2 verdict required trước merge].

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: 7 source AC-IDs (AC-1 đến AC-7) — mỗi AC phải xuất hiện tại §3 hoặc §4.

### Cluster A — Hiển thị màn chi tiết

#### AC-1 → Mobile render màn chi tiết và tải dữ liệu qua getMaterialGroup

- **Khi**: `MaterialGroupListPage` dispatch push `MaterialGroupDetailRoute(id: id)` (tap icon Xem hoặc tap tên nhóm trong danh sách).
- **Mobile phải**: `MaterialGroupDetailCubit.loadDetail(id)` emit `loading` → gọi `MaterialGroupRepository.getDetail(id)` → execute GraphQL query `getMaterialGroup(id: $id)` → parse `MaterialGroupApiResponse.data` → emit `loaded(MaterialGroupModel)` hoặc `error(code)`.
- **State transition**: `initial → loading → loaded(group) | error(errorCode)`.
- **Widget render per state**:
  - `loading` → `LoadingRowShimmerWidget` (full-screen skeleton, `lib/ui/widgets/loading/loading_row_shimmer_widget.dart`).
  - `loaded` → `GroupSummaryHeader` + GroupDetailFieldList body + `GroupDetailFooter`.
  - `error(NOT_FOUND / 404)` → `LoadEmpty` widget + SnackBar `materialGroupDetail_errorNotFound`.
  - `error(500)` → SnackBar `materialGroupDetail_errorGeneric`.
- **GraphQL op**: `getMaterialGroup(id: $id)` — xem §6.1; op phải tồn tại ở BFF §6.1.
- **i18n key (ARB)**: `materialGroupDetail_title` = "Chi tiết nhóm vật tư hàng hoá" (diacritic "hoá" verbatim Figma AppBar).
- **a11y**: `CustomAppBar` leading `Semantics(label: l10n.materialGroupDetail_backButtonA11y, button: true)`.
- **Ref**: Figma node `21254:51661` (§VV ✓), paired BFF `FEAT-CAT-GRP-DETAIL` bff/ §6.1.

#### AC-2 → Mobile hiển thị đầy đủ 5 trường thông tin nhóm (read-only)

- **Khi**: `MaterialGroupDetailState.loaded(group)` active — body render.
- **Mobile phải**: Hiển thị 5 trường theo Figma layout (không form, không input):
  1. **Mã nhóm VTHH** → `Text(group.code, style: AppTextStyle.textHeadingH4.copyWith(color: AppColors.textActivePrimary))` trong `GroupSummaryHeader` (blue `#0052ff`, H4 16px w700).
  2. **Trạng thái** → `StatusBadge(label: group.statusLabel, bgColor: ..., textColor: ...)` trong `GroupSummaryHeader` (ACTIVE green / INACTIVE orange [NEED CONFIRMATION — §4.1]).
  3. **Tên nhóm VTHH** → `Text(group.name, style: AppTextStyle.textHeadingH3.copyWith(color: AppColors.textPrimary))` (H3 18px w700, heading section trong `GroupDetailFieldList`).
  4. **Thuộc nhóm** → `StartInfoRow(label: l10n.materialGroupDetail_fieldParentGroup, value: group.parentName ?? "—")` — row 1.
  5. **Mô tả** → `StartInfoRow(label: l10n.materialGroupDetail_fieldDescription, value: group.description ?? "—")` — row 2.
- **Widget**: `GroupSummaryHeader` + `GroupDetailFieldList` (local — §5.2).
- **a11y**: mỗi `StartInfoRow` wrap `Semantics(label: "${label}: ${value}")`.
- **Ref**: Figma nodes `GroupSummaryHeader` + `Column/FieldsList` rows 1-2 (§VV ✓); `_negative_coverage` xác nhận KHÔNG có inline Edit icon cạnh tên nhóm.

> **Figma note (AC-2)**: `GroupSummaryHeader` có thêm `Text/CreateTimestamp` ("Ngày tạo: [createdAt]" style `AppTextStyle.textCaptionC7.copyWith(color: AppColors.textTertiary)`) bên dưới mã nhóm — compact display dùng cùng field `group.createdAt`. Đây là thành phần UI bổ sung của header, phân biệt với `StartInfoRow "Ngày tạo"` thuộc AC-3 (FieldsList rows 3-6).

#### AC-3 → Mobile hiển thị 4 trường audit trail (ngày/người tạo, sửa)

- **Khi**: `MaterialGroupDetailState.loaded(group)` active — FieldsList rows 3-6 render.
- **Mobile phải**: Render 4 `StartInfoRow` tại phần cuối `GroupDetailFieldList`:
  - Row 3: `StartInfoRow(label: l10n.materialGroupDetail_fieldCreatedAt, value: formatDateTime(group.createdAt))`.
  - Row 4: `StartInfoRow(label: l10n.materialGroupDetail_fieldCreatedBy, value: group.createdByName ?? group.createdBy)`.
  - Row 5: `StartInfoRow(label: l10n.materialGroupDetail_fieldUpdatedAt, value: formatDateTime(group.updatedAt))`.
  - Row 6: `StartInfoRow(label: l10n.materialGroupDetail_fieldUpdatedBy, value: group.updatedByName ?? group.updatedBy)`.
- **Fallback**: `createdByName` / `updatedByName` nullable (BFF enrich có thể fail gracefully) → fallback sang `createdBy` / `updatedBy` raw string; KHÔNG crash nếu null.
- **Widget**: 4 `StartInfoRow` trong `GroupDetailFieldList` (§5.2).
- **a11y**: mỗi row `Semantics(label: "${label}: ${value}")`.
- **Ref**: BR-CAT-CMN-002 (audit fields mandatory — BE primary enforce); Figma FieldsList rows 3-6 (§VV ✓ "Ngày tạo / Người tạo / Ngày sửa / Người sửa").

### Cluster B — Điều hướng và hành động

#### AC-4 → Mobile điều hướng sang form chỉnh sửa khi tap "Sửa"

- **Khi**: user tap AppButton "Sửa" trong `GroupDetailFooter` (loaded state, có edit permission).
- **Mobile phải**: `context.router.push(MaterialGroupEditRoute(id: group.id))` — không dispatch mutation; detail screen chỉ trigger navigation.
- **State transition**: không thay đổi `MaterialGroupDetailCubit` state — navigation push lên stack mới.
- **Widget**: `AppButton.text(title: l10n.materialGroupDetail_buttonEdit, appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: () => context.router.push(MaterialGroupEditRoute(id: group.id)))`.
- **i18n key**: `materialGroupDetail_buttonEdit` = "Sửa" — **KHÔNG "Chỉnh sửa"**; Figma PNG §VV ✓ xác nhận "Sửa" verbatim (M-22 rule overrides source FEAT AC-4 text).
- **a11y**: `Semantics(label: "Sửa nhóm ${group.name}", button: true)`.
- **Ref**: Figma node `AppButton/Sửa` (§VV ✓ "NOT 'Chỉnh sửa'"), paired mobile FEAT-CAT-GRP-EDIT.

#### AC-5 → Mobile quay về danh sách nhóm VTHH

- **Khi**: user tap leading BackButton trong `CustomAppBar` hoặc system back gesture (Android back / iOS swipe-back).
- **Mobile phải**: `context.router.pop()` — `auto_route` pop `MaterialGroupDetailRoute` khỏi stack; quay về `MaterialGroupListPage`.
- **State transition**: page dispose → `MaterialGroupDetailCubit` dispose tự động qua `BlocProvider` scope.
- **Widget**: `CustomAppBar` leading icon `Icons.arrow_back_ios_new` (Figma `chevron-back`, 24px, `AppColors.textPrimary`).
- **a11y**: `Semantics(label: l10n.materialGroupDetail_backButtonA11y, button: true)`.
- **Ref**: Figma node `CustomAppBar` leading chevron (§VV ✓).

### Cluster C — Phân quyền và phạm vi nền tảng

#### AC-6 → Mobile phân quyền: cả hai role xem; action buttons RBAC-gated

- **Khi**: user authed (garage-owner hoặc accountant) push `MaterialGroupDetailRoute`.
- **Mobile phải**: (a) Không RBAC-gate cho load/view — cả hai role đều `loadDetail` và xem full content. (b) Button "Sửa": `Visibility(visible: authContext.hasPermission(editPermissionKey))` [NEED CONFIRMATION — §4.6]. (c) Button "Xoá": `Visibility(visible: authContext.hasPermission(deletePermissionKey))` [NEED CONFIRMATION]. (d) Token expired / thiếu → BFF trả `statusCode: 401` → `MaterialGroupDetailState.error("UNAUTHORIZED")` → `context.router.replace(LoginRoute())`.
- **State transition**: 401 error → redirect; 403 error → SnackBar "Không có quyền xem".
- **Ref**: Critical Rule #4 (tenant isolation qua BFF header propagation); Critical Rule #6 (dual persona).

#### AC-7 → Mobile hiển thị đầy đủ nút Sửa + Xoá (không giới hạn view-only)

- **Khi**: `MaterialGroupDetailState.loaded(group)` active — `GroupDetailFooter` render.
- **Mobile phải**: Render 2 buttons cạnh nhau trong `GroupDetailFooter` (Row, Expanded each):
  - `AppButton/Xoá`: secondary style (`AppColors.buttonBackgroundSecondary` / `AppColors.textPrimary`); tap → delegate FEAT-CAT-GRP-DELETE confirm flow (scope ngoài DETAIL feature).
  - `AppButton/Sửa`: primary style (`AppColors.buttonBackgroundPrimary` / `AppColors.textWhite`); tap → AC-4 navigation.
- **Mobile KHÔNG view-only**: khác với web scope đã được BA confirm tại source v4 AC-7 ("mobile KHÔNG bị giới hạn view-only").
- **Widget**: `GroupDetailFooter` (build-new local, §5.2) — Figma `BottomBar/Footer` node `21254:51680`.
- **Ref**: Source AC-7 v4 (BA confirm), Figma §VV ✓ "Footer Row: [Xoá light-grey | Sửa primary-blue]".

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám Figma node `21254:51661` (§VV tất cả claims ✓) — không re-invent layout, spacing, màu.
- Design tokens (`lib/core/common/styles/` — `AppColors.*` / `AppTextStyle.*` / `AppSizes.*`):
  - Group code: `AppTextStyle.textHeadingH4` + `AppColors.textActivePrimary` (`#0052ff`).
  - Create timestamp compact: `AppTextStyle.textCaptionC7` + `AppColors.textTertiary`.
  - ACTIVE badge: `AppColors.bgBadgeSuccess` bg + `AppColors.textSuccessPrimary` (`#15aa2c`) text; label "Đang hoạt động".
  - **INACTIVE badge**: `AppColors.bgBadgeWarning` bg + `AppColors.textWarningPrimary` text; label "Đã ẩn" — **orange per GRP-LIST mobile convention** [NEED CONFIRMATION — Figma detail spec ghi `bgBadgeOpen`/`textSecondary` (grey); Pass 2 verdict required; nếu BA confirm grey thì dùng `AppColors.bgBadgeOpen`/`AppColors.textSecondary`].
  - Group name heading: `AppTextStyle.textHeadingH3` (18px w700) + `AppColors.textPrimary`.
  - `StartInfoRow` label: `AppTextStyle.textCaptionC5` (14px w400) + `AppColors.textSecondary`.
  - `StartInfoRow` value: `AppTextStyle.textBodyB5` (14px w500) + `AppColors.textPrimary`.
  - Button text: `AppTextStyle.textSubtitleS4` (16px w600); "Xoá" = `AppColors.textPrimary` on `AppColors.buttonBackgroundSecondary`; "Sửa" = `AppColors.textWhite` on `AppColors.buttonBackgroundPrimary`.
- **KHÔNG** hardcode `Color(0xFF...)` / `TextStyle(fontSize: ...)` / raw int spacing.
- Khoảng cách: `EdgeInsets.all(AppSizes.spacing16)` cho `GroupSummaryHeader` padding và `GroupDetailFieldList` padding; `Gap(AppSizes.spacing8)` giữa các StartInfoRow rows; `Gap(AppSizes.spacing16)` sau group name heading; `Gap(AppSizes.spacing8)` giữa 2 buttons trong footer.
- SectionDivider (6px strip giữa Header và DetailFieldList): `Container(height: 6, color: AppColors.borderPrimary)` hoặc tương đương từ Figma "Rectangle 5628".
- `SafeArea` bottom cho `GroupDetailFooter`.
- **Label verbatim (M-22)**: "Sửa" và "Xoá" — giữ đúng diacritic từ Figma PNG. KHÔNG paraphrase thành "Chỉnh sửa" hay "Xóa" (diacritic drift).
- **KHÔNG** có inline Edit icon cạnh tên nhóm — layer `21254:51767 Button` hidden=true trong Figma; edit chỉ qua BottomBar "Sửa".

### 4.2 State machine + error handling

- Cubit states: `initial | loading | loaded(group) | error(errorCode)` — tường minh, không ambiguous.
- `loading` → `LoadingRowShimmerWidget` full-screen skeleton (`lib/ui/widgets/loading/loading_row_shimmer_widget.dart`); KHÔNG chỉ dùng `CircularProgressIndicator` trơ.
- `error(NOT_FOUND)` → `LoadEmpty` + SnackBar; `error(UNAUTHORIZED)` → redirect login; `error(FORBIDDEN)` → SnackBar; `error(INTERNAL)` → SnackBar generic.
- KHÔNG silent fail — log error qua Sentry/equivalent.
- Màn này read-only → không áp form-validity gating rule (§4.2 template form section N/A).

### 4.3 Native interaction + permission

- Không cần xin permission hệ thống (camera, storage, location) — màn read-only display.
- Không có deeplink yêu cầu spec riêng trong scope DETAIL feature.
- "Xoá" tap → delegate FEAT-CAT-GRP-DELETE (confirm dialog / route) — không trigger native share sheet hay file picker trong DETAIL screen.

### 4.4 Offline + connectivity

- Online required cho initial load (GraphQL query cần network).
- `graphql_flutter` InMemoryCache TTL 30s (per BFF `@cacheControl(maxAge: 30, scope: PRIVATE)`) — nếu cache hit: render từ cache ngay.
- Offline + không có cache: hiển thị connectivity banner + `LoadEmpty` với hint "Kiểm tra kết nối mạng".
- Không cần offline queue — màn read-only, không mutation.
- KHÔNG dùng Hive / Isar (không cần persistent cache cho detail page).

### 4.5 i18n + a11y

- Mọi label string qua ARB key (`mobile/gf-garage-app/lib/l10n/intl_vi.arb` + `intl_en.arb`) — không hardcode tiếng Việt inline (ngoại trừ debug / comment).
- `Semantics` cho icon-only buttons (back chevron); `ExcludeSemantics` cho SectionDivider decorative.
- Tap target ≥ 48dp: AppButton height `FIXED(48px)` per Figma — đạt chuẩn.
- Contrast WCAG AA: `textActivePrimary` (#0052ff) trên `bgBase` — verify; badge tokens per color system.

### 4.6 RBAC render + feature flag

- Load/view: không RBAC-gate — cả `garage-owner` và `accountant` truy cập được.
- **"Sửa" button**: `Visibility(visible: authContext.hasPermission(editGroupPermissionKey))` — permission key constant [NEED CONFIRMATION: Architecture Authority xác nhận từ `gf-inventory` KG §permissions hoặc `FEAT-CAT-GRP-EDIT` spec; khả năng chỉ `garage-owner`].
- **"Xoá" button**: `Visibility(visible: authContext.hasPermission(deleteGroupPermissionKey))` — permission key constant [NEED CONFIRMATION: tương tự; từ `FEAT-CAT-GRP-DELETE` BE spec, suy luận garage-owner only].
- Route protected bởi `AuthGuard` (`lib/core/router/auth_guard.dart`).

### 4.7 Business rule secondary (UI hint)

- BR primary nằm BE (xem `be/FEAT-CAT-GRP-DETAIL.md §9`). Mobile chỉ secondary:
  - **BR-CAT-CMN-002** (NORMAL): 4 audit fields trong `MaterialGroupModel` — null-safe display "—"; KHÔNG crash.
  - **BR-CAT-GRP-006** (NEED CONFIRMATION — severity unknown): `parentName` resolve bởi BE/BFF; Mobile passthrough display; null → "—". Xem `be/ §4.1` trước impl.

### 4.8 Performance

- KHÔNG dùng `ListWidget` / `pull_to_refresh` / `infinite_scroll_pagination` — màn detail không có list.
- Split widgets: `GroupSummaryHeader` + `GroupDetailFieldList` + `GroupDetailFooter` tách thành widget riêng với `const` constructor khi không có state.
- `BlocBuilder` granular: wrap body chính để tránh rebuild toàn màn khi state không đổi.
- `LoadingRowShimmerWidget` auto-handle shimmer — KHÔNG manual-build shimmer bằng `Container(color: grey)`.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| `NOT_FOUND` (statusCode 404) | `LoadEmpty` + SnackBar lỗi | `MaterialGroupDetailPage` body | AC-1 |
| `UNAUTHORIZED` (statusCode 401) | Redirect login | `context.router.replace(LoginRoute())` | AC-6 |
| `FORBIDDEN` (statusCode 403) | SnackBar "Không có quyền xem" | `MaterialGroupDetailPage` | AC-6 |
| `INTERNAL` (statusCode 500) | SnackBar generic | `MaterialGroupDetailPage` | AC-1 |

---

## 5. Screen / Widget breakdown (Mobile)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`. Canonical pattern: `lib/ui/{domain}/{sub_feature}/{name}_page.dart`.

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `MaterialGroupDetailPage` | `/inventory-catalog/material-groups/:id` [NEED CONFIRMATION — verify route registry vs GRP-LIST/EDIT siblings] | NEW | `21254:51661` (§VV ✓) | AC-1..AC-7 |

**Route registration**: `lib/core/router/router.dart` → add `MaterialGroupDetailRoute` with `@RoutePage()`; `router.gr.dart` regenerate (codegen).

### 5.2 Widgets

> **⚠️ MOBILE WIDGET CATALOG**: bundle §G.X báo KG `implementation.components` MISSING. Component layer path NEED CONFIRMATION per `_decisions.md` 2026-06-29. Dev PHẢI scan `lib/components/{customs,share,ui}/` thực tế trước S6.3 để verify path trước khi import.
>
> **Anti-phantom**: `DetailRow` NOT EXISTS trong filesystem — dùng `StartInfoRow` (spawn-canonical). `EmptyStateWidget`/`EmptyDataWidget` NOT EXISTS — dùng `LoadEmpty`.

| Widget | Path | Change type | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|
| `MaterialGroupDetailPage` | `lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | NEW | StatelessWidget + `BlocProvider` | Build-new — justification: domain-specific `@RoutePage` page; page-level luôn build-new, không có page component ở customs/share/ui | AC-1..AC-7 |
| `MaterialGroupDetailCubit` | `lib/ui/inventory_catalog/material_group_detail/material_group_detail_cubit.dart` | NEW | Cubit (`@Injectable`) | Build-new — justification: feature-scoped state machine; no shared detail cubit | AC-1, AC-6 |
| `MaterialGroupDetailState` | `lib/ui/inventory_catalog/material_group_detail/material_group_detail_state.dart` | NEW | `@freezed` union | Build-new — `@freezed` union `initial\|loading\|loaded\|error` | AC-1 |
| `GroupSummaryHeader` | `lib/ui/inventory_catalog/material_group_detail/widgets/group_summary_header.dart` | NEW | StatelessWidget | Build-new — justification: domain-specific header (code+timestamp+badge layout, Figma `GroupSummaryHeader`); no fit at customs/share/ui after §G.X convention scan | AC-1, AC-2 |
| `GroupDetailFooter` | `lib/ui/inventory_catalog/material_group_detail/widgets/group_detail_footer.dart` | NEW | StatelessWidget | Build-new — justification: domain-specific 2-button RBAC-conditional footer (Figma `GroupDetailFooter`); no fit at customs/share/ui | AC-4, AC-6, AC-7 |
| `CustomScaffold` | `lib/components/customs/...` [NEED CONFIRMATION path] | REUSE | StatelessWidget | Priority 1 — customs/ (naming convention `Custom*` → customs/ layer; dev verify actual path) | AC-1 |
| `CustomAppBar` | `lib/components/customs/...` [NEED CONFIRMATION path] | REUSE | StatelessWidget | Priority 1 — customs/ (naming convention; leading `Icons.arrow_back_ios_new` per Figma chevron-back, 24px, `AppColors.textPrimary`) | AC-1, AC-5 |
| `StartInfoRow` | `lib/components/...` [NEED CONFIRMATION path] | REUSE (6×) | StatelessWidget | Priority 2 — share/ (spawn-canonical label-value row widget; substitutes phantom `DetailRow`; dev verify in `lib/components/{share,ui}/`) | AC-2, AC-3 |
| `StatusBadge` | `lib/components/...` [NEED CONFIRMATION path] | REUSE | StatelessWidget | Priority 1 or 2 (dev verify). Pill badge: ACTIVE = `bgBadgeSuccess`/`textSuccessPrimary` green; INACTIVE = `bgBadgeWarning` orange [NEED CONFIRMATION vs Figma detail `bgBadgeOpen` grey; Pass 2 verdict] | AC-2, AC-6 |
| `AppButton` | `lib/components/...` [NEED CONFIRMATION path] | REUSE (2×) | StatelessWidget | Priority 2 — share/ (naming convention `App*`; `AppButton.text(title, appButtonSize, appButtonColor, onPress)` pattern) | AC-4, AC-6, AC-7 |
| `LoadingRowShimmerWidget` | `lib/ui/widgets/loading/loading_row_shimmer_widget.dart` | REUSE | StatelessWidget | **CANONICAL** shimmer skeleton — KHÔNG manual-build; path from template §4.8 | AC-1 (loading) |
| `LoadEmpty` | `lib/ui/widgets/...` [verify path in `lib/ui/widgets/`] | REUSE | StatelessWidget | Priority 2 — share/ (canonical empty state; substitutes phantom `EmptyStateWidget`) | AC-1 (404 error) |

### 5.3 Navigation

| Route | Page | Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `/inventory-catalog/material-groups/:id` [NEED CONFIRMATION] | `MaterialGroupDetailPage` | `AuthGuard` (auto_route) | N/A — không spec deeplink cho DETAIL | AC-1, AC-5 |

### 5.4 State management (Cubit)

| Concern | Pattern | File | States | AC ref |
|---|---|---|---|---|
| Detail page state | Cubit | `lib/ui/inventory_catalog/material_group_detail/material_group_detail_cubit.dart` | `initial \| loading \| loaded(MaterialGroupModel group) \| error(String errorCode, String? message)` — `@Injectable`, extends `Cubit<MaterialGroupDetailState>` | AC-1..AC-7 |

**Key method**: `Future<void> loadDetail(int id)` — gọi trong `MaterialGroupDetailPage.initState` hoặc `AutoRouteObserver` callback.

**State union skeleton** (`@freezed`):
```dart
@freezed
class MaterialGroupDetailState with _$MaterialGroupDetailState {
  const factory MaterialGroupDetailState.initial() = _Initial;
  const factory MaterialGroupDetailState.loading() = _Loading;
  const factory MaterialGroupDetailState.loaded({required MaterialGroupModel group}) = _Loaded;
  const factory MaterialGroupDetailState.error({
    required String errorCode,
    String? message,
  }) = _Error;
}
```

---

## 6. Data integration (Mobile — consume BFF)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter | Repository class | AC ref |
|---|---|---|---|---|
| `getMaterialGroup` | query | `_graphQLService.client.query(QueryOptions(document: gql(getMaterialGroupQuery), variables: {'id': id}))` | `lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` (`InventoryCatalogRepository`, consolidated cross-domain — KHÔNG có file per-domain `material_group_repository.dart` riêng) | AC-1, AC-2, AC-3 |

**Query document** (verbatim từ `inventory_catalog_document.dart` — consume BFF `FEAT-CAT-GRP-DETAIL` bff/ §6.1):
```graphql
query GetMaterialGroup($id: ID!) {
  getMaterialGroup(id: $id) {
    ... on GetMaterialGroupResponse {
      success
      code
      message
      data {
        id
        code
        name
        description
        status
        parentId
        parentName
        createdAt
        createdBy
        createdByName
        updatedAt
        updatedBy
        updatedByName
      }
    }
    ... on ErrorResponse {
      id
      code
      serverResponse
      message
      statusCode
      path
      timestamp
      details
    }
  }
}
```

> Op phải tồn tại ở BFF `FEAT-CAT-GRP-DETAIL` bff/ §6.1 (reviewer item #17). `createdByName`/`updatedByName` nullable — BFF TENANT-USERS enrich fail-graceful → null → fallback `createdBy`/`updatedBy` raw. **Sửa 2026-07-01**: `id` scalar đúng là `ID!` (KHÔNG phải `Int!`); response union type tên đúng là `GetMaterialGroupResponse` (KHÔNG phải `MaterialGroupApiResponse` — type không tồn tại); operation name verbatim `GetMaterialGroup` (không phải `GetMaterialGroupDetail`).

### 6.2 REST endpoints consumed direct

Không có — toàn bộ data flow qua BFF GraphQL `getMaterialGroup`.

### 6.3 Offline-first strategy

| Concern | Pattern | Storage | AC ref |
|---|---|---|---|
| In-memory cache | `graphql_flutter` InMemoryCache TTL 30s (per BFF cacheControl) | RAM | AC-1 |
| Cache miss + offline | `LoadEmpty` + connectivity banner "Kiểm tra kết nối mạng" | — | AC-1 |
| Offline queue | N/A — read-only, không mutation | — | — |

### 6.4 Platform-specific behaviors

| Concern | iOS-only | Android-only | Notes |
|---|---|---|---|
| Back navigation | Swipe-back gesture (Cupertino) | System back button | auto_route handle tự động |
| Permissions | None | None | Read-only screen |
| Deeplink | N/A | N/A | Không trong scope DETAIL feature |

---

## 7. File/module impact map (Mobile)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`.

| Layer | Path glob | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/inventory_catalog/material_group_detail/` | `material_group_detail_page.dart` | NEW | Page (`@RoutePage`, StatelessWidget + `BlocProvider`) | ~150 | AC-1..AC-7 |
| `lib/ui/inventory_catalog/material_group_detail/` | `material_group_detail_cubit.dart` | NEW | Cubit (`@Injectable`) | ~60 | AC-1, AC-6 |
| `lib/ui/inventory_catalog/material_group_detail/` | `material_group_detail_state.dart` | NEW | `@freezed` union | ~30 | AC-1 |
| `lib/ui/inventory_catalog/material_group_detail/widgets/` | `group_summary_header.dart` | NEW | Domain-specific header widget | ~80 | AC-1, AC-2 |
| `lib/ui/inventory_catalog/material_group_detail/widgets/` | `group_detail_footer.dart` | NEW | Domain-specific 2-button footer | ~60 | AC-4, AC-6, AC-7 |
| `lib/core/repositories/inventory_catalog/` | `material_group_repository.dart` | ADDITIVE (`getDetail(int id)` method; may exist from GRP-LIST) | `@LazySingleton(as: MaterialGroupRepository)` | ~40 | AC-1 |
| `lib/core/models/inventory_catalog/` | `material_group_model.dart` | ADDITIVE (add `parentName`, `description`, `createdByName`, `updatedByName` fields if missing from GRP-LIST model) | `@freezed + @JsonSerializable` | ~20 | AC-2, AC-3 |
| `lib/core/router/` | `router.dart` + `router.gr.dart` (codegen) | ADDITIVE (`MaterialGroupDetailRoute` entry) | auto_route 10.1.0+1 | ~10 | AC-1, AC-5 |
| `lib/l10n/` | `intl_vi.arb` + `intl_en.arb` | ADDITIVE | flutter_localizations | ~30 (15 keys) | AC-1..AC-7 |
| `test/features/inventory_catalog/` | `material_group_detail_cubit_test.dart` | NEW | bloc_test | ~120 | AC-1, AC-6 |
| `test/features/inventory_catalog/` | `material_group_detail_page_test.dart` | NEW | flutter_test widget test | ~100 | AC-2, AC-3, AC-4, AC-7 |

---

## 8. Implementation sequence DAG (Mobile — S6)

```
(← BFF tier S5: getMaterialGroup SDL + resolver stable — FEAT-CAT-GRP-DETAIL bff/ §8)

S6  Mobile UI wire (Flutter)
    Entry: BFF S5 stable (getMaterialGroup op live) + Figma node 21254:51661 confirmed (§VV ✓)
    Exit:  Patrol E2E happy path green
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | `MaterialGroupModel` additive fields + Repository `getDetail(id)` method | `lib/core/models/` + `lib/core/repositories/` | BFF S5 stable | Unit test `getDetail` mock green (found / not-found / 401) | BFF S5 |
| S6.2 | `MaterialGroupDetailCubit` + `MaterialGroupDetailState` | `lib/ui/.../material_group_detail/` | S6.1 | Cubit unit test ≥ 5 cases green (initial / loading / loaded / notFound / serverError) | S6.1 |
| S6.3 | Local widgets: `GroupSummaryHeader` + `GroupDetailFieldList` body + `GroupDetailFooter` | `lib/ui/.../material_group_detail/widgets/` | S6.2 + component paths verified in `lib/components/` | Widget snapshot green; NEED CONFIRMATION paths resolved | S6.2 |
| S6.4 | `MaterialGroupDetailPage` assembly + router registration | `lib/ui/.../` + `lib/core/router/` | S6.3 | `router.gr.dart` regenerated; page smoke render (mock cubit loaded state) | S6.3 |
| S6.5 | ARB i18n keys (15) + `Semantics` wrappers | `lib/l10n/` + widget files | S6.4 | ARB compile green; TalkBack smoke verify | S6.4 |
| S6.6 | Cubit unit tests + widget tests | `test/features/inventory_catalog/` | S6.5 | ≥ 10 test cases green (states + RBAC + audit fields) | S6.5 |
| S6.7 | Patrol E2E happy path (list → detail → verify layout → back) | `integration_test/` | S6.6 | Patrol green | S6.6 |

---

## 9. Business Rules to enforce (Mobile — UI hint secondary)

> Mobile KHÔNG enforce business validation primary (đó là gf-inventory BE). Mobile chỉ secondary display hint.

| BR ID | Severity | UI behavior | Where | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-CMN-002` | NORMAL | 4 audit fields null-safe display; null → "—" không crash | `material_group_detail_page.dart` BlocBuilder loaded branch + `StartInfoRow` | AC-3 | BE primary enforce; Mobile display only |
| `BR-CAT-GRP-006` | NEED CONFIRMATION | Display `parentName` passthrough từ BFF; null → "—" | `group_summary_header.dart` (indirect) + StartInfoRow "Thuộc nhóm" | AC-2 | BE primary; xem `be/FEAT-CAT-GRP-DETAIL.md §9` |
| RBAC | CORNERSTONE | `Visibility` guard cho "Sửa" + "Xoá" buttons per permission key | `group_detail_footer.dart` | AC-6, AC-7 | Permission key NEED CONFIRMATION |

> **Primary BR enforcement** = BE tier (`features/be/FEAT-CAT-GRP-DETAIL.md §9`).

---

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (loading) | test-mobile-ui | `LoadingRowShimmerWidget` renders khi cubit `loading` |
| AC-1 | Widget test (error NOT_FOUND) | test-mobile-ui | `LoadEmpty` renders + SnackBar khi cubit `error(NOT_FOUND)` |
| AC-1 | Widget test (loaded) | test-mobile-ui | Full layout renders khi cubit `loaded(mockGroup)` |
| AC-2 | Widget test | test-mobile-ui | code (blue), badge, name (H3), parentName row, description row đều visible |
| AC-3 | Widget test | test-mobile-ui | 4 audit StartInfoRow visible; null `createdByName` → fallback `createdBy` |
| AC-4 | Widget test (tap Sửa) | test-mobile-ui | `MaterialGroupEditRoute.push` triggered khi tap AppButton "Sửa" (mock router) |
| AC-5 | Widget test (back) | test-mobile-ui | `context.router.pop()` triggered khi tap leading back icon |
| AC-6 | Widget test (RBAC) | test-mobile-ui + test-isolation | "Sửa"/"Xoá" `Visibility(visible: true/false)` per mock permission; 401 → redirect |
| AC-7 | Widget test | test-mobile-ui | `GroupDetailFooter` renders 2 buttons khi loaded + has permission |
| (smoke) | Mobile E2E happy path | test-mobile-e2e | Patrol: GRP-LIST → tap Xem → detail layout visible → tap back → GRP-LIST |

---

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

> File path: `mobile/gf-garage-app/lib/l10n/intl_vi.arb` + `intl_en.arb`.

| Key | vi | en | AC ref |
|---|---|---|---|
| `materialGroupDetail_title` | "Chi tiết nhóm vật tư hàng hoá" | "Material Group Detail" | AC-1 |
| `materialGroupDetail_fieldParentGroup` | "Thuộc nhóm" | "Parent Group" | AC-2 |
| `materialGroupDetail_fieldDescription` | "Mô tả" | "Description" | AC-2 |
| `materialGroupDetail_labelCreatedAtCompact` | "Ngày tạo: %s" | "Created: %s" | AC-1 (header compact) |
| `materialGroupDetail_fieldCreatedAt` | "Ngày tạo" | "Created Date" | AC-3 |
| `materialGroupDetail_fieldCreatedBy` | "Người tạo" | "Created By" | AC-3 |
| `materialGroupDetail_fieldUpdatedAt` | "Ngày sửa" | "Last Modified Date" | AC-3 |
| `materialGroupDetail_fieldUpdatedBy` | "Người sửa" | "Last Modified By" | AC-3 |
| `materialGroupDetail_statusActive` | "Đang hoạt động" | "Active" | AC-2, AC-6 |
| `materialGroupDetail_statusInactive` | "Đã ẩn" | "Inactive" | AC-2, AC-6 |
| `materialGroupDetail_buttonEdit` | "Sửa" | "Edit" | AC-4, AC-7 |
| `materialGroupDetail_buttonDelete` | "Xoá" | "Delete" | AC-7 |
| `materialGroupDetail_errorNotFound` | "Không tìm thấy nhóm vật tư hàng hoá" | "Material group not found" | AC-1 |
| `materialGroupDetail_errorGeneric` | "Có lỗi xảy ra, vui lòng thử lại" | "An error occurred, please try again" | AC-1 |
| `materialGroupDetail_backButtonA11y` | "Quay lại" | "Go back" | AC-5 |

> "Xoá" — diacritic 'oá' verbatim từ Figma PNG (M-22 verbatim label rule). KHÔNG "Xóa".
> "hoá" trong `materialGroupDetail_title` — verbatim Figma AppBar text. KHÔNG "hóa" tại display string (source FEAT dùng "hóa" nhưng Figma SSOT override tại UI string).

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 (loading) | `Semantics(label: "Đang tải...")` cho skeleton | TalkBack announce loading |
| AC-1 (AppBar back) | `Semantics(label: l10n.materialGroupDetail_backButtonA11y, button: true)` | TalkBack/VoiceOver back action |
| AC-2 (code) | `Semantics(label: "Mã nhóm: ${group.code}")` cho `Text/GroupCode` blue | Code announce |
| AC-2 (badge) | `Semantics(label: "Trạng thái: ${group.statusLabel}")` cho `StatusBadge` | Status announce |
| AC-2, AC-3 | `Semantics(label: "${label}: ${value}")` cho mỗi `StartInfoRow` | Combined label+value |
| AC-4 | `Semantics(label: "Sửa nhóm ${group.name}", button: true)` cho AppButton/Sửa | Edit action |
| AC-7 | `Semantics(label: "Xoá nhóm ${group.name}", button: true)` cho AppButton/Xoá | Delete action; "Xoá" verbatim |
| Divider | `ExcludeSemantics(child: SectionDivider(...))` | Decorative — không announce |

---

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-DETAIL.md` | DRAFT | Contract source `GET /api/v2/material-groups/{id}` — read-only reference |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-DETAIL.md` | DRAFT | GraphQL op `getMaterialGroup(id: Int!)` consumed tại §6.1 — read-only reference |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-DETAIL.md` | DRAFT | Parallel tier; cùng BFF op; KHÔNG spec Mobile impl |

**Source ID consistency** (item #18): `source_feat_sha = d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2` — identical với BE/BFF/FE-web tier files.

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-DETAIL.md`](../../../../../Product/features/FEAT-CAT-GRP-DETAIL.md) v4
- **Paired BE**: [`features/be/FEAT-CAT-GRP-DETAIL.md`](../be/FEAT-CAT-GRP-DETAIL.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-GRP-DETAIL.md`](../bff/FEAT-CAT-GRP-DETAIL.md)
- **Paired FE-web**: [`features/fe-web/FEAT-CAT-GRP-DETAIL.md`](../fe-web/FEAT-CAT-GRP-DETAIL.md)
- **Figma Mobile**: [`Product/ux/figma-mobile/wave03-cat-grp-detail.md`](../../../../../Product/ux/figma-mobile/wave03-cat-grp-detail.md) (node `21555:24248`, screen `21254:51661`)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1
- **PKG**: [`Execution/work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.4
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **Wave decisions**: [`_decisions.md`](../../../_decisions.md)
- **BR ref**: `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` (BR-CAT-CMN-002, BR-CAT-GRP-006)
- **ADR-017**: Catalog-v2 additive aggregates (MaterialGroup entity)
- **ADR-009**: JPA no relationship mapping — scalar FK `parent_id`; `parentName` resolved by BE service layer

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 2 | Delivery Authority (in-session full GraphQL re-audit — user request "check lại hết phần graphql của wave 3") | **Fix §6.1 3 drift vs code ground-truth** (`inventory_catalog_document.dart`): `id: Int!` → `id: ID!`; response union type `MaterialGroupApiResponse` → `GetMaterialGroupResponse` (type cũ không tồn tại); operation name `GetMaterialGroupDetail` → `GetMaterialGroup` verbatim. Đồng thời fix repository path (`material_group_repository.dart` → `inventory_catalog_repository.dart`, class `InventoryCatalogRepository` consolidated, khớp BUG-W03-013 đã ratify). |
| 2026-06-30 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-CAT-GRP-DETAIL` W03. Policy v2 tier-authoritative: §0 audit slim; §1 mục đích nghiệp vụ (byte-equal BE/BFF tier); §2 trách nhiệm Mobile (CustomScaffold + Cubit + 2-button footer); §3 Mobile behaviour map 7 AC-IDs (Cluster A display AC-1/2/3, Cluster B navigation AC-4/5, Cluster C RBAC+platform AC-6/7); §4 visual fidelity (Figma node 21254:51661 §VV ✓, design tokens, M-22 "Sửa"/"Xoá" verbatim) + state machine + RBAC + BR secondary + a11y + error mapping; §5-§11 Mobile-specific (Page/Cubit/widgets/repo/router/i18n/ARB 15 keys/a11y). NEED CONFIRMATION (5 items): component layer paths (§G.X KG missing), RBAC permission keys (Sửa/Xoá), INACTIVE badge color (orange GRP-LIST convention vs Figma detail `bgBadgeOpen` grey — Pass 2 verdict), route path registry, `LoadEmpty` exact path. |
