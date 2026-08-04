---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/features/FEAT-CAT-GRP-CREATE.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-CREATE"
source_feat_sha: "183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4"
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
consumes_backend_feats: ["FEAT-CAT-GRP-CREATE"]
consumes_bff_feats: ["FEAT-CAT-GRP-CREATE"]
screens_touched:
  - "lib/ui/inventory_catalog/material_group_create/material_group_create_page.dart"
flutter_packages: ["flutter_bloc", "freezed", "get_it", "injectable", "auto_route", "graphql_flutter", "gap"]
figma_refs:
  - "Product/ux/figma-mobile/wave03-cat-grp-create.md (node 21555:24247 — màn Thêm nhóm vật tư hàng hóa, screen 21252:51299)"
figma_url: "https://www.figma.com/file/5YU4H3iY726P8KNxI9oCYF?node-id=21555-24247"
node_id: "21555:24247"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "a72a1e067d6d58ef210d7e8bf5645599229d79701391f56be8f8e84c02557176"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-CREATE.mobile.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-GRP-CREATE (Mobile): Tạo nhóm vật tư hàng hóa

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-CREATE` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `lib/ui/inventory_catalog/material_group_create/material_group_create_page.dart` |
| Flutter packages | `flutter_bloc, freezed, get_it, injectable, auto_route, graphql_flutter, gap` |
| Cross-tier consume | BE: `FEAT-CAT-GRP-CREATE` \| BFF: `FEAT-CAT-GRP-CREATE` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-CREATE.md`](../../../../../Product/features/FEAT-CAT-GRP-CREATE.md) |
| Source version | v4 |
| Source SHA | `183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4` |
| Generated at | 2026-06-30T00:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần xây dựng cấu trúc phân loại vật tư hàng hóa phân cấp trước khi sử dụng danh mục mã sản phẩm nội bộ. Feature cho phép tạo mới một nhóm vật tư với mã định danh nội bộ, tên hiển thị, nhóm cha tùy chọn và mô tả. Nhóm vật tư sau khi tạo là điều kiện tiên quyết để gán mã SP nội bộ và là nền dữ liệu phân loại cho toàn bộ nghiệp vụ kho V2 (nhập/xuất/tồn/tính giá).

## 2. Trách nhiệm Mobile (garage-mobile)

- Render màn hình tạo mới nhóm vật tư (`MaterialGroupCreatePage`) — full-page push route từ màn danh sách; Scaffold với `CustomAppBar` + scrollable form body + `BottomBar` footer 2 nút.
- Thu thập 5 trường thông tin từ người dùng theo bố cục Figma node `21252:51299`: Mã nhóm (bắt buộc), Tên nhóm (bắt buộc), Thuộc nhóm (dropdown ACTIVE-only, tùy chọn), Trạng thái (dropdown default ACTIVE, tùy chọn), Mô tả (textarea maxLength 250, tùy chọn).
- Quản lý form state qua `MaterialGroupCreateCubit` — computed property `isFormValid` kiểm soát trạng thái enable/disable nút "Lưu"; inline validation hint trước khi gọi BFF.
- Gọi mutation `createMaterialGroup` qua `MaterialGroupRepository` (graphql_flutter) sau khi form hợp lệ; xử lý response thành công → pop về danh sách + hiển thị SnackBar; xử lý lỗi server → inline error hoặc SnackBar theo error code.
- Nạp danh sách nhóm cha (ACTIVE) qua BFF query để populate bottom sheet picker cho trường "Thuộc nhóm" — **NEED CONFIRMATION** tên op (xem §6.1).
- RBAC render: nút "Thêm Nhóm VT/HH" trên màn danh sách chỉ hiển thị cho persona được phép — **NEED CONFIRMATION** (xem §4.6 DIV-RBAC-01).

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: TẤT CẢ 10 source AC-IDs (AC-1 đến AC-10) xuất hiện ở §3 hoặc §4.

### Cluster A — Mở màn hình tạo nhóm

#### AC-1 → Mobile push route sang MaterialGroupCreatePage

- **Khi**: người dùng tap nút "Thêm Nhóm VT/HH" trên màn danh sách nhóm vật tư.
- **Mobile phải**: navigate tới `MaterialGroupCreatePage` qua `auto_route` push (KHÔNG present modal/bottom sheet — full-page push, per Figma node `21252:51299`). Page render `CustomAppBar` title "Thêm nhóm vật tư hàng hóa", body form 5 trường, footer Row 2 nút.
- **State transition**: Cubit khởi tạo `MaterialGroupCreateState.initial()` — tất cả field rỗng, nút "Lưu" disabled.
- **Widget**: `MaterialGroupCreatePage` (`lib/ui/inventory_catalog/material_group_create/material_group_create_page.dart`)
- **i18n key (ARB)**: `materialGroupCreate_pageTitle` = "Thêm nhóm vật tư hàng hóa"
- **a11y**: `Semantics(label: "Màn hình tạo nhóm vật tư")` bọc page; AppBar title đọc được bởi TalkBack/VoiceOver.
- **Ref**: Figma node `21252:51299` screen "Thêm nhóm vật tư hàng hóa", §5.1.

### Cluster B — Nhập liệu form

#### AC-2 → Trường Mã nhóm VTHH — client-side validation hint

- **Khi**: người dùng nhập hoặc thay đổi nội dung trường "Mã nhóm VTHH".
- **Mobile phải**: render `AppTextField(label: "Mã nhóm VTHH", required: true, ...)` với asterisk đỏ `AppColors.textErrorPrimary`. Trên mỗi thay đổi (`onChanged`) — cubit re-evaluate `isFormValid`: field rỗng → invalid; field chứa ký tự trong tập `~!@#$%^&*` → hiển thị helper text lỗi inline ("Mã nhóm không hợp lệ") + border `AppColors.borderError`. Khi đúng định dạng → clear error, re-enable "Lưu" nếu các required field khác cũng valid.
- **State transition**: `Cubit.onGroupCodeChanged(value)` → recompute `isFormValid`; lỗi ký tự đặc biệt → `hasGroupCodeError: true`.
- **Widget**: `AppTextField` (§5.2) — NEED CONFIRMATION path cụ thể (xem §4.1).
- **GraphQL op**: không gọi op tại bước này — validation hoàn toàn client-side cho pattern. Lỗi server `ERR_INV_001` xử lý sau khi submit (§4.9).
- **i18n key (ARB)**: `materialGroupCreate_codeLabel` = "Mã nhóm VTHH", `materialGroupCreate_codeErrorSpecialChar` = "Mã nhóm không được chứa ký tự đặc biệt".
- **a11y**: `Semantics(label: "Mã nhóm VTHH, bắt buộc")` cho TextField; `Semantics(liveRegion: true)` cho helper text lỗi — screen reader đọc khi lỗi xuất hiện.
- **Ref**: BE §3 AC-2 (server enforce BR-CAT-GRP-001), Figma `21252:51299` §GroupCodeField, §4.7.

#### AC-3 → Trường Tên nhóm VTHH — required validation hint

- **Khi**: người dùng nhập hoặc xóa nội dung trường "Tên nhóm VTHH".
- **Mobile phải**: render `AppTextField(label: "Tên nhóm VTHH", required: true, ...)` với asterisk đỏ. Khi field rỗng (sau blur hoặc khi tap "Lưu") → hiển thị inline error "Vui lòng nhập tên nhóm"; nút "Lưu" disabled do `isFormValid = false`.
- **State transition**: `Cubit.onGroupNameChanged(value)` → recompute `isFormValid`.
- **Widget**: `AppTextField` (§5.2).
- **i18n key (ARB)**: `materialGroupCreate_nameLabel` = "Tên nhóm VTHH", `materialGroupCreate_nameErrorRequired` = "Vui lòng nhập tên nhóm".
- **a11y**: `Semantics(label: "Tên nhóm VTHH, bắt buộc")` cho TextField; liveRegion cho error.
- **Ref**: BE §3 AC-3 (server enforce BR-CAT-GRP-002), Figma `21252:51299` §GroupNameField, §4.7.

#### AC-4 → Trường Thuộc nhóm — dropdown nhóm ACTIVE

- **Khi**: người dùng tap trường "Thuộc nhóm" (optional, không có asterisk).
- **Mobile phải**: mở bottom sheet picker hiển thị danh sách nhóm vật tư ACTIVE trong tenant hiện tại. Người dùng chọn → giá trị được gán vào `parentGroup` state; để trống → `parentId = null` (nhóm gốc). Cubit fetch danh sách nhóm cha qua BFF query khi form khởi tạo (xem §6.1).
- **State transition**: `Cubit.onParentGroupChanged(MaterialGroupModel?)` → update `selectedParentGroup` trong state; `isFormValid` không phụ thuộc field này (optional).
- **Widget**: `AppDropdown` hoặc `DropdownTextField` — NEED CONFIRMATION (§5.2); chevron-down `Icons.keyboard_arrow_down` trailing, `AppColors.textTertiary`.
- **i18n key (ARB)**: `materialGroupCreate_parentGroupLabel` = "Thuộc nhóm", `materialGroupCreate_parentGroupHint` = "Chọn nhóm cha (tùy chọn)".
- **a11y**: `Semantics(label: "Thuộc nhóm, tùy chọn")`.
- **Ref**: BE §3 AC-4 (server enforce BR-CAT-GRP-003 — parentId ACTIVE), Figma `21252:51299` §ParentGroupField, §6.1 query NEED CONFIRMATION.

#### AC-5 → Trường Trạng thái — dropdown mặc định ACTIVE

- **Khi**: form mở lần đầu.
- **Mobile phải**: render `AppDropdown` (hoặc `DropdownTextField`) với label "Trạng thái", giá trị mặc định "Đang hoạt động" (`MaterialGroupStatus.ACTIVE`). Người dùng có thể chọn "Ngừng hoạt động" (`MaterialGroupStatus.INACTIVE`). Không có asterisk (field có default, không strict required).
- **State transition**: `Cubit` khởi tạo `selectedStatus = MaterialGroupStatus.ACTIVE`; `Cubit.onStatusChanged(MaterialGroupStatus)` khi user chọn.
- **Widget**: `AppDropdown` hoặc `DropdownTextField` (NEED CONFIRMATION), trailing `Icons.keyboard_arrow_down`, `AppColors.textTertiary`.
- **i18n key (ARB)**: `materialGroupCreate_statusLabel` = "Trạng thái", `materialGroupStatus_active` = "Đang hoạt động", `materialGroupStatus_inactive` = "Ngừng hoạt động".
- **a11y**: `Semantics(label: "Trạng thái, giá trị hiện tại: Đang hoạt động")`.
- **Ref**: BE §3 AC-5 (server default ACTIVE), Figma `21252:51299` §StatusField.

#### AC-6 → Trường Mô tả — textarea với char counter

- **Khi**: người dùng nhập mô tả (optional).
- **Mobile phải**: render `AppTextarea(label: "Mô tả", hint: "Nhập mô tả", maxLength: 250, ...)` — hiển thị char counter "0/250" góc dưới phải (`AppTextStyle.textCaptionC7`, `AppColors.textTertiary`). maxLength=250 (Figma SSOT per decisions log 2026-06-29 DIV-05; PKG server enforce 255 — **NEED CONFIRMATION** CR-20260630-01 P1.4). Widget không cho nhập quá 250 ký tự; không có asterisk (optional).
- **State transition**: `Cubit.onDescriptionChanged(value)` → update char count; không ảnh hưởng `isFormValid`.
- **Widget**: `AppTextarea` hoặc `AppTextField(maxLines: 5, maxLength: 250)` — NEED CONFIRMATION (§5.2).
- **i18n key (ARB)**: `materialGroupCreate_descriptionLabel` = "Mô tả", `materialGroupCreate_descriptionHint` = "Nhập mô tả".
- **a11y**: `Semantics(label: "Mô tả, tùy chọn, tối đa 250 ký tự")`.
- **Ref**: Figma `21252:51299` §DescriptionField (char counter "0/250"), decisions log DIV-05.

### Cluster C — Lưu và xử lý kết quả

#### AC-7 → Hiển thị lỗi trùng mã khi BFF trả ERR_INV_002

- **Khi**: người dùng tap "Lưu", mutation `createMaterialGroup` được gọi, BFF trả `errors[].extensions.code = "ERR_INV_002"` (trùng mã trong tenant).
- **Mobile phải**: đưa cubit về state `error`; hiển thị inline error trên trường "Mã nhóm VTHH" ("Mã nhóm đã tồn tại") hoặc SnackBar tùy UX decision. Nút "Lưu" trở lại enabled để user sửa mã.
- **State transition**: `Cubit` emit `MaterialGroupCreateState.error(errorCode: "ERR_INV_002")` → `BlocBuilder` render inline error trên `GroupCodeField`.
- **Widget**: `AppTextField` inline error state — border `AppColors.borderError` + helper text lỗi.
- **i18n key (ARB)**: `materialGroupCreate_errorDuplicateCode` = "Mã nhóm đã tồn tại trong hệ thống".
- **a11y**: `Semantics(liveRegion: true)` trên error helper text — TalkBack đọc khi lỗi xuất hiện.
- **Ref**: BFF §4.5 error mapping `ERR_INV_002`, BE §3 AC-7, §4.9 error code table.

#### AC-8 → Lưu thành công — pop về danh sách + SnackBar

- **Khi**: mutation `createMaterialGroup` trả thành công (data `MaterialGroupResponse`).
- **Mobile phải**: emit `MaterialGroupCreateState.success()`; `Navigator.pop(context)` về màn danh sách; danh sách tự refresh (cubit danh sách cần re-fetch sau pop); hiển thị SnackBar thành công "Tạo nhóm vật tư thành công" trên màn danh sách.
- **State transition**: `Cubit` loading → success → pop. Sau pop, `MaterialGroupListCubit` tự refresh (pattern shared via push result hoặc BLoC stream).
- **Widget**: Flutter built-in `ScaffoldMessenger.of(context).showSnackBar(...)` với nội dung thành công.
- **GraphQL op**: `createMaterialGroup` mutation (§6.1).
- **i18n key (ARB)**: `materialGroupCreate_successMessage` = "Tạo nhóm vật tư thành công".
- **a11y**: SnackBar message được screen reader đọc tự động (Flutter mặc định).
- **Ref**: BFF §3 AC-8 (enrich response), Figma §BottomBar/SaveButton, §4.9.

### Cluster D — Huỷ bỏ form

#### AC-9 → Tap "Huỷ" — pop navigation không lưu

- **Khi**: người dùng tap nút "Huỷ" (secondary button, label verbatim theo Figma PNG "Huỷ" — không phải "Hủy").
- **Mobile phải**: `Navigator.pop(context)` — không gọi bất kỳ mutation nào, không lưu state form. Người dùng quay về màn danh sách nhóm.
- **State transition**: không cần cubit action — pop navigation trực tiếp. Dữ liệu form discarded tự động khi page bị dispose.
- **Widget**: `AppButton.text(title: "Huỷ", appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: () => Navigator.pop(context))`.
- **i18n key (ARB)**: `common_cancel` = "Huỷ" (dùng common key nếu đã tồn tại, hoặc tạo `materialGroupCreate_cancelButton`).
- **a11y**: `Semantics(label: "Huỷ — đóng form không lưu")`.
- **Ref**: Figma `21252:51299` §CancelButton (PNG verified "Huỷ" với dấu `ỷ`).

### Cluster E — Phân quyền

#### AC-10 → RBAC — render nút tạo theo persona

- **Khi**: người dùng truy cập màn danh sách nhóm vật tư.
- **Mobile phải**: hiển thị nút "Thêm Nhóm VT/HH" chỉ khi user có quyền tạo nhóm. Per BFF §2 + §3 AC-10: permission `CATALOG_GROUP_CREATE` gán cho `garage-owner`. **NEED CONFIRMATION** DIV-RBAC-01: source FEAT AC-10 + BE tier cho phép cả `accountant`, BFF chỉ cho phép `garage-owner` — BA phải confirm canonical RBAC trước khi impl button visibility (xem §4.6).
- **Mobile phải**: nếu user không có quyền (sau khi confirm với BA) → ẩn hoàn toàn nút "Thêm Nhóm VT/HH" trên màn danh sách (KHÔNG hiển thị disabled). Nếu user navigate thẳng đến route tạo nhóm → BFF sẽ reject với `ERR_AUTH_FORBIDDEN`, mobile hiển thị error SnackBar + pop về danh sách.
- **State transition**: `PermissionGuard` (`auto_route`) hoặc `BlocBuilder` kiểm tra auth context.
- **Widget**: nút "Thêm Nhóm VT/HH" trong `MaterialGroupListPage` — render conditional per role.
- **Ref**: BFF §3 AC-10 (ERR_AUTH_FORBIDDEN), Critical Rule #6 (dual persona only), §4.6.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT — node 21555:24247)

- Layout bám sát Figma node `21252:51299` (screen 375x812px phone): `CustomAppBar` + `Expanded(SingleChildScrollView(form))` + `BottomBar` footer.
- Design tokens từ `lib/core/common/styles/`: `AppColors.*` / `AppTextStyle.*` / `AppSizes.spacing*`. **KHÔNG** hardcode `Color(0xFF...)` / `TextStyle(...)` / raw int spacing.
  - AppBar title: `AppTextStyle.textHeadingH3` (18px weight=700), `AppColors.textPrimary`.
  - Section header "Thông tin chung": `AppTextStyle.textHeadingH3`, `AppColors.textPrimary`.
  - Field labels: `AppTextStyle.textBodyB5` (14px weight=500), `AppColors.textPrimary`.
  - Placeholder/char counter: `AppTextStyle.textCaptionC7` (12px weight=400), `AppColors.textTertiary`.
  - Asterisk `*` bắt buộc: `AppColors.textErrorPrimary` (#ed1f42). Chỉ trường Mã nhóm + Tên nhóm có asterisk — 3 trường còn lại (Thuộc nhóm, Trạng thái, Mô tả) KHÔNG có asterisk.
  - Nút "Huỷ": `AppColors.buttonBackgroundSecondary` (#f3f3f4), text `AppColors.textPrimary`.
  - Nút "Lưu" (primary): `AppColors.buttonBackgroundPrimary` (#0052ff), text `AppColors.textWhite`.
  - Border field default: `AppColors.borderPrimary`; focused: `AppColors.borderActive`; error: `AppColors.borderError`.
- Body padding: `EdgeInsets.symmetric(horizontal: 16, vertical: 16)`. Gap giữa field: `Gap(AppSizes.spacing16)`.
- Section header "Thông tin chung": KHÔNG có Switch/Toggle (metadata layer `21254:51565` render hidden — M-24 anti-invent: không emit widget nếu PNG không render).
- Footer `BottomBar`: border-top 1px `AppColors.borderPrimary`; padding `EdgeInsets.symmetric(horizontal: 16, vertical: 16)` + `SafeArea` bottom inset; 2 button Expanded equal-width.
- **NEED CONFIRMATION** thành phần widget: `AppDropdown` và `AppTextarea` được Figma translate suggest nhưng cần DEV xác nhận class tồn tại tại `lib/ui/widgets/` hoặc `lib/components/`. Substitute nếu không tồn tại: `DropdownTextField` (cho AppDropdown) và `AppTextField(maxLines: 5)` (cho AppTextarea).

### 4.2 State machine + error handling (FORM FEAT)

- Cubit state tường minh: `initial | loading | success | error`. Mỗi state có render tương ứng.
- **`isFormValid`** computed property trong Cubit — AND-combine:
  - `groupCode.isNotEmpty` (after trim)
  - `!hasSpecialCharsInCode(groupCode)` — tập ký tự `~!@#$%^&*`
  - `groupName.isNotEmpty` (after trim)
- Nút "Lưu" (`AppButton`) disabled khi (composite 3-condition):
  - (a) `!cubit.isFormValid` — required fields empty hoặc code có ký tự đặc biệt → opacity 0.5, không tap.
  - (b) `state == loading` → `CircularProgressIndicator` inline thay text "Lưu", form non-interactive.
  - (c) Offline — connectivity banner active.
- Wire: `AppButton.text(title: "Lưu", onPress: isFormValid && !isLoading ? cubit.submit : null)` qua `BlocBuilder`.
- Error server → cubit emit `error(errorCode)` → BlocBuilder hiển thị inline error (trường liên quan) hoặc SnackBar (xem §4.9).
- KHÔNG silent fail — log via Sentry/equivalent; KHÔNG giữ loading spinner vô tận sau timeout.

### 4.3 Native interaction + permission

- Màn CREATE form không yêu cầu permission hệ thống (camera/photo/location).
- Không có deeplink schema riêng cho màn CREATE (push từ list, không cần deeplink direct).
- iOS/Android: không có xử lý platform-specific đặc biệt cho feature này.

### 4.4 Offline + connectivity

- Feature yêu cầu kết nối internet để gọi mutation `createMaterialGroup` (không có offline queue cho CREATE form).
- Khi offline: nút "Lưu" disabled; connectivity banner hiển thị (nếu `ConnectivityBloc` global được inject); không cache form draft (scope W03).
- Danh sách nhóm cha (populate dropdown "Thuộc nhóm") không cần cache offline — load khi form mở.

### 4.5 i18n + a11y

- Mọi label string dùng ARB key (`mobile/gf-garage-app/lib/l10n/intl_en.arb` + `intl_vi.arb`) — KHÔNG hardcode tiếng Việt inline trong widget (trừ const string đã verify từ Figma PNG như label field name).
- `Semantics` cho mọi icon-only button; `Semantics(liveRegion: true)` cho inline error widget — TalkBack/VoiceOver announce khi lỗi thay đổi.
- Tap target ≥ 48dp (AppButton `h=48px` đủ chuẩn).
- Contrast ratio: `AppColors.textPrimary` trên `AppColors.bgBase` đạt WCAG AA (đã verify bởi Design System).
- Diacritic Figma verbatim: button "Huỷ" (chữ `ỷ` không phải `ủ`) — xem Figma PNG verified `21252-51299.png §CancelButton`.

### 4.6 RBAC render + feature flag

- **DIV-RBAC-01 — NEED CONFIRMATION**: BFF §2 khai báo `CATALOG_GROUP_CREATE` chỉ gán `garage-owner`; nguồn FEAT AC-10 + BE tier cho phép cả hai persona. BA phải confirm RBAC canonical trước impl.
  - Nếu confirm garage-owner only: nút "Thêm Nhóm VT/HH" tại `MaterialGroupListPage` chỉ render khi `authContext.hasPermission("CATALOG_GROUP_CREATE")`.
  - Nếu confirm cả hai persona: render cho cả `garage-owner` và `accountant`.
- Route guard: `auto_route AuthGuard` bảo vệ `/material-group/create` — unauthenticated user redirect về login.
- Không có feature flag riêng cho CREATE form (W03 global scope per PKG-W03).

### 4.7 Business rule secondary (UI hint)

- BR-CAT-GRP-001 (CORNERSTONE, BE primary): Mobile hint — inline error trên `GroupCodeField` khi phát hiện ký tự `~!@#$%^&*` client-side; server trả `ERR_INV_001` → hiển thị error tương tự.
- BR-CAT-GRP-002 (CORNERSTONE, BE primary): Mobile hint — nút "Lưu" disabled khi Tên nhóm rỗng.
- BR-CAT-GRP-003 (CORNERSTONE, BE primary): Mobile hint — dropdown "Thuộc nhóm" chỉ fetch và hiển thị nhóm ACTIVE (filter trong BFF query, xem §6.1).
- BR-CAT-GRP-006 (NORMAL, BE primary): Mobile enforce default bằng cách pre-select "Đang hoạt động" khi form init.
- BR-CAT-GRP-012 (CORNERSTONE, BE primary): Mobile xử lý sau khi server trả `ERR_INV_002` — hiển thị error "Mã nhóm đã tồn tại".
- BR-CAT-GRP-008 (NORMAL, BE primary — description ≤ 255): Mobile enforce client-side với `maxLength=250` (Figma SSOT, conservative; không trigger ERR-INV-016 qua normal UX — **NEED CONFIRMATION** CR-20260630-01 P1.4 về đồng bộ giá trị 250 vs 255).

### 4.8 Performance

- Danh sách nhóm cha: gọi 1 lần khi form init với `size=100` (đủ cho hầu hết tenant per decisions log FEAT-CAT-GRP-LIST). Không phân trang dropdown.
- Tránh rebuild toàn `MaterialGroupCreatePage` — `BlocBuilder` granular chỉ rebuild phần field bị ảnh hưởng (nút "Lưu" và error state).
- `const` constructor cho static widget (AppBar, SectionHeader không thay đổi).
- KHÔNG dùng `ListWidget` (feature này không có list) — form layout dùng `Column` + `Gap` thuần túy.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF extensions.code) | Display mode | Widget / Vị trí | Trigger | Source AC |
|---|---|---|---|---|
| `ERR_INV_001` | Inline (field GroupCodeField) | `AppTextField` error helper text | Code chứa ký tự đặc biệt (server fallback) | AC-2 |
| `ERR_INV_002` | Inline (field GroupCodeField) | `AppTextField` error helper text | Trùng `(tenant_id, code)` | AC-7 |
| `ERR_INV_016` | Inline (field DescriptionField) | `AppTextarea`/`AppTextField` error helper text | Description > 255 chars (server; không trigger qua normal UX nếu client cap 250) | AC-6 |
| `ERR_DOWNSTREAM_CLIENT` | SnackBar | `ScaffoldMessenger` | parentId không hợp lệ hoặc INACTIVE (NEED CONFIRMATION error code) | AC-4 |
| `ERR_DOWNSTREAM_SERVER` | SnackBar | `ScaffoldMessenger` | Lỗi server gf-inventory | AC-8 |
| `ERR_AUTH_FORBIDDEN` | SnackBar + pop | `ScaffoldMessenger` → pop | Không có quyền tạo (permission guard) | AC-10 |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`. Figma SSOT: node `21252:51299` (screen 375x812px).

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `MaterialGroupCreatePage` | `/inventory-catalog/material-group/create` | NEW | `21252:51299` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9 |

> `@RoutePage()` decorator; class suffix `*Page`; file suffix `_page.dart`. Route path NEED CONFIRMATION — verify cùng router master plan trong `lib/core/router/router.dart`.

### 5.2 Widgets

> **NEED CONFIRMATION — Component layer paths**: Bundle §G.X báo KG `implementation.components` empty. Spec dùng naming-convention inference: `Custom*` → Priority 1 customs/ (`lib/components/customs/`); `App*` → Priority 2 share/ (`lib/components/share/`). Dev PHẢI scan `lib/components/{customs,share,ui}/` + `lib/ui/widgets/` thực tế trước impl và cập nhật paths.
>
> **Phantom widget guard**: `AppDropdown` và `AppTextarea` được Figma transform suggest. Nếu không tồn tại → substitute: `DropdownTextField` (share/) cho dropdown; `AppTextField(maxLines: 5, maxLength: 250)` cho textarea. KHÔNG tự bịa class không có trong filesystem.

| Widget | Path | Change type | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|
| `CustomAppBar` | `lib/components/customs/app_bar/custom_app_bar.dart` (NEED CONFIRMATION path) | REUSE | StatelessWidget | Priority 1 — customs/ (naming convention `Custom*`); title "Thêm nhóm vật tư hàng hóa", leading back | AC-1 |
| `CustomScaffold` | `lib/components/customs/scaffold/custom_scaffold.dart` (NEED CONFIRMATION path) | REUSE | StatelessWidget | Priority 1 — customs/ (naming convention `Custom*`); bọc page scaffold | AC-1 |
| `AppTextField` | `lib/ui/widgets/text_field/app_text_field.dart` (NEED CONFIRMATION path) | REUSE | StatefulWidget | Priority 2 — share/; required=true → render asterisk `AppColors.textErrorPrimary`; dùng cho Mã nhóm + Tên nhóm | AC-2, AC-3 |
| `AppDropdown` hoặc `DropdownTextField` | `lib/ui/widgets/picker/` hoặc substitute (NEED CONFIRMATION — scan `lib/ui/widgets/picker/` + `lib/components/share/`) | REUSE | StatefulWidget | Priority 2 — share/; trailing chevron-down; opens bottom sheet picker; dùng cho Thuộc nhóm + Trạng thái | AC-4, AC-5 |
| `AppTextarea` hoặc `AppTextField(maxLines: 5)` | `lib/ui/widgets/text_field/` (NEED CONFIRMATION — scan thực tế) | REUSE | StatefulWidget | Priority 2 — share/; maxLength=250; char counter bottom-right; dùng cho Mô tả | AC-6 |
| `AppButton` | `lib/ui/widgets/button/app_button.dart` (NEED CONFIRMATION path) | REUSE | StatelessWidget | Priority 2 — share/; size medium (h=48px); "Huỷ" secondary + "Lưu" primary; disabled logic per §4.2 | AC-8, AC-9 |
| `MaterialGroupCreatePage` | `lib/ui/inventory_catalog/material_group_create/material_group_create_page.dart` | NEW | StatelessWidget | Build-new — domain-new (inventory_catalog tạo lần đầu W03 per ADR-017; không có match tại customs/share/ui) | AC-1..AC-9 |

### 5.3 Navigation

| Route | Page | Loader/Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `/inventory-catalog/material-group/create` | `MaterialGroupCreatePage` | `AuthGuard` (auto_route) | N/A — không có deeplink trực tiếp vào CREATE form | AC-1 |

> Route path cần NEED CONFIRMATION — verify với `lib/core/router/router.dart` (router codegen `.gr.dart`).

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events/States | AC ref |
|---|---|---|---|---|
| Form + submission state | Cubit | `lib/ui/inventory_catalog/material_group_create/material_group_create_cubit.dart` | `initial \| loading \| success \| error(errorCode)` — extends `Cubit<MaterialGroupCreateState>`, `@Injectable` | AC-1 đến AC-10 |
| Form state | `MaterialGroupCreateState` (@freezed) | `lib/ui/inventory_catalog/material_group_create/material_group_create_state.dart` | `groupCode, groupName, selectedParentGroup, selectedStatus, description, isLoading, errorCode, hasGroupCodeError, hasGroupNameError` | AC-2 đến AC-8 |
| Parent groups list | fetch trong Cubit `loadParentGroups()` | (trong cubit — không có separate list cubit) | NEED CONFIRMATION query op (§6.1) | AC-4 |

> Cubit expose computed property `bool get isFormValid`:
> ```
> groupCode.trim().isNotEmpty
>   && !hasSpecialChar(groupCode)  // tập ~!@#$%^&*
>   && groupName.trim().isNotEmpty
> ```

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF `agg-garage-graph`)

| Operation | Type | graphql_flutter pattern | Repository class | AC ref |
|---|---|---|---|---|
| `createMaterialGroup` | mutation | `_graphQLService.client.mutate(MutationOptions(document: gql(createMaterialGroupMutation), variables: {...}))` | `lib/core/repositories/inventory_catalog/material_group_repository.dart` (@LazySingleton) | AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-10 |
| `searchMaterialGroups` — query danh sách nhóm cha ACTIVE cho dropdown "Thuộc nhóm" | query | `_graphQLService.client.query(QueryOptions(document: gql(searchMaterialGroupsQuery), variables: {"input": {"status": "ACTIVE", "page": 0, "size": 100}}))` | `lib/core/repositories/inventory_catalog/material_group_repository.dart` | AC-4 |

> **RESOLVED** (2026-07-01, trước đây NEED CONFIRMATION): op load nhóm cha = `searchMaterialGroups` (Q1), size=100, ACTIVE-only — theo **CR-1782381477** (2026-06-25) đã quyết định mobile chỉ dùng Q1, KHÔNG `getMaterialGroupTree` (Q2). Cùng op + pattern với FEAT-CAT-GRP-LIST mobile §6.1 (reuse repository method nếu đã tồn tại).
>
> Mutation input mapping (`createMaterialGroup` — verbatim response shape từ `inventory_catalog_document.dart`, union-wrapped):
> ```graphql
> mutation CreateMaterialGroup($input: CreateMaterialGroupInput!) {
>   createMaterialGroup(input: $input) {
>     ... on CreateMaterialGroupResponse {
>       success
>       code
>       message
>       data { id code name status }
>     }
>     ... on ErrorResponse {
>       id code serverResponse message statusCode path timestamp details
>     }
>   }
> }
> ```
> **Lưu ý**: response `data` CHỈ trả `id code name status` — KHÔNG trả `description`/`parentId`/`parentName`/`createdAt`/`createdBy`/`createdByName` (spec cũ liệt kê sai 9 field). Nếu cần hiển thị lại thông tin vừa tạo đầy đủ (vd sau khi pop về list), client phải tự dùng data đã nhập form thay vì trông chờ mutation response.
> Variables: `{ "input": { "code": groupCode, "name": groupName, "description": description (if not empty), "parentId": selectedParentGroup?.id, "status": selectedStatus } }`.

### 6.2 REST endpoints consumed direct

Không có — mobile chỉ consume BFF (graphql_flutter).

### 6.3 Offline-first strategy

| Concern | Pattern | Storage | Sync trigger | AC ref |
|---|---|---|---|---|
| CREATE form | Online-required (không có offline queue trong W03 scope) | N/A | N/A | AC-8 |
| Parent groups list | In-memory cache trong Cubit (session scope) | Cubit state | Form init / force-reload | AC-4 |

### 6.4 Platform-specific behaviors

| Concern | iOS-only | Android-only | Notes |
|---|---|---|---|
| Permissions | Không cần | Không cần | Feature chỉ dùng text input + dropdown — không cần permission hệ thống |
| Keyboard | Dismiss on tap outside via `GestureDetector(onTap: FocusScope.of(context).unfocus)` | Giống iOS | Cần dismiss keyboard khi tap ngoài field |
| Back gesture | Swipe-right system gesture → pop (như nút Huỷ) | Back button Android → pop | Không có dirty-check warning trong W03 scope |

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/gf-garage-app/lib/**` (Critical Rule #1, item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/inventory_catalog/material_group_create/` | `material_group_create_page.dart` | NEW | `@RoutePage()`, StatelessWidget, BlocProvider + BlocBuilder | ~180 | AC-1 đến AC-9 |
| `lib/ui/inventory_catalog/material_group_create/` | `material_group_create_cubit.dart` | NEW | `Cubit<MaterialGroupCreateState>`, `@Injectable`, graphql dispatch, `isFormValid` computed | ~150 | AC-2 đến AC-8 |
| `lib/ui/inventory_catalog/material_group_create/` | `material_group_create_state.dart` | NEW | `@freezed` union state (initial/loading/success/error) | ~80 | AC-2 đến AC-8 |
| `lib/core/repositories/inventory_catalog/` | `material_group_repository.dart` | NEW (hoặc ADDITIVE nếu đã tạo từ LIST/DETAIL spec) | `@LazySingleton(as: MaterialGroupRepository)`, `GraphQLService` injected; method `createMaterialGroup(...)` + `fetchActiveGroups(...)` | ~100 | AC-4, AC-8 |
| `lib/core/models/inventory_catalog/` | `material_group_model.dart` | NEW (hoặc REUSE nếu đã tạo từ LIST/DETAIL spec) | `@freezed` + `@JsonSerializable` | ~60 | — |
| `lib/core/models/request/inventory_catalog/` | `create_material_group_request.dart` | NEW | `@freezed` — map sang `CreateMaterialGroupInput` | ~40 | AC-2 đến AC-6 |
| `lib/core/router/` | `router.dart` (+ `router.gr.dart` codegen) | MODIFY (additive — add `@RoutePage` entry cho `MaterialGroupCreatePage`) | auto_route 10.1.0+1 | ~10 | AC-1 |
| `lib/l10n/intl_vi.arb` + `intl_en.arb` | — | ADDITIVE (new ARB keys, xem §11.1) | flutter_localizations | ~15 | AC-1 đến AC-9 |
| `test/features/material_group_create/` | `material_group_create_cubit_test.dart` | NEW | bloc_test + mockito | ~160 | AC-2, AC-3, AC-7, AC-8, AC-10 |
| `test/features/material_group_create/` | `material_group_create_page_test.dart` | NEW | `flutter_test` widget test | ~120 | AC-1, AC-9 |
| `integration_test/` | `material_group_create_e2e_test.dart` | NEW | Patrol / integration_test | ~80 | (smoke: AC-8 happy path) |

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 song song với FE-web S6 (cùng entry: BFF S5 stable).

```
(← BFF tier S5: mutation createMaterialGroup + SDL stable)

S6  Mobile UI wire (Flutter)
    Entry: BFF S5 SDL stable (createMaterialGroup + parent group query op confirmed)
           + Figma node 21252:51299 verified (DONE per wave03-cat-grp-create.md status: ACTIVE)
           + component layer paths confirmed (dev scan lib/ui/widgets/ + lib/components/)
           + RBAC canonical confirmed (DIV-RBAC-01) + description maxLength confirmed (CR-20260630-01 P1.4)
    Exit: Patrol E2E happy path green (AC-8 submit → success → pop danh sách)
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Model + Repository (createMaterialGroup + fetchActiveGroups) | `lib/core/repositories/` + `lib/core/models/` | BFF S5 SDL stable | Unit test repository green | BFF S5 |
| S6.2 | Cubit + State (`isFormValid`, submit, error handling) | `lib/ui/inventory_catalog/material_group_create/` | S6.1 | Cubit unit test ≥ 8 cases green | S6.1 |
| S6.3 | Page + Widget tree (form layout, button state, Figma binding) | `lib/ui/inventory_catalog/material_group_create/` | S6.2 | Widget test green (render + validation + disable) | S6.2 |
| S6.4 | Router + i18n + a11y | `lib/core/router/` + `lib/l10n/` | S6.3 | Route accessible; ARB keys đủ | S6.3 |
| S6.5 | E2E happy path | `integration_test/` | S6.4 | Patrol test green | S6.4 |

## 9. Business Rules to enforce (Mobile — UI hint + secondary)

> Mobile KHÔNG enforce business validation primary. BE là primary SSOT (xem `features/be/FEAT-CAT-GRP-CREATE.md §9`). Mobile chỉ: client-side UX hint, RBAC-driven render, error display.

| BR ID | Severity | UI behavior (Mobile hint) | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-001` | CORNERSTONE | Inline error hint "Mã không hợp lệ" khi input chứa `~!@#$%^&*`; disable nút Lưu | `material_group_create_cubit.dart::_hasSpecialChar()` | AC-2 | BE primary enforce; mobile hint trước submit |
| `BR-CAT-GRP-002` | CORNERSTONE | Disable nút Lưu khi Tên nhóm rỗng | `material_group_create_cubit.dart::isFormValid` | AC-3 | BE primary enforce |
| `BR-CAT-GRP-003` | CORNERSTONE | Dropdown "Thuộc nhóm" chỉ fetch nhóm ACTIVE từ BFF query (filter status=ACTIVE) | `material_group_repository.dart::fetchActiveGroups()` | AC-4 | BE primary validate parentId ACTIVE server-side |
| `BR-CAT-GRP-006` | NORMAL | Pre-select "Đang hoạt động" khi form init | `material_group_create_cubit.dart` state init | AC-5 | Default inject tại BE; mobile reflect default bằng UI pre-select |
| `BR-CAT-GRP-008` | NORMAL | `AppTextarea` `maxLength=250` (Figma SSOT — NEED CONFIRMATION CR-20260630-01 P1.4 với server 255) | `material_group_create_page.dart §DescriptionField` | AC-6 | Client conservative; BE enforce 255 |
| `BR-CAT-GRP-012` | CORNERSTONE | Hiển thị error "Mã nhóm đã tồn tại" khi server trả ERR_INV_002 | `material_group_create_cubit.dart::_handleError()` + page BlocBuilder | AC-7 | BE + DB unique constraint primary |

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (navigation) | test-mobile-ui | Tap nút từ list → verify `MaterialGroupCreatePage` pushed; cubit init state `initial` |
| AC-2 | Cubit unit test + widget test | test-mobile-ui | Input ký tự đặc biệt → `hasGroupCodeError = true`, nút Lưu disabled; input hợp lệ → error clear |
| AC-3 | Cubit unit test | test-mobile-ui | Name rỗng → `isFormValid = false`; name không rỗng → `isFormValid = true` (với code cũng hợp lệ) |
| AC-4 | Widget test (dropdown) | test-mobile-ui | Dropdown "Thuộc nhóm" chỉ hiển thị item ACTIVE; chọn 1 item → cubit state update |
| AC-5 | Widget test (dropdown) | test-mobile-ui | Form init → Trạng thái default "Đang hoạt động"; chọn "Ngừng hoạt động" → cubit state update |
| AC-6 | Widget test (maxLength) | test-mobile-ui | Nhập 251 ký tự → widget không cho nhập (maxLength=250); char counter cập nhật |
| AC-7 | Cubit unit test (error mapping) | test-mobile-ui | Mock BFF trả `ERR_INV_002` → cubit emit `error("ERR_INV_002")` → widget hiển thị inline error GroupCodeField |
| AC-8 | Integration / widget test (happy path) | test-mobile-ui + test-mobile-e2e | Mock BFF 201 → cubit emit `success` → `Navigator.pop` → SnackBar thành công |
| AC-9 | Widget test | test-mobile-ui | Tap "Huỷ" → `Navigator.pop` không gọi mutation |
| AC-10 | Widget test (RBAC visibility) | test-mobile-ui + test-isolation | Persona garage-owner → nút thêm visible (pending RBAC confirm); persona accountant → ẩn hoặc visible (NEED CONFIRMATION DIV-RBAC-01) |
| (smoke) | Mobile E2E happy path | test-mobile-e2e | Patrol: fill form hợp lệ → tap Lưu → thấy success SnackBar → danh sách hiển thị nhóm mới |

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

| Key | vi | en | AC ref |
|---|---|---|---|
| `materialGroupCreate_pageTitle` | "Thêm nhóm vật tư hàng hóa" | "Add material group" | AC-1 |
| `materialGroupCreate_sectionGeneralInfo` | "Thông tin chung" | "General information" | AC-1 |
| `materialGroupCreate_codeLabel` | "Mã nhóm VTHH" | "Group code" | AC-2 |
| `materialGroupCreate_codeHint` | "Nhập mã nhóm" | "Enter group code" | AC-2 |
| `materialGroupCreate_codeErrorRequired` | "Vui lòng nhập mã nhóm" | "Group code is required" | AC-2 |
| `materialGroupCreate_codeErrorSpecialChar` | "Mã nhóm không được chứa ký tự đặc biệt" | "Group code cannot contain special characters" | AC-2 |
| `materialGroupCreate_nameLabel` | "Tên nhóm VTHH" | "Group name" | AC-3 |
| `materialGroupCreate_nameHint` | "Nhập tên nhóm" | "Enter group name" | AC-3 |
| `materialGroupCreate_nameErrorRequired` | "Vui lòng nhập tên nhóm" | "Group name is required" | AC-3 |
| `materialGroupCreate_parentGroupLabel` | "Thuộc nhóm" | "Parent group" | AC-4 |
| `materialGroupCreate_parentGroupHint` | "Chọn nhóm cha (tùy chọn)" | "Select parent group (optional)" | AC-4 |
| `materialGroupCreate_statusLabel` | "Trạng thái" | "Status" | AC-5 |
| `materialGroupStatus_active` | "Đang hoạt động" | "Active" | AC-5 |
| `materialGroupStatus_inactive` | "Ngừng hoạt động" | "Inactive" | AC-5 |
| `materialGroupCreate_descriptionLabel` | "Mô tả" | "Description" | AC-6 |
| `materialGroupCreate_descriptionHint` | "Nhập mô tả" | "Enter description" | AC-6 |
| `materialGroupCreate_errorDuplicateCode` | "Mã nhóm đã tồn tại trong hệ thống" | "Group code already exists" | AC-7 |
| `materialGroupCreate_errorInvalidCode` | "Mã nhóm không hợp lệ" | "Invalid group code" | AC-2, AC-7 |
| `materialGroupCreate_errorDescriptionTooLong` | "Mô tả không được vượt quá 255 ký tự" | "Description cannot exceed 255 characters" | AC-6 |
| `materialGroupCreate_successMessage` | "Tạo nhóm vật tư thành công" | "Material group created successfully" | AC-8 |
| `materialGroupCreate_cancelButton` | "Huỷ" | "Cancel" | AC-9 |
| `materialGroupCreate_saveButton` | "Lưu" | "Save" | AC-8 |
| `materialGroupCreate_errorGenericServer` | "Lỗi hệ thống, vui lòng thử lại" | "System error, please try again" | AC-8 |
| `materialGroupCreate_errorNoPermission` | "Bạn không có quyền thực hiện thao tác này" | "You don't have permission for this action" | AC-10 |

> Verify các key đã tồn tại trong `intl_vi.arb` (từ LIST/DETAIL features có thể đã khai báo `materialGroupStatus_*`). Chỉ add key mới — không duplicate.

### 11.2 a11y (Semantics)

| AC | a11y requirement | Implementation | Notes |
|---|---|---|---|
| AC-1 | `Semantics(label: "Màn hình tạo nhóm vật tư")` cho page root | Wrap `MaterialGroupCreatePage` | Screen reader announce khi navigate |
| AC-1 | AppBar title đọc được | `CustomAppBar` semantic tự động (Flutter AppBar) | TalkBack / VoiceOver |
| AC-2, AC-3 | `Semantics(label: "Mã nhóm VTHH, bắt buộc")` + `Semantics(label: "Tên nhóm VTHH, bắt buộc")` | `AppTextField` semantic label prop | Announce required status |
| AC-2, AC-7 | `Semantics(liveRegion: true)` cho error helper text | Inline error widget | TalkBack đọc khi lỗi xuất hiện/thay đổi |
| AC-4, AC-5 | `Semantics(label: "Thuộc nhóm, tùy chọn")` + `Semantics(label: "Trạng thái, giá trị hiện tại: ...")` | `AppDropdown` semantic | Announce selected value |
| AC-6 | `Semantics(label: "Mô tả, tùy chọn, tối đa 250 ký tự")` | `AppTextarea` semantic label | Announce char limit |
| AC-8, AC-9 | `Semantics(label: "Nút Lưu")` + `Semantics(label: "Nút Huỷ")` | `AppButton` semantic | Announce button purpose |
| AC-8 | SnackBar message đọc tự động (Flutter default) | `ScaffoldMessenger` | Không cần thêm Semantics |
| AC-10 | Nút bị ẩn → không có `Semantics` tương ứng (hidden không phải disabled) | Conditional render, không `Visibility(visible: false)` | Screen reader không thấy element ẩn |

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-CREATE.md` | DRAFT | BR primary enforcement (BR-CAT-GRP-001/002/003/006/008/012); REST endpoint `POST /api/v2/material-groups` — Mobile không gọi trực tiếp |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-CREATE.md` | DRAFT | GraphQL mutation `createMaterialGroup` Mobile consume (§6.1); error mapping §4.5 BFF; RBAC `CATALOG_GROUP_CREATE` (NEED CONFIRMATION DIV-RBAC-01 vs source FEAT AC-10 + BE) |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-CREATE.md` | DRAFT | Cùng business scope; chia sẻ same BFF mutation; ARB keys không overlap (tách namespace `materialGroupCreate_*` vs web i18next keys) |

**Source ID consistency** (item #18): `source_feat_sha = 183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4` — identical cross-tier (BE / BFF / FE-web / Mobile).

**NEED CONFIRMATION items tổng hợp**:

| ID | Mục | Ảnh hưởng | Cần từ |
|---|---|---|---|
| DIV-RBAC-01 | RBAC canonical: garage-owner only (BFF) vs cả hai persona (source FEAT + BE) | Button visibility + route guard | BA + Architecture Authority |
| DIV-05 / CR-20260630-01 P1.4 | description maxLength: 250 (Figma) vs 255 (PKG/BE) | `AppTextarea maxLength`, i18n error string | BA / Business Authority |
| NC-GQL-PARENT | Tên op BFF để load nhóm cha ACTIVE cho dropdown "Thuộc nhóm" | `material_group_repository.dart::fetchActiveGroups()` | Architecture Authority (verify BFF LIST SDL) |
| NC-WIDGET-PATH | Actual class paths cho `AppDropdown`, `AppTextarea`, `CustomAppBar`, `AppButton`, `AppTextField` | §5.2 component paths | Dev scan `lib/ui/widgets/` + `lib/components/` trước S6.3 |
| NC-ROUTE | Route path canonical cho `/inventory-catalog/material-group/create` | Router registration | Dev verify `lib/core/router/router.dart` |

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-CREATE.md`](../../../../../Product/features/FEAT-CAT-GRP-CREATE.md) v4
- **Paired BE**: [`features/be/FEAT-CAT-GRP-CREATE.md`](../be/FEAT-CAT-GRP-CREATE.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-GRP-CREATE.md`](../bff/FEAT-CAT-GRP-CREATE.md)
- **Paired FE-web**: [`features/fe-web/FEAT-CAT-GRP-CREATE.md`](../fe-web/FEAT-CAT-GRP-CREATE.md)
- **Figma Mobile**: [`Product/ux/figma-mobile/wave03-cat-grp-create.md`](../../../../../Product/ux/figma-mobile/wave03-cat-grp-create.md) — node `21555:24247`, screen `21252:51299`, asset `21252-51299.png`
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1
- **HLD Mobile**: [`Architecture/hld/garage-mobile-HLD.md`](../../../../../Architecture/hld/garage-mobile-HLD.md)
- **PKG**: [`Execution/work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.4
- **ADR-009**: JPA no relationship mapping (scalar FK only — context BE)
- **ADR-017**: Additive aggregates — `MaterialGroup` entity mới trong gf-inventory W03
- **BR**: [`Product/business-rules/BR-GF-INVENTORY-CATALOG.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md)
- **Fan-out map**: [`Execution/wave-specs/W03/_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **W03 Decisions**: [`Execution/wave-specs/W03/_decisions.md`](../../../_decisions.md) — entries: DIV-05 (description maxLength), DIV-RBAC-01 (RBAC), NC-GQL-PARENT (parent group query op)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 3 | Delivery Authority (in-session full GraphQL re-audit — user request "check lại hết phần graphql của wave 3") | **Fix mutation response shape §6.1** — snippet cũ liệt kê 9 field (`description/parentId/parentName/createdAt/createdBy/createdByName`) không tồn tại trong response thật. Verified `inventory_catalog_document.dart`: `createMaterialGroup` response `data` CHỈ có `id code name status`, wrapped union `CreateMaterialGroupResponse`/`ErrorResponse`. Rewrite snippet verbatim + thêm note hướng dẫn client tự giữ form data thay vì trông chờ mutation trả đủ field. |
| 2026-07-01 | 2 | Delivery Authority (in-session doc-drift audit — user request "check GraphQL mobile document") | **Resolve NEED CONFIRMATION §6.1 parent-group-load op** — spec (2026-06-30) chưa cite **CR-1782381477** (2026-06-25) khi để ngỏ lựa chọn `searchMaterialGroups` vs `getMaterialGroupTree`. CR đã quyết định dứt khoát Q1 cho toàn bộ mobile scope. Rewrite bảng §6.1 dùng tên op verbatim `searchMaterialGroups` (Q1) + variables cụ thể, xoá NEED CONFIRMATION framing. |
| 2026-06-30 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-CAT-GRP-CREATE` W03. Policy v2 "tier-authoritative": §0 audit slim (5-row table), §1 mục đích nghiệp vụ (3 dòng — identical cross-tier, byte-equal với BE), §2 trách nhiệm Mobile (6 bullet), §3 Mobile behaviour map 10 ACs (AC-1 form open, AC-2/3 required field hints, AC-4 parent dropdown ACTIVE-only, AC-5 status default, AC-6 desc maxLength 250 Figma SSOT, AC-7 ERR_INV_002 inline, AC-8 success pop+SnackBar, AC-9 cancel pop, AC-10 RBAC NEED CONFIRMATION DIV-RBAC-01), §4 visual/state/native/offline/i18n-a11y/RBAC/BR/perf/error-mapping, §5 screen+widget breakdown (1 page NEW, 6 widget entries reuse NEED CONFIRMATION paths), §6 data integration (createMaterialGroup mutation + NEED CONFIRMATION parent group op), §7 file map (11 entries mobile/**), §8 S6 DAG (5 steps), §9 BR secondary (6 BR), §10 test scope (10 ACs + smoke), §11 i18n 24 ARB keys + a11y 10 Semantics entries, §12 cross-tier 3 pairs + 5 NEED CONFIRMATION items. Figma SSOT: node 21252:51299 (wave03-cat-grp-create.md, status ACTIVE, PNG verified). |
