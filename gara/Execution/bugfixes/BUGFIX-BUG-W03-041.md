# BUGFIX — BUG-W03-041

> GRP+PROD search `AppTextField` sai params + raw `Icon(Icons.close)` clear-button so với reference `booking_search_page.dart`/`customer_search_page.dart`
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`material_group_search_page.dart` và `internal_product_search_page.dart` (FEAT-CAT-GRP-LIST / FEAT-CAT-PROD-LIST search pages) build search-input `AppTextField` với params khác hoàn toàn so với 2 reference đã ship: `booking_search_page.dart` (`:80-104`) và `customer_search_page.dart` (`:122-156`, exemplar chính thức theo `rules-mobile SKILL.md §0 Structural exemplar`). User (mobile dev) report "ô search của 2 màn hình đang khác hoàn toàn so với booking".

## 2. Root cause

Khi viết 2 search page W03, DEV không đối chiếu param-by-param với exemplar `customer_search_page.dart`/`booking_search_page.dart`, dẫn tới 3 lớp divergence:

1. **Border style**: dùng `hasBorder: false` (tắt hẳn border logic) thay vì `customBorderColor: BaseColor.transparent` (giữ border logic, chỉ set màu trong suốt) — cả 2 param đều tồn tại hợp lệ trên `AppTextField` (`lib/ui/widgets/text_field/app_text_field.dart`) nhưng convention đã ship dùng `customBorderColor`.
2. **Density/sizing**: set `isDense: true` (không xuất hiện ở reference nào) và bỏ trống `textFieldHeight` (cả 2 reference đều set `textFieldHeight: 40`) — kết hợp gây lệch chiều cao ô input so với booking/customer.
3. **Typography**: không set `textStyle` (cả 2 reference đều set `AppTextStyle.textCaptionC5.copyWith(color: AppColors.textPrimary)`) → input text fallback về `TextStyle(fontSize: 14)` mặc định của `AppTextField` (`app_text_field.dart:336`) thay vì token canonical.
4. **Clear-icon (×)**: dùng raw `IconButton(icon: Icon(Icons.close, size: 18))` — vi phạm trực tiếp `rules-mobile SKILL.md §0` dòng "Nút xoá (×) — dùng asset canonical `Assets.icons.icCloseCircleBorder.image(16x16)` qua `GestureDetector`, KHÔNG raw `Icon(Icons.close)`" — thay vì canonical asset. `customer_search_page.dart:142-153` dùng `GestureDetector` + `Assets.icons.icCloseCircleBorder.image(height:16, width:16)`; `booking_search_page.dart:96-102` dùng cùng cấu trúc `GestureDetector` nhưng asset `icDeleteBlack` (domain-specific choice, không phải sai — cả 2 asset đều tồn tại trong `assets.gen.dart`/`assets/icons/`). `icCloseCircleBorder` được chọn cho fix này vì `customer_search_page.dart` là exemplar chính thức theo `rules-mobile SKILL.md §0`, và asset đã verify tồn tại (widely used ở `request_quote_list_search_page.dart`, `service_order_list_search_v3_page.dart`, `employee_search_page.dart`, `search_list_order_page.dart`, …).

## 3. Fix

Cả 2 file (`material_group_search_page.dart`, `internal_product_search_page.dart`) — đối chiếu param-by-param với `customer_search_page.dart`:

```dart
titleWidget: AppTextField(
  controller: _controller,
  focusNode: _focusNode,
  hintText: LocaleKeys.<domain>_searchPlaceholder.tr(),
  fillColor: AppColors.bgSecondary,
  customBorderColor: BaseColor.transparent,          // was: hasBorder: false
  textStyle: AppTextStyle.textCaptionC5
      .copyWith(color: AppColors.textPrimary),        // was: missing
  textFieldHeight: 40,                                 // was: missing (had isDense: true instead)
  prefixIcon: Assets.icons.icSearchNormal.image(
    height: 20, width: 20, color: AppColors.textTertiary,
  ),
  suffixIcon: state.keyword.isEmpty
      ? null
      : GestureDetector(                                // was: IconButton(icon: Icon(Icons.close))
          onTap: () {
            _controller.clear();
            cubit.changeKeyword('');
          },
          child: Assets.icons.icCloseCircleBorder.image(height: 16, width: 16),
        ),
  onChanged: cubit.changeKeyword,
),
```

`onChanged`/cubit-wiring logic (`cubit.changeKeyword`) giữ nguyên — chỉ đổi `AppTextField` param list + clear-icon widget.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | `hasBorder:false`+`isDense:true` → `customBorderColor:BaseColor.transparent`; thêm `textStyle`+`textFieldHeight:40`; `IconButton(Icon(Icons.close))` → `GestureDetector`+`icCloseCircleBorder` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | Cùng thay đổi |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_input_fidelity_test.dart` | **New** — widget test (reconstructed `AppTextField` fragment: `customBorderColor`/`hasBorder`/`isDense`/`textFieldHeight`/`textStyle` field assertions + no `IconButton`/`Icons.close` + `GestureDetector` tap clears) + static source assertion |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_input_fidelity_test.dart` | **New** — cùng cấu trúc test cho PROD |

## 5. Regression / verification

- 2 test file mới, standalone widget test (no BlocProvider/DI/router — cùng strategy với BUG-W03-021/024/030/036 test trong suite này vì cubit thật wire qua getIt+AutoRoute). Mỗi file assert:
  1. `AppTextField.customBorderColor == BaseColor.transparent`.
  2. `AppTextField.hasBorder == true` (default — KHÔNG bị set `false`).
  3. `AppTextField.isDense == false` (default — KHÔNG bị set `true`).
  4. `AppTextField.textFieldHeight == 40`.
  5. `AppTextField.textStyle == AppTextStyle.textCaptionC5.copyWith(color: AppColors.textPrimary)`.
  6. Không có `IconButton` / `Icons.close` descendant nào; clear-icon là `GestureDetector` — tap gọi callback clear đúng.
  7. Static source assertion: chứa `customBorderColor: BaseColor.transparent` / `textStyle:` / `AppTextStyle.textCaptionC5.copyWith(color: AppColors.textPrimary)` / `textFieldHeight: 40` / `Assets.icons.icCloseCircleBorder.image(`; KHÔNG chứa `hasBorder: false` / `isDense: true` / `IconButton(` / `Icon(Icons.close`.
- Verify asset tồn tại: `grep -rn "icCloseCircleBorder"` xác nhận PNG `assets/icons/ic_close_circle_border.png` + 5+ usage hiện có trong repo (`customer_search_page.dart`, `request_quote_list_search_page.dart`, `service_order_list_search_v3_page.dart`, `employee_search_page.dart`, `search_list_order_page.dart`) trước khi dùng.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` → **OK: 0 anti-pattern hit** cho cả 2 file đã sửa.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: `customBorderColor`/`textStyle`/`textFieldHeight`/`hasBorder`/`isDense` đều là param hợp lệ tồn tại sẵn trên `AppTextField` (đọc source `app_text_field.dart:17,43,46,47,51`) — không phát sinh lỗi type/undefined-param. Brace/paren balance verified thủ công (paren-count mismatch trong test file là false-positive từ partial-pattern string literal trong `.contains('IconButton(')`-style assertion, không phải lỗi cú pháp thật — verified bằng đọc lại toàn bộ file). TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không touch `material_group_filter_cubit.dart`, `internal_product_filter_cubit.dart`, `material_group_filter_page.dart`, `internal_product_filter_page.dart` — đang có 2 FIX cycle song song khác (BUG-W03-037/038 trên cubit, BUG-W03-039 trên footer filter page) trên các file đó.
- Không đổi `onChanged`/cubit-wiring logic — chỉ đổi `AppTextField` param list + clear-icon widget, đúng scope report.
- Không đổi `AppBarCustom.hasShape`/`bottom:` slot (đã fix riêng ở BUG-W03-036) — file đã có `hasShape: false` từ trước, giữ nguyên.
- Chọn `icCloseCircleBorder` (không phải `icDeleteBlack` của booking) theo hướng dẫn ưu tiên exemplar `customer_search_page.dart` — đã verify asset tồn tại trước khi dùng, per Notes instruction.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — đối chiếu param-by-param `AppTextField` với `customer_search_page.dart` exemplar cho cả GRP+PROD search page: `customBorderColor:BaseColor.transparent` thay `hasBorder:false`, bỏ `isDense:true`, thêm `textStyle`+`textFieldHeight:40`, `GestureDetector`+`icCloseCircleBorder` thay raw `IconButton(Icon(Icons.close))`. Regression test mới (widget test x2). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
