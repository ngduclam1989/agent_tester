# BUGFIX BUG-W01-276 — Mobile SO Edit (BH): "Áp dụng tất cả" chỉ fill khấu hao dòng đầu

> **Status**: OPEN (cần diagnose — root cause downstream chưa pin chắc).
> **Severity**: P2.
> **Boundary**: garage-mobile.
> **Authored by**: agent-fix-garage-mobile (Wave 01).
> **Related**: AC-8, BR-INS-SO-ADJ-004; BUG-W01-274 (cùng ô khấu hao).

---

## 1. Failure mode

Màn SO Edit có Bảo hiểm, section "Phân bổ quyết toán bảo hiểm": nhập mức khấu hao đồng
loạt rồi nhấn **"Áp dụng tất cả"** → chỉ phụ tùng **đầu tiên (index 0)** được fill giá trị
khấu hao; các dòng phụ tùng còn lại không cập nhật. Vi phạm AC-8 + BR-INS-SO-ADJ-004
("Áp dụng tất cả" set MỌI dòng phụ tùng BH = mức đồng loạt).

## 2. Root cause (candidate — cần confirm khi diagnose)

`applyDepreciationToAll()` (`lib/ui/service_order/insurance/cubit/insurance_allocation_cubit.dart:139`)
build `depreciationByLine` cho **mọi** `state.partLines` — **logic cubit đúng**. Root cause
nằm downstream, ứng viên:

- **(a) `_lineId` collision** — `_PartItemCard._lineId = item.localId ?? item.sku ?? '${item.partId}'`
  (`items_page_v3.dart:836`). Nếu nhiều part thiếu `localId`+`sku` và trùng `partId` → cùng
  key → map collapse còn 1 entry, hoặc nhiều card cùng key. Derivation phải khớp
  `InsuranceBreakdownMapper.partLinesOf` (`insurance_breakdown_mapper.dart:62` — cùng công
  thức `localId ?? sku ?? partId`).
- **(b) `state.partLines` không đầy đủ / stale** lúc nhấn nút — `partLinesOf` chỉ lấy part
  payer=insurance (`insurance_breakdown_mapper.dart:55–67`); listener cập nhật partLines khi
  `partItems` đổi (`items_page_v3.dart:98–110`). Nếu update chưa flush trước tap → map thiếu
  dòng.
- **(c) `ValueKey(item.localId)`** trùng (localId null) → card không rebuild độc lập.
- **(d) per-card `BlocListener.listenWhen`** so `depreciationByLine[_lineId]` — chỉ fire cho
  card có key đúng; key mismatch → card không phản ánh.

## 3. Diagnosis steps (trước khi sửa)

1. Log `depreciationByLine` map sau `applyDepreciationToAll()`; đếm số key vs số part BH.
2. Log `_lineId` từng `_PartItemCard` vs key trong map → tìm mismatch/collision.
3. Kiểm `state.partLines.length` vs số dòng BH render; kiểm `localId` có unique không.

## 4. Fix direction / don't-touch

- **Fix direction**: đảm bảo mỗi dòng phụ tùng có `localId` **unique & ổn định**; `partLinesOf`
  đăng ký đủ mọi part BH; mỗi card listener phản ánh đúng key của nó.
- **Touched (dự kiến)**: `insurance_breakdown_mapper.dart` (lineId/partLinesOf),
  `items_page_v3.dart` (`_lineId`, `ValueKey`, BlocListener). `applyDepreciationToAll` **giữ
  nguyên** trừ khi diagnosis chỉ vào đó.
- **Don't-touch**: gate khấu hao của BUG-W01-274; công thức tính khấu hao.

## 5. Regression test

Widget test (group BUG-W01-276): SO Edit BH với ≥2 part payer=insurance, nhập % đồng loạt,
tap "Áp dụng tất cả" → **mọi** dòng hiển thị đúng %. Thêm ca part trùng SKU/partId để chặn
tái phát collision.

## 6. Status

VERIFIED (2026-06-15). Root cause pinned: `BlocListener._previousState` drift — emission
trung gian của `_insuranceCubit` (`updateBreakdown` do outer BlocListener fire khi `partItems`
emit async) cập nhật `BlocListenerBase._previousState` cho các card 1+; khi `applyDepreciationToAll`
emit sau đó, `listenWhen(prev=đã_update, curr=cùng_value)` trả `false` → listener không fire cho
card 1+ (chỉ card 0 — mount đầu — thoát). Fix: thay `BlocListener<InsuranceAllocationCubit>` →
`BlocBuilder<InsuranceAllocationCubit>` trong `_PartItemCard.build()` (`items_page_v3.dart`),
builder sync trực tiếp `_depreciationController.text` từ state — loại bỏ `_previousState` dependency.
`insurance_breakdown_mapper.dart` không đổi. Regression test: group BUG-W01-276 (8 tests) tại
`test/ui/service_order_v3/service_order_creation_v3/pages/insurance_allocation_apply_all_test.dart`.
`fvm flutter analyze` + `fvm flutter test` 0 error. L2: `Tracking/WAVE01/verify/BUG-W01-276.verify.md`.
