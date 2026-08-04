# BUGFIX — BUG-W03-044

> `_DetailFooter` role-gate ẩn mất nút Sửa/Xoá + background sai trên cả GRP-detail và PROD-detail (+ 2 form page cùng lỗi nền phát hiện qua audit)
> Severity: **P1** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

Hai vấn đề độc lập trên `material_group_detail_page.dart` (+ background trên
`internal_product_detail_page.dart`):

1. **Role-gate silently hides the whole footer.** `_DetailFooter.build()` đọc
   `getIt<AppPreferences>().getProfileLocal?.role`, và nếu role đó không khớp CHÍNH XÁC
   `UserRole.garage`/`UserRole.ca` (bao gồm cả trường hợp `getProfileLocal` trả `null` — xảy ra khi
   `keyProfile` chưa được seed vào local prefs trong phiên hiện tại, xem `share_preferences.dart:79`)
   thì `return const SizedBox.shrink();` — **toàn bộ** footer (cả Sửa lẫn Xoá) biến mất, không phải 1
   nút. Comment tại chỗ tự nhận guard này "defensive/no-op today" nhưng KHÔNG no-op trên thực tế —
   khớp đúng user report + screenshot "thiếu bottom buttons". Critical Rule #6 (dual persona only —
   garage-owner + accountant) và FEAT-CAT-GRP-DETAIL AC-6 đều yêu cầu CẢ 2 persona thấy Sửa/Xoá,
   KHÔNG có path ẩn theo role nào được đặc tả — không có persona thứ 3 nào cần phòng thủ, nên guard là
   rủi ro thuần tuý (silent full-footer disappearance) không tương ứng với bất kỳ yêu cầu nào.
2. **Wrong background token, cả GRP lẫn PROD detail, mỗi trang sai một hướng khác nhau.**
   `material_group_detail_page.dart` CustomScaffold dùng `AppColors.bgPrimary` (xám,
   `NeutralColor.s100`) trong khi Figma (`wave03-cat-grp-detail.md` dòng 29) yêu cầu `AppColors.bgBase`
   (trắng). `internal_product_detail_page.dart` cũng dùng `AppColors.bgPrimary` nhưng Figma
   (`wave03-cat-prod-detail.md` dòng 31) lại yêu cầu `AppColors.bgSecondary` (xám nhạt hơn,
   `NeutralColor.s50`) — trang này có 4 card `bgBase`+shadow (BUG-W03-034) nên cần nền xám phía sau để
   card nổi, cùng lý do với BUG-W03-043 (GRP-list). 2 trang cần 2 giá trị khác nhau.

Audit `grep -rn "AppColors.bgPrimary" lib/ui/inventory_catalog` phát hiện thêm 2 page cùng lỗi copy-
paste `bgPrimary`: `material_group_add/add_material_group_page.dart` và
`material_group_edit/edit_material_group_page.dart` — Figma của cả 2 (`wave03-cat-grp-create.md` dòng
30, `wave03-cat-grp-edit.md` dòng 32) đều yêu cầu `AppColors.bgBase`, không phải `bgPrimary`. 2 page
search (`material_group_search_page.dart`, `internal_product_search_page.dart`) cũng dùng `bgPrimary`
nhưng đã có comment xác nhận đúng theo Figma riêng của AppBar search — KHÔNG sửa.

## 2. Root cause

1. Role-gate: được thêm ở BUG-W03-020 như 1 phòng thủ "audit-friendly" cho 1 persona thứ 3 giả định
   trong tương lai, nhưng KHÔNG có cơ chế nào đảm bảo `getProfileLocal` luôn non-null + role luôn khớp
   enum tại thời điểm `_DetailFooter` build (không có loading-state guard, không fallback an toàn) —
   biến 1 "defensive no-op" thành 1 "silent regression trigger" bất cứ khi nào local prefs chưa seed
   đủ hoặc lệch serialize. Không có AC nào trong FEAT-CAT-GRP-DETAIL yêu cầu ẩn theo role — guard được
   thêm dựa trên suy đoán tương lai, không dựa trên spec thật.
2. Background: `AppColors.bgPrimary` dường như là giá trị mặc định bị copy-paste cho `CustomScaffold`
   khi khởi tạo các trang detail/form trong wave này — không tra Figma riêng từng trang. GRP-list
   (BUG-W03-043) cũng phát hiện đúng pattern lỗi tương tự (bgBase thay vì bgSecondary), xác nhận đây
   là 1 lớp lỗi hệ thống trong domain `inventory_catalog` chứ không phải sự cố cục bộ 1 trang.

## 3. Fix

### 3.1 `material_group_detail_page.dart` — bỏ hẳn role-gate

```dart
// Bad — silently hides Sửa + Xoá when getProfileLocal is null or role mismatches:
static bool _canManageGroup(UserRole? role) =>
    role == UserRole.garage || role == UserRole.ca;

Widget build(BuildContext context) {
  final currentRole = getIt<AppPreferences>().getProfileLocal?.role;
  if (!_canManageGroup(currentRole)) {
    return const SizedBox.shrink();
  }
  return SafeArea(...);
}

// Good — footer always renders (Critical Rule #6 — no role-gate needed, no 3rd persona to defend):
Widget build(BuildContext context) {
  return SafeArea(...);
}
```

Xoá theo đó 3 import không còn dùng: `core/common/bases/enum/user_role.dart`,
`core/local_storage/share_preferences.dart`, `injection_container.dart`.

### 3.2 Background token — 4 trang

```dart
// material_group_detail_page.dart — Figma wave03-cat-grp-detail.md dòng 29:
backgroundColor: AppColors.bgPrimary,   →   backgroundColor: AppColors.bgBase,

// internal_product_detail_page.dart — Figma wave03-cat-prod-detail.md dòng 31:
backgroundColor: AppColors.bgPrimary,   →   backgroundColor: AppColors.bgSecondary,

// add_material_group_page.dart — Figma wave03-cat-grp-create.md dòng 30 (audit finding):
backgroundColor: AppColors.bgPrimary,   →   backgroundColor: AppColors.bgBase,

// edit_material_group_page.dart — Figma wave03-cat-grp-edit.md dòng 32 (audit finding):
backgroundColor: AppColors.bgPrimary,   →   backgroundColor: AppColors.bgBase,
```

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | Xoá role-gate (`_canManageGroup` + `getProfileLocal` check) khỏi `_DetailFooter.build()` — footer luôn render; xoá 3 import không còn dùng; Scaffold `backgroundColor` `bgPrimary` → `bgBase` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | Scaffold `backgroundColor` `bgPrimary` → `bgSecondary` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart` | (audit finding) Scaffold `backgroundColor` `bgPrimary` → `bgBase` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_edit/edit_material_group_page.dart` | (audit finding) Scaffold `backgroundColor` `bgPrimary` → `bgBase` |

## 5. Regression / verification

- Không thêm widget test mới riêng cho footer-visibility — `_DetailFooter` là `private` class, và sau
  fix nó không còn CÓ ĐIỀU KIỆN nào để test (footer luôn render, không còn nhánh ẩn). Existing
  `material_group_secondary_button_token_test.dart` (BUG-W03-033) vẫn pass nguyên vẹn — chỉ assert
  `backgroundColor: AppColors.buttonBackgroundSecondary` cho nút Xoá, không liên quan tới role-gate
  hay Scaffold `backgroundColor` đã sửa.
- Manual verify: `grep -n "UserRole\|AppPreferences\|getIt(" material_group_detail_page.dart` sau fix
  → 0 hit ngoài comment giải thích lịch sử fix — xác nhận 3 import xoá đúng, không còn dead reference.
- `grep -rn "AppColors.bgPrimary" lib/ui/inventory_catalog` sau fix → chỉ còn 2 hit hợp lệ
  (`material_group_search_page.dart`, `internal_product_search_page.dart` — cả 2 đã có comment xác
  nhận đúng theo Figma AppBar search riêng, không sửa).
- `python3 scripts/check-mobile-canonical-primitives.py --file <files sửa>` → **OK: 0 anti-pattern
  hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có toolchain (`DEBT-W01-MOBILE-
  BUILD-ENV`). Manual verify: `AppColors.bgBase`/`AppColors.bgSecondary` đã tồn tại sẵn trong
  `app_colors.dart` (dùng nguyên xi ở các trang khác trong cùng domain), không cần định nghĩa mới.

## 6. Non-goals / out of scope

- KHÔNG sửa `material_group_search_page.dart`/`internal_product_search_page.dart` — 2 file này dùng
  `bgPrimary` ĐÚNG theo Figma AppBar search riêng (đã có comment xác nhận tại chỗ trước khi bug này
  được audit).
- KHÔNG thêm role-gate thay thế nào khác (vd feature flag) — Critical Rule #6 xác nhận KHÔNG có
  persona thứ 3 cần phòng thủ; nếu tương lai có yêu cầu ẩn theo role thật, đó là 1 CR/AC mới, không
  phải phục hồi guard cũ.
- KHÔNG đụng `onDelete`/`onEdit` callback logic, `MaterialGroupDeleteHandler`, hay bất kỳ navigation
  logic nào trong `_DetailFooter`.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — xoá role-gate khỏi `_DetailFooter` (footer luôn render, Critical Rule #6 dual-persona); Scaffold `backgroundColor` sửa `bgPrimary`→`bgBase` (GRP-detail) / `bgPrimary`→`bgSecondary` (PROD-detail); audit `bgPrimary` toàn domain phát hiện + fix thêm 2 form page (`add_material_group_page.dart`, `edit_material_group_page.dart`, cả 2 → `bgBase`). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
