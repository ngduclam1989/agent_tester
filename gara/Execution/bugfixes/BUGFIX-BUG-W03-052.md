# BUGFIX — BUG-W03-052

> "Không thể xoá" (cannot-delete) popup — hasProducts nội dung sai + không interpolate tên nhóm, màu nút sai (primary thay vì secondary)
> Severity: **P1** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

Figma audit trực tiếp (node `21254:52450`, file `5YU4H3iY726P8KNxI9oCYF`, user cung cấp link) trên `material_group_cannot_delete_dialog.dart` (FEAT-CAT-GRP-DELETE) tìm thấy 2 defect trên nhánh `hasProducts` của popup "Không thể xoá":

1. **Nội dung sai + không dynamic**: Figma yêu cầu 1 câu duy nhất có interpolate tên nhóm thật — "Nhóm vật tư hàng hóa {tên nhóm} đã phát sinh mã sản phẩm nội bộ nên không được xóa." Code nối 2 locale key tĩnh (`catGrp_cannotDeleteHasProducts` + `catGrp_cannotDeleteHintProducts`), không interpolate `groupName` dù `material_group_delete_handler.dart` đã có sẵn `groupName` trong scope nhưng chưa truyền qua `MaterialGroupCannotDeleteDialog.show()`, và thừa 1 câu hint Figma không có.
2. **Màu nút sai**: Figma chỉ có 1 nút "Đóng" style secondary/xám (bg `#f3f3f4`, text `#262626`). Code dùng `okText:` trên `AppDialog(...)` → route vào `_buildOkButton` → `AppButtonColor.primary()` (nền xanh brand) thay vì `cancelText:` → `_buildCancelButton` (đã có sẵn đúng style secondary nhưng chưa được dùng).

## 2. Root cause

- **(1)**: `MaterialGroupCannotDeleteDialog.show()` chưa từng có tham số `groupName` — được viết ban đầu (BUG-W03-015 refactor sang `AppDialog` object-API) mà không đối chiếu Figma cho phần nội dung câu chữ, chỉ tái dùng 2 locale key generic có sẵn từ trước (không tên nhóm, có câu hint) thay vì viết đúng câu Figma yêu cầu.
- **(2)**: `AppDialog` cung cấp 2 named param độc lập điều khiển 2 style nút khác nhau (`okText:` → primary/xanh, `cancelText:` → secondary/xám qua `AppColors.buttonBackgroundSecondary`/`textPrimary`) — tác giả ban đầu chọn nhầm `okText:` cho 1 dialog chỉ cần acknowledge (không phải call-to-action chính), lẽ ra phải dùng `cancelText:` để lấy đúng style xám mà Figma yêu cầu cho hành động "Đóng" trung tính.

## 3. Fix

- `material_group_cannot_delete_dialog.dart`: `show()` thêm tham số bắt buộc `groupName`. Nhánh `hasProducts` đổi từ nối 2 `.tr()` tĩnh sang `LocaleKeys.catGrp_cannotDeleteHasProducts.tr(namedArgs: {'groupName': groupName})` (cùng pattern `catGrp_deleteConfirmBody` đã dùng trong `material_group_confirm_delete_dialog.dart`). Nhánh `hasChildren` giữ nguyên logic cũ (locale key khác, không có Figma node riêng trong đợt audit này). `AppDialog(...)` call đổi `okText:` → `cancelText:` cho `LocaleKeys.common_close.tr()`.
- `material_group_delete_handler.dart`: cả 2 call site (`blockedHasProducts` + `blockedHasChildren`) trong `confirmAndDelete()` giờ truyền `groupName: groupName` (đã có sẵn trong scope qua tham số hàm) xuống `MaterialGroupCannotDeleteDialog.show()`.
- `assets/localizations/vi.json` + `en.json`: `catGrp_cannotDeleteHasProducts` sửa thành 1 câu duy nhất có `{groupName}` placeholder — vi verbatim Figma "Nhóm vật tư hàng hóa {groupName} đã phát sinh mã sản phẩm nội bộ nên không được xóa."; en restructure tương ứng "Cannot delete group {groupName} because it has generated internal product codes." Xoá key `catGrp_cannotDeleteHintProducts` khỏi cả 2 file (verify: chỉ dùng ở file dialog này, không còn consumer nào khác sau fix). `catGrp_cannotDeleteHasChildren`/`catGrp_cannotDeleteHintChildren` giữ nguyên, đúng scope.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_delete/widgets/material_group_cannot_delete_dialog.dart` | `show()` thêm `required String groupName`; `hasProducts` branch dùng `catGrp_cannotDeleteHasProducts.tr(namedArgs: {'groupName': groupName})` thay 2-key concat; `AppDialog(...)` `okText:` → `cancelText:` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_delete/material_group_delete_handler.dart` | Cả 2 `MaterialGroupCannotDeleteDialog.show(...)` call site (`blockedHasProducts`/`blockedHasChildren`) truyền thêm `groupName: groupName` |
| `mobile/gf-garage-app/assets/localizations/vi.json` | `catGrp_cannotDeleteHasProducts` sửa thành 1 câu interpolate `{groupName}`; xoá `catGrp_cannotDeleteHintProducts` |
| `mobile/gf-garage-app/assets/localizations/en.json` | Tương ứng EN — restructure `catGrp_cannotDeleteHasProducts` với `{groupName}`; xoá `catGrp_cannotDeleteHintProducts` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_delete/material_group_cannot_delete_dialog_test.dart` | **New** — 2 widget test (message interpolate + không còn hint sentence thừa; nút "Đóng" đúng màu secondary/gray, đúng 1 nút hiện trong dialog) |

## 5. Regression / verification

- `test/ui/inventory_catalog/material_group_delete/material_group_cannot_delete_dialog_test.dart` — 2 `testWidgets`:
  1. Trigger dialog qua `MaterialGroupCannotDeleteDialog.show(context, reason: hasProducts, groupName: 'Phụ tùng động cơ')`, assert rendered `Text` khớp verbatim `LocaleKeys.catGrp_cannotDeleteHasProducts.tr(namedArgs: {'groupName': 'Phụ tùng động cơ'})` = "Nhóm vật tư hàng hóa Phụ tùng động cơ đã phát sinh mã sản phẩm nội bộ nên không được xóa.", và assert không còn tìm thấy fragment câu hint cũ ("di chuyển hoặc xoá mã sản phẩm trước").
  2. Assert đúng 1 `AppButton` có title = `common_close` ("Đóng"), `appButtonColor.backgroundColor == AppColors.buttonBackgroundSecondary` (`#f3f3f4`) + `contentColor == AppColors.textPrimary` (`#262626`), và khác `AppColors.buttonBackgroundPrimary`; đúng 2 `AppButton` tổng cộng trong tree (nút "Đóng" của dialog + nút trigger của chính test) — xác nhận không phát sinh nút thứ 2 trong dialog.
- `python3 scripts/check-mobile-canonical-primitives.py --file` chạy trên cả 3 file `.dart` đã sửa (2 lib + 1 test) → **OK: 0 anti-pattern hit** cho cả 3.
- Blast-radius check: `grep -rln "AppDialog.show(\|AppDialog(" lib/ui` → chỉ 2 consumer (`material_group_cannot_delete_dialog.dart` + định nghĩa `app_dialog.dart` chính nó) — không cross-screen risk, `AppDialog` widget chung không bị đổi.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: mọi symbol dùng (`LocaleKeys.catGrp_cannotDeleteHasProducts`, `AppColors.buttonBackgroundSecondary`/`textPrimary`/`buttonBackgroundPrimary`, `AppButton`/`AppButtonSize`) đã tồn tại thật trong codebase; `namedArgs` pattern verified identical tới `catGrp_deleteConfirmBody` đã dùng ở `material_group_confirm_delete_dialog.dart`; `AppColors.buttonBackgroundSecondary = NeutralColor.s50 = Color(0xfff3f3f4)` và `AppColors.textPrimary = Color(0xFF262626)` verified khớp chính xác Figma hex. `lib/generated/locale_keys.gen.dart` bị gitignore (per-dev-machine codegen output) — cần chạy `fvm dart run easy_localization:generate -S assets/localizations -O lib/generated -o locale_keys.gen.dart -f keys` trên máy có toolchain trước khi build. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không sửa nhánh `hasChildren` — Figma audit chỉ cover node `21254:52450` (nhánh `hasProducts`); `hasChildren` dùng locale key khác, không có Figma reference riêng trong đợt audit này.
- Không đụng `AppDialog` widget chung (`lib/ui/widgets/notify/app_dialog.dart`) — chỉ đổi param nào call site này dùng, không đổi logic `_buildActions`/`_buildOkButton`/`_buildCancelButton` của widget chung.
- Không đụng `material_group_confirm_delete_dialog.dart` — dialog khác, bug khác.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `groupName` interpolation cho hasProducts message + `cancelText:` thay `okText:` để đúng style nút secondary/gray. 2 regression test mới. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
