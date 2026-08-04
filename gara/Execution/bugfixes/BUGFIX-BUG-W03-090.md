# BUGFIX — BUG-W03-090

> Nút "Thiết lập lại" (Reset) trên màn Lọc Nhóm vật tư hàng hoá / Sản phẩm nội bộ đã bị gate theo `isFilterChanged` (do BUG-W03-082) — user clarify lại: nút Reset phải LUÔN active/tappable, chỉ nút "Áp dụng" mới gate theo dirty-state.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User correction sau BUG-W03-082 (mobile dev, "ở màn Lọc thì nút thiết lập lại sẽ luôn bật để reset lại nhé"): BUG-W03-082 đã hiểu nhầm yêu cầu trước đó ("cả nút thiết lập lại nhé") thành "áp cùng gate `isFilterChanged` cho cả 2 nút" — Apply VÀ Reset. Ý user thực sự chỉ là nút "Áp dụng" gate theo `isFilterChanged` (đúng theo `booking_filter_page.dart`); nút "Thiết lập lại" phải LUÔN LUÔN active — kể cả khi mở lại màn filter đã có sẵn giá trị áp dụng từ trước (case `isFilterChanged=false` nhưng user vẫn cần bấm Reset để xoá).

## 2. Root cause

BUG-W03-082 wired `isActive: cubit.isFilterChanged` lên CẢ 2 `BottomActionButtonConfig` — "Thiết lập lại" (Reset) VÀ "Áp dụng" (Apply) — trong `material_group_filter_page.dart` và `internal_product_filter_page.dart`. Việc gate Reset theo `isFilterChanged` disable nút này bất cứ khi nào filter hiện tại trùng khớp "original" — kể cả trường hợp hợp lệ khi user muốn xoá 1 filter đã áp dụng từ trước mà chưa đổi gì kể từ khi mở lại màn (reopen với giá trị sẵn có → `isFilterChanged=false` nhưng Reset vẫn cần tappable được).

## 3. Fix

Xoá dòng `isActive: cubit.isFilterChanged` khỏi `BottomActionButtonConfig` của nút "Thiết lập lại" (Reset) ở CẢ 2 file filter — `isActive` fallback về default của `BottomActionButtonConfig` (`true`, xem `bottom_navigation_bar_button.dart:10`), tức luôn active. Nút "Áp dụng" (Apply) giữ nguyên `isActive: cubit.isFilterChanged` — không đổi. Cubit `isFilterChanged` getter (từ BUG-W03-082) giữ nguyên, không xoá — vẫn cần cho Apply button.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart` | Xoá `isActive: cubit.isFilterChanged,` khỏi Reset `BottomActionButtonConfig` (dòng `title: LocaleKeys.common_reset.tr()` / `onTap: cubit.reset` / `isPrimary: false`). Apply `BottomActionButtonConfig` không đổi. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | Xoá `isActive: cubit.isFilterChanged,` khỏi Reset `BottomActionButtonConfig`. Apply `BottomActionButtonConfig` không đổi. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_dirty_state_test.dart` | **Updated** — file-header comment + 1 test description cập nhật để phản ánh Reset không còn gate theo `isFilterChanged`; **new group** `BUG-W03-090` với 2 static-source assertion test (Reset block KHÔNG chứa `isActive: cubit.isFilterChanged`; Apply block VẪN chứa). 5 test case cũ (cubit-level `isFilterChanged` getter) giữ nguyên logic — vẫn hợp lệ vì getter vẫn dùng cho Apply. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_dirty_state_test.dart` | **Updated** — same treatment, sibling file. |

**Don't-touch respected**: cubits/states (`material_group_filter_cubit.dart`, `material_group_filter_state.dart`, `internal_product_filter_cubit.dart`, `internal_product_filter_state.dart`) không đụng — `isFilterChanged` getter vẫn cần cho nút Áp dụng. 5 test case cubit-level cũ của cả 2 file dirty_state_test không bị xoá/sửa logic, chỉ update description string ở 1 chỗ (test đầu tiên) để chính xác lại nghĩa. Không `git commit`/push.

## 5. Blast-radius verification

- `grep -rln "MaterialGroupFilterPage\|InternalProductFilterPage" lib/` ngoài 2 folder filter: chỉ có 1 comment reference (không phải code dependency) trong `material_group_list_cubit.dart:77`.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` trên cả 2 file `lib/` đã sửa: 0 hit mỗi file.
- Brace/paren balance (grep count) trên 2 file `lib/` đã sửa: cân bằng cả 2. 2 file test đã sửa có parens lệch 1 do string-literal chứa `(` theo đúng pattern đã có tiền lệ trong codebase (vd `material_group_filter_footer_fidelity_test.dart` cũng lệch 78/77 vì lý do tương tự — string search pattern `'BottomActionButtonConfig('`/`'bottomNavigationBar: BottomNavigationBarButton('`) — không phải lỗi cú pháp thật, đã simulate logic bằng Python đối chiếu source thật để xác nhận `resetBlock`/`applyBlock` extract đúng.
- Concurrent-session note: BUG-W03-089 (fix cycle riêng, đang chạy song song) sửa `material_group_search/*` + `internal_product_search/*` (cubit/state/page) — hoàn toàn khác file với fix này (`*_filter_page.dart`), không overlap. Xác nhận qua `git status --short lib/ui/inventory_catalog/`.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có Flutter/Dart toolchain trên `PATH` trong môi trường này (`DEBT-W01-MOBILE-BUILD-ENV`, cùng gap như mọi FIX cycle W03 mobile trước đó, bao gồm BUG-W03-082).

## 6. Regression / verification

| Scenario | Test |
|---|---|
| GRP: Reset `BottomActionButtonConfig` không còn `isActive: cubit.isFilterChanged` (fallback default `true`) | `material_group_filter_dirty_state_test.dart` group `BUG-W03-090` |
| GRP: Apply `BottomActionButtonConfig` vẫn gate `isActive: cubit.isFilterChanged` | `material_group_filter_dirty_state_test.dart` group `BUG-W03-090` |
| PROD: Reset `BottomActionButtonConfig` không còn `isActive: cubit.isFilterChanged` | `internal_product_filter_dirty_state_test.dart` group `BUG-W03-090` |
| PROD: Apply `BottomActionButtonConfig` vẫn gate `isActive: cubit.isFilterChanged` | `internal_product_filter_dirty_state_test.dart` group `BUG-W03-090` |
| `isFilterChanged` getter behavior (BUG-W03-082) không regress — vẫn đúng cho Apply | 5 test case cũ trong cả 2 file `*_dirty_state_test.dart` group `BUG-W03-082` (unchanged logic) |

**Residual risk**: none identified — thay đổi thu hẹp phạm vi (bỏ 1 dòng `isActive:` mỗi file), không đổi hành vi Apply, không đổi cubit/state. `reset()` semantics (clear về `null`) không đổi, không nằm trong scope bug này.
