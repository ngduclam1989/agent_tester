# BUGFIX — BUG-W03-047

> Search input tràn sát cạnh phải AppBar — thiếu `Row`+`Gap` wrapper như `customer_search_page.dart`
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`material_group_search_page.dart` và `internal_product_search_page.dart` (FEAT-CAT-GRP-LIST / FEAT-CAT-PROD-LIST search pages) truyền `titleWidget: AppTextField(...)` trực tiếp cho `AppBarCustom`, không bọc trong `Row`/`Expanded`/`Gap` như exemplar `customer_search_page.dart`. User (mobile dev) xác nhận trên máy thật: "ô nhập nó đang bị tràn về cạnh bên phải".

## 2. Root cause

`AppBarCustom` set `titleSpacing: 0` (`app_bar_custom.dart:61`) và không tự thêm margin cho `titleWidget`. Cả 2 page này không có `actions:` cạnh tranh không gian, nên khi `titleWidget` là `AppTextField` trần (không có `Expanded`/constraint riêng để giới hạn chiều rộng, không có phần tử nào chiếm khoảng trống bên phải), input stretch full-width sát tới rìa phải màn hình — không có khoảng cách với cạnh.

Exemplar chính thức `customer_search_page.dart:119-160` (theo `rules-mobile SKILL.md §0 Structural exemplar`) tránh lỗi này bằng cách bọc `AppTextField` trong `Row(children: [Expanded(child: AppTextField(...)), const Gap(8)])` — `Expanded` giới hạn field theo constraint của `Row` (đã trừ đi `Gap(8)`), và `Gap(8)` cung cấp margin bên phải tường minh. Cả 2 file W03 bỏ qua bước này khi viết search page mới.

## 3. Fix

Cả 2 file (`material_group_search_page.dart`, `internal_product_search_page.dart`) — bọc `titleWidget` đúng theo pattern exemplar, KHÔNG đổi bất kỳ param nào của `AppTextField` (controller/focusNode/hintText/fillColor/customBorderColor/textStyle/textFieldHeight/prefixIcon/suffixIcon/onChanged giữ nguyên):

```dart
titleWidget: Row(
  children: [
    Expanded(
      child: AppTextField(
        controller: _controller,
        focusNode: _focusNode,
        hintText: LocaleKeys.<domain>_searchPlaceholder.tr(),
        fillColor: AppColors.bgSecondary,
        customBorderColor: BaseColor.transparent,
        textStyle: AppTextStyle.textCaptionC5
            .copyWith(color: AppColors.textPrimary),
        textFieldHeight: 40,
        prefixIcon: Assets.icons.icSearchNormal.image(
          height: 20, width: 20, color: AppColors.textTertiary,
        ),
        suffixIcon: state.keyword.isEmpty
            ? null
            : GestureDetector(
                onTap: () {
                  _controller.clear();
                  cubit.changeKeyword('');
                },
                child: Assets.icons.icCloseCircleBorder.image(height: 16, width: 16),
              ),
        onChanged: cubit.changeKeyword,
      ),
    ),
    const Gap(8),
  ],
),
```

`package:gap/gap.dart` chưa được import ở 2 file này trước fix (khác `customer_search_page.dart` — đã có sẵn) — thêm import mới ở cả 2 file.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | `titleWidget: AppTextField(...)` → `titleWidget: Row([Expanded(child: AppTextField(...)), const Gap(8)])`; thêm import `package:gap/gap.dart` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | Cùng thay đổi |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_appbar_fidelity_test.dart` | **Extended** — thêm 1 `testWidgets` (widget-tree: `AppBarCustom.titleWidget` là `Row` chứa `Expanded` chứa `AppTextField`, cộng `Gap(8)` với `mainAxisExtent: 8`) + 1 `test` (static source assertion) + host widget `_Bug047AppBarHost`, giữ nguyên toàn bộ test case cũ (BUG-W03-036) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_appbar_fidelity_test.dart` | Cùng cấu trúc extend cho PROD |

## 5. Regression / verification

- 2 file test mở rộng (không xoá/sửa test case cũ), mỗi file thêm:
  1. `testWidgets` dựng lại đúng fragment `AppBarCustom(titleWidget: Row([Expanded(AppTextField), Gap(8)]))` từ page source (standalone — không BlocProvider/DI/router, cùng strategy với các test BUG-W03-021/024/030/036/041 khác trong suite) — assert `titleWidget is Row`, `Expanded` descendant chứa `AppTextField`, `Gap` descendant với `mainAxisExtent == 8`.
  2. `test` static source assertion: file chứa `titleWidget: Row(`, `Expanded(`, `const Gap(8)`, và import `package:gap/gap.dart`.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` → **OK: 0 anti-pattern hit** cho cả 2 file đã sửa.
- Brace/paren/bracket balance verified thủ công bằng script đếm ký tự (`(`/`)` 85/85 và 81/81, `{`/`}` 15/15 và 16/16, `[`/`]` 8/8 và 7/7 cho GRP/PROD tương ứng) — cân bằng.
- `AppBarCustom.titleWidget` xác nhận field type `Widget?` (`app_bar_custom.dart:13`) — không có breaking-change khi đổi từ `AppTextField` sang `Row`.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm` trong environment này; thử trực tiếp bằng Flutter SDK sẵn có (`/home/all_engineer/flutter`, 3.32.8/Dart 3.8.1) nhưng `flutter pub get` fail ngay ("current Dart SDK version is 3.8.1" vs repo `environment: sdk: ^3.11.0`, cần Flutter ~3.44) — xác nhận `DEBT-W01-MOBILE-BUILD-ENV`. TEST_GROUP phải chạy lại trên máy có toolchain đúng version trước khi flip `VERIFIED`.
- Ghi chú môi trường: cùng lúc có 1 FIX cycle khác đang chạm chung 2 file này (BUG-W03-046 — `AppBarCustom.backgroundColor` dead-code fix, thêm `backgroundColor: AppColors.bgPrimary` property độc lập với `titleWidget`) — không có xung đột dòng/cấu trúc; đã verify diff sau cùng vẫn giữ nguyên `Row([Expanded(AppTextField(...)), const Gap(8)])` wrapper của fix này.

## 6. Non-goals / out of scope

- Không đổi bất kỳ param nào của `AppTextField` (controller/focusNode/hintText/fillColor/customBorderColor/textStyle/textFieldHeight/prefixIcon/suffixIcon/onChanged) — chỉ thêm wrapper `Row`/`Expanded`/`Gap`.
- Không touch `AppBarCustom` (`lib/ui/widgets/app_bar/app_bar_custom.dart`) hay `AppTextField` (`lib/ui/widgets/text_field/app_text_field.dart`) — cả 2 widget dùng chung, ngoài scope bug này.
- Không đổi `hasShape:false`/`bottom:` slot của `AppBarCustom` (đã fix riêng ở BUG-W03-036) hoặc `AppTextField` params (đã fix riêng ở BUG-W03-041) — giữ nguyên từ các fix trước.
- Không sửa các page search khác — chỉ 2 file được báo trong bug.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — bọc `titleWidget: AppTextField(...)` trong `Row([Expanded(child: AppTextField(...)), const Gap(8)])` cho cả GRP+PROD search page, đúng pattern `customer_search_page.dart`. Thêm import `package:gap/gap.dart` ở cả 2 file. Regression test mở rộng (widget-tree + source assertion) trong 2 file `*_appbar_fidelity_test.dart` sẵn có. `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). |
