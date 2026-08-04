---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/features/FEAT-CAT-GRP-DELETE.md"
source_version: 2
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-DELETE"
source_feat_sha: "c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277"
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
consumes_backend_feats: ["FEAT-CAT-GRP-DELETE"]
consumes_bff_feats: ["FEAT-CAT-GRP-DELETE"]
screens_touched:
  - "lib/ui/inventory_catalog/material_group_delete/material_group_delete_handler.dart"
  - "lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart (MODIFY — add delete trigger in row actions)"
flutter_packages:
  - "flutter_bloc"
  - "freezed"
  - "get_it"
  - "injectable"
  - "auto_route"
  - "graphql_flutter"
  - "gap"
figma_refs:
  - "Product/ux/figma-mobile/wave03-cat-grp-delete.md (node 21555:24250 — delete flow: confirm popover 21254:52061 + cannot-delete popover 21254:52450)"
figma_url: "https://www.figma.com/file/5YU4H3iY726P8KNxI9oCYF?node-id=21555-24250"
figma_node_id: "21555:24250"
figma_div07_warning: >
  DIV-07 NEED CONFIRMATION (Architecture Authority): oracle PNG git-tracked cites nodes
  21254:52182 / 21254:52571 vs figma-mobile spec nodes 21254:52061 / 21254:52450.
  Registry canonical = 21555:24250. Defer per CR-20260630-01 P1.4 — confirm node
  canonical before merge. Spec authored against figma-mobile spec nodes (52061/52450).
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "a72a1e067d6d58ef210d7e8bf5645599229d79701391f56be8f8e84c02557176"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-DELETE.mobile.md"
  bundle_generated_at: "N/A (direct source read — bundle runner không chạy cho mobile tier trong session này)"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-GRP-DELETE (Mobile): Xóa nhóm vật tư hàng hóa

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DELETE` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Handler canonical path | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_handler.dart` |
| Screens modified | `material_group_list_page.dart` (MODIFY — add delete icon + handler call in row actions) |
| Flutter packages | flutter_bloc, freezed, get_it, injectable, auto_route, graphql_flutter, gap |
| Cross-tier consume | BE: `FEAT-CAT-GRP-DELETE` \| BFF: `FEAT-CAT-GRP-DELETE` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-DELETE.md`](../../../../../Product/features/FEAT-CAT-GRP-DELETE.md) |
| Source version | v2 |
| Source SHA | `c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277` |
| Generated at | 2026-06-30T00:00:00Z |

## 1. Mục đích nghiệp vụ

Tính năng cho phép chủ garage xóa vĩnh viễn một nhóm vật tư hàng hóa không còn dùng khỏi danh mục phân cấp. Để bảo vệ tính toàn vẹn dữ liệu, hệ thống tự động ngăn xóa nhóm khi còn nhóm con hoặc khi đã có mã sản phẩm nội bộ được gắn vào nhóm đó. Đây là mắt xích hoàn thiện vòng đời CRUD nhóm vật tư, đảm bảo danh mục luôn gọn gàng và nhất quán trước khi các nghiệp vụ nhập/xuất kho V2 vận hành trên nền dữ liệu này.

## 2. Trách nhiệm Mobile (`garage-mobile`)

- Hiển thị icon Xóa trong cột Thao tác của màn hình danh sách nhóm (`MaterialGroupListPage`) — entry point của luồng delete; icon chỉ render khi persona hợp lệ theo RBAC (AC-6).
- Khi người dùng nhấn icon Xóa: gọi `MaterialGroupDeleteHandler.show(context, groupId, groupName)` để hiển thị popover xác nhận (`MaterialGroupConfirmDeleteDialog` — Figma node `21254:52061`) với nút Huỷ và Xác nhận trên backdrop tối.
- Khi xác nhận: `MaterialGroupDeleteCubit` gọi mutation `deleteMaterialGroup(id: Int!)` qua `MaterialGroupRepository`, hiển thị loading state trên nút Xác nhận; trên thành công đóng dialog và trigger reload danh sách + SnackBar thành công.
- Khi server trả ERR-INV-004 hoặc ERR-INV-005: đóng confirm dialog, mở `MaterialGroupCannotDeleteDialog` (Figma node `21254:52450`) — 1 widget dùng chung với `CannotDeleteReason` enum switching body text động.
- Không có màn hình riêng (no new `@RoutePage`) — delete là handler + dialog overlay; không cần offline queue cho operation này.
- RBAC: per source AC-6 cả `garage-owner` và `accountant` đều được xóa — render icon cho cả hai (xem NEED CONFIRMATION §4.6 về conflict với BE spec).

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: 6/6 source AC-IDs. Nhóm theo interaction.

### Cluster A — Xác nhận xóa (AC-1, AC-2, AC-3)

#### AC-1 → Mobile hiển thị popover xác nhận trước khi gọi mutation

- **Khi**: người dùng nhấn icon Xóa ở cột Thao tác trong `MaterialGroupListPage`.
- **Mobile phải**: gọi `MaterialGroupDeleteHandler.show(context, groupId: int, groupName: String)` → render `MaterialGroupConfirmDeleteDialog` qua `showDialog(context, builder, barrierDismissible: false)` — popover `Container` 343×202, `BorderRadius.circular(12)`, `AppShadows.boxShadow`, bg `AppColors.bgBase`, căn giữa trên `ModalBarrier` tối. Body layout: `Column` → title "Xác nhận" (`AppTextStyle.textHeadingH3`, `AppColors.textPrimary`, `TextAlign.center`) → `Gap(AppSizes.spacing8)` → body "Bạn có chắc chắn muốn xóa nhóm vật tư hàng hoá $groupName không?" (`AppTextStyle.textCaptionC5`) → `Divider(thickness: 1, color: AppColors.borderPrimary)` → footer Row: `AppButton/Huỷ` (Expanded, secondary) + `AppButton/Xác nhận` (Expanded, primary blue).
- **State transition**: `MaterialGroupDeleteCubit` khởi tạo ở `initial` — không dispatch gì tại bước show dialog.
- **Widget**: `lib/ui/inventory_catalog/material_group_delete/widgets/material_group_confirm_delete_dialog.dart` (NEW, StatelessWidget).
- **GraphQL op**: chưa gọi — bước này chỉ UI xác nhận intent.
- **i18n key (ARB)**: `mat_grp_delete_confirm_title` ("Xác nhận"), `mat_grp_delete_confirm_body` ("Bạn có chắc chắn muốn xóa nhóm vật tư hàng hoá {groupName} không?").
- **a11y**: `Semantics(label: "Hộp thoại xác nhận xóa nhóm $groupName", container: true)` bọc popover; icon Xóa trong list: `Semantics(label: "Xóa nhóm $groupName", button: true)`.
- **Ref**: Figma node `21254:52061` (wave03-cat-grp-delete.md §Screen: Popup xác nhận).

#### AC-2 → Mobile gọi mutation xóa và xử lý kết quả thành công

- **Khi**: người dùng nhấn "Xác nhận" trong `MaterialGroupConfirmDeleteDialog`.
- **Mobile phải**: dispatch `cubit.deleteGroup(groupId)` → state `loading` (nút Xác nhận chuyển `CircularProgressIndicator` inline, dialog non-interactive, prevent double-tap qua `state.isLoading ? null : cubit.deleteGroup` pattern) → `MaterialGroupRepository.deleteMaterialGroup(id)` gọi mutation `deleteMaterialGroup(id: Int!)` (xem §6.1) → nhận `ApiResponseString { success: true }` → state `success` → `Navigator.pop(context)` đóng dialog → trigger list refresh tại `MaterialGroupListPage` (cubit event hoặc callback) → `ScaffoldMessenger.showSnackBar(...)` hiển thị `mat_grp_delete_success_msg`.
- **State transition**: `initial → loading → success`.
- **Widget**: nút Xác nhận trong `MaterialGroupConfirmDeleteDialog` — `AppButton.text(title: l10n.mat_grp_delete_confirm_label, appButtonSize: AppButtonSize.small(), appButtonColor: AppButtonColor.primary(), onPress: state.isLoading ? null : () => cubit.deleteGroup(groupId))`.
- **GraphQL op**: `deleteMaterialGroup(id: Int!)` — xem §6.1.
- **i18n key (ARB)**: `mat_grp_delete_confirm_label` ("Xác nhận"), `mat_grp_delete_success_msg` ("Xóa nhóm vật tư thành công").
- **a11y**: khi loading, nút thay bằng `CircularProgressIndicator` với `Semantics(label: "Đang xóa nhóm vật tư", button: false)`.
- **Ref**: BFF `FEAT-CAT-GRP-DELETE §6.1` op `deleteMaterialGroup`; Figma node `21254:52061` `AppButton/XácNhận` — bg `AppColors.bgActive` (#0052ff), KHÔNG danger-red (Figma §PNG `21254-52061-confirm-popover.png` xác nhận màu primary blue, anti-invent M-24).

#### AC-3 → Mobile đóng dialog khi người dùng nhấn Huỷ

- **Khi**: người dùng nhấn "Huỷ" trong `MaterialGroupConfirmDeleteDialog`.
- **Mobile phải**: gọi `Navigator.pop(context)` → dialog đóng; không gọi mutation, không thay đổi danh sách; `MaterialGroupDeleteCubit` giữ nguyên state `initial`.
- **State transition**: không thay đổi — list undisturbed.
- **Widget**: `AppButton.text(title: l10n.mat_grp_delete_cancel_label, appButtonSize: AppButtonSize.small(), appButtonColor: AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary), onPress: () => Navigator.pop(context))`.
- **GraphQL op**: không gọi.
- **i18n key (ARB)**: `mat_grp_delete_cancel_label` ("Huỷ" — dấu hỏi, KHÔNG "Hủy" dấu nặng per Figma PNG verbatim).
- **a11y**: `Semantics(label: "Huỷ xóa nhóm", button: true)` cho nút Huỷ.
- **Ref**: Figma node `21254:52061` `AppButton/Huỷ`.

### Cluster B — Chặn xóa (AC-4, AC-5)

#### AC-4 → Mobile hiển thị dialog không thể xóa khi nhóm đã có mã sản phẩm nội bộ

- **Khi**: mutation `deleteMaterialGroup` trả về `ErrorResponse { code: "ERR-INV-004", statusCode: 409 }` — nhóm có `internal_product` gắn vào, BR-CAT-GRP-010 bị vi phạm. Bao gồm cả edge case EC-1 (concurrent attach giữa lúc user tap và server check).
- **Mobile phải**: state `loading → error(CannotDeleteReason.hasProducts)` → `Navigator.pop(context)` đóng confirm dialog → `showDialog(...)` mở `MaterialGroupCannotDeleteDialog(groupName, reason: CannotDeleteReason.hasProducts)` — popover 343×222, cùng border-radius/shadow/bg với confirm dialog, title "Không thể xóa" (`AppTextStyle.textHeadingH3`), body "Nhóm vật tư hàng hoá $groupName đã phát sinh mã sản phẩm nội bộ nên không được xóa." (`AppTextStyle.textCaptionC5`, `maxLines: 3`, `TextAlign.center`), `Divider`, single `AppButton/Đóng` (full-width, secondary grey).
- **Widget**: `lib/ui/inventory_catalog/material_group_delete/widgets/material_group_cannot_delete_dialog.dart` (NEW — shared widget dùng `CannotDeleteReason` enum per _decisions.md 2026-06-29).
- **GraphQL op**: response từ `deleteMaterialGroup` — xem §6.1.
- **i18n key (ARB)**: `mat_grp_cannot_delete_title` ("Không thể xóa"), `mat_grp_cannot_delete_has_products_body` ("Nhóm vật tư hàng hoá {groupName} đã phát sinh mã sản phẩm nội bộ nên không được xóa.").
- **a11y**: `Semantics(liveRegion: true)` bọc dialog — TalkBack/VoiceOver announce khi modal hiện.
- **Ref**: BE `FEAT-CAT-GRP-DELETE §9` BR-CAT-GRP-010 (primary enforce tại `MaterialGroupService.deleteMaterialGroup()`); Figma node `21254:52450` (wave03-cat-grp-delete.md §Screen: Popup không thể xoá).

#### AC-5 → Mobile hiển thị dialog không thể xóa khi nhóm còn nhóm con

- **Khi**: mutation `deleteMaterialGroup` trả về `ErrorResponse { code: "ERR-INV-005", statusCode: 409 }` — nhóm vẫn có `material_group` con trỏ về, BR-CAT-GRP-011 bị vi phạm.
- **Mobile phải**: state `loading → error(CannotDeleteReason.hasChildren)` → đóng confirm dialog → mở `MaterialGroupCannotDeleteDialog(groupName, reason: CannotDeleteReason.hasChildren)` — cùng layout 343×222 với title "Không thể xóa", body switching sang `mat_grp_cannot_delete_has_children_body`, single "Đóng" button. Logic xử lý giống AC-4 nhưng `reason` khác → body text khác.
- **Widget**: cùng `MaterialGroupCannotDeleteDialog` với `reason: CannotDeleteReason.hasChildren` — switch body text theo enum.
- **GraphQL op**: response từ `deleteMaterialGroup` — xem §6.1.
- **i18n key (ARB)**: `mat_grp_cannot_delete_has_children_body` ("Nhóm vật tư hàng hóa {groupName} còn nhóm con, vui lòng xóa hết nhóm con trước khi xóa nhóm cha.").
- **a11y**: `Semantics(liveRegion: true)` — cùng AC-4.
- **Ref**: BE `FEAT-CAT-GRP-DELETE §9` BR-CAT-GRP-011 (primary enforce); Figma node `21254:52450` (cùng screen, body text thay đổi theo reason).

### Cluster C — Phân quyền (AC-6)

#### AC-6 → Mobile render icon Xóa theo RBAC và persona

- **Khi**: người dùng (`garage-owner` hoặc `accountant`) truy cập màn hình danh sách nhóm vật tư.
- **Mobile phải**: kiểm tra auth context permission → render icon Xóa trong row actions cho cả hai persona. Per source AC-6: "cả hai vai trò đều xóa được với quyền ngang nhau." Icon ẩn khi persona không hợp lệ (wrap bằng `Visibility(visible: authContext.canDeleteMaterialGroup, child: ...)` hoặc permission guard tương đương).
- **State transition**: conditional render — không có state machine.
- **Widget**: icon Xóa trong `MaterialGroupListPage` row actions — `Semantics(label: "Xóa nhóm $groupName", button: true, excludeSemantics: !canDelete)`.
- **GraphQL op**: không có.
- **i18n key (ARB)**: không có (icon-only button, label qua Semantics).
- **NEED CONFIRMATION (1/2)**: BE spec có NEED CONFIRMATION về RBAC — suy luận chỉ `garage-owner` được xóa (conflict với source AC-6 cho phép cả hai). Mobile spec theo source AC-6. Architecture Authority cần resolve trước merge, cập nhật permission key scope nếu cần.
- **Ref**: Source FEAT AC-6; BE `FEAT-CAT-GRP-DELETE §4.2` (NEED CONFIRMATION); `_decisions.md` 2026-06-29 RBAC entry.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- **Confirm popover** (Figma `21254:52061`): `Container(width: 343, height: 202, decoration: BoxDecoration(color: AppColors.bgBase, borderRadius: BorderRadius.circular(12), boxShadow: AppShadows.boxShadow))` — KHÔNG dùng Material `AlertDialog` built-in padding/shape vì Figma spec là custom Container.
- **CannotDelete popover** (Figma `21254:52450`): cùng decoration, `height: 222` (taller — body 3 dòng thay vì 2 dòng).
- **Title**: `AppTextStyle.textHeadingH3` (18px, weight=700) + `AppColors.textPrimary` + `TextAlign.center`.
- **Body**: `AppTextStyle.textCaptionC5` (14px, weight=400) + `AppColors.textPrimary` + `TextAlign.center`; body là dynamic string `$groupName`.
- **Spacing**: `Gap(AppSizes.spacing8)` giữa title và body (Figma padding parent handles title/body grouping).
- **Divider**: `Divider(thickness: 1, color: AppColors.borderPrimary)` giữa body section và footer.
- **Nút Huỷ / Đóng**: `AppButtonColor.custom(background: AppColors.buttonBackgroundSecondary, text: AppColors.textPrimary)`, `AppButtonSize.small()` (h=36dp), `AppTextStyle.textSubtitleS5` (14px, weight=600).
- **Nút Xác nhận**: `AppButtonColor.primary()` (bg `AppColors.bgActive` #0052ff, text `AppColors.textWhite`) — **KHÔNG danger-red**: Figma §PNG xác nhận primary blue DELETE confirmation pattern.
- **Backdrop**: `showDialog(barrierColor: Colors.black54)` — backdrop opacity ~0.5 per Figma widget tree.
- **KHÔNG** hardcode `Color(0xFF...)` / `TextStyle(...)` / raw int literal.

### 4.2 State machine + error handling

- Cubit state tường minh: `initial | loading | success | error(CannotDeleteReason reason, String code)`.
- `loading`: nút Xác nhận → `CircularProgressIndicator` inline; form non-interactive (prevent double-submit).
- `success`: đóng confirm dialog → trigger list refresh → `ScaffoldMessenger.showSnackBar(...)`.
- `error(ERR-INV-004)`: đóng confirm → mở CannotDelete dialog (reason=hasProducts).
- `error(ERR-INV-005)`: đóng confirm → mở CannotDelete dialog (reason=hasChildren).
- `error(network)`: đóng confirm → SnackBar generic "Không có kết nối mạng, vui lòng thử lại".
- KHÔNG silent fail — log error qua Sentry/equivalent trước khi dispatch error state.

### 4.3 Native interaction + permission

- Không cần camera/storage/location permission cho delete flow.
- Không có deeplink target cho delete action.
- Android back button trong dialog: `PopScope(onPopInvoked: (didPop) => ...)` → back = cancel (AC-3 behaviour), KHÔNG xóa.

### 4.4 Offline + connectivity

- Delete là online-required — KHÔNG offline queue (delete không an toàn để queue: race condition, non-idempotent từ server perspective khi record đã xóa).
- Khi offline: mutation fail với network error → SnackBar "Không có kết nối mạng, vui lòng thử lại" (AC-2 error path).
- Sau delete success: invalidate/refetch graphql_flutter cache cho `searchMaterialGroups` query để list phản ánh thay đổi.

### 4.5 i18n + a11y

- Mọi label string qua ARB key (`mobile/gf-garage-app/lib/l10n/intl_en.arb` + `intl_vi.arb`) — KHÔNG hardcode tiếng Việt inline.
- Diacritics bắt buộc: "Huỷ" (dấu hỏi ỷ) KHÔNG "Hủy" (dấu nặng ụ) — per Figma PNG `21254-52061-confirm-popover.png` verbatim.
- a11y: dialog title announce khi mở (`Semantics(liveRegion: true)` trên CannotDelete dialog); icon Xóa có `Semantics(label: ..., button: true)`; backdrop/barrier dùng `excludeSemantics: true`; icon ẩn khi RBAC off dùng `excludeSemantics: true` trong Visibility wrapper.
- Tap target icon Xóa ≥ 48dp.
- Contrast: `AppColors.textPrimary` trên `AppColors.bgBase` — WCAG AA.

### 4.6 RBAC render + feature flag

- **NEED CONFIRMATION (2/2)**: tên permission key `canDeleteMaterialGroup` là placeholder — dev phải map đúng tên constant từ `lib/core/auth/` hoặc auth context object trước impl. Pattern từ FEAT-CAT-GRP-DETAIL: `authContext.canEdit` / `authContext.canDelete` (NEED CONFIRMATION tên thực tế).
- Per source AC-6: cả `garage-owner` và `accountant` đều được xóa — cả hai persona nhìn thấy icon Xóa. Khi Architecture Authority resolve conflict với BE spec → cập nhật nếu cần giới hạn về `garage-owner` only.
- Không có feature flag riêng cho delete — flag inventory_catalog_enabled (nếu tồn tại trong codebase) kiểm soát toàn slice.

### 4.7 Business rule secondary (UI hint)

- **BR-CAT-GRP-010** (BE primary): Mobile không pre-check client-side. Chỉ hiển thị `MaterialGroupCannotDeleteDialog(reason: hasProducts)` khi server trả ERR-INV-004. Lý do không pre-check: race condition EC-1 chỉ BE detect chính xác tại thời điểm delete.
- **BR-CAT-GRP-011** (BE primary): Chỉ hiển thị `MaterialGroupCannotDeleteDialog(reason: hasChildren)` khi server trả ERR-INV-005. Tương tự — BE là SSOT check.

### 4.8 Performance

- `MaterialGroupConfirmDeleteDialog` và `MaterialGroupCannotDeleteDialog` là `StatelessWidget` — không cần `BlocBuilder` phức tạp; cubit/state inject qua constructor hoặc `context.read`.
- 1 widget `MaterialGroupCannotDeleteDialog` dùng chung (reason enum) — không inflate 2 dialog widget riêng, build cost tối thiểu.
- Tránh rebuild toàn `MaterialGroupListPage` sau delete — dùng localized callback/event để chỉ reload list data.
- KHÔNG dùng `infinite_scroll_pagination` (NOT in pubspec) — không apply cho delete dialog flow.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| `ERR-INV-004` | Dialog (cannot-delete, reason=hasProducts) | `MaterialGroupCannotDeleteDialog` | AC-4 |
| `ERR-INV-005` | Dialog (cannot-delete, reason=hasChildren) | `MaterialGroupCannotDeleteDialog` | AC-5 |
| Network error / timeout | SnackBar | `ScaffoldMessenger.of(context).showSnackBar(...)` | AC-2 |
| Unknown server error (5xx) | SnackBar generic | `ScaffoldMessenger.of(context).showSnackBar(...)` | AC-2 |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> **DIV-07 NEED CONFIRMATION (Architecture Authority)**: figma-mobile spec sử dụng node IDs `21254:52061` (confirm) và `21254:52450` (cannot-delete). Oracle PNG trong git cites `21254:52182` / `21254:52571`. Registry canonical = `21555:24250`. Defer per CR-20260630-01 P1.4. Dev xác nhận node canonical trước khi finalise visual detail.

> **PATH CANONICAL Garage mobile**: `lib/ui/{domain}/{sub_feature}/{name}.dart` (flat 3-level). Class suffix `*Dialog` / `*Handler` / `*Cubit` / `*State`. KHÔNG nest `presentation/screens/`.

### 5.1 Pages

> Không có trang mới — delete là handler + dialog overlay (no new `@RoutePage`). Entry point là trang danh sách hiện có.

| Page | auto_route path (@RoutePage) | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `MaterialGroupListPage` | `/inventory-catalog/groups` (existing) | MODIFY — thêm icon Xóa trong row actions + gọi `MaterialGroupDeleteHandler.show()` | `21555:24250` (section parent) | AC-1, AC-6 |

### 5.2 Widgets

> Author scanned §G.X — KG `implementation.components` không available (bundle §G.X stub); spec dùng naming-convention inference (App* → share/, Custom* → customs/). **NEED CONFIRMATION**: dev phải verify layer paths thực tế trước impl.
>
> Phantom widget forbidden: `AppBottomSheet` / `EmptyStateWidget` / `AppTextarea` NOT EXISTS. `showDialog` + Flutter built-in mechanism là cách đúng.
>
> **Reuse pattern (priority: customs > share > ui)**

| Widget | Path | Change type | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|
| `MaterialGroupConfirmDeleteDialog` | `lib/ui/inventory_catalog/material_group_delete/widgets/material_group_confirm_delete_dialog.dart` | NEW | StatelessWidget | Build-new — justification: dialog custom Container 343×202 với layout Column + footer 2-button Row per Figma `21254:52061`; no matching component ở customs/share/ui sau §G.X scan (domain-new, popover format không khớp generic AlertDialog). Entry via `showDialog(context, builder)`. | AC-1, AC-2, AC-3 |
| `MaterialGroupCannotDeleteDialog` | `lib/ui/inventory_catalog/material_group_delete/widgets/material_group_cannot_delete_dialog.dart` | NEW | StatelessWidget | Build-new — justification: shared-reason widget (`enum CannotDeleteReason { hasProducts, hasChildren }`) switch body text theo reason; 1 widget cho ERR-INV-004 + ERR-INV-005; Container 343×222 per Figma `21254:52450`; no match ở 3 layers (domain-new). _decisions.md 2026-06-29: dùng 1 widget thay 2. | AC-4, AC-5 |
| `AppButton` | `lib/ui/widgets/button/app_button.dart` (NEED CONFIRMATION path — inference App* = share/) | REUSE | StatelessWidget | Priority 2 — share/ (naming-convention inference; dev verify actual path). Dùng `AppButton.text(title, appButtonSize, appButtonColor, onPress)`. | AC-1, AC-2, AC-3, AC-4, AC-5 |
| `MaterialGroupDeleteHandler` | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_handler.dart` | NEW | — (static utility) | Build-new — justification: orchestration class `show(BuildContext, int, String)` để tách logic delete flow khỏi list page; no fit ở 3 layers (domain-specific orchestrator). | AC-1 – AC-5 |

### 5.3 Navigation

| Trigger | Mechanism | Notes | AC ref |
|---|---|---|---|
| Tap icon Xóa | `MaterialGroupDeleteHandler.show(context, id, name)` | `showDialog(context, builder, barrierDismissible: false)` — overlay trên current route, không tạo route mới | AC-1 |
| Nhấn Huỷ | `Navigator.pop(context)` | Đóng confirm dialog; không navigate | AC-3 |
| Nhấn Đóng | `Navigator.pop(context)` | Đóng cannot-delete dialog; không navigate | AC-4, AC-5 |
| Delete success | `Navigator.pop(context)` + callback list reload | Đóng confirm dialog sau success | AC-2 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events/States | AC ref |
|---|---|---|---|---|
| Delete async flow | Cubit | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_cubit.dart` | `deleteGroup(int id)` → `initial → loading → success / error(CannotDeleteReason, code)`; extends `BaseCubit<MaterialGroupDeleteState>`, `@Injectable` | AC-1 – AC-6 |
| State union | @freezed | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_state.dart` + `.freezed.dart` (generated) | `MaterialGroupDeleteInitial \| MaterialGroupDeleteLoading \| MaterialGroupDeleteSuccess \| MaterialGroupDeleteError(CannotDeleteReason reason, String errorCode)` | AC-2, AC-4, AC-5 |
| Reason enum | Dart enum | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_cubit.dart` (hoặc separate `material_group_delete_types.dart`) | `enum CannotDeleteReason { hasProducts, hasChildren }` | AC-4, AC-5 |

---

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter | Repository class | AC ref |
|---|---|---|---|---|
| `deleteMaterialGroup` | mutation | `_graphQLService.client.mutate(MutationOptions(document: gql(r'mutation DeleteMaterialGroup($id: ID!) { deleteMaterialGroup(id: $id) { ... on DeleteMaterialGroupResponse { success code message } ... on ErrorResponse { id code serverResponse message statusCode path timestamp details } } }'), variables: {'id': id}))` | `lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` (`InventoryCatalogRepository`, consolidated cross-domain) | AC-2, AC-4, AC-5 |

> Mutation `deleteMaterialGroup(id: ID!): DeleteResponse!` (union `DeleteMaterialGroupResponse | ErrorResponse`) — source: BFF `FEAT-CAT-GRP-DELETE §6.1`. **Sửa 2026-07-01**: `id` scalar đúng `ID!` (không phải `Int!`); response union type tên đúng `DeleteMaterialGroupResponse` (KHÔNG phải `ApiResponseString` — type không tồn tại trong `inventory_catalog_document.dart`).
>
> Response mapping (verified khớp `material_group_delete_handler.dart` thật):
> - `success == true` → dispatch success → đóng dialog + refresh list.
> - `__typename == "ErrorResponse" && code == "ERR-INV-004"` → dispatch `error(CannotDeleteReason.hasProducts, "ERR-INV-004")`.
> - `__typename == "ErrorResponse" && code == "ERR-INV-005"` → dispatch `error(CannotDeleteReason.hasChildren, "ERR-INV-005")`.
> - Network exception / null response → dispatch `error(null, "NETWORK_ERROR")` → SnackBar generic.
> - Khác → dispatch `error(null, code)` → SnackBar generic.

### 6.2 REST endpoints consumed direct (bypass BFF)

Không có — mobile chỉ gọi BFF qua GraphQL mutation.

### 6.3 Offline-first strategy

| Concern | Strategy | AC ref |
|---|---|---|
| Offline mode | Online-required — delete không offline-queue (race condition risk); khi offline: mutation fail với network exception → SnackBar lỗi | AC-2 |
| Cache invalidation sau delete | graphql_flutter store: refetch `searchMaterialGroups` query hoặc remove deleted entity từ store sau success state | AC-2 |

### 6.4 Platform-specific behaviors

| Concern | iOS | Android | Notes |
|---|---|---|---|
| Modal dialog | `showDialog` cross-platform | `showDialog` cross-platform | Flutter unified — không có khác biệt |
| Back button | N/A (swipe-back iOS) | Android hardware back → cancel (AC-3 behaviour) | `PopScope(canPop: !state.isLoading, ...)` — block pop khi loading |

---

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| Handler | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_handler.dart` | NEW | Static utility `MaterialGroupDeleteHandler.show(BuildContext, int, String)` — orchestrate dialog sequence (confirm → delete → success/error) | ~60 | AC-1, AC-2, AC-3, AC-4, AC-5 |
| Cubit | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_cubit.dart` | NEW | Cubit (extends `BaseCubit<MaterialGroupDeleteState>`, `@Injectable`) — method `deleteGroup(int id)` | ~80 | AC-2, AC-4, AC-5 |
| State | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_state.dart` + `.freezed.dart` (generated) | NEW | `@freezed` union state — 4 variants: Initial/Loading/Success/Error | ~60 | AC-2, AC-4, AC-5 |
| Widget — confirm | `lib/ui/inventory_catalog/material_group_delete/widgets/material_group_confirm_delete_dialog.dart` | NEW | StatelessWidget — popover 343×202 per Figma `21254:52061` | ~90 | AC-1, AC-2, AC-3 |
| Widget — cannot-delete | `lib/ui/inventory_catalog/material_group_delete/widgets/material_group_cannot_delete_dialog.dart` | NEW | StatelessWidget — popover 343×222, `CannotDeleteReason` enum per Figma `21254:52450` + _decisions.md | ~80 | AC-4, AC-5 |
| Repository | `lib/core/repositories/inventory_catalog/material_group_repository.dart` | ADDITIVE — method `Future<void> deleteMaterialGroup(int id)` | `@LazySingleton(as: MaterialGroupRepository)`, GraphQL mutation call trực tiếp qua `_graphQLService` | ~30 | AC-2 |
| List page | `lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart` | MODIFY — thêm delete icon trong row actions + RBAC conditional render + `MaterialGroupDeleteHandler.show()` call | REUSE existing page | ~25 | AC-1, AC-6 |
| i18n | `mobile/gf-garage-app/lib/l10n/intl_vi.arb` + `intl_en.arb` | ADDITIVE | ARB key entries — 9 keys | ~18 | AC-1, AC-2, AC-3, AC-4, AC-5 |
| Unit test | `test/ui/inventory_catalog/material_group_delete/material_group_delete_cubit_test.dart` | NEW | bloc_test + mocktail — 6 cases: happy path, ERR-INV-004, ERR-INV-005, network error, loading guard, RBAC | ~130 | AC-2, AC-4, AC-5, AC-6 |
| Widget test | `test/ui/inventory_catalog/material_group_delete/widgets/material_group_delete_dialogs_test.dart` | NEW | flutter_test — dialog render + interaction: tap Xác nhận, tap Huỷ, tap Đóng, loading state | ~110 | AC-1, AC-3, AC-4, AC-5 |

---

## 8. Implementation sequence DAG (Mobile — S6)

```
(← BFF tier S5: deleteMaterialGroup mutation SDL + resolver stable)

S6  Mobile delete handler + dialogs (Flutter)
    Entry: BFF S5 stable (mutation queryable) + DIV-07 figma node confirmed + RBAC permission key confirmed
    Exit: widget test green + Patrol E2E happy path + cannot-delete error path green
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | State + Cubit: `MaterialGroupDeleteState` (@freezed) + `MaterialGroupDeleteCubit` | `material_group_delete/` | — | Unit test: deleteGroup happy path + ERR-INV-004 + ERR-INV-005 + network error green | — |
| S6.2 | Repository ADDITIVE method `deleteMaterialGroup(int id)` | `lib/core/repositories/inventory_catalog/` | S6.1 | Repository unit test: mutation call + header propagation verified (mock GraphQLService) | S6.1 |
| S6.3 | Dialog widgets: `MaterialGroupConfirmDeleteDialog` + `MaterialGroupCannotDeleteDialog` | `material_group_delete/widgets/` | S6.2 + DIV-07 node confirmed | Widget test: golden render + tap interactions (Huỷ, Xác nhận loading, Đóng) | S6.2 |
| S6.4 | Handler: `MaterialGroupDeleteHandler.show()` — orchestrate dialog sequence | `material_group_delete/` | S6.3 | Handler integration test: confirm flow → success, error flow → cannot-delete dialog | S6.3 |
| S6.5 | Modify `MaterialGroupListPage`: delete icon + RBAC render + handler call | `material_group_list/` | S6.4 + RBAC permission key confirmed | Integration: list → delete icon visible per RBAC → confirm flow → success | S6.4 |
| S6.6 | i18n ARB entries (9 keys) | `lib/l10n/` | S6.3 | `flutter gen-l10n` pass; no hardcoded vi string | S6.3 |
| S6.7 | Patrol E2E | `integration_test/` | S6.5 + S6.6 + BFF S5 | Happy path + ERR-INV-004 block + cancel path green | S6.5, S6.6 |

---

## 9. Business Rules to enforce (Mobile — UI hint secondary)

> Mobile KHÔNG enforce BR primary. BE là SSOT (xem `features/be/FEAT-CAT-GRP-DELETE.md §9`). Mobile chỉ display-only response.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-010` | CORNERSTONE | Mở `MaterialGroupCannotDeleteDialog(reason: hasProducts)` khi ERR-INV-004 | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_cubit.dart::_handleError()` | AC-4 | BE primary enforce; Mobile display-only relay |
| `BR-CAT-GRP-011` | CORNERSTONE | Mở `MaterialGroupCannotDeleteDialog(reason: hasChildren)` khi ERR-INV-005 | `lib/ui/inventory_catalog/material_group_delete/material_group_delete_cubit.dart::_handleError()` | AC-5 | BE primary enforce; Mobile display-only relay |
| RBAC (garage-owner + accountant) | CORNERSTONE | Ẩn icon Xóa khi `!authContext.canDeleteMaterialGroup` | `lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart` | AC-6 | Permission key name NEED CONFIRMATION; source AC-6: cả 2 persona được xóa |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-GRP-DELETE.md §9` — BR-CAT-GRP-010 + BR-CAT-GRP-011 tại `MaterialGroupService.deleteMaterialGroup()`).

---

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (dialog display) | test-mobile-ui | Verify `MaterialGroupConfirmDeleteDialog` renders: title/body/divider/2-button footer per Figma `21254:52061`; barrierDismissible=false |
| AC-2 | bloc_test (happy path) + Widget test (loading state) | test-mobile-ui | `cubit.deleteGroup(id)` → loading → success; nút disabled khi loading; mock repository trả success |
| AC-3 | Widget test (cancel interaction) | test-mobile-ui | Tap "Huỷ" → `Navigator.pop` called; cubit state unchanged; list không reload |
| AC-4 | bloc_test (ERR-INV-004) + Widget test | test-mobile-ui | Mock repository trả `ErrorResponse{code: ERR-INV-004}` → state `error(hasProducts)` → `MaterialGroupCannotDeleteDialog(reason: hasProducts)` rendered |
| AC-5 | bloc_test (ERR-INV-005) + Widget test | test-mobile-ui | Mock repository trả `ErrorResponse{code: ERR-INV-005}` → state `error(hasChildren)` → `MaterialGroupCannotDeleteDialog(reason: hasChildren)` rendered |
| AC-6 | Widget test (RBAC visibility) | test-mobile-ui + test-isolation | Delete icon visible khi canDelete=true, hidden khi canDelete=false; dual persona token |
| (smoke) | Patrol E2E — happy path | test-mobile-e2e | list → tap delete icon → confirm dialog hiện → nhấn Xác nhận → success SnackBar → list refreshed (group không còn) |
| (negative) | Patrol E2E — cannot-delete | test-mobile-e2e | Mock BFF ERR-INV-004 → CannotDelete dialog hiện → nhấn Đóng → back to list (undisturbed) |
| (edge) | Patrol E2E — cancel | test-mobile-e2e | Tap delete icon → confirm dialog → nhấn Huỷ → dialog đóng, list unchanged |

---

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

> ARB files: `mobile/gf-garage-app/lib/l10n/intl_vi.arb` + `intl_en.arb`. Tham số dùng ICU placeholder `{groupName}`.

| Key | vi | en | AC ref |
|---|---|---|---|
| `mat_grp_delete_confirm_title` | "Xác nhận" | "Confirm" | AC-1 |
| `mat_grp_delete_confirm_body` | "Bạn có chắc chắn muốn xóa nhóm vật tư hàng hoá {groupName} không?" | "Are you sure you want to delete material group {groupName}?" | AC-1 |
| `mat_grp_delete_cancel_label` | "Huỷ" | "Cancel" | AC-3 |
| `mat_grp_delete_confirm_label` | "Xác nhận" | "Confirm" | AC-2 |
| `mat_grp_delete_success_msg` | "Xóa nhóm vật tư thành công" | "Material group deleted successfully" | AC-2 |
| `mat_grp_cannot_delete_title` | "Không thể xóa" | "Cannot Delete" | AC-4, AC-5 |
| `mat_grp_cannot_delete_has_products_body` | "Nhóm vật tư hàng hoá {groupName} đã phát sinh mã sản phẩm nội bộ nên không được xóa." | "Material group {groupName} has internal products and cannot be deleted." | AC-4 |
| `mat_grp_cannot_delete_has_children_body` | "Nhóm vật tư hàng hóa {groupName} còn nhóm con, vui lòng xóa hết nhóm con trước khi xóa nhóm cha." | "Material group {groupName} has sub-groups. Delete all sub-groups before deleting the parent." | AC-5 |
| `mat_grp_cannot_delete_close_label` | "Đóng" | "Close" | AC-4, AC-5 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `Semantics(label: "Xóa nhóm $groupName", button: true)` cho icon Xóa trong list | TalkBack/VoiceOver label rõ ràng |
| AC-1 | `Semantics(label: "Hộp thoại xác nhận xóa nhóm $groupName", container: true)` bọc `MaterialGroupConfirmDeleteDialog` | Dialog announce khi mở |
| AC-2 | Loading: `Semantics(label: "Đang xóa nhóm vật tư", button: false)` thay thế nút Xác nhận khi loading | Screen reader announce action in-progress |
| AC-3 | `Semantics(label: "Huỷ xóa nhóm", button: true)` cho nút Huỷ | Clear action label |
| AC-4, AC-5 | `Semantics(liveRegion: true)` bọc `MaterialGroupCannotDeleteDialog` | TalkBack/VoiceOver announce khi dialog hiện lên |
| AC-4, AC-5 | `Semantics(label: "Đóng hộp thoại", button: true)` cho nút Đóng | Clear dismiss action |
| AC-6 | `excludeSemantics: true` khi icon Xóa ẩn (Visibility widget hidden) | Tránh screen reader announce invisible element |

---

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-DELETE.md` | DRAFT | BR primary enforcement (BR-CAT-GRP-010/011 tại `MaterialGroupService.deleteMaterialGroup()`); produces ERR-INV-004/005; endpoint `DELETE /api/v2/material-groups/{id}`. Mobile reads error codes only — không impl BE logic. |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-DELETE.md` | DRAFT | GraphQL mutation `deleteMaterialGroup(id: Int!): DeleteResponse!` (§6.1); maps ERR-INV-004/005 → `ErrorResponse`. Mobile consume §6.1 op. BFF S5 phải stable trước Mobile S6. |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-DELETE.md` | PENDING | Cùng feature scope trên web — impl divergent (web dùng shadcn Dialog, mobile dùng Flutter `showDialog` + custom Container). Read-only reference; không copy impl từ web sang mobile. |

**Source ID consistency** (item #18): `source_feat_sha = c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277` — identical cross-tier (BE/BFF/Mobile).

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-DELETE.md`](../../../../../Product/features/FEAT-CAT-GRP-DELETE.md) v2
- **Paired BE**: [`features/be/FEAT-CAT-GRP-DELETE.md`](../be/FEAT-CAT-GRP-DELETE.md) (DRAFT)
- **Paired BFF**: [`features/bff/FEAT-CAT-GRP-DELETE.md`](../bff/FEAT-CAT-GRP-DELETE.md) (DRAFT)
- **Figma mobile**: [`Product/ux/figma-mobile/wave03-cat-grp-delete.md`](../../../../../Product/ux/figma-mobile/wave03-cat-grp-delete.md) node `21555:24250` (sections `21254:52061` + `21254:52450`)
- **UX Flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md) §3.1 EC-4
- **PKG**: [`Execution/work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.4
- **BR refs**: `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` — BR-CAT-GRP-010 + BR-CAT-GRP-011
- **Decisions log**: [`Execution/wave-specs/W03/_decisions.md`](../../../_decisions.md) — entries 2026-06-29 feature-mobile FEAT-CAT-GRP-DELETE (shared widget reason enum + DIV-07 node ID); entry 2026-06-30 feature-mobile FEAT-CAT-GRP-DELETE (RBAC follows source AC-6)
- **Fan-out map**: [`Execution/wave-specs/W03/_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **ADR-009**: No JPA relationship mapping — scalar FK only (referenced in BE tier)

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 2 | Delivery Authority (in-session full GraphQL re-audit — user request "check lại hết phần graphql của wave 3") | **Fix §6.1 2 drift vs code ground-truth** (`inventory_catalog_document.dart`): `id: Int!` → `id: ID!`; response union type `ApiResponseString` → `DeleteMaterialGroupResponse` (type cũ không tồn tại). Error code mapping ERR-INV-004/005 verified khớp `material_group_delete_handler.dart` thật — giữ nguyên, không đổi. Đồng thời fix repository path (`material_group_repository.dart` → `inventory_catalog_repository.dart`, khớp BUG-W03-013 đã ratify). |
| 2026-06-30 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-CAT-GRP-DELETE` W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier byte-equal với BE), §2 trách nhiệm Mobile (handler + dialog overlay pattern, no new @RoutePage), §3 Mobile behaviour map 6/6 AC-IDs (AC-1 confirm dialog display; AC-2 mutation + success reload; AC-3 cancel/close; AC-4 ERR-INV-004 → CannotDelete hasProducts; AC-5 ERR-INV-005 → CannotDelete hasChildren; AC-6 RBAC icon conditional render), §4 ràng buộc (visual fidelity Figma SSOT + state machine + offline-required + i18n diacritics + a11y + RBAC NEED CONFIRMATION + BR secondary display-only + perf + error code mapping), §5 widget breakdown (MaterialGroupConfirmDeleteDialog build-new + MaterialGroupCannotDeleteDialog shared reason-enum build-new + AppButton reuse Priority 2 share/ + Handler build-new), §6 data integration (deleteMaterialGroup mutation response mapping), §7 file map 10 rows, §8 S6 DAG 7 steps (S6.1 cubit/state → S6.2 repo → S6.3 dialogs → S6.4 handler → S6.5 list-page → S6.6 i18n → S6.7 Patrol E2E), §9 BR secondary 3 entries, §10 test scope 9 rows, §11 i18n 9 ARB keys + a11y 7 entries, §12 cross-tier 3 tiers. 2 NEED CONFIRMATION markers: (1) RBAC permission key name + BE conflict resolve; (2) DIV-07 Figma node canonical defer CR-20260630-01 P1.4. Source FEAT chỉ audit. |
