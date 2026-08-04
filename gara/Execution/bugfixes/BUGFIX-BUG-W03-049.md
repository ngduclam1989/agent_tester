# BUGFIX — BUG-W03-049

> No-results state lệch nhau GRP vs PROD — PROD dùng sai `EmptyDataWidget` (icon "không có dữ liệu" chung) thay vì icon kính lúp đúng spec riêng
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

`MaterialGroupSearchPage._buildBody()` (GRP) và `InternalProductSearchPage._buildBody()` (PROD) đều có nhánh "no results" khi `state.hasSearched && (state.groups|state.products).isEmpty`. GRP render đúng theo `wave03-cat-grp-list.md` §Search No-Results: `Center > Column [AppImage(magnifyingGlass) 40x40 + Text title (textSubtitleS4) + Text desc (textCaptionC7)]`. PROD lại dùng `EmptyDataWidget(text: LocaleKeys.common_noResults.tr())` — widget mặc định vẽ icon tài liệu/thư mục chung (`assets/icons/empty-data.svg`) dùng cho state "không có dữ liệu" (list rỗng), sai với chính Figma spec của PROD (`wave03-cat-prod-list.md`, node `21235:24823`, `_png_verified`: "Empty illustration is magnifying-glass line-art (search-specific, NOT generic document like 'Không có dữ liệu')") và sai text (1 dòng thay vì 2 dòng title+desc như spec + GRP đã dùng đúng). User (mobile dev) yêu cầu đồng nhất trải nghiệm 2 màn.

## 2. Root cause

PROD's no-results branch được implement độc lập với GRP thay vì tái sử dụng cùng 1 UI fragment, dẫn tới: (a) dùng nhầm shared widget generic-purpose (`EmptyDataWidget`, đúng cho use-case list-rỗng-không-search khác) cho use-case search-no-results (cần icon + wording riêng theo spec); (b) dùng sai locale key (`common_noResults` 1 dòng thay vì `catGrp_searchNoResultsTitle`/`catGrp_searchNoResultsDesc` 2 dòng). Cả 2 spec Figma (GRP + PROD) yêu cầu content **verbatim giống hệt nhau** ở state này — không có lý do nghiệp vụ để 2 màn lệch nhau.

## 3. Fix

Extract nhánh no-results ĐÚNG của GRP thành 1 shared `StatelessWidget` mới, rồi cho cả 2 page dùng chung:

```dart
// lib/ui/inventory_catalog/widgets/catalog_search_no_results.dart
class CatalogSearchNoResults extends StatelessWidget {
  const CatalogSearchNoResults({super.key, this.title, this.description});

  final String? title;
  final String? description;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AppImage(Assets.icons.magnifyingGlass, height: 40, width: 40, color: AppColors.textTertiary),
          const SizedBox(height: AppSizes.spacing16),
          Text(title ?? LocaleKeys.catGrp_searchNoResultsTitle.tr(),
              style: AppTextStyle.textSubtitleS4.copyWith(color: AppColors.textPrimary)),
          Text(description ?? LocaleKeys.catGrp_searchNoResultsDesc.tr(),
              style: AppTextStyle.textCaptionC7.copyWith(color: AppColors.textTertiary)),
        ],
      ),
    );
  }
}
```

**Locale key choice**: dùng lại `catGrp_searchNoResultsTitle`/`catGrp_searchNoResultsDesc` (namespace `catGrp_*`) làm default cho CẢ 2 domain, thay vì tạo cặp key `catProd_*` trùng lặp — vì cả 2 Figma spec (GRP + PROD) yêu cầu wording verbatim giống nhau ở state này ("Không có kết quả phù hợp" / "Vui lòng thử lại"). Có `title`/`description` optional override nếu 1 domain sau này cần wording riêng (tránh phải sửa lại constructor). Đây là judgment call theo đúng gợi ý trong bug notes ("dùng key `catGrp_*` cho cả 2 chấp nhận được, tránh tạo duplicate key") — không tạo `catProd_searchNoResultsTitle`/`Desc` mới.

Cả 2 page thay nhánh cũ:

```dart
// GRP — material_group_search_page.dart._buildBody()
if (state.hasSearched && state.groups.isEmpty) {
  return const CatalogSearchNoResults();
}

// PROD — internal_product_search_page.dart._buildBody()
if (state.hasSearched && state.products.isEmpty) {
  return const CatalogSearchNoResults();
}
```

`EmptyDataWidget` (`lib/ui/widgets/loading/empty_data_widget.dart`) **không đổi** — vẫn đúng cho use-case khác (list rỗng không qua search).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/catalog_search_no_results.dart` | **NEW** — shared `CatalogSearchNoResults` widget. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | No-results branch: inline `Center > Column [...]` → `const CatalogSearchNoResults()`. Import `images/app_image.dart` removed (no longer used directly), import mới cho shared widget. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | No-results branch: `EmptyDataWidget(text: LocaleKeys.common_noResults.tr())` → `const CatalogSearchNoResults()`. Import `loading/empty_data_widget.dart` removed (no longer used), import mới cho shared widget. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/widgets/catalog_search_no_results_test.dart` | **NEW** — unit test cho shared widget (icon type, default text, override params). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_no_results_test.dart` | **NEW** — page-level regression: pump real `MaterialGroupSearchPage` với mocked repository → keyword search trả empty → assert `CatalogSearchNoResults` render. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_no_results_test.dart` | **NEW** — page-level regression: pump real `InternalProductSearchPage` với mocked repository → keyword search trả empty → assert `CatalogSearchNoResults` render, `EmptyDataWidget` KHÔNG render. |

## 5. Regression / verification

- `test/ui/inventory_catalog/widgets/catalog_search_no_results_test.dart` — asserts `AppImage` found (not `EmptyDataWidget`), title/desc text match `LocaleKeys.catGrp_searchNoResultsTitle`/`Desc` + correct style tokens; override params take precedence.
- `test/ui/inventory_catalog/material_group_search/material_group_search_no_results_test.dart` — drives `MaterialGroupSearchCubit.changeKeyword(...)` against a mocked `InventoryCatalogRepository` returning empty content, pumps the real `MaterialGroupSearchPage`, asserts `state.hasSearched && groups.isEmpty` then `find.byType(CatalogSearchNoResults)` found.
- `test/ui/inventory_catalog/internal_product_search/internal_product_search_no_results_test.dart` — same pattern for `InternalProductSearchCubit`/`InternalProductSearchPage`, additionally asserts `find.byType(EmptyDataWidget)` findsNothing (regression guard against reintroducing the old defect).
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` (chạy từ design-repo root) → **OK: 0 anti-pattern hit** cho cả 2 page + widget mới + 3 test file.
- Brace/paren/bracket balance verified bằng script đếm ký tự cho mọi file touched/created — cân bằng (0 depth còn lại).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/Flutter toolchain trong sandbox này (`DEBT-W01-MOBILE-BUILD-ENV`). TEST_GROUP phải chạy lại trên máy có toolchain đúng version (Flutter 3.41/Dart 3.11) trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không đổi `EmptyDataWidget` mặc định/behavior — widget này đúng cho use-case list-rỗng-không-search khác, chỉ PROD search đang dùng sai chỗ.
- Không tạo locale key `catProd_searchNoResultsTitle`/`Desc` mới — tái sử dụng `catGrp_*` cho cả 2 domain (xem §3 rationale).
- Không đổi cubit/state/repository — pure UI-layer fix.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — extract shared `CatalogSearchNoResults` widget từ GRP's đúng no-results Column, thay cả GRP + PROD dùng chung (PROD trước đó dùng sai `EmptyDataWidget`/`common_noResults`). 3 regression test mới (widget-level + 2 page-level). `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). |
