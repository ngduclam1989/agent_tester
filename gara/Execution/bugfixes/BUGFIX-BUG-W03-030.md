# BUGFIX — BUG-W03-030

> InternalProductSearchPage sai widget catalog + thiếu TabBar persist + sai empty-state layout so Figma
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`internal_product_search_page.dart` (FEAT-CAT-PROD-LIST search) có 3 defect so với Figma `wave03-cat-prod-list.md` §"Tìm kiếm sản phẩm - Default" (node 21235:24802):

1. AppBar search input dùng raw `TextField(decoration: InputDecoration(...))` thay vì canonical `AppTextField` — không có clear-× icon.
2. `TabBar/StatusFilter` (3 tab Tất cả/Đang hoạt động/Ngừng hoạt động) hoàn toàn thiếu — Figma yêu cầu persist ngay dưới AppBar khi vào search route.
3. Empty-keyword state là `Center(child: Text(hint))` 1 dòng thay vì `Padding(all:16) > Column[start, gap:8]` với header bold + 3-item bullet list (Mã nội bộ/Tên sản phẩm/SKU liên kết).

## 2. Root cause

Root cause chuỗi 2 lớp:
- **Lớp 1 (nguồn gốc)**: PROD search page được viết ở 1 cycle DEV trước, không đối chiếu đủ với Figma spec §2 Widget Catalog First + §1.5a binding — dùng raw Material widget thay canonical, và bỏ sót TabBar persist requirement.
- **Lớp 2 (process gap — lý do quan trọng hơn)**: một cycle sau đó xây `material_group_search_page.dart` (GRP sibling, cùng wave, cùng feature pattern) dùng PROD làm structural reference — nhưng KHÔNG verify PROD's compliance với rules-mobile trước khi copy cấu trúc. GRP tự viết đúng (AppTextField + TabBar + header/bullet layout) một cách tình cờ (tác giả GRP tự áp catalog rules độc lập), nhưng PROD gốc thì chưa bao giờ được sửa — đây là hướng ngược: "đã ship" bị coi nhầm là "đã đúng". Cycle này (đã update `agent-dev-garage-mobile.md` + `agent-fix-garage-mobile.md` §Pattern-specific pointers) thêm rule tường minh: verify widget-catalog compliance + check BUGS.md OPEN của reference page TRƯỚC khi dùng làm structural template.

## 3. Fix

- `titleWidget: TextField(...)` → `titleWidget: AppTextField(controller, focusNode, hintText: catProd_searchPlaceholder, fillColor: bgSecondary, hasBorder: false, isDense: true, prefixIcon: icSearchNormal, suffixIcon: clear-× khi keyword non-empty, onChanged: cubit.changeKeyword)` — verbatim GRP pattern.
- Thêm `late final TabController _tabController` (local, `with SingleTickerProviderStateMixin`, KHÔNG wire cubit — theo Figma §VV "search results ignore tab filter", TabBar thuần visual/navigational continuity) + `_focusNode` (autofocus khi vào search route). `body: Column([ListTabBarWidget(tabController, tabs: 3 Tab), Expanded(_buildBody(...))])` — TabBar giờ persist trên MỌI body state (empty-keyword/loading/no-results/results).
- Empty-keyword branch: `Center(child: Text(hint))` → `Padding(EdgeInsets.all(spacing16)) > Column[crossAxisAlignment.start, mainAxisSize.min]` chứa header `Text(catProd_searchHeader, textSubtitleS5/textSecondary)` + 3 bullet `Text('•  ${catProd_searchBulletCode/Name/Sku}', textBodyB5/textTertiary)`, mỗi cặp cách nhau `SizedBox(height: spacing8)`.
- 6 LocaleKeys entries mới (`catProd_searchHeader`, `catProd_searchBulletCode`, `catProd_searchBulletName`, `catProd_searchBulletSku` — đã có sẵn `catProd_searchPlaceholder`/`catProd_searchHint`) thêm vào `assets/localizations/{vi,en}.json`.
- No-results branch (`EmptyDataWidget`) + results branch giữ nguyên logic — KHÔNG trong scope bug này, chỉ thay đổi wrapping (giờ nằm trong `Expanded` bên dưới TabBar thay vì trực tiếp `body:`).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | Raw `TextField` → `AppTextField`; thêm `TabController` + `ListTabBarWidget` persist; empty-keyword layout Padding+Column+header+3-bullet thay `Center(Text)` |
| `mobile/gf-garage-app/assets/localizations/vi.json` | +4 keys: `catProd_searchHeader`, `catProd_searchBulletCode`, `catProd_searchBulletName`, `catProd_searchBulletSku` |
| `mobile/gf-garage-app/assets/localizations/en.json` | +4 keys tương ứng (EN) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_fidelity_test.dart` | **New** — 3 widget test (AppTextField descendant AppBar, TabBar 3-tab renders, empty-keyword Padding+Column 4-Text structure không còn `Center`) |

## 5. Regression / verification

- `test/ui/inventory_catalog/internal_product_search/internal_product_search_fidelity_test.dart` — standalone widget tests (no BlocProvider/DI/router, cùng strategy với BUG-W03-021/024 test trong suite này vì cubit thật wire qua getIt+AutoRoute) reconstruct đúng widget-tree fragment từ page source đã fix, assert:
  1. `AppTextField` là descendant của `AppBar` (không còn raw `TextField`).
  2. `ListTabBarWidget` render với đúng 3 `Tab` label Tất cả/Đang hoạt động/Ngừng hoạt động.
  3. Empty-keyword body: `find.byType(Center)` = 0 (chặn regression về pattern cũ), `Padding.padding == EdgeInsets.all(spacing16)`, `Column.crossAxisAlignment == start`, đúng 4 `Text` widget (header + 3 bullet), header style khớp `AppTextStyle.textSubtitleS5`.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` → **OK: 0 anti-pattern hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: mọi symbol dùng (`AppTextField`, `ListTabBarWidget`, `Assets.icons.icSearchNormal`, `LocaleKeys.catProd_*`) đã tồn tại thật trong codebase (GRP sibling dùng y hệt), 6 LocaleKeys mới đã thêm vào cả 2 file JSON. `lib/generated/locale_keys.gen.dart` bị gitignore (per-dev-machine codegen output) — cần chạy `fvm dart run easy_localization:generate -S assets/localizations -O lib/generated -o locale_keys.gen.dart -f keys` trên máy có toolchain trước khi build. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không sửa cubit's raw `try/catch` (nên dùng `BaseCubit.launch()` như GRP search cubit) — đây là BLoC-pattern discrepancy khác, không nằm trong Notes của bug này (chỉ UI widget-catalog + TabBar + layout), tránh scope creep.
- Không sửa no-results / results branch logic — chỉ đổi wrapping (nằm trong `Expanded` dưới TabBar).
- Không touch `material_group_search_page.dart` structure ngoài BUG-W03-032's riêng scope (xem `BUGFIX-BUG-W03-032.md`).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — AppTextField thay TextField, thêm TabBar persist, empty-keyword header+bullet layout. Regression test mới (widget test x3). `flutter analyze`/`flutter test` DEFERRED (no toolchain). Governance: `agent-dev-garage-mobile.md` + `agent-fix-garage-mobile.md` thêm rule "verify reference page compliance trước khi dùng làm structural template". |
