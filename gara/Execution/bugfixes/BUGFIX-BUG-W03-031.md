# BUGFIX — BUG-W03-031

> InternalProductFilterPage dùng raw DropdownButtonFormField ×2 (D-M3 violation) + raw Text + sai token nút Reset + raw gap literal
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`internal_product_filter_page.dart` (FEAT-CAT-PROD-LIST filter) có 4 defect so với Figma `wave03-cat-prod-list.md` §"Bộ lọc sản phẩm - Filled" (node 21235:27908):

1. 2× raw `DropdownButtonFormField<T>(decoration: InputDecoration(border: OutlineInputBorder()))` cho "Tính chất" + "Nhóm hàng" thay vì canonical `DropdownMenuWidget` (D-M3).
2. Field label `Text(...)` không có `AppTextStyle` token (default TextStyle).
3. Nút "Thiết lập lại" dùng `AppColors.bgSecondary` thay vì Figma-named token `AppColors.buttonBackgroundSecondary`.
4. Gap giữa 2 nút footer là raw `SizedBox(width: 12)` thay vì `AppSizes.spacing16`.

## 2. Root cause

Cùng lớp root-cause với BUG-W03-030 (xem `BUGFIX-BUG-W03-030.md` §2): PROD filter page viết ở cycle DEV trước không đối chiếu đủ rules-mobile §2 Widget Catalog First. Cross-ref: `material_group_filter_page.dart` (GRP sibling, cùng wave, cùng tác giả) dùng ĐÚNG `DropdownMenuWidget` + `AppTextStyle.textBodyB5` + `AppColors.buttonBackgroundSecondary` + `AppSizes.spacing16` cho field/nút tương tự — nghĩa là tác giả GỐC đã biết pattern đúng khi viết GRP filter nhưng PROD filter (cùng tác giả) vẫn còn defect, xác nhận đây không phải thiếu kiến thức mà là thiếu bước verify/đối chiếu 2 file sibling trước khi coi PROD "đã xong".

Điểm (3) — token `bgSecondary` vs `buttonBackgroundSecondary` — là cùng lớp lỗi với BUG-W03-033 (3 màn GRP add/edit/detail cũng bị, xem `BUGFIX-BUG-W03-033.md`): 2 token cùng resolve `NeutralColor.s50` nên không có sai lệch màu thực tế, thuần drift semantic-token.

## 3. Fix

- 2× `DropdownButtonFormField` → 2× `DropdownMenuWidget` (`MenuController`+`TextEditingController`+`ScrollController` riêng mỗi field, option wrapper class `_TypeOption`/`_GroupOption` với `toString()` override — pattern verbatim từ `material_group_filter_page.dart` + `material_group_form.dart` `_ParentOption`/`_StatusOption` precedent). Sync-on-build pattern: `_syncTypeTextController`/`_syncGroupTextController` cập nhật `TextEditingController.text` khi state thay đổi (null → clear về '' để hint hiện placeholder; non-null → set label khớp option).
- `hintText` = 2 placeholder mới `catProd_filterTypePlaceholder` ("Chọn tính chất hàng hoá") / `catProd_filterGroupPlaceholder` ("Chọn nhóm hàng") — verbatim Figma `_png_verified`.
- Field label `Text(...)` → thêm `style: AppTextStyle.textBodyB5.copyWith(color: AppColors.textPrimary)`.
- Reset button: `AppColors.bgSecondary` → `AppColors.buttonBackgroundSecondary`.
- Footer gap: `SizedBox(width: 12)` → `SizedBox(width: AppSizes.spacing16)`. **Verify trước khi chọn giá trị** (không tự chọn theo GRP mù quáng): đối chiếu widget tree PROD `FilterFooter` trong `wave03-cat-prod-list.md` (dòng 330-334, `BottomBar/Footer > Row [_children_count: 2]`) — spec KHÔNG ghi figure riêng cho PROD, và cấu trúc widget tree giống hệt GRP's `GroupFilterFooter` (cũng `Row [_children_count: 2]`, cũng không numeric gap riêng trong §Widget Tree, chỉ khác biệt ở phần Bounds/Layout chi tiết vốn không có cho PROD). Vì không có bằng chứng PROD cần 1 figure khác GRP, `AppSizes.spacing16` (đã grounded trong code GRP) là lựa chọn đúng thay vì raw `12` tự đặt không rõ nguồn gốc.

Semantic behavior giữ nguyên: `productType`/`materialGroupId` null vẫn map "Tất cả" (label option đầu tiên trong mỗi dropdown, giữ nguyên nghĩa "không filter" từ code raw-dropdown gốc — KHÔNG đổi sang "--" như GRP để tránh regression hành vi ngoài phạm vi bug UI-catalog thuần).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | 2× `DropdownButtonFormField` → `DropdownMenuWidget`; label `AppTextStyle.textBodyB5`; reset button token `buttonBackgroundSecondary`; footer gap `AppSizes.spacing16` |
| `mobile/gf-garage-app/assets/localizations/vi.json` | +2 keys: `catProd_filterTypePlaceholder`, `catProd_filterGroupPlaceholder` |
| `mobile/gf-garage-app/assets/localizations/en.json` | +2 keys tương ứng (EN) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_fidelity_test.dart` | **New** — 5 test (2 DropdownMenuWidget/0 DropdownButtonFormField, label token, reset button widget-tree color, reset button static-source-assertion token, footer gap spacing16≠12) |

## 5. Regression / verification

- `test/ui/inventory_catalog/internal_product_filter/internal_product_filter_fidelity_test.dart` — standalone widget tests (no BlocProvider/DI/router, same strategy như BUG-W03-021/024/030) reconstruct widget-tree fragment từ page source đã fix:
  1. `find.byType(DropdownMenuWidget)` = 2, `find.byType(DropdownButtonFormField)` = 0.
  2. 2 label `Text` có `fontSize`/`fontWeight` khớp `AppTextStyle.textBodyB5`.
  3. Reset button `appButtonColor?.backgroundColor == AppColors.buttonBackgroundSecondary` (widget-tree check).
  4. **Static source assertion** (theo precedent BUG-W03-033 — widget-tree Color-equality KHÔNG phân biệt được `bgSecondary` vs `buttonBackgroundSecondary` vì cùng hex `NeutralColor.s50`): đọc trực tiếp `internal_product_filter_page.dart` source, assert literal `backgroundColor: AppColors.buttonBackgroundSecondary` có mặt + `backgroundColor: AppColors.bgSecondary` KHÔNG còn mặt.
  5. Footer gap `SizedBox.width == AppSizes.spacing16` (`isNot(12)`).
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` → **OK: 0 anti-pattern hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: `DropdownMenuWidget` constructor params (`menuController`, `textEditingController`, `scrollController`, `dataList`, `hintText`, `onSelected`, `isRequired`) khớp `lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` thật; `InternalProductType`/`.label` field đã tồn tại trong `internal_product_status.dart`; 2 LocaleKeys mới đã thêm vào cả 2 file JSON. `lib/generated/locale_keys.gen.dart` bị gitignore — cần chạy codegen trên máy có toolchain trước khi build. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không đổi giá trị hex của `bgSecondary`/`buttonBackgroundSecondary` trong `app_colors.dart` (cùng non-goal với BUG-W03-033).
- Không đổi hành vi cubit (`setProductType`/`setMaterialGroupId`/`reset`) — chỉ đổi UI wiring.
- Không đổi semantic "Tất cả" label (giữ nguyên hành vi raw-dropdown gốc, không đổi sang "--" như GRP).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — 2× DropdownMenuWidget thay DropdownButtonFormField, label token, reset button token, footer gap spacing16. Regression test mới (widget test x4 + static source assertion x1). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
