---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/features/FEAT-CAT-GRP-EDIT.md"
source_version: 4
source_feat_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-EDIT"
source_feat_sha: "87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436"
generated_at: "2026-06-30T00:00:00Z"
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
consumes_backend_feats: ["FEAT-CAT-GRP-EDIT"]
consumes_bff_feats: ["FEAT-CAT-GRP-EDIT"]
screens_touched:
  - "lib/ui/inventory_catalog/material_group_edit/material_group_edit_page.dart"
flutter_packages:
  - "flutter_bloc"
  - "freezed"
  - "get_it"
  - "injectable"
  - "auto_route"
  - "graphql_flutter"
  - "gap"
figma_refs:
  - "Product/ux/figma-mobile/wave03-cat-grp-edit.md (node 21555:24249 — Chỉnh sửa Nhóm vật tư hàng hoá, 1 screen / frame 21254:51963)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "a72a1e067d6d58ef210d7e8bf5645599229d79701391f56be8f8e84c02557176"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-EDIT.mobile.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-GRP-EDIT (Mobile): Chỉnh sửa nhóm vật tư hàng hóa

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (`Product/ux/figma-mobile/wave03-cat-grp-edit.md` node 21555:24249). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-EDIT` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `lib/ui/inventory_catalog/material_group_edit/material_group_edit_page.dart` |
| Flutter packages | flutter_bloc, freezed, get_it, injectable, auto_route, graphql_flutter, gap |
| Cross-tier consume | BE: FEAT-CAT-GRP-EDIT \| BFF: FEAT-CAT-GRP-EDIT |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-EDIT.md`](../../../../../Product/features/FEAT-CAT-GRP-EDIT.md) |
| Source version | v4 |
| Source SHA | `87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436` |
| Generated at | 2026-06-30T00:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần cập nhật thông tin nhóm vật tư hàng hóa theo nhu cầu vận hành thực tế — đổi tên, chỉnh mô tả, thay đổi nhóm cha hoặc điều chỉnh trạng thái hoạt động. Tính năng này đảm bảo cây phân cấp nhóm vật tư luôn phản ánh đúng cấu trúc tổ chức hàng hóa của garage, phục vụ các nghiệp vụ kho V2 như nhập/xuất tồn và tính giá. FEAT-CAT-GRP-EDIT nằm trong luồng quản lý danh mục sau bước tạo mới (FEAT-CAT-GRP-CREATE) và trước khi xóa (FEAT-CAT-GRP-DELETE).

## 2. Trách nhiệm Mobile (garage-mobile)

- Render màn hình `MaterialGroupEditPage` (`lib/ui/inventory_catalog/material_group_edit/`) — entry point từ danh sách (icon "Chỉnh sửa") hoặc màn chi tiết (nút "Chỉnh sửa"); phone layout 375×812 (Figma frame 21254:51963).
- Tải dữ liệu hiện tại via query `getMaterialGroup(id)` trước khi render form; populate 5 trường pre-filled: Mã nhóm VTHH (disabled), Tên nhóm VTHH (editable required), Thuộc nhóm (dropdown ACTIVE-only, exclude self/descendants), Trạng thái (dropdown ACTIVE/INACTIVE), Mô tả (multiline).
- Quản lý state qua `MaterialGroupEditCubit` (Bloc/Cubit): `initial` → `loading` → `loaded` → `submitting` → `success | error`; form-validity computed property `isFormValid` gate submit button.
- Submit `updateMaterialGroup(id, input)` mutation khi user tap "Lưu"; optimistic update: navigate back + trigger danh sách refresh on success; rollback (giữ form + hiển thị error) on failure.
- Propagate RBAC: theo source AC-9 cả `garage-owner` và `accountant` truy cập được — [NEED CONFIRMATION: conflict với BFF §3 AC-9 chỉ cho garage-owner; xem §4.6].
- Online required: không có offline-first; hiển thị connectivity banner + disable "Lưu" khi mất mạng; widget `AppTextField(maxLength: 255)` với counter — NEED CONFIRMATION DIV-05 (Figma counter "0/250" vs PKG ≤255, defer CR-20260630-01 P1.4).

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: tất cả 9 source AC-IDs (AC-1..AC-9) phải xuất hiện ở §3 hoặc §4. Không copy text AC từ source — viết theo góc nhìn Mobile.

### Cluster A — Mở form và tải dữ liệu hiện tại

#### AC-1 → Tải dữ liệu hiện tại để pre-fill form

- **Khi**: user tap icon "Chỉnh sửa" (từ danh sách) hoặc nút "Chỉnh sửa" (từ chi tiết); auto_route navigate sang `MaterialGroupEditPage` với arg `groupId`.
- **Mobile phải**: cubit dispatch `LoadGroup(id: groupId)` → gọi query `getMaterialGroup(id)` (BFF op từ FEAT-CAT-GRP-DETAIL) → populate tất cả form fields với dữ liệu nhận được (code, name, parentId/parentName, status, description).
- **State transition**: `initial` → `loading` (skeleton shimmer hoặc CircularProgressIndicator) → `loaded` (form hiển thị pre-filled).
- **Widget**: `MaterialGroupEditPage` + `MaterialGroupEditCubit`; `CustomAppBar` title "Chỉnh sửa Nhóm vật tư hàng hoá" (verbatim per Figma PNG, dấu 'hoá' preserved — M-22).
- **GraphQL op**: query `getMaterialGroup(id: Int!)` (FEAT-CAT-GRP-DETAIL BFF §6.1 — reuse, không cần op mới).
- **i18n key**: `material_group_edit_page_title`
- **a11y**: `Semantics(label: "Màn hình chỉnh sửa nhóm vật tư")` trên Scaffold.
- **Ref**: Figma node 21254:51963 `EditGroupAppBar`; `_png_verified`: "AppBar title 'Chỉnh sửa Nhóm vật tư hàng hoá' confirmed".

#### AC-2 → Mã nhóm hiển thị pre-filled và không cho chỉnh sửa

- **Khi**: form đã loaded (AC-1 success).
- **Mobile phải**: render `AppTextField` với `enabled: false`, controller pre-filled với `group.code`; vẫn hiển thị required asterisk đỏ (`AppColors.textErrorPrimary`, `#ed1f42`) bên phải label "Mã nhóm VTHH" dù field disabled (per §4.1 FORM rule — intrinsic required vẫn có asterisk); KHÔNG show helper text "Không được sửa mã nhóm" trên mobile (không có trong Figma frame 21254:51963 — Figma SSOT override).
- **State transition**: field luôn ở `disabled` state; cubit không cập nhật `codeValue` từ user input.
- **Widget**: `AppTextField(label: "Mã nhóm VTHH", required: true, enabled: false, controller: _groupCodeController)`
- **i18n key**: `material_group_code_label`
- **Ref**: BR-CAT-GRP-004 secondary (primary tại BE); Figma `GroupCodeField` node 21254:51963 — "Mã nhóm VTHH *" red asterisk + pre-filled "MN1202012".

### Cluster B — Trường chỉnh sửa form

#### AC-3 → Tên nhóm editable, required, validate trước submit

- **Khi**: user nhập hoặc xóa text trong field "Tên nhóm VTHH".
- **Mobile phải**: cubit update `nameValue` → recompute `isFormValid` (false khi `name` blank) → `AppButton` "Lưu" disabled khi `!isFormValid`; KHÔNG hiển thị inline error ngay khi nhập (chỉ khi server trả 400).
- **State transition**: mỗi `onChanged` trigger cubit `NameChanged(value)` event → state rebuild `isFormValid`.
- **Widget**: `AppTextField(label: "Tên nhóm VTHH", required: true, controller: _nameController, onChanged: cubit.onNameChanged)`
- **i18n key**: `material_group_name_label`, `material_group_name_required_error`
- **a11y**: `Semantics(label: "Tên nhóm vật tư hàng hoá, bắt buộc")` trên input.
- **Ref**: Figma `GroupNameField` — "Tên nhóm VTHH *" pre-filled "Công ty CP Thanh toán Dịch Vụ Hưng Hà".

#### AC-4 → Dropdown Thuộc nhóm — chỉ nhóm ACTIVE, loại bỏ self + descendants

- **Khi**: user tap field "Thuộc nhóm" để chọn nhóm cha mới.
- **Mobile phải**: mở picker/bottom sheet populate từ query `searchMaterialGroups(filter: {status: ACTIVE, tenantId})` (NEED CONFIRMATION: op name — verify BFF FEAT-CAT-GRP-LIST SDL sau khi spec ACTIVE); client-side loại bỏ `currentGroupId` và mọi node trong `descendants`; nếu server trả `ERR-INV-003` (BE detect cycle) → SnackBar "Nhóm cha không hợp lệ: tạo thành vòng tròn trong cây phân cấp" (`AppColors.textErrorPrimary`).
- **State transition**: cubit field `parentGroupValue` update; `isFormValid` không phụ thuộc (parentId nullable).
- **Widget**: `DropdownTextField(label: "Thuộc nhóm")` — KHÔNG dùng `AppDropdown` (NOT EXISTS per template §5.2 phantom guard); `DropdownTextField` là substitute hợp lệ; NEED CONFIRMATION path.
- **GraphQL op**: `searchMaterialGroups(...)` (NEED CONFIRMATION: verify BFF FEAT-CAT-GRP-LIST §6.1 op name trước S6).
- **i18n key**: `material_group_parent_label`, `material_group_edit_err_cycle`
- **Ref**: BR-CAT-GRP-008 secondary (dropdown ẩn INACTIVE per source AC-4); BR-CAT-GRP-009 secondary (mobile UI hint; primary tại BE); Figma `ParentGroupField` — "Thuộc nhóm" no asterisk, chevron-down, pre-selected "Vật tư hàng hoá".

#### AC-5 → Dropdown Trạng thái — ACTIVE / INACTIVE toggle

- **Khi**: user tap field "Trạng thái" và chọn option mới.
- **Mobile phải**: cubit update `statusValue`; trạng thái mới được forward trong `UpdateMaterialGroupInput.status`; cascade INACTIVE xuống cây con do BE thực hiện trong 1 transaction — Mobile không cần biết cascade logic, chỉ nhận response thành công.
- **State transition**: cubit `StatusChanged(status)` → `isFormValid` không thay đổi (status always has value).
- **Widget**: `DropdownTextField(label: "Trạng thái")` với 2 options: "Đang hoạt động" → `ACTIVE`; "Ngừng hoạt động" → `INACTIVE`. KHÔNG `AppDropdown` (NOT EXISTS).
- **i18n key**: `material_group_status_label`, `material_group_status_active`, `material_group_status_inactive`
- **Ref**: Figma `StatusField` — "Trạng thái" no asterisk, pre-selected "Đang hoạt động".

#### AC-6 → Mô tả multiline với ký tự counter

- **Khi**: user nhập mô tả vào field "Mô tả".
- **Mobile phải**: render `AppTextField(maxLines: 4, maxLength: 255)` với counter "X/255" bên dưới field; NEED CONFIRMATION DIV-05 — Figma hiển thị "0/250" nhưng PKG ERR-INV-016 enforce ≤255; spec dùng 255 (PKG canonical), defer CR-20260630-01 P1.4. Nếu server trả `ERR-INV-016` → inline error "Mô tả không được vượt quá 255 ký tự" bên dưới field (không SnackBar).
- **Widget**: `AppTextField(label: "Mô tả", maxLines: 4, maxLength: 255, controller: _descriptionController)` — KHÔNG `AppTextarea` (NOT EXISTS; substitute là `AppTextField(maxLines)` per template §5.2).
- **i18n key**: `material_group_description_label`, `material_group_description_max_error`
- **Ref**: BR-CAT-GRP-012 secondary; Figma `DescriptionField` — "Mô tả" no asterisk, counter "0/250" (Figma display — NEED CONFIRMATION align với 255).

### Cluster C — Lưu và Huỷ

#### AC-7 → Submit mutation Lưu — optimistic update + navigate back

- **Khi**: user tap "Lưu" (form valid: `isFormValid = true`, not loading, not offline).
- **Mobile phải**: cubit dispatch `SubmitEdit` → state = `submitting` → `AppButton` "Lưu" shows `CircularProgressIndicator` inline, form non-interactive → gọi mutation `updateMaterialGroup(id: groupId, input: {name, description, parentId, status})` → **success**: navigate back via `context.router.pop(true)` (trả `true` để caller refresh danh sách); **error**: rollback về state `loaded`, giữ form open, hiển thị SnackBar theo error code (xem §4.9). Không cần Sentry log nếu là validation error; log 5xx.
- **State transition**: `loaded` → `submitting` → `success` (pop) | `error` (rollback).
- **Widget**: `AppButton.text(title: "Lưu", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: cubit.isFormValid && !state.isSubmitting ? cubit.submitEdit : null)` — wire qua `BlocBuilder`.
- **GraphQL op**: `updateMaterialGroup(id: Int!, input: UpdateMaterialGroupInput!)` (BFF §6.1 mutation).
- **i18n key**: `material_group_edit_save_button`, `material_group_edit_save_success`
- **a11y**: `Semantics(label: "Lưu thay đổi nhóm vật tư hàng hoá")`
- **Ref**: Figma `AppButton/Lưu` — BG `AppColors.buttonBackgroundPrimary`, text `AppColors.textWhite`.

#### AC-8 → Huỷ — pop navigation không lưu

- **Khi**: user tap "Huỷ".
- **Mobile phải**: `context.router.pop()` (hoặc `Navigator.pop(context)`) — không gọi BFF, không persist bất kỳ thay đổi. Không cần dirty-check dialog (Figma SSOT không có confirm dialog — follow Figma per SSOT rule).
- **State transition**: không thay đổi cubit state; route pop.
- **Widget**: `AppButton.text(title: "Huỷ", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: () => context.router.pop())`
- **i18n key**: `material_group_edit_cancel_button`
- **Ref**: Figma `AppButton/Huỷ` — BG `AppColors.buttonBackgroundSecondary`, text "Huỷ" (diacritic preserved per `_png_verified`).

### Cluster D — Phân quyền

#### AC-9 → RBAC — hiển thị form và handle 403

- **Khi**: bất kỳ user đã authenticate navigate tới `MaterialGroupEditPage`.
- **Mobile phải**: hiển thị form cho cả `garage-owner` và `accountant` theo source AC-9. NEED CONFIRMATION: BFF spec §3 AC-9 chỉ cho phép `garage-owner`; nếu BA confirm restrict → thêm `PermissionGuard` tại route và ẩn entry point "Chỉnh sửa" khi `!canEdit`. Hiện tại: nếu mutation trả 403 → SnackBar "Bạn không có quyền chỉnh sửa nhóm vật tư" + không navigate.
- **State transition**: `error` state với code 403 → SnackBar + rollback.
- **Widget**: route hiện tại dùng `AuthGuard` (JWT authenticated), không dùng `PermissionGuard` role restriction cho đến khi NEED CONFIRMATION được giải.
- **i18n key**: `material_group_edit_err_forbidden`
- **Ref**: Critical Rule #6 (dual persona only); paired BE §4.2; paired BFF §3 AC-9 (conflict — NEED CONFIRMATION).

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám Figma node 21254:51963 (`wave03-cat-grp-edit.md`) làm visual ground-truth. Layout IDENTICAL với FEAT-CAT-GRP-CREATE (Figma note: "khác biệt duy nhất: AppBar title + pre-filled inputs").
- Design tokens: `AppColors.*`, `AppTextStyle.*`, `AppSizes.spacing*`, `AppShadow.*` từ `lib/core/common/styles/{app_colors,app_text_styles,app_sizes,app_shadows}.dart`. **KHÔNG** hardcode `Color(0xFF...)`, `TextStyle(...)`, raw `int` spacing.
- AppBar: `CustomAppBar(title: "Chỉnh sửa Nhóm vật tư hàng hoá", leading: BackButton())` — 96px height, BG `AppColors.bgBase`, title `AppTextStyle.textHeadingH3`, color `AppColors.textPrimary`. Dấu 'hoá' verbatim per PNG M-22.
- Required asterisk `*` màu `AppColors.textErrorPrimary` (#ed1f42) BÊN PHẢI label cho: "Mã nhóm VTHH *" (disabled nhưng intrinsic required) + "Tên nhóm VTHH *". Optional: "Thuộc nhóm", "Trạng thái", "Mô tả" — không có asterisk.
- Section header "Thông tin chung": `AppTextStyle.textHeadingH3`, `AppColors.textPrimary`, padding `EdgeInsets.symmetric(vertical: AppSizes.spacing16)`. KHÔNG có Switch/Toggle bên phải (Figma §VV confirmed — M-24 anti-invent).
- Footer BottomBar: 104px height, BG `AppColors.bgBase`, border-top 1px `AppColors.borderPrimary`, padding `EdgeInsets.symmetric(horizontal: AppSizes.spacing16, vertical: AppSizes.spacing16)` + `SafeArea` bottom.
- Field spacing: `Gap(AppSizes.spacing16)` giữa các field trong FieldGroup Column.

### 4.2 State machine + error handling

- Cubit state tường minh: `initial | loading | loaded | submitting | success | error`.
- **Form-validity gating** (MANDATORY — mirror EDIT v10 pattern):
  - `isFormValid` computed property: `name.isNotEmpty` (single required validation).
  - "Lưu" button disabled khi `!isFormValid` (opacity 0.5, `onPress: null`) TRƯỚC user tap.
  - Loading/submitting: `CircularProgressIndicator` inline thay text "Lưu".
  - Offline: disable Lưu + show connectivity banner.
  - Wire: `AppButton.text(..., onPress: isFormValid && !isSubmitting ? cubit.submitEdit : null)` qua `BlocBuilder`.
- Error → display theo §4.9 error code mapping; KHÔNG silent fail.
- Log 5xx errors qua `AppLogger` / Sentry equivalent.

### 4.3 Native interaction + permission

- Không cần permission native (camera, storage, location) cho feature này.
- Không cần deeplink scheme riêng cho edit page (navigate trong-app via auto_route).
- iOS/Android: không có behavior divergence cho form edit.

### 4.4 Offline + connectivity

- Online required: form edit không có offline-first strategy.
- Khi offline: hiển thị connectivity banner (reuse existing `ConnectivityBanner` widget nếu tồn tại; NEED CONFIRMATION path) + disable "Lưu" button.
- Không cache mutation offline queue.
- Retry: user manual re-tap "Lưu" khi reconnect.

### 4.5 i18n + a11y

- Mọi label string qua ARB key (`lib/l10n/intl_vi.arb` + `intl_en.arb`); KHÔNG hardcode tiếng Việt inline trong Dart code (ngoại lệ: Figma verbatim string trong test assertion).
- a11y: `Semantics` cho icon-only back button; `excludeSemantics` cho decorative icons (chevron-down trong dropdown).
- Tap target ≥ 48dp cho tất cả interactive elements; contrast ratio WCAG AA.
- Screen reader: `Semantics(liveRegion: true)` cho inline error messages (ERR-INV-016 dưới field mô tả).

### 4.6 RBAC render + feature flag

- Không có feature flag gate riêng cho FEAT-CAT-GRP-EDIT mobile (feature visible theo default inventory catalog access).
- Route guard: `AuthGuard` (JWT authenticated) — chưa có `PermissionGuard` role restriction (NEED CONFIRMATION: xem AC-9 conflict).
- Entry point "Chỉnh sửa" (icon tại list row + nút tại detail page) PHẢI visible cho cả `garage-owner` và `accountant` per source AC-9. Nếu BFF confirm garage-owner only → conditional render via `authContext.role == 'garage-owner'`.

### 4.7 Business rule secondary (UI hint)

- **BR-CAT-GRP-004** secondary: Mobile enforce disabled state trên "Mã nhóm VTHH" field — không cho user input. Primary enforcement tại BE (ignore/reject code field trong PUT).
- **BR-CAT-GRP-007** secondary: Cascade INACTIVE toàn bộ cây con do BE thực hiện — Mobile không cần logic cascade; chỉ hiển thị status mới từ response.
- **BR-CAT-GRP-008** secondary: Dropdown "Thuộc nhóm" chỉ liệt kê nhóm ACTIVE — filter client-side hoặc BFF; NEED CONFIRMATION exact filter param.
- **BR-CAT-GRP-009** secondary: Nếu ERR-INV-003 từ BE → SnackBar error (primary tại BE).
- **BR-CAT-GRP-012** secondary: `maxLength: 255` counter hint (NEED CONFIRMATION DIV-05: 250 vs 255, defer CR-20260630-01 P1.4); inline error nếu ERR-INV-016 từ server.

### 4.8 Performance

- Không dùng `ListWidget` canonical (feature này là form edit, không có list).
- Avoid rebuild toàn page: dùng `BlocBuilder` granular cho từng field nếu cần; `const` constructor cho static widgets.
- `getMaterialGroup(id)` query: graphql_flutter cache policy `NetworkOnly` (cần fresh data khi mở form edit).
- `searchMaterialGroups` cho parent picker: có thể cache ngắn (30s) theo pattern BFF `getMaterialGroupTree`.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| `ERR-INV-003` | SnackBar | `notify/app_snack_bar` hoặc equivalent | AC-4 |
| `ERR-INV-016` | Inline (bên dưới field "Mô tả") | `AppTextField` errorText | AC-6 |
| HTTP 400 (name blank) | Inline (bên dưới field "Tên nhóm VTHH") | `AppTextField` errorText | AC-3 |
| HTTP 403 | SnackBar | `notify/app_snack_bar` | AC-9 |
| HTTP 404 | SnackBar | `notify/app_snack_bar` | AC-1 |
| HTTP 500 | SnackBar + log | `notify/app_snack_bar` | AC-7 |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> PATH CANONICAL: `lib/ui/{domain}/{sub_feature}/{sub_feature}_page.dart` (flat 3-level). Verify exemplar tại `mobile/gf-garage-app/lib/ui/inventory/inventory_list/`.

> **Bundle §G.X missing** — KG `implementation.components` stub. Author áp naming-convention inference: `Custom*` → Priority 1 customs/, `App*` → Priority 3 ui/ (per `_decisions.md` FEAT-CAT-GRP-EDIT mobile entry). DEV PHẢI scan `lib/components/{customs,share,ui}/` filesystem trước impl và verify path thực tế.

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Modifies / New | Figma node-id | AC ref |
|---|---|---|---|---|
| `MaterialGroupEditPage` | `/inventory-catalog/material-group-edit/:id` | NEW | `21254:51963` | AC-1..AC-9 |

### 5.2 Widgets

> **⚠️ PHANTOM WIDGET GUARD**: KHÔNG declare `AppDropdown` / `AppTextarea` / `AppBottomSheet` như Flutter class — NOT EXISTS. Substitutes: `DropdownTextField` (cho dropdown/picker), `AppTextField(maxLines: N)` (cho textarea), `showModalBottomSheet` (cho bottom sheet).

| Widget | Path | Change type | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|
| `CustomScaffold` | `lib/components/customs/scaffold/custom_scaffold.dart` (NEED CONFIRMATION — DEV scan) | REUSE | StatelessWidget | Priority 1 — customs/ (naming-convention inference: `Custom*` → customs/; confirm actual path) | AC-1..AC-9 |
| `CustomAppBar` | `lib/components/customs/app_bar/custom_app_bar.dart` (NEED CONFIRMATION — DEV scan) | REUSE | StatelessWidget | Priority 1 — customs/ (naming-convention inference; Figma flutter snippet `CustomAppBar(title:...)` confirmed) | AC-1 |
| `AppTextField` | `lib/components/ui/text_field/app_text_field.dart` (NEED CONFIRMATION — DEV scan) | REUSE | StatelessWidget | Priority 3 — ui/ (naming-convention inference: `App*` → ui/ per decision; renders required asterisk `AppColors.textErrorPrimary` khi `required: true`; `enabled: false` for code field) | AC-2, AC-3, AC-6 |
| `DropdownTextField` | `lib/components/ui/text_field/dropdown_text_field.dart` (NEED CONFIRMATION — DEV scan) | REUSE | StatelessWidget | Priority 3 — ui/ (substitute cho `AppDropdown` NOT EXISTS; dùng cho "Thuộc nhóm" + "Trạng thái" per template §5.2 phantom guard) | AC-4, AC-5 |
| `AppButton` | `lib/components/ui/button/app_button.dart` (NEED CONFIRMATION — DEV scan) | REUSE | StatelessWidget | Priority 3 — ui/ (naming-convention inference; `.text(...)` constructor confirmed by Figma flutter snippet) | AC-7, AC-8 |
| `MaterialGroupEditPage` | `lib/ui/inventory_catalog/material_group_edit/material_group_edit_page.dart` | NEW | StatelessWidget | Build-new — justification: page composition domain-specific (form pre-fill + edit-mode flag + submit logic); no fit at customs/share/ui after §G.X scan (KG stub) | AC-1..AC-9 |
| `MaterialGroupEditForm` | `lib/ui/inventory_catalog/material_group_edit/widgets/material_group_edit_form.dart` | NEW | StatelessWidget | Build-new — justification: form field layout (5 fields + section header) identical to CREATE pattern; share widget nếu FEAT-CAT-GRP-CREATE mobile tạo `MaterialGroupFormWidget`; NEED CONFIRMATION CREATE spec path khi ACTIVE | AC-1..AC-7 |

### 5.3 Navigation

| Route | Page | Loader / Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `/inventory-catalog/material-group-edit/:id` | `MaterialGroupEditPage` | `AuthGuard` (JWT authenticated) | N/A (trong-app navigation only) | AC-1..AC-9 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events / States | AC ref |
|---|---|---|---|---|
| Page + form state | Cubit | `lib/ui/inventory_catalog/material_group_edit/material_group_edit_cubit.dart` | `LoadGroup(id)`, `NameChanged(value)`, `ParentChanged(id)`, `StatusChanged(status)`, `DescriptionChanged(value)`, `SubmitEdit` / states: `MaterialGroupEditInitial | Loading | Loaded | Submitting | Success | Error` | AC-1..AC-9 |
| Cubit state (freezed) | @freezed union | `lib/ui/inventory_catalog/material_group_edit/material_group_edit_state.dart` | `isFormValid: bool` computed; `nameValue`, `parentGroupId`, `status`, `descriptionValue`, `errorCode` | AC-3, AC-7 |
| DI | @Injectable | cubit file | `@Injectable()` trên `MaterialGroupEditCubit`; inject `MaterialGroupRepository` | AC-1, AC-7 |

---

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter pattern | Repository class | AC ref |
|---|---|---|---|---|
| `getMaterialGroup(id: ID!)` | query | `_graphQLService.client.query(QueryOptions(document: gql(getMaterialGroupQuery), variables: {'id': id}, fetchPolicy: FetchPolicy.networkOnly))` | `lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` (`InventoryCatalogRepository`, consolidated cross-domain) | AC-1 |
| `searchMaterialGroups` | query | `_graphQLService.client.query(QueryOptions(document: gql(searchMaterialGroupsQuery), variables: {'input': {'status': 'ACTIVE', 'page': 0, 'size': 100}}))` | `lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` | AC-4 |
| `updateMaterialGroup(input: UpdateMaterialGroupInput!)` | mutation | `_graphQLService.client.mutate(MutationOptions(document: gql(updateMaterialGroupMutation), variables: {'input': request.toJson()}))` — **CHỈ 1 variable `input`**, `id` nằm lồng bên trong `input` object (KHÔNG có variable `id` riêng biệt ở top-level) | `lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` | AC-7 |

> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #17). `updateMaterialGroup` đã confirmed tại BFF FEAT-CAT-GRP-EDIT §6.1. `getMaterialGroup` từ BFF FEAT-CAT-GRP-DETAIL (reuse). `searchMaterialGroups` — **RESOLVED** (2026-07-01, trước đây NEED CONFIRMATION): op name = `searchMaterialGroups` (Q1) verbatim per CR-1782381477 (2026-06-25), cùng pattern FEAT-CAT-GRP-LIST mobile §6.1. **Repository consolidation**: mobile code KHÔNG có file per-domain riêng (`material_group_repository.dart`) — mọi op (Group + Product) đi qua 1 file duy nhất `inventory_catalog_repository.dart` (`abstract class InventoryCatalogRepository` + `InventoryCatalogRepositoryImpl`), cùng pattern consolidation đã ratify ở BUG-W03-013 (page-folder collapse).

### 6.2 REST endpoints consumed direct

N/A — tất cả data access qua BFF GraphQL.

### 6.3 Offline-first strategy

- Online required — không có offline queue.
- `getMaterialGroup` query dùng `FetchPolicy.networkOnly` để đảm bảo fresh pre-fill data.
- Không persist form data xuống local storage.

### 6.4 Platform-specific behaviors

| Concern | iOS-only | Android-only | Notes |
|---|---|---|---|
| Keyboard | `TextInputAction.next` giữa fields | same | form navigation |
| Back gesture | swipe-left (NavigationGesture) | back button hardware | auto_route handles cả 2 |

---

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`. Cross-boundary chỉ qua BFF GraphQL.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/inventory_catalog/material_group_edit/` | `material_group_edit_page.dart` | NEW | Page (`@RoutePage()`, StatelessWidget) | ~130 | AC-1..AC-9 |
| `lib/ui/inventory_catalog/material_group_edit/widgets/` | `material_group_edit_form.dart` | NEW | Local widget (StatelessWidget, form field layout) | ~120 | AC-1..AC-7 |
| `lib/ui/inventory_catalog/material_group_edit/` | `material_group_edit_cubit.dart` | NEW | Cubit (`BaseCubit<MaterialGroupEditState>`, `@Injectable()`) | ~120 | AC-1..AC-9 |
| `lib/ui/inventory_catalog/material_group_edit/` | `material_group_edit_state.dart` | NEW | `@freezed` union state (`isFormValid` computed, `nameValue`, etc.) | ~80 | AC-3, AC-7 |
| `lib/core/repositories/inventory/` | `material_group_repository.dart` | MODIFY (additive: thêm `getMaterialGroup`, `searchMaterialGroups`, `updateMaterialGroup` methods) | `@LazySingleton(as: MaterialGroupRepository)`, inject `GraphQLService` | ~60 | AC-1, AC-4, AC-7 |
| `lib/core/models/inventory/` | `material_group_model.dart` | MODIFY hoặc NEW (nếu chưa tồn tại từ FEAT-CAT-GRP-LIST/DETAIL) | `@freezed` + `@JsonSerializable`, include `code, name, parentId, parentName, status, description` | ~50 | AC-1 |
| `lib/core/models/request/inventory/` | `update_material_group_input.dart` | NEW | `@freezed` request model — fields: `name, description, parentId, status`; `code` KHÔNG có (BR-CAT-GRP-004) | ~40 | AC-7 |
| `lib/core/router/` | `router.dart` (+ `router.gr.dart` codegen) | MODIFY (thêm `MaterialGroupEditRoute`) | auto_route 10.1.0+1 | ~10 | AC-1 |
| `lib/l10n/` | `intl_vi.arb` + `intl_en.arb` | ADDITIVE | flutter_localizations | ~20 keys | AC-1..AC-9 |
| `test/features/inventory_catalog/` | `material_group_edit_test.dart` | NEW | bloc_test + widget test | ~180 | AC-1..AC-9 |
| `integration_test/` | `material_group_edit_e2e_test.dart` | NEW | patrol / integration_test (smoke) | ~80 | happy path |

---

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 entry: BFF S5 SDL stable (`updateMaterialGroup` mutation live + `getMaterialGroup` query confirmed).

```
(← BFF tier S5: updateMaterialGroup mutation + getMaterialGroup query stable)

S6  Mobile UI wire (Flutter)
    Entry: BFF S5 SDL stable + Figma wave03-cat-grp-edit.md confirmed ACTIVE
           + parent group query op name confirmed (NEED CONFIRMATION resolved)
    Exit: Patrol E2E happy path green (submit edit + navigate back)
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Models + repository methods | `lib/core/models/` + `lib/core/repositories/` | BFF SDL stable | Unit test repository methods pass | BFF S5 |
| S6.2 | Cubit + state (freezed codegen) | `lib/ui/inventory_catalog/material_group_edit/` | S6.1 | Cubit unit test: load/submit/error states green | S6.1 |
| S6.3 | Page + form widget + router | `material_group_edit_page.dart` + `widgets/` + `router.dart` | S6.2 + Figma confirmed | Widget test: render pre-filled, submit button gate, cancel pop | S6.2 |
| S6.4 | i18n + a11y keys | `lib/l10n/*.arb` | S6.3 | ARB compile green, no missing keys | S6.3 |
| S6.5 | E2E smoke test | `integration_test/` | S6.4 + BFF live | Patrol happy path: open edit → change name → save → navigate back | S6.4, BFF S5 |

---

## 9. Business Rules to enforce (Mobile — UI hint + secondary)

> Primary BR enforcement ở BE tier (xem `features/be/FEAT-CAT-GRP-EDIT.md §9`). Mobile chỉ UI hint.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-004` | CORNERSTONE | Field "Mã nhóm VTHH" `enabled: false` — không nhận input | `widgets/material_group_edit_form.dart` | AC-2 | Primary tại BE; field disabled KHÔNG skip asterisk |
| `BR-CAT-GRP-007` | CORNERSTONE | Không cần cascade logic tại Mobile — nhận status mới từ response, re-render | `material_group_edit_cubit.dart` | AC-5 | Primary tại BE (1 @Transactional) |
| `BR-CAT-GRP-008` | NORMAL (NEED CONFIRMATION) | Dropdown "Thuộc nhóm" filter `status: ACTIVE` | `material_group_edit_cubit.dart::loadParentGroups()` | AC-4 | Primary tại BE; client-side pre-filter UX |
| `BR-CAT-GRP-009` | CORNERSTONE | SnackBar `ERR-INV-003` khi cycle detected — "Nhóm cha không hợp lệ: tạo thành vòng tròn trong cây phân cấp" | `material_group_edit_page.dart` | AC-4 | Primary tại BE; mobile surface error |
| `BR-CAT-GRP-012` | NORMAL | `maxLength: 255` counter + inline error `ERR-INV-016` (NEED CONFIRMATION DIV-05: 250 vs 255) | `widgets/material_group_edit_form.dart` | AC-6 | Primary tại BE; mobile client hint |

---

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (page mount → cubit loading → pre-fill) | test-mobile-ui | Mock `getMaterialGroup` response; verify fields pre-filled |
| AC-2 | Widget test (code field disabled) | test-mobile-ui | Assert `AppTextField(enabled: false)` + asterisk renders; no onChanged triggered |
| AC-3 | Widget test (form validation — name empty → button disabled) | test-mobile-ui | bloc_test: `NameChanged("")` → `isFormValid = false`; button `onPress = null` |
| AC-4 | Widget test (dropdown shows ACTIVE groups; ERR-INV-003 SnackBar) | test-mobile-ui | Mock `searchMaterialGroups` returns ACTIVE only; mock BFF ERR-INV-003 → SnackBar |
| AC-5 | Widget test (status dropdown toggle) | test-mobile-ui | `StatusChanged(INACTIVE)` → cubit state updated; submit includes status |
| AC-6 | Widget test (counter + inline ERR-INV-016) | test-mobile-ui | Input 256 chars → counter red; mock ERR-INV-016 → inline error |
| AC-7 | Widget test (submit → success nav + error rollback) | test-mobile-ui | Happy path: mock mutation → `router.pop(true)`; Error: mock 500 → SnackBar + form retained |
| AC-8 | Widget test (cancel pop) | test-mobile-ui | Tap "Huỷ" → `router.pop()` called, no mutation |
| AC-9 | Widget test (route access both personas); test-isolation RBAC | test-mobile-ui + test-isolation | Dual persona: both see form (per source AC-9 pending NEED CONFIRMATION); 403 → SnackBar |
| (smoke) | Mobile E2E happy path | test-mobile-e2e | Patrol: open edit form → change name → tap Lưu → navigate back |

---

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

| Key | vi | en | AC ref |
|---|---|---|---|
| `material_group_edit_page_title` | "Chỉnh sửa Nhóm vật tư hàng hoá" | "Edit Material Group" | AC-1 |
| `material_group_section_general_info` | "Thông tin chung" | "General Information" | AC-1 |
| `material_group_code_label` | "Mã nhóm VTHH" | "Group Code" | AC-2 |
| `material_group_name_label` | "Tên nhóm VTHH" | "Group Name" | AC-3 |
| `material_group_name_required_error` | "Vui lòng nhập tên nhóm vật tư hàng hoá" | "Group name is required" | AC-3 |
| `material_group_parent_label` | "Thuộc nhóm" | "Parent Group" | AC-4 |
| `material_group_edit_err_cycle` | "Nhóm cha không hợp lệ: tạo thành vòng tròn trong cây phân cấp" | "Invalid parent: circular reference detected" | AC-4 |
| `material_group_status_label` | "Trạng thái" | "Status" | AC-5 |
| `material_group_status_active` | "Đang hoạt động" | "Active" | AC-5 |
| `material_group_status_inactive` | "Ngừng hoạt động" | "Inactive" | AC-5 |
| `material_group_description_label` | "Mô tả" | "Description" | AC-6 |
| `material_group_description_max_error` | "Mô tả không được vượt quá 255 ký tự" | "Description must not exceed 255 characters" | AC-6 |
| `material_group_edit_save_button` | "Lưu" | "Save" | AC-7 |
| `material_group_edit_save_success` | "Cập nhật nhóm vật tư thành công" | "Material group updated successfully" | AC-7 |
| `material_group_edit_cancel_button` | "Huỷ" | "Cancel" | AC-8 |
| `material_group_edit_err_forbidden` | "Bạn không có quyền chỉnh sửa nhóm vật tư" | "You don't have permission to edit this group" | AC-9 |
| `material_group_edit_err_not_found` | "Không tìm thấy nhóm vật tư" | "Material group not found" | AC-1 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `Semantics(label: "Màn hình chỉnh sửa nhóm vật tư", child: CustomScaffold(...))` | Page-level semantic |
| AC-2 | `Semantics(label: "Mã nhóm VTHH, read-only")` trên disabled AppTextField | TalkBack announce disabled state |
| AC-3 | `Semantics(label: "Tên nhóm VTHH, bắt buộc")` + `Semantics(liveRegion: true)` cho error | announce validation error |
| AC-6 | `Semantics(liveRegion: true)` cho inline error ERR-INV-016 | announce khi error xuất hiện |
| AC-7 | `Semantics(label: "Lưu thay đổi nhóm vật tư hàng hoá")` cho Lưu button | screen reader |
| AC-8 | `Semantics(label: "Huỷ, quay về màn hình trước")` cho Huỷ button | screen reader |
| AC-9 | `Semantics(liveRegion: true)` cho SnackBar 403 | announce permission error |

---

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-EDIT.md` | DRAFT | BR primary enforcement (BR-CAT-GRP-004/007/008/009/012); `PUT /api/v2/material-groups/{id}` V2-5; error codes ERR-INV-003 / ERR-INV-016 (read-only ref — KHÔNG modify) |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-EDIT.md` | DRAFT | `updateMaterialGroup(id: Int!, input: UpdateMaterialGroupInput!)` mutation (§6.1); auth guard (NEED CONFIRMATION garage-owner only vs both personas per AC-9 conflict) (read-only ref) |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-EDIT.md` | PENDING | Web-tier counterpart cho cùng feature — share BFF contract; không ảnh hưởng Mobile impl |

**Source ID consistency** (item #18): `source_feat_sha = 87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436` — identical cross-tier (BE/BFF/Mobile).

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-EDIT.md`](../../../../../Product/features/FEAT-CAT-GRP-EDIT.md) v4
- **Paired BE**: [`features/be/FEAT-CAT-GRP-EDIT.md`](../be/FEAT-CAT-GRP-EDIT.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-GRP-EDIT.md`](../bff/FEAT-CAT-GRP-EDIT.md)
- **Figma Mobile**: [`Product/ux/figma-mobile/wave03-cat-grp-edit.md`](../../../../../Product/ux/figma-mobile/wave03-cat-grp-edit.md) node 21555:24249 / frame 21254:51963
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1 EC-3
- **HLD Mobile**: [`Architecture/hld/garage-mobile-HLD.md`](../../../../../Architecture/hld/garage-mobile-HLD.md)
- **PKG**: [`Execution/work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.4
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **Template**: `Execution/wave-specs/_TEMPLATE-feature-mobile.md` T2
- **Mobile codebase exemplar**: `mobile/gf-garage-app/lib/ui/inventory/inventory_list/`

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 2 | Delivery Authority (in-session full GraphQL re-audit — user request "check lại hết phần graphql của wave 3") | **Fix §6.1 3 drift vs code ground-truth**: (1) `getMaterialGroup(id: Int!)` → `id: ID!` (đúng GraphQL scalar per query text thật); (2) `searchMaterialGroups` NEED CONFIRMATION (item #3 trong 4 NC gốc) → RESOLVED, cite CR-1782381477; (3) `updateMaterialGroup(id: Int!, input: ...)` sai — mutation thật CHỈ 1 param `$input`, `id` lồng bên trong `input.toJson()`, KHÔNG có variable `id` riêng. Đồng thời fix repository path/class toàn bài (`material_group_repository.dart` → `inventory_catalog_repository.dart`, class `InventoryCatalogRepository` consolidated) khớp cấu trúc thật đã ratify ở BUG-W03-013. |
| 2026-06-30 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-CAT-GRP-EDIT` W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (byte-equal với BE tier), §2 trách nhiệm Mobile, §3 behaviour map 9 ACs, §4 ràng buộc (visual fidelity Figma 21254:51963, state machine form-validity gate, i18n ARB, a11y Semantics, RBAC NEED CONFIRMATION), §5-§11 Mobile-specific (page/widget/cubit/repository/router/i18n). 4 NEED CONFIRMATION: (1) DIV-05 description maxLength 250 vs 255 (defer CR-20260630-01 P1.4); (2) component layer paths §G.X KG stub; (3) parent group BFF query op name; (4) RBAC conflict source AC-9 vs BFF AC-9. Widget phantom guard enforced: AppDropdown/AppTextarea substituted với DropdownTextField/AppTextField(maxLines). |
