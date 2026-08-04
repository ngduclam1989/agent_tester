# BUGFIX — BUG-W03-036

> GRP + PROD search page nhét TabBar vào body Column thay vì AppBarCustom.bottom slot + thiếu hasShape:false — double-border risk
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`material_group_search_page.dart` (FEAT-CAT-GRP-LIST search) và `internal_product_search_page.dart` (FEAT-CAT-PROD-LIST search) wire `ListTabBarWidget` như một child trực tiếp của `body: Column([...])`, và KHÔNG set `hasShape: false` trên `AppBarCustom`. `AppBarCustom` mặc định `hasShape: true` tự vẽ 1 border ngay dưới search input (`shape: Border(bottom: BorderSide(...))`); `ListTabBarWidget` tự vẽ 1 border riêng ngay dưới chính nó (`Container(decoration: BoxDecoration(border: Border(bottom: ...)))`). Kết quả: 2 đường kẻ liền kề nhau — double/redundant border — **cùng lớp lỗi** đã fix ở BUG-W03-024 cho list page nhưng bỏ sót ở search page.

## 2. Root cause

`AppBarCustom.hasShape` default `true` được thiết kế cho trường hợp AppBar đứng riêng (không có widget liền kề tự vẽ border). Khi 1 widget khác ngay dưới AppBar (ở đây: `ListTabBarWidget`) tự vẽ border riêng, quy tắc `rules-mobile SKILL.md §2` (bullet 2, established từ chính BUG-W03-024) yêu cầu set `hasShape: false` để tránh double-border — nhưng rule này bị bỏ sót khi viết 2 search page. Đồng thời, đặt `ListTabBarWidget` như body Column child thay vì qua `AppBarCustom.bottom:` là sai idiom Flutter — `AppBarCustom` (giống `AppBar` chuẩn) có sẵn `bottom: PreferredSizeWidget?` slot chính xác cho use-case này, và `preferredSize` đã tự cộng `bottom?.preferredSize.height` (`Size.fromHeight(toolbarHeight + (bottom?.preferredSize.height ?? 0))`). `lib/ui/booking/booking_search/booking_search_page.dart:107-110` đã dùng đúng idiom này (`AppBarCustom(bottom: PreferredSize(preferredSize: Size(0, 44), child: RequestTabBar(...)))`).

`RequestTabBar` (booking) và `ListTabBarWidget` (inventory catalog) có cấu trúc + props gần như giống hệt nhau (`ColoredBox`/`Container` bọc `TabBar` với cùng `labelStyle`/`padding`/`indicatorColor`/`tabAlignment`) — xác nhận height `44` dùng ở booking là giá trị an toàn để tái sử dụng cho `ListTabBarWidget`.

## 3. Fix

Cả 2 file:

1. Di chuyển `ListTabBarWidget` từ `body: Column([ListTabBarWidget(...), Expanded(_buildBody(...))])` sang `AppBarCustom.bottom:`:

   ```dart
   appBar: AppBarCustom(
     isCenterTitle: false,
     hasShape: false,
     titleWidget: AppTextField(...),
     bottom: PreferredSize(
       preferredSize: const Size(0, 44),
       child: ListTabBarWidget(
         tabController: _tabController,
         tabs: [for (final label in _tabLabels()) Tab(text: label)],
       ),
     ),
   ),
   body: _buildBody(context, cubit, state),   // internal_product: _buildBody(context, state)
   ```

2. Thêm `hasShape: false` trên `AppBarCustom` (belt-and-suspenders với việc di chuyển sang `bottom:` — cả 2 cùng phòng double-border, theo established rule `rules-mobile SKILL.md §2`).
3. `body` không còn cần `Column`/`Expanded` wrapper — `_buildBody(...)` trả trực tiếp làm `Scaffold.body` (Scaffold cấp constraint tight height y hệt Expanded trước đó cho các nhánh có `Expanded(ListView.builder)` bên trong; nhánh empty-keyword/loading/no-results giữ nguyên hành vi top-align/center vì các Widget đó (`Padding` mainAxisSize.min, `Center`) không phụ thuộc vào Expanded wrapper để render đúng).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | `ListTabBarWidget` → `AppBarCustom.bottom:` (wrap `PreferredSize(Size(0,44))`); thêm `hasShape: false`; `body` = `_buildBody(...)` trực tiếp |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | Cùng thay đổi |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_appbar_fidelity_test.dart` | **New** — widget test (`AppBarCustom.hasShape == false`, `bottom` non-null, `ListTabBarWidget` là descendant của `AppBarCustom` chứ không phải `body`) + static source assertion |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_appbar_fidelity_test.dart` | **New** — cùng cấu trúc test cho PROD |

## 5. Regression / verification

- 2 test file mới, standalone widget test (no BlocProvider/DI/router — cùng strategy với BUG-W03-021/024/030 test trong suite này vì cubit thật wire qua getIt+AutoRoute) reconstruct đúng widget-tree fragment từ page source đã fix, assert:
  1. `AppBarCustom.hasShape == false`.
  2. `AppBarCustom.bottom != null`.
  3. `ListTabBarWidget` tìm thấy như descendant của `AppBarCustom` (xác nhận wired qua `bottom:`, không phải body).
  4. `Scaffold.body` không còn là `Column` (xác nhận đã bỏ wrapper thừa).
  5. Static source assertion: source chứa `hasShape: false` + `bottom: PreferredSize(`, KHÔNG match regex `body:\s*Column\(`.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` → **OK: 0 anti-pattern hit** cho cả 2 file.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: `AppBarCustom.bottom` field + `preferredSize` getter đã tồn tại sẵn (đọc source `app_bar_custom.dart`), `ListTabBarWidget` không implement `PreferredSizeWidget` nên bắt buộc wrap `PreferredSize` (đã làm) — không phát sinh lỗi type. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không touch `material_group_list_page.dart` / `internal_product_list_page.dart` (LIST pages) — đã có `hasShape: false` fix riêng từ BUG-W03-024 với kiến trúc khác (TabBar giữ trong body ở list page) — không đồng nhất hoá sang search-page pattern trong cycle này (ngoài scope report).
- Không đổi logic `_buildBody` (empty-keyword/loading/no-results/results branches) — chỉ đổi cách wrap TabBar + Scaffold slot.
- Không touch `ListTabBarWidget` shared widget — chỉ call-site (search page) thay đổi cách consume nó (Shared-Symbol Blast-Radius Gate: locus = call-site defect, không phải shared-contract defect).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `ListTabBarWidget` di chuyển từ body Column sang `AppBarCustom.bottom:` (`PreferredSize(Size(0,44))`) + thêm `hasShape: false`, cả 2 file GRP+PROD search. Reference pattern: `booking_search_page.dart`. Regression test mới (widget test x2). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
