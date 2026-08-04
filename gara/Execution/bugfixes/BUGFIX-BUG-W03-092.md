# BUGFIX — BUG-W03-092

> `FEAT-CAT-PROD-DETAIL` — pull-to-refresh trên Internal Product Detail không hiện indicator gì cả (`AlwaysScrollableScrollPhysics` trên inner `SingleChildScrollView` cướp gesture khỏi outer `CustomScrollView` của `SmartRefresher`)
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

User report (mobile dev, 2026-07-02): "Tôi pull down thấy không hiện" — hỏi tại sao Group Detail
có refresh mà Product Detail thì không, dù cả 2 đều đã có `isShowLoading: false` đúng (BUG-W03-088).
Orchestrator audit toàn bộ `SmartRefresher` usage trong codebase (`supplier_detail_page.dart`,
`booking_detail_page.dart`, `settlement_detail_page.dart`, `insurance_settlement_detail_screen.dart`,
`material_group_detail_page.dart`) xác nhận: `internal_product_detail_page.dart:107-108` là NƠI DUY
NHẤT set `physics: const AlwaysScrollableScrollPhysics()` trên `SingleChildScrollView` bên trong
`SmartRefresher` — mọi consumer khác để `physics` mặc định.

## 2. Root cause

Package `pull_to_refresh` 2.0.0's `SmartRefresherState._buildBodyBySlivers` (+
`_buildSliversByChild`) chỉ unwrap slivers trực tiếp khi `child is ScrollView`
(`ListView`/`GridView`/`CustomScrollView`). `SingleChildScrollView` KHÔNG phải `ScrollView` (nó là
`StatelessWidget` tự build 1 `Scrollable` nội bộ, không `extends ScrollView` và không phải chính nó
là `Scrollable`), nên rơi vào fallback branch: package bọc TOÀN BỘ `SingleChildScrollView` như 1
`SliverRefreshBody` bên trong 1 `CustomScrollView` NGOÀI (do `SmartRefresher` tự dựng, mang
pull-header sliver) — tạo ra scrollable-lồng-scrollable thật sự.

Với 2 scrollable dọc lồng nhau cùng cạnh tranh 1 gesture arena, scrollable nào **accept** drag từ
pixel đầu tiên sẽ thắng arena, scrollable kia không bao giờ nhận được gesture. `physics: const
AlwaysScrollableScrollPhysics()` trên `SingleChildScrollView` (inner) làm nó LUÔN accept drag —
kể cả khi content ngắn hơn viewport (scroll extent = 0) — nên inner scrollable luôn thắng arena,
gesture không bao giờ chạm tới outer `CustomScrollView` sở hữu pull-header sliver → header KHÔNG
BAO GIỜ hiện, khớp đúng mô tả user "pull down thấy không hiện" (không phải lệch vị trí — hoàn toàn
vắng mặt).

Override này có từ trước, độc lập với 2 lần rewrite content sau đó (BUG-W03-053 field/composition
rewrite, BUG-W03-073 padding/gap fix) — cả 2 bugfix doc đó show `physics:
const AlwaysScrollableScrollPhysics(),` giữ nguyên không đổi trong before/after code block của
chúng, nghĩa là dòng này đã tồn tại từ implementation gốc của page, chỉ tình cờ "sống sót" qua các
lần fix không liên quan tới scroll/refresh.

**Verify trực tiếp trên package source đã vendor** (`~/.pub-cache/hosted/pull_to_refresh-2.0.0/lib/src/smart_refresher.dart`,
`_buildBodyBySlivers` dòng ~383-422): khi `childView` không phải `ScrollView`, outer
`CustomScrollView` mà `SmartRefresher` tự dựng LUÔN mặc định `physics:
_getScrollPhysics(conf, widget.physics ?? AlwaysScrollableScrollPhysics())` — **độc lập hoàn toàn
với physics của inner child**. Nghĩa là mối lo ban đầu ("cho phép scroll khi content ngắn hơn
viewport") mà override này nhắm tới **đã được outer wrapper tự đảm bảo sẵn, không cần set gì thêm
ở tầng nào cả** — khớp đúng hành vi quan sát được ở `material_group_detail_page.dart` (không có
override, refresh header hiện đúng dù content ngắn/dài).

## 3. Fix

`internal_product_detail_page.dart`, `_buildContent`'s loaded-state branch:

```dart
// Before (bug)
final detail = state.detail!;
return SingleChildScrollView(
  physics: const AlwaysScrollableScrollPhysics(),
  child: Padding(
    padding: const EdgeInsets.all(AppSizes.spacing16),
    ...

// After (fix)
final detail = state.detail!;
return SingleChildScrollView(
  child: Padding(
    padding: const EdgeInsets.all(AppSizes.spacing16),
    ...
```

Chỉ xoá dòng `physics:` — không đổi gì khác trong `_buildContent`, không đụng
`SmartRefresher`/`RefreshController`/`onRefresh` wiring (đã đúng từ BUG-W03-088), không đụng
skeleton-loading branch (dùng `ListView`, không liên quan). Không set `physics` ở tầng
`SmartRefresher` outer (`widget.physics`) — theo §2, outer wrapper đã tự default
`AlwaysScrollableScrollPhysics` cho trường hợp non-`ScrollView` child, set thêm là thừa và không
cần thiết để giải quyết concern "content ngắn vẫn pull được".

## 4. Blast radius

- 1 file, 1 dòng xoá. Không đổi public API/contract/entity/event.
- Không phải shared symbol (page-local `_buildContent`, không có consumer khác) — Shared-Symbol
  Blast-Radius Gate không áp dụng.
- Đã audit toàn bộ 12 `SmartRefresher(` usage trong `lib/ui/**` — `internal_product_detail_page.dart`
  là điểm duy nhất có pattern này; các usage còn lại (`material_group_detail_page.dart`,
  `supplier_detail_page.dart`, `booking_detail_page.dart`, `settlement_detail_page.dart`,
  `insurance_settlement_detail_screen.dart`, + non-detail-page consumers trong
  `lib/ui/widgets/{bottom_sheet,list,loading}/**` và `home_page.dart`) không bị ảnh hưởng bởi fix
  này (không chạm file nào khác).

## 5. Regression test

`mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_092_test.dart`
(mới) — static source assertion (nhất quán với `internal_product_detail_bug_073_test.dart` /
`_bug_053_test.dart`, page không có DI-mocking widget-tree pump precedent cho cubit/AutoRoute-wired
page này):

1. Inner `SingleChildScrollView` trong loaded-state branch đi thẳng `child: Padding(...)`, không
   còn `physics:` argument nào + không còn chứa `AlwaysScrollableScrollPhysics` trong đoạn code đó.
2. `SmartRefresher` + `enablePullDown: true` wiring vẫn nguyên vẹn (không bị fix này đụng tới).
3. **Canary xuyên codebase**: assert 5 sibling `SmartRefresher` + `SingleChildScrollView` consumer
   khác (`material_group_detail_page.dart`, `supplier_detail_page.dart`,
   `booking_detail_page.dart`, `settlement_detail_page.dart`,
   `insurance_settlement_detail_screen.dart`) đều KHÔNG set `physics:` trên `SingleChildScrollView`
   của chúng — giữ pattern này là convention toàn app, không chỉ 1 file được vá lẻ.

Mọi assertion regex/substring đã pre-validate độc lập bằng script Python tương đương chạy trên
chính working tree hiện tại trước khi commit vào file test (3 test case, tất cả pass) — theo đúng
lesson từ BUG-W03-053 v2 correction (không tin tưởng assertion tự viết mà không re-check lại
source thật).

## 6. Verification status

- `python3 scripts/check-mobile-canonical-primitives.py --file
  mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart`
  → **OK: 0 anti-pattern hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED — no `fvm`/`flutter`/`dart` toolchain in
  this environment** (`DEBT-W01-MOBILE-BUILD-ENV`). Regression test written statically-correct;
  assertions pre-validated against actual file content via equivalent Python logic (§5). TEST_GROUP
  phải chạy `fvm flutter analyze` + `fvm flutter test` trên máy có toolchain trước khi flip
  `VERIFIED`.
- KG (`Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml`): **not updated** — pure
  scroll-physics/gesture-arena bugfix, không đổi entity/event/permission/screen contract.

## 7. Non-goals / out of scope

- Không đụng `SmartRefresher`/`onRefresh`/`RefreshController` wiring — đã đúng từ BUG-W03-088.
- Không đụng skeleton-loading branch (`ListView`, không phải `SingleChildScrollView`, không nằm
  trong bug scope).
- Không thêm `physics:` param nào ở tầng `SmartRefresher` outer — theo §2/§3, không cần thiết vì
  outer wrapper đã tự default đúng hành vi.
- Không sửa các `SmartRefresher` consumer khác — chúng vốn đã đúng convention (không set physics),
  audit ở §4 chỉ để xác nhận, không phải để sửa.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial fix — removed `physics: const AlwaysScrollableScrollPhysics()` from the inner `SingleChildScrollView` in `internal_product_detail_page.dart`'s loaded-state `_buildContent` branch (gesture-arena conflict with `SmartRefresher`'s outer `CustomScrollView`, verified against vendored `pull_to_refresh` 2.0.0 package source). 1 lib file + 1 new regression test file (static source assertion + codebase-wide canary). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
