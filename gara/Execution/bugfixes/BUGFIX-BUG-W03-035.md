# BUGFIX — BUG-W03-035

> GRP + PROD filter footer dùng flat `Border(top:)` thay vì rounded-corner + shadow "elevated card" style
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`material_group_filter_page.dart` (FEAT-CAT-GRP-LIST filter) và `internal_product_filter_page.dart` (FEAT-CAT-PROD-LIST filter) render `bottomNavigationBar` footer (2 nút "Thiết lập lại" / "Áp dụng") bên trong một `Container` decorated với `BoxDecoration(border: Border(top: BorderSide(color: AppColors.borderPrimary)))` — một đường kẻ mỏng flat separator. User (mobile dev) phát hiện trên máy thật rằng khu vực footer thực tế cần có **góc bo tròn phía trên + shadow nhẹ** ("elevated card" style), giống hệt style của nút "Thêm nhóm vật tư" (`BottomNavigationBarButton`, đã sửa đúng trước đó ở BUG-W03-025).

## 2. Root cause

Root cause là **transcription artifact** trong prefetch-figma spec, KHÔNG phải code logic: dòng "Border-top: 1px solid AppColors.borderPrimary" ở `wave03-cat-grp-list.md` §GroupFilterFooter (v cũ) và tương tự tại `wave03-cat-prod-list.md` KHÔNG có `_png_verified` citation kèm theo — nghĩa là claim này chưa từng được đối chiếu trực tiếp với screenshot thật. Đây CHÍNH XÁC cùng lớp lỗi đã sửa 1 lần trong wave này ở CR-20260701-06 cho `GroupListFooter` (nút đơn "Thêm nhóm vật tư"), nhưng lần fix đó chỉ verify code khớp spec text — KHÔNG đối chiếu lại PNG cho case **2-nút filter footer**, nên bỏ sót defect này.

Đối chiếu trực tiếp 2 screenshot oracle:
- `Product/ux/figma-mobile/assets/wave03-cat-grp-list/21252-49582-filter-filled.png`
- `Product/ux/figma-mobile/assets/wave03-cat-prod-list/21235-27908-filter-filled.png`

Cả 2 đều cho thấy rõ ràng góc bo tròn phía trên khu vực footer + shadow nhẹ phía trên — style "elevated card", KHÔNG phải đường kẻ thẳng ngang.

## 3. Fix

- Cả 2 file: `bottomNavigationBar` → `SafeArea(top:false) > Container.decoration` đổi từ

  ```dart
  decoration: const BoxDecoration(
    border: Border(top: BorderSide(color: AppColors.borderPrimary)),
  ),
  ```

  sang

  ```dart
  decoration: const BoxDecoration(
    color: AppColors.bgBase,
    borderRadius: BorderRadius.only(
      topLeft: Radius.circular(8),
      topRight: Radius.circular(8),
    ),
    boxShadow: [
      BoxShadow(color: Color(0x0F000000), blurRadius: 12, offset: Offset(0, -4)),
    ],
  ),
  ```

  — khớp **exact** shadow value (`Color(0x0F000000)`, `blurRadius: 12`, `offset: Offset(0, -4)`) + `borderRadius` value dùng bởi widget canonical `BottomNavigationBarButton` (`lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart`), đảm bảo visual consistency xuyên toàn app cho cùng 1 "bottom elevated bar" pattern.
- `Product/ux/figma-mobile/wave03-cat-grp-list.md` §GroupFilterFooter đã có correction sẵn (được đối tác sửa 2026-07-02, trước cycle này) — verify lại: correction khớp đúng những gì PNG thể hiện.
- `Product/ux/figma-mobile/wave03-cat-prod-list.md` §FilterFooter (node `21235-27908-filter-filled.png`) kiểm tra: **KHÔNG có** dòng "Border-top" sai — spec PROD chưa từng ghi claim này, nên không cần correction ở file này.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart` | `bottomNavigationBar` `Container.decoration`: `Border(top:)` → `BorderRadius.only(topLeft/topRight: 8)` + `boxShadow` + `color: AppColors.bgBase` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | Cùng thay đổi decoration |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_footer_fidelity_test.dart` | **New** — widget test (decoration.border == null, borderRadius + boxShadow đúng giá trị) + static source assertion |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_footer_fidelity_test.dart` | **New** — cùng cấu trúc test cho PROD |

## 5. Regression / verification

- 2 test file mới, standalone widget test (no BlocProvider/DI/router — cùng strategy với BUG-W03-021/024/030/031 test trong suite này vì cubit thật wire qua getIt+AutoRoute) reconstruct đúng widget-tree fragment từ page source đã fix, assert:
  1. `decoration.border == null` (chặn regression về flat separator).
  2. `decoration.borderRadius == BorderRadius.only(topLeft: Radius.circular(8), topRight: Radius.circular(8))`.
  3. `decoration.boxShadow` khớp `Color(0x0F000000)` / `blurRadius: 12` / `offset: Offset(0, -4)`.
  4. Static source assertion: source không còn chứa chuỗi `border: Border(top: BorderSide(color: AppColors.borderPrimary))`, có chứa `BorderRadius.only(` + `boxShadow: [`.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` → **OK: 0 anti-pattern hit** cho cả 2 file.
- Đã VIEW cả 2 PNG oracle (`21252-49582-filter-filled.png`, `21235-27908-filter-filled.png`) trực tiếp trước khi sửa — xác nhận rounded-top + shadow, KHÔNG dựa trên mô tả bug report.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: mọi symbol dùng (`AppColors.bgBase`, `BorderRadius`, `BoxShadow`, `Color`, `Offset`) là Flutter SDK builtin hoặc token đã tồn tại — không phát sinh symbol mới cần codegen. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không touch `group_list_footer.dart` (đã đúng, dùng `BottomNavigationBarButton` — single-button case, không liên quan đến 2-nút filter footer case này).
- Không touch `material_group_list_page.dart` / `internal_product_list_page.dart` (LIST pages) — không nằm trong scope bug này.
- Không đổi `AppButtonColor`/label/spacing của 2 nút Reset/Apply — chỉ decoration của Container bọc ngoài.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — footer decoration `Border(top:)` → `BorderRadius.only(topLeft/topRight:8) + boxShadow` khớp `BottomNavigationBarButton` canonical, cả 2 file GRP+PROD filter. Regression test mới (widget test x2). `flutter analyze`/`flutter test` DEFERRED (no toolchain). PROD spec kiểm tra không có claim sai tương tự — không cần correction. |
