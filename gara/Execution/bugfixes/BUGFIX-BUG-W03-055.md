# BUGFIX — BUG-W03-055

> Raw Material `ScaffoldMessenger.showSnackBar` dùng khắp nơi thay vì canonical `ToastMessageUtils.showOnMessage`
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User (mobile dev) báo cáo: "Toast đang dùng sai, phải dùng `ToastMessageUntils` của mobile,
không dùng của material". Audit domain `inventory_catalog` tìm thấy 6 vị trí (7 call site thực
tế — `debug_add_internal_product_sheet.dart` có cả nhánh thành công lẫn nhánh lỗi) dùng raw
Flutter `ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(...)))` thay vì widget
toast chuẩn của app (`lib/ui/widgets/notify/toast_message_utils.dart`,
`ToastMessageUtils.showOnMessage(AppMessageType.<success|error>, message: ...)`) — widget này
không cần `BuildContext` (dùng `appRouter.navigatorKey.currentContext` toàn cục), tự style theo
`AppMessageType`, hỗ trợ swipe-dismiss + hàng đợi tối đa 1 toast hiển thị cùng lúc.

## 2. Root cause

`ToastMessageUtils` được viết và đã dùng đúng ở các domain khác (`service_order/insurance`,
`employee_accounts`) nhưng domain `inventory_catalog` (viết trong cùng wave, nhiều page khác
nhau — delete handler, edit page, add page, debug sheet) không đối chiếu convention hiện có, mỗi
chỗ tự viết trực tiếp `ScaffoldMessenger.of(context).showSnackBar(...)` — API mặc định của
Flutter Material, dễ viết nhất khi không tra widget catalog trước (đúng lớp lỗi widget-catalog-
bypass mà `rules-mobile/SKILL.md` đã cảnh báo, chỉ chưa liệt kê rõ `ToastMessageUtils` là
canonical bắt buộc cho toast).

## 3. Fix

Thay cả 7 call site — `success` → `AppMessageType.success`, `error` → `AppMessageType.error`,
giữ nguyên nội dung message hiện có (qua `LocaleKeys` hoặc literal string cho 2 vị trí
debug-only).

```dart
// Bad — raw Material SnackBar:
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(content: Text(LocaleKeys.catGrp_deleteSuccess.tr())),
);

// Good — canonical app toast:
ToastMessageUtils.showOnMessage(
  AppMessageType.success,
  message: LocaleKeys.catGrp_deleteSuccess.tr(),
);
```

Áp dụng tại 4 file:

- `material_group_delete_handler.dart`: `DeleteOutcome.success` → `AppMessageType.success`
  (`catGrp_deleteSuccess`); `DeleteOutcome.error` → `AppMessageType.error`
  (`catGrp_deleteError`).
- `edit_material_group_page.dart`: `state.cycleError` post-frame callback → `AppMessageType.error`
  (`catGrp_cycleError`); `_submit()` update success → `AppMessageType.success`
  (`catGrp_updateSuccess`).
- `add_material_group_page.dart`: `_submit()` create success → `AppMessageType.success`
  (`catGrp_createSuccess`).
- `internal_product_list/widgets/debug_add_internal_product_sheet.dart` (debug-only, gated
  `kDebugMode` ở call site, tree-shaken khỏi release build): `.then()` success →
  `AppMessageType.success` (literal `'DEBUG: product created successfully'`); `.catchError()`
  → `AppMessageType.error` (literal `'DEBUG: create failed — $e'`).

Mỗi file thêm 2 import: `core/global/app_message_type.dart` (cho `AppMessageType` enum) +
`ui/widgets/notify/toast_message_utils.dart` (cho `ToastMessageUtils`). `package:flutter/material.dart`
vẫn giữ nguyên ở cả 4 file — vẫn cần cho các widget khác (`Container`, `Row`, `Column`,
`BuildContext`, v.v.), không phải import riêng chỉ để dùng `ScaffoldMessenger`/`SnackBar` nên
không có import nào để xoá sau fix.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_delete/material_group_delete_handler.dart` | 2 call site (`DeleteOutcome.success`/`.error`) `ScaffoldMessenger`→`ToastMessageUtils.showOnMessage`; thêm 2 import |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_edit/edit_material_group_page.dart` | 2 call site (`cycleError`/update success) `ScaffoldMessenger`→`ToastMessageUtils.showOnMessage`; thêm 2 import |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart` | 1 call site (create success) `ScaffoldMessenger`→`ToastMessageUtils.showOnMessage`; thêm 2 import |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_list/widgets/debug_add_internal_product_sheet.dart` | 2 call site (debug success/error) `ScaffoldMessenger`→`ToastMessageUtils.showOnMessage`; thêm 2 import |
| `mobile/gf-garage-app/test/ui/inventory_catalog/toast_canonical_bug_055_test.dart` | **New** — static source-assertion regression test, 7 positive assertions (đúng `ToastMessageUtils.showOnMessage(AppMessageType...)` snippet tại từng vị trí) + 4 negative assertions (không còn `ScaffoldMessenger`/`SnackBar(` trong mỗi file) |

## 5. Regression / verification

- `test/ui/inventory_catalog/toast_canonical_bug_055_test.dart` — theo đúng convention
  `File(path).readAsStringSync()` + `expect(source.contains(...))` đã dùng ở
  `material_group_secondary_button_token_test.dart` (BUG-W03-033): pin literal source text của
  từng `ToastMessageUtils.showOnMessage(...)` call (bao gồm cả `AppMessageType` đúng biến thể),
  và assert `ScaffoldMessenger`/`SnackBar(` không còn xuất hiện trong bất kỳ file nào trong 4
  file đã sửa.
- `python3 scripts/check-mobile-canonical-primitives.py --file <mỗi file đã sửa>` → **OK: 0
  anti-pattern hit** cho cả 4 file.
- `grep -n "ScaffoldMessenger\|SnackBar" <4 file>` → 0 hit sau fix (đã verify thủ công).
- Brace/paren balance verify thủ công (đếm `{`/`}` và `(`/`)` mỗi file) → cân bằng, không lệch.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart`
  toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Symbol `ToastMessageUtils`,
  `AppMessageType.success`/`.error` đã verify tồn tại thật trong
  `lib/ui/widgets/notify/toast_message_utils.dart` + `lib/core/global/app_message_type.dart`,
  và cùng pattern gọi verbatim với usage hiện có tại `insurance_allocation_section.dart`.

## 6. Non-goals / out of scope

- KHÔNG đụng `internal_product_detail_page.dart`, `inventory_catalog_document.dart`,
  `material_group_list_page.dart`, `group_list_card.dart` — các file này đang có agent khác xử
  lý song song trong cùng cycle.
- KHÔNG đổi behavior/style/duration của `ToastMessageUtils` widget chung — chỉ đổi call site để
  dùng đúng API đã có sẵn.
- KHÔNG audit toàn bộ repo tìm thêm vị trí `ScaffoldMessenger` khác ngoài domain
  `inventory_catalog` — ngoài phạm vi bug row này (chỉ liệt kê 4 file/6 vị trí cụ thể).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — 7 call site raw `ScaffoldMessenger.showSnackBar` đổi sang canonical `ToastMessageUtils.showOnMessage(AppMessageType...)` across 4 file. 1 regression test mới (static source-assertion). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
