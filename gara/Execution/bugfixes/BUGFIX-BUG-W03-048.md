# BUGFIX — BUG-W03-048

> `DropdownMenuWidget` menu item sai font (`Text` không `style:`) + thiếu highlight item đang chọn khi mở lại
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02 (refined)

## 1. Summary

`DropdownMenuWidget` (`lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart`) là shared widget dùng bởi 3 consumer (`material_group_form.dart`, `material_group_filter_page.dart`, `internal_product_filter_page.dart`). Trong `menuChildren` builder, mỗi `MenuItemButton`'s item `Text` không có `style:` — dùng default `TextStyle` của Flutter thay vì design token, và không có cơ chế đánh dấu trực quan item đang được chọn khi mở lại danh sách. User (mobile dev) xác nhận trên máy thật: "ở dropdown khi sổ ra đang sai font chữ", đối chiếu sibling `DropdownWidget` cho thấy 2 điều thiếu.

## 2. Root cause

1. **Sai font**: `child: Align(alignment: Alignment.centerLeft, child: Text(currentItem.toString()))` — không truyền `style:`, nên `Text` kế thừa `DefaultTextStyle` mặc định của Flutter (không phải token `AppTextStyle.*`), vi phạm `rules-mobile SKILL.md §1 Typography` (CẤM default/raw TextStyle). Cùng widget này đã tự dùng `AppTextStyle.textCaptionC5` cho `hintWidget`/input text (dòng 46/51) nhưng quên áp dụng cho menu item — thiếu nhất quán nội bộ.
2. **Thiếu highlight item đang chọn**: mọi item trong `dataList.map(...)` render `MenuItemButton` giống hệt nhau, không có logic so sánh với giá trị hiện tại — khác với sibling `lib/ui/widgets/dropdown/dropdown_widget.dart` (`_Submenu._buildMenuItem`) đã có cơ chế `ColoredBox(color: indexSelected == index ? PrimaryColor.s50 : Colors.transparent, ...)`. `DropdownMenuWidget` nhận sẵn `textEditingController` (được mọi consumer sync `.text = <label đã chọn>` tại thời điểm `onSelected`) nhưng không dùng giá trị này để xác định item đang chọn khi build lại `menuChildren`.

## 3. Fix

Trong `menuChildren` builder — tính `isSelected` cho từng item bằng `currentItem.toString() == textEditingController.text`, rồi:

```dart
children: dataList.map((currentItem) {
  final isSelected = currentItem.toString() == textEditingController.text;
  return MenuItemButton(
    style: ButtonStyle(
      backgroundColor: WidgetStateProperty.all(
        isSelected ? PrimaryColor.s50 : AppColors.bgTransparent,
      ),
    ),
    onPressed: () {
      onSelected(currentItem);
      menuController.close();
    },
    child: Align(
      alignment: Alignment.centerLeft,
      child: Text(
        currentItem.toString(),
        style: AppTextStyle.textCaptionC5.copyWith(
          color: isSelected ? AppColors.textActivePrimary : AppColors.textPrimary,
          fontWeight: isSelected ? AppTextStyle.fontWeightSemiBold : AppTextStyle.fontWeightCaption,
        ),
      ),
    ),
  );
}).toList(),
```

**Token choice rationale** (per instruction: dùng semantic `AppColors.*` trước, chỉ fallback raw palette-scale token khi không có semantic tương đương):

- Đã audit toàn bộ `AppColors` (`app_colors.dart`) — không có token semantic light-tint dành cho "selected row background". `AppColors.bgActive = PrimaryColor.s700` là xanh đậm (dùng làm `indicatorColor`/`labelColor` — tức màu **text/indicator** đang chọn ở `ListTabBarWidget`, không phải nền hàng nhạt). Không có `AppColors.bgSelected`/tương đương.
- → Fallback đúng theo precedent: dùng trực tiếp `PrimaryColor.s50` (raw palette-scale) cho background — **khớp chính xác giá trị** `_Submenu._buildMenuItem` của `DropdownWidget` đã dùng (`ColoredBox(color: indexSelected == index ? PrimaryColor.s50 : Colors.transparent, ...)`), giữ nhất quán "selected" visual language trong toàn app.
- Text color/weight của item chọn: `AppColors.textActivePrimary` (= `PrimaryColor.s700`, cùng giá trị `ListTabBarWidget` đã dùng làm `labelColor` cho tab đang chọn) + `AppTextStyle.fontWeightSemiBold` — nhất quán với "selected" pattern đã có trong codebase, không tự bịa token mới.
- Item không chọn: giữ `AppColors.textPrimary` (không đổi so với hint/input text convention đã có) + `AppTextStyle.fontWeightCaption` (weight gốc của `textCaptionC5`).

Không thêm param mới cho `DropdownMenuWidget` — logic hoàn toàn nội bộ dựa trên `textEditingController` đã có sẵn. Public constructor/signature không đổi.

## 4. Shared-Symbol Blast-Radius Gate

- **Trước khi sửa**: `grep -rln "DropdownMenuWidget(" lib/ui | grep -v dropdown_menu_widget.dart` → xác nhận đúng 3 file: `material_group_form.dart` (2 call-site: dropdown "Nhóm cha" + "Trạng thái"), `material_group_filter_page.dart` (1 call-site), `internal_product_filter_page.dart` (2 call-site: "Loại sản phẩm" + "Nhóm hàng"). Đọc từng call-site: tất cả đều truyền `textEditingController` được set `.text = <label>` trong `onSelected` của chính page/form đó (vd `material_group_form.dart`: `_ParentOption`/`_StatusOption` đều override `toString()` trả về đúng label hiển thị) — điều kiện tiên quyết để so khớp `currentItem.toString() == textEditingController.text` hoạt động đúng cho mọi consumer, không cần thay đổi gì ở call-site.
- **Locus**: (b) Shared-contract defect — bug nằm ở chính widget dùng chung (font mặc định + thiếu highlight áp dụng cho MỌI input dữ liệu, không phải call-site nào feed sai) → sửa tại widget chung, phủ regression cho toàn bộ hành vi mới (không chỉ 1 consumer).
- **Bất biến giữ nguyên**: khi không có item nào khớp `textEditingController.text` (vd trường hợp filter chưa chọn gì, text rỗng) → không có item nào bị `isSelected = true` → render y hệt hành vi trước fix (không highlight, chỉ khác font — đúng ý đồ fix #1). Không đổi `dataList`/`onSelected`/`menuController`/`scrollController`/`hintText`/`isRequired`/`onOpened` — 0 breaking change cho public API.
- **Sau khi sửa**: re-run grep xác nhận đúng 3 file trên, không file nào bị chạm ngoài `dropdown_menu_widget.dart` + test file của nó.

## 5. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` | Menu item `Text` thêm `style: AppTextStyle.textCaptionC5.copyWith(color:, fontWeight:)`; `MenuItemButton` thêm `style: ButtonStyle(backgroundColor:)` theo `isSelected`; thêm biến cục bộ `isSelected = currentItem.toString() == textEditingController.text` trong `dataList.map(...)`. Không đổi constructor/public API. |
| `mobile/gf-garage-app/test/ui/widgets/dropdown_menu/dropdown_menu_widget_test.dart` | **Extended** — thêm group `BUG-W03-048` (3 `testWidgets`), thêm helper `hostSelected({required String selectedText})`, thêm 2 import (`app_colors.dart`, `app_text_styles.dart`). Giữ nguyên toàn bộ test case cũ (BUG-W03-037). |

## 6. Regression / verification

- `test/ui/widgets/dropdown_menu/dropdown_menu_widget_test.dart` group `BUG-W03-048` — 3 case:
  1. Menu item `Text` có `style` khác `null`, `fontSize == AppTextStyle.textFontSize14`, `fontFamily` khác `null` và khác `'Roboto'` (không rơi về default Flutter).
  2. Với `textEditingController.text = 'B'` (khớp item thứ 2), item B có background khác item A, `AppColors.bgTransparent` cho item không chọn, text color/weight của B khác A.
  3. Với `textEditingController.text` không khớp item nào trong `dataList` — cả 2 item đều giữ `AppColors.bgTransparent` (không highlight sai).
- `python3 scripts/check-mobile-canonical-primitives.py --file lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` (chạy từ design-repo root) → **OK: 0 anti-pattern hit**.
- Brace/paren/bracket balance verified bằng script đếm ký tự cho cả file nguồn và file test — cân bằng (0/0/0 depth còn lại).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/Flutter toolchain trong sandbox này (`DEBT-W01-MOBILE-BUILD-ENV`, đã xác nhận qua các FIX cycle trước — BUG-W03-041/042/046/047). TEST_GROUP phải chạy lại trên máy có toolchain đúng version (Flutter 3.41/Dart 3.11) trước khi flip `VERIFIED`.

## 7. Non-goals / out of scope

- Không đổi `dropdown_widget.dart` (sibling widget) — chỉ dùng làm reference cho giá trị token (`PrimaryColor.s50`), không sửa file này.
- Không đổi 3 call-site consumer (`material_group_form.dart`, `material_group_filter_page.dart`, `internal_product_filter_page.dart`) — pure internal-rendering fix, không cần thay đổi cách gọi widget.
- Không thêm param mới vào `DropdownMenuWidget` constructor.

## 8. Refinement (REOPENED 2026-07-02 → RESOLVED 2026-07-02)

User cung cấp reference chính xác hơn: `lib/ui/supplier/supplier_filtter/supplier_filter_page.dart` field "Nguồn tạo" (`_buildPopupList`, dòng ~160-172):

```dart
Text(
  customer.label,
  style: AppTextStyle.textCaptionC5.copyWith(
    color: isSelected ? PrimaryColor.s600 : AppColors.textPrimary,
  ),
),
```

Reference dùng đúng cùng base token `AppTextStyle.textCaptionC5` (khớp §3 fix trước) nhưng khác 2 điểm cụ thể so với fix v1:

1. **Không đổi `fontWeight`** giữa item chọn/không chọn — chỉ đổi màu. Fix v1 đã thêm `fontWeight: isSelected ? fontWeightSemiBold : fontWeightCaption` — thừa so với reference, đã bỏ.
2. **Màu item chọn = `PrimaryColor.s600`** (raw palette-scale, verbatim theo reference) — không phải `AppColors.textActivePrimary` (`= PrimaryColor.s700`) đã suy luận sai ở fix v1 theo precedent `ListTabBarWidget` (precedent đó hoá ra không áp dụng cho pattern dropdown-item-list).

### Fix v2

```dart
child: Text(
  currentItem.toString(),
  style: AppTextStyle.textCaptionC5.copyWith(
    color: isSelected ? PrimaryColor.s600 : AppColors.textPrimary,
  ),
),
```

Nền `PrimaryColor.s50` cho `MenuItemButton.style.backgroundColor` giữ nguyên (đã khớp reference từ fix v1 — `_buildPopupList` cũng dùng `PrimaryColor.s50` cho `Container.color` khi `isSelected`). `isSelected` comparison logic không đổi. Public constructor/signature không đổi.

**Shared-Symbol Blast-Radius Gate re-run**: `grep -rln "DropdownMenuWidget(" lib/ui | grep -v dropdown_menu_widget.dart` → vẫn đúng 3 file (`material_group_form.dart`, `material_group_filter_page.dart`, `internal_product_filter_page.dart`) — không thay đổi số lượng/danh sách consumer so với v1. Thay đổi chỉ ở màu/weight nội bộ widget, không đổi public API/behavior contract → 3 consumer không bị ảnh hưởng thêm ngoài những gì v1 đã verify.

### Regression test (v2)

`test/ui/widgets/dropdown_menu/dropdown_menu_widget_test.dart` group `BUG-W03-048` — cập nhật 2 assertion trong case 2 ("the item matching ... is visually distinguished"):
- `textB.style!.color` phải bằng đúng `PrimaryColor.s600` (thay vì chỉ `isNot(equals(textA.style!.color))` như trước).
- `textB.style!.fontWeight` phải **bằng** `textA.style!.fontWeight` (đảo ngược so với v1 vốn assert khác nhau) — khớp reference "không đổi weight, chỉ đổi màu".

`python3 scripts/check-mobile-canonical-primitives.py --file lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` → 0 hit. Brace/paren balance verified cho cả file nguồn + file test. `fvm flutter analyze`/`fvm flutter test`: **DEFERRED** — vẫn không có toolchain trong sandbox (`DEBT-W01-MOBILE-BUILD-ENV`).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — thêm `style:` cho menu item `Text` (`AppTextStyle.textCaptionC5`) + highlight item đang chọn (`isSelected = currentItem.toString() == textEditingController.text`, background `PrimaryColor.s50` fallback theo precedent `DropdownWidget`, text `AppColors.textActivePrimary` + semibold). Regression test mở rộng (3 case mới) trong `dropdown_menu_widget_test.dart`. `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). |
| 2026-07-02 | 2 | agent-fix-garage-mobile | Refinement (REOPENED → RESOLVED) — user cung cấp reference chính xác hơn (`supplier_filter_page.dart._buildPopupList`): bỏ `fontWeight` override thừa, đổi màu item chọn từ `AppColors.textActivePrimary` → `PrimaryColor.s600` verbatim theo reference. Nền `PrimaryColor.s50` giữ nguyên. Regression test 2 assertion cập nhật lại theo hành vi đúng. |
