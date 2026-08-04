# BUGFIX — BUG-W03-033

> Nút secondary (Hủy/Xoá) dùng sai token `AppColors.bgSecondary` thay vì `AppColors.buttonBackgroundSecondary` — 3 màn
> Severity: **P3** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

3 màn `AddMaterialGroupPage` (nút "Hủy"), `EditMaterialGroupPage` (nút "Hủy"), `MaterialGroupDetailPage` (nút "Xoá") đều render nút secondary bằng `AppButtonColor.custom(backgroundColor: AppColors.bgSecondary, ...)` thay vì token semantic đúng theo Figma spec: `AppColors.buttonBackgroundSecondary`.

Cả 2 token cùng resolve `NeutralColor.s50` (`app_colors.dart:8` + `:42`) nên **KHÔNG có sai lệch màu thực tế** trên máy — đây thuần tuý là drift semantic-token, không phải bug hiển thị.

## 2. Root cause

DEV agent (wave DEV cycle trước) dùng token `bgSecondary` (background-role generic) cho background của nút secondary thay vì token đặt tên đúng chức năng `buttonBackgroundSecondary` (button-role cụ thể). 2 token trùng giá trị hex tại thời điểm viết code nên bug không lộ diện qua kiểm tra bằng mắt — cùng lớp lỗi đã phát hiện độc lập tại BUG-W03-031 (`internal_product_filter_page.dart`, PROD filter, cùng wave). Rủi ro thực tế: nếu design system sau này tách `bgSecondary` cho mục đích khác (background trang, panel, …) trong khi giữ `buttonBackgroundSecondary` riêng cho button, 3 màn này sẽ tự động lệch màu theo `bgSecondary` mà không ai chủ động sửa.

## 3. Fix

Đổi `backgroundColor: AppColors.bgSecondary` → `backgroundColor: AppColors.buttonBackgroundSecondary` tại đúng 1 vị trí trong mỗi file (arg của `AppButtonColor.custom(...)` truyền cho `AppButton.text(...)` của nút secondary). Không đổi gì khác — `contentColor`, `onPress`, layout, spacing giữ nguyên.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart:82` | `backgroundColor: AppColors.bgSecondary` → `AppColors.buttonBackgroundSecondary` (nút "Hủy") |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_edit/edit_material_group_page.dart:104` | `backgroundColor: AppColors.bgSecondary` → `AppColors.buttonBackgroundSecondary` (nút "Hủy") |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart:203-204` | `backgroundColor: AppColors.bgSecondary` → `AppColors.buttonBackgroundSecondary` (nút "Xoá") |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_secondary_button_token_test.dart` | **New** — regression test (static source assertion, 3 sub-test theo BUG-ID group). |

## 5. Regression / verification

- **Test type**: static source assertion, KHÔNG widget-tree Color-equality test. Lý do: `bgSecondary` và `buttonBackgroundSecondary` cùng compile ra cùng giá trị `Color` (`NeutralColor.s50`) — một widget test đọc `AppButtonColor.backgroundColor` từ tree rồi so `== AppColors.buttonBackgroundSecondary` sẽ **PASS bất kể dùng token nào** (2 giá trị `==` nhau), nên không phải regression guard hợp lệ cho lớp bug "sai semantic token, đúng hex tình cờ". Test mới đọc trực tiếp nội dung source (`File(path).readAsStringSync()`) và assert literal identifier `AppColors.buttonBackgroundSecondary` có mặt + `AppColors.bgSecondary` KHÔNG còn mặt, cho cả 3 file.
- Verify thủ công (script) trước khi viết test: `grep -rn "AppColors.bgSecondary" <3 file>` → 0 kết quả sau fix (trước fix: 3 kết quả, đúng 1 mỗi file).
- `python3 scripts/check-mobile-canonical-primitives.py --file <mỗi file trong 3 file trên>` → **OK: 0 anti-pattern hit** (cả 3).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: cả 2 token (`buttonBackgroundSecondary` dòng 8, `bgSecondary` dòng 42) tồn tại thật trong `app_colors.dart`, edit chỉ đổi 1 identifier trên 1 dòng mỗi file, không đổi kiểu/tham số nào khác — không có rủi ro compile error. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không sửa BUG-W03-031 (`internal_product_filter_page.dart`, cùng lớp lỗi) — bug riêng, đang `OPEN`, thuộc scope FIX cycle khác (không nằm trong 2 bug được assign cho cycle này — tránh scope creep giữa 2 cycle chạy song song).
- Không đổi giá trị hex của `bgSecondary`/`buttonBackgroundSecondary` trong `app_colors.dart` — cả 2 token vẫn hợp lệ, chỉ đổi *chỗ dùng sai* trong 3 page trên.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — đổi token `bgSecondary` → `buttonBackgroundSecondary` cho nút secondary tại 3 file (add/edit/detail). Regression test mới (static source assertion). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
