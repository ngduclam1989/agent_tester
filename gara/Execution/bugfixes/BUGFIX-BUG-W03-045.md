# BUGFIX — BUG-W03-045

> Regression trong chính fix BUG-W03-038: guard `_syncedXxx == state.xxx` chặn re-sync dropdown text field sau khi async options load xong — field vẫn hiện trống dù state đã round-trip đúng
> Severity: **P1** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`material_group_filter_page.dart._syncTextController()` và
`internal_product_filter_page.dart._syncGroupTextController()` (field "Nhóm hàng" — CHỈ field này,
KHÔNG phải `_syncTypeTextController` vốn dùng enum local không qua async fetch) vẫn hiện field TRỐNG
khi mở lại Filter page đã có filter áp dụng trước đó, mặc dù `parentId`/`materialGroupId` đã round-trip
đúng vào cubit (fix BUG-W03-038). Đây chính là câu hỏi user đặt ra: "check filter đã áp dụng có
truyền lại data chưa" — câu trả lời: DATA đã truyền đúng (tầng cubit/state), nhưng UI text field không
BAO GIỜ hiện label tương ứng do 1 race condition riêng trong chính logic sync — về mặt hiển thị, hiệu
ứng với user là "vẫn như chưa fix".

## 2. Root cause

`initState()` gọi `cubit.setParentId(widget.initialParentId)` (đồng bộ, emit ngay lập tức) TRƯỚC KHI
`cubit.loadGroupOptionsIfNeeded()` (async, fetch 500 record) resolve. Tại lần build đầu tiên,
`state.groupOptions` vẫn RỖNG → `_optionsFor(state)` không tìm được match → `_textController.text = ''`
— và guard `_syncedParentId = state.parentId` bị "tiêu thụ" (stamp) NGAY TẠI THỜI ĐIỂM ĐÓ, dù chưa hề
resolve được label thật. Khi `loadGroupOptionsIfNeeded()` fetch xong, cubit emit state MỚI có
`groupOptions` đầy đủ nhưng `parentId` KHÔNG đổi (vẫn giá trị cũ) → guard cũ
`if (_syncedParentId == state.parentId) return;` so sánh ĐÚNG (cả 2 cùng giá trị từ pass đầu) → EARLY
RETURN — không bao giờ re-sync lại, dù giờ đã có đủ data để resolve label. Field readOnly (picker,
không phải free-text người dùng gõ) nên đây là 1 lỗi thuần logic memoization, không phải trade-off
UX có chủ đích.

Cùng lớp lỗi y hệt xảy ra độc lập ở `internal_product_filter_page.dart._syncGroupTextController()`
(field "Nhóm hàng" — cũng phụ thuộc `groupOptions` async fetch qua `loadGroupOptionsIfNeeded()`).
`_syncTypeTextController` ("Loại sản phẩm") KHÔNG bị ảnh hưởng vì options của nó là enum local
(`InternalProductType.values`), luôn có sẵn đồng bộ, không qua async — không có "khoảng trống" giữa 2
lần build để guard bị stamp sớm.

## 3. Fix

Bỏ memoization thuần theo value-equality của id; chỉ coi là "đã sync" khi ID khớp VÀ field không đang
ở trạng thái "trống bất thường" (trống trong khi lẽ ra phải có giá trị):

```dart
// Bad — guard tiêu thụ chính nó ở lần build đầu (groupOptions rỗng), không bao giờ retry:
void _syncTextController(MaterialGroupFilterState state) {
  if (_syncedParentId == state.parentId) return;
  _syncedParentId = state.parentId;
  final match = _optionsFor(state).where((o) => o.id == state.parentId);
  _textController.text = match.isNotEmpty ? match.first.label : '';
}

// Good — chỉ skip khi đã sync THẬT (field có giá trị, hoặc không có selection nào cần resolve):
void _syncTextController(MaterialGroupFilterState state) {
  final alreadySynced = _syncedParentId == state.parentId &&
      (_textController.text.isNotEmpty || state.parentId == null);
  if (alreadySynced) return;
  _syncedParentId = state.parentId;
  final match = _optionsFor(state).where((o) => o.id == state.parentId);
  _textController.text = match.isNotEmpty ? match.first.label : '';
}
```

Cùng pattern áp dụng cho `_syncGroupTextController` trong `internal_product_filter_page.dart` (đổi
`_textController`/`_syncedParentId` → `_groupTextController`/`_syncedGroupId`,
`state.parentId` → `state.materialGroupId`). `_syncTypeTextController` giữ nguyên — không có race
tương ứng.

Effect: pass đầu (`groupOptions` rỗng) → `alreadySynced` false (vì `_syncedParentId` chưa từng set) →
resolve `''`, stamp id. Pass thứ 2 (options đã load, id không đổi) → `alreadySynced` false (vì
`_textController.text` đang rỗng dù `state.parentId != null`) → retry resolve → giờ tìm được match →
set label thật, stamp lại id. Pass thứ 3+ (không đổi gì) → `alreadySynced` true (text đã có giá trị,
id không đổi) → skip, không recompute thừa.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart` | `_syncTextController`: guard đổi từ `_syncedParentId == state.parentId` sang thêm điều kiện `_textController.text.isNotEmpty \|\| state.parentId == null` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | `_syncGroupTextController` (CHỈ field "Nhóm hàng"): cùng fix; `_syncTypeTextController` KHÔNG đổi |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_sync_race_test.dart` | **New** — regression test 2-bước (state groupOptions rỗng → state groupOptions đầy đủ) chạy trên real cubit |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_sync_race_test.dart` | **New** — same 2-bước regression cho `_syncGroupTextController` |

## 5. Regression / verification

- 2 file test mới đều mô phỏng ĐÚNG chuỗi sự kiện gây bug (test kiểu cũ chỉ pump 1 state đầy đủ ngay
  từ đầu sẽ KHÔNG bắt được bug này):
  1. **Bước 1**: dùng `Completer` để giữ response `searchMaterialGroups` chưa resolve; gọi
     `cubit.setParentId(7)` (hoặc `setMaterialGroupId(9)`) rồi `unawaited(cubit.loadGroupOptionsIfNeeded())`;
     `pump()` 1 frame → assert field text = `''` (đúng, kỳ vọng tại bước này — `groupOptions` vẫn rỗng).
  2. **Bước 2**: `completer.complete(...)` với response chứa entry khớp id đã set;
     `pumpAndSettle()` → assert field text GIỜ PHẢI hiện đúng label (`'Động cơ'`/`'Lốp xe'`) — đây là
     assertion trực tiếp bắt được bug cũ (guard cũ sẽ early-return ở bước này, field vẫn `''`).
  3. Static source assertion: guard cũ `if (_syncedParentId == state.parentId) return;` /
     `if (_syncedGroupId == state.materialGroupId) return;` KHÔNG còn tồn tại; guard mới
     (`.text.isNotEmpty || ... == null`) có mặt; `_syncTypeTextController` giữ nguyên guard cũ (xác nhận
     KHÔNG bị đụng vào — out of scope).
- `_syncTextController`/`_syncGroupTextController` là private method của `_MaterialGroupFilterPageState`/
  `_InternalProductFilterPageState` — không thể import trực tiếp. Test dùng 1 harness
  `StatefulWidget` tái tạo VERBATIM logic đã fix (post-fix), wired vào cubit thật qua `BlocBuilder`, để
  bài test chạy trên state stream thật thay vì chuỗi static string — cùng chiến lược "reconstruct
  fixed fragment + static source pin" đã dùng xuyên suốt suite này (BUG-W03-021/024/030/032/036/040/041/042),
  mở rộng thêm phần "drive qua real cubit + Completer-controlled async" để pin đúng race condition
  2 bước theo yêu cầu.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart --file mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` → **OK: 0 anti-pattern hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có toolchain (`DEBT-W01-MOBILE-
  BUILD-ENV`). Manual verify: đối chiếu field name/type (`_textController`, `_syncedParentId`,
  `_groupTextController`, `_syncedGroupId`) khớp đúng tên thật trong source; `BasePagingResponse`/
  `BasePagingDataResponse` constructor signature (positional args) đối chiếu khớp với cách dùng đã có
  sẵn trong `material_group_filter_initial_value_test.dart` (BUG-W03-038 test).

## 6. Non-goals / out of scope

- KHÔNG đụng `_syncTypeTextController` (`internal_product_filter_page.dart`) — options của nó là enum
  local, không có race tương ứng, giữ nguyên guard `if (_syncedType == state.productType) return;`.
- KHÔNG thay đổi `loadGroupOptionsIfNeeded()`/`setParentId()`/`setMaterialGroupId()` cubit logic (fix
  BUG-W03-037/038 trước đó) — bug này thuần ở tầng UI-sync (page), không phải cubit/state.
- KHÔNG đổi `DropdownMenuWidget` shared widget hay `onOpened`/`onSelected` callback wiring.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `_syncTextController` (GRP filter) + `_syncGroupTextController` (PROD filter, field "Nhóm hàng" only) guard đổi từ pure `_syncedXxx == state.xxx` value-equality (tự tiêu thụ ở lần build đầu khi options còn rỗng, chặn re-sync vĩnh viễn) sang thêm điều kiện field-not-stuck-empty. 2 regression test mới mô phỏng đúng race 2-bước (groupOptions rỗng → đầy đủ) trên real cubit qua Completer. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
