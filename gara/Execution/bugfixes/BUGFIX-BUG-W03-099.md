# BUGFIX — BUG-W03-099

> BUG-W03-093 fix chưa triệt để — field "Tính chất" (`productType`) trên màn Lọc Sản phẩm nội bộ vẫn KHÔNG mặc định hiện "Tất cả" khi mở màn Lọc lần đầu, vì sync guard tự short-circuit ngay lần build đầu tiên.
> Severity: **P1** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User report 2026-07-02 (mobile dev): "sao phần Bộ Lọc của màn sản phẩm, Tính chất mặc định ko phải là Tất cả? chỗ này bạn chưa sửa sao?" — đúng. BUG-W03-093 (commit `7443fd35`) chỉ xoá nhánh đặc biệt hardcode blank-string cho `productType == null`, nhưng bỏ sót nguyên nhân gốc thật sự nằm ở GUARD phía trên nhánh đó — guard này tự short-circuit ngay lần build đầu tiên, khiến logic resolve (bao gồm cả phần BUG-093 vừa sửa) không bao giờ được chạy tới trong trường hợp phổ biến nhất (mở màn Lọc không có `initialProductType`).

## 2. Root cause

```dart
InternalProductType? _syncedType;   // instance field, mặc định null
...
void _syncTypeTextController(InternalProductFilterState state) {
  if (_syncedType == state.productType) return;
  _syncedType = state.productType;
  final match = _typeOptions().where((o) => o.type == state.productType);
  _typeTextController.text = match.isNotEmpty ? match.first.label : '';
}
```

`state.productType` cũng mặc định `null` (`@Default(null) InternalProductType? productType` trong `InternalProductFilterState`). Khi mở màn Lọc KHÔNG có `initialProductType` (trường hợp phổ biến nhất — bấm "Lọc" từ màn PROD list chưa từng lọc gì), `state.productType` giữ nguyên `null` ở lần build đầu tiên. Vì `_syncedType` CŨNG khởi tạo `null`, guard `_syncedType == state.productType` đánh giá `null == null` → `true` ngay tại lần gọi đầu tiên → method return sớm, `_typeTextController.text` KHÔNG BAO GIỜ được set — field giữ nguyên rỗng mặc định của `TextEditingController()` thay vì "Tất cả".

Đây là bug class khác với case BUG-093 đã sửa: BUG-093 là 1 nhánh hardcode blank-string bị chạy đúng cách (khi guard đã pass); BUG-099 là guard PHÍA TRÊN không bao giờ để nhánh nào bên trong chạy ở lần build đầu tiên, kể cả nhánh đã fix của BUG-093. Bug này CHỈ xảy ra khi giá trị mặc định của state trùng với sentinel mặc định của guard field (cả hai đều `null`) — khác với case user tự chọn "Tất cả" thủ công (lúc đó `state.productType` đổi qua lại từ non-null → null, guard hoạt động đúng vì 2 giá trị khác nhau tại đúng thời điểm build đó, giống như test cũ của BUG-093 đã pin).

Cùng họ với sync-guard bug đã sửa ở BUG-W03-045/082 (memory lesson FIX-031: guard "tiêu thụ" chính nó khi phụ thuộc data async) nhưng khác cơ chế — ở đây KHÔNG có async involved, thuần tuý là 2 giá trị (guard sentinel vs state default) trùng nhau tại lần build đầu tiên. Ghi lesson riêng: `.claude/memory/fix.md` [FIX-049].

## 3. Fix

Thêm 1 cờ "đã từng sync chưa" (`bool _typeSynced = false;`) tách biệt khỏi giá trị đã sync, đảm bảo lần build đầu tiên LUÔN chạy qua logic resolve bất kể `state.productType` là gì:

```dart
InternalProductType? _syncedType;
bool _typeSynced = false;
...
void _syncTypeTextController(InternalProductFilterState state) {
  if (_typeSynced && _syncedType == state.productType) return;
  _typeSynced = true;
  _syncedType = state.productType;
  final match = _typeOptions().where((o) => o.type == state.productType);
  _typeTextController.text = match.isNotEmpty ? match.first.label : '';
}
```

Các lần build sau (khi `_typeSynced == true`) vẫn áp dụng no-op check `_syncedType == state.productType` như cũ — không đổi hành vi steady-state, chỉ đóng lỗ hổng ở lần build đầu tiên.

### Audit `_syncGroupTextController` ("Nhóm hàng") — KHÔNG sửa

```dart
void _syncGroupTextController(InternalProductFilterState state) {
  final syncKey = '${state.materialGroupId}_${state.groupOptions.length}';
  if (_syncedGroupKey == syncKey) return;
  _syncedGroupKey = syncKey;
  ...
}
```

`_syncedGroupKey` là `String?` mặc định `null`, còn `syncKey` LUÔN là 1 `String` cụ thể không null (vd `'null_0'` ở lần build đầu tiên khi `materialGroupId == null` và `groupOptions` rỗng). `null != 'null_0'` → guard này KHÔNG collapse ở lần build đầu tiên — an toàn, đã xác nhận lại bằng cách đọc trực tiếp code hiện tại. Để nguyên, không áp flag `_typeSynced`-style phòng thủ ở đây vì không cần thiết (tránh over-fix).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | Thêm field `bool _typeSynced = false;`; đổi guard trong `_syncTypeTextController` thành `if (_typeSynced && _syncedType == state.productType) return; _typeSynced = true; ...`. `_syncGroupTextController` không đổi (đã audit, an toàn). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_type_all_option_sync_test.dart` | Cập nhật harness `_SyncHarnessState` để phản ánh đúng logic ĐÃ FIX (thêm `_typeSynced`) — 2 test BUG-093 cũ giữ nguyên assertion. Thêm 3 test case mới cho BUG-W03-099: (1) very-first-build với `state.productType == null` resolves "Tất cả" thay vì rỗng; (2) rebuild với giá trị KHÔNG đổi sau lần sync đầu vẫn no-op đúng; (3) first-build với `initialProductType` non-null vẫn resolve đúng nhãn (không regress path cũ). |

**Don't-touch respected**: cubit (`internal_product_filter_cubit.dart`), state (`internal_product_filter_state.dart`), và `_syncGroupTextController` không bị đổi.

## 5. Blast-radius verification

- `_syncTypeTextController` có đúng 1 consumer (`InternalProductFilterPage.builder`, gọi mỗi rebuild) — không cần shared-symbol gate.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` → 0 hit.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_type_all_option_sync_test.dart` → 0 hit.
- Brace/paren/bracket balance verified trên cả 2 file — cân bằng.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có Flutter/Dart toolchain trên `PATH` trong môi trường này (`DEBT-W01-MOBILE-BUILD-ENV`, cùng gap như mọi FIX cycle W03 mobile trước đó, gồm cả BUG-W03-082/090/093).

## 6. Regression / verification

| Scenario | Test |
|---|---|
| Very first build, `state.productType == null`, chưa từng gọi `_syncTypeTextController` trước đó → resolves "Tất cả" (không phải rỗng) | `internal_product_filter_type_all_option_sync_test.dart` |
| Rebuild với giá trị KHÔNG đổi sau lần sync đầu vẫn no-op đúng (giữ "Tất cả", không re-resolve/clear) | `internal_product_filter_type_all_option_sync_test.dart` |
| First build với `initialProductType` non-null (đường cũ) vẫn resolve đúng nhãn — không regress | `internal_product_filter_type_all_option_sync_test.dart` |
| (Kế thừa BUG-093) Default state resolves "Tất cả" từ lần build đầu | `internal_product_filter_type_all_option_sync_test.dart` |
| (Kế thừa BUG-093) Sau Reset, field resolve lại "Tất cả" thay vì kẹt rỗng | `internal_product_filter_type_all_option_sync_test.dart` |

**Residual risk**: không xác định thêm — thay đổi chỉ thêm 1 flag boolean và điều kiện `_typeSynced &&` vào guard hiện có, không đổi logic resolve hay bất kỳ field nào khác. `_syncGroupTextController` / cubit / state không bị ảnh hưởng by construction.
