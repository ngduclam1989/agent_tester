# BUGFIX — BUG-W03-043

> GRP-list + PROD-list item vẫn là flat row (không phải card) — thiếu radius/shadow, GRP list Scaffold sai nền
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`GroupListCard` (`material_group_list/widgets/group_list_card.dart`) và `InternalProductListCard`
(`widgets/internal_product_list_card.dart`) render `Container(decoration: BoxDecoration(color:
AppColors.bgBase, border: Border(bottom: BorderSide(...))))` — 1 flat row với đường kẻ dưới, giống
table row, KHÔNG phải card độc lập nổi trên nền. Figma (`wave03-cat-grp-list.md` §GroupListCard dòng
94-99, `wave03-cat-prod-list.md` dòng 74) yêu cầu: `Border: 0; radius=BorderRadius.circular(8);
Shadow: AppShadows.itemBoxShadow; Padding: EdgeInsets.all(AppSizes.spacing16)` — cùng pattern đã áp
dụng cho 4 card PROD-detail ở BUG-W03-034.

Đồng thời `material_group_list_page.dart` Scaffold dùng `backgroundColor: AppColors.bgBase` (trắng)
trong khi Figma yêu cầu `bg=AppColors.bgSecondary` (nền xám phía sau card trắng) — nền trắng + card
không shadow/radius khiến item hoà lẫn vào nền, đúng y hệt user report "item chưa thành card".
`internal_product_list_page.dart` Scaffold đã đúng sẵn `bgSecondary`.

## 2. Root cause

Card widget của LIST được viết độc lập với card widget của DETAIL (BUG-W03-034 fix trước đó chỉ áp
dụng cho 4 card trong `internal_product_detail_page.dart`) — cùng 1 lớp lỗi "flat `Container` +
`Border(bottom:)`" tái diễn ở bề mặt LIST vì không có cross-check giữa 2 bề mặt hiển thị cùng 1 entity
(list row vs detail card) khi cả hai đều nên theo cùng 1 "elevated card" design language. Scaffold
`bgBase` cho GRP list là leftover từ trước khi card có shadow — khi card chưa nổi trên nền, việc
Scaffold trắng hay xám không quan trọng trực quan; sau khi thêm shadow/radius, sai nền mới lộ rõ vì
không còn "kẻ dưới" phân tách các row.

## 3. Fix

### 3.1 `group_list_card.dart` + `internal_product_list_card.dart` — card decoration

```dart
// Bad — flat row:
padding: const EdgeInsets.symmetric(horizontal: AppSizes.spacing16, vertical: 12),
decoration: const BoxDecoration(
  color: AppColors.bgBase,
  border: Border(bottom: BorderSide(color: AppColors.borderPrimary, width: 1)),
),

// Good — elevated card per Figma (same pattern as BUG-W03-034 PROD-detail cards):
padding: const EdgeInsets.all(AppSizes.spacing16),
decoration: BoxDecoration(
  color: AppColors.bgBase,
  borderRadius: BorderRadius.circular(8),
  boxShadow: AppShadow.itemBoxShadow,
),
```

Thêm import `app_shadows.dart` ở cả 2 file.

### 3.2 `material_group_list_page.dart` — Scaffold nền + list spacing

```dart
// Bad:
backgroundColor: AppColors.bgBase,

// Good — light grey scroll bg behind white cards, per wave03-cat-grp-list.md dòng 44:
backgroundColor: AppColors.bgSecondary,
```

Card giờ không còn `Border(bottom:)` phân tách — cần khoảng cách giữa các card để không dính sát nhau.
`ListWidget` (`lib/ui/widgets/list/list_widget.dart`) đã có sẵn prop `padding`/`separatorHeight`
(dùng `ListView.separated` nội bộ) — không cần sửa shared widget, chỉ truyền thêm 2 param ở cả 2 list
page theo đúng Figma (`padding=EdgeInsets.all(AppSizes.spacing16)`,
`separator=Gap(AppSizes.spacing16)`):

```dart
ListWidget(
  ...
  padding: const EdgeInsets.all(AppSizes.spacing16),
  separatorHeight: AppSizes.spacing16,
  ...
)
```

Áp dụng cho cả `material_group_list_page.dart` VÀ `internal_product_list_page.dart` — cả 2 card giờ
đều mất border phân tách nên cả 2 list đều cần gap (PROD list Scaffold background giữ nguyên
`bgSecondary`, không đổi).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` | `Container` decoration: bỏ `Border(bottom:)`, thêm `borderRadius: BorderRadius.circular(8)` + `boxShadow: AppShadow.itemBoxShadow`; padding `symmetric(h:16,v:12)` → `all(spacing16)`; import `app_shadows.dart` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/internal_product_list_card.dart` | Same decoration/padding fix; import `app_shadows.dart` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart` | Scaffold `backgroundColor: AppColors.bgBase` → `AppColors.bgSecondary`; `ListWidget` thêm `padding: EdgeInsets.all(AppSizes.spacing16)` + `separatorHeight: AppSizes.spacing16` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart` | `ListWidget` thêm `padding: EdgeInsets.all(AppSizes.spacing16)` + `separatorHeight: AppSizes.spacing16` (Scaffold background KHÔNG đổi — đã đúng `bgSecondary` sẵn) |

## 5. Regression / verification

- `GroupListCard`/`InternalProductListCard` không có test widget riêng trước fix (grep xác nhận
  0 hit trong `test/`) — không có regression test hiện hữu nào cần cập nhật cho phần card decoration;
  không thêm test mới cho bug này (P2, thuần visual token swap, cùng pattern đã pin bởi
  `material_group_secondary_button_token_test.dart`-style static assertion ở các bug khác — không lặp
  lại instrument thêm ở đây để giữ blast-radius nhỏ).
- Manual verify: đối chiếu `AppShadow.itemBoxShadow` tồn tại đúng tên class/field trong
  `lib/core/common/styles/app_shadows.dart` (class `AppShadow`, không phải `AppShadows` — đã verify
  trước khi dùng, tránh lặp lỗi đoán tên class). Đối chiếu pattern y hệt với
  `internal_product_detail_page.dart` `_HeaderCard`/`_GeneralInfoCard` (BUG-W03-034) — cùng
  `BoxDecoration(color: AppColors.bgBase, borderRadius: BorderRadius.circular(8), boxShadow:
  AppShadow.itemBoxShadow)`, cùng `padding: EdgeInsets.all(AppSizes.spacing16)`.
- `python3 scripts/check-mobile-canonical-primitives.py --file <10 files sửa trong cycle này>` →
  **OK: 0 anti-pattern hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có toolchain trong environment này
  (`DEBT-W01-MOBILE-BUILD-ENV`). Manual verify: brace/paren balance kiểm tra bằng đọc lại toàn bộ diff;
  `AppSizes.spacing16` + `AppShadow.itemBoxShadow` + `ListWidget.padding`/`.separatorHeight` đều là
  API/token đã tồn tại sẵn trong repo (không cần thêm định nghĩa mới).

## 6. Non-goals / out of scope

- KHÔNG đổi `internal_product_list_page.dart` Scaffold `backgroundColor` — đã đúng `bgSecondary` từ
  trước.
- KHÔNG sửa `ListWidget` (shared widget) signature — chỉ truyền thêm 2 param đã tồn tại sẵn
  (`padding`, `separatorHeight`), không thay đổi behavior mặc định cho các consumer khác.
- KHÔNG đụng `StartInfoRow`/`StatusBadge`/`SectionDivider` hay bất kỳ cubit/state logic nào.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `GroupListCard`/`InternalProductListCard` decoration đổi flat-row `Border(bottom:)` sang elevated card (`borderRadius:8` + `AppShadow.itemBoxShadow`, `padding: all(spacing16)`); GRP list Scaffold `bgBase`→`bgSecondary`; cả 2 list page `ListWidget` thêm `padding`/`separatorHeight` (spacing16) để card không dính sát nhau sau khi mất border phân tách. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
