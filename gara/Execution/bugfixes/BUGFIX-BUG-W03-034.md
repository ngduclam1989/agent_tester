# BUGFIX — BUG-W03-034

> 4 card (Header/GeneralInfo/TechnicalSpec/SpecDescription) trên PROD Detail thiếu `BorderRadius(8)` + `itemBoxShadow` so Figma
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`InternalProductDetailPage` (`lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart`) render cả 4 card widget con (`_HeaderCard`, `_GeneralInfoCard`, `_TechnicalSpecCard`, `_SpecDescriptionCard`) bằng `Container(color: AppColors.bgBase, ...)` — chỉ set `color:` phẳng, KHÔNG có `decoration: BoxDecoration(...)`. Kết quả: card render góc vuông, không có shadow — sai fidelity so Figma spec (`Product/ux/figma-mobile/wave03-cat-prod-detail.md`, block `Card/ProductHeaderInfo` khai rõ `radius=BorderRadius.circular(8)` + `Shadow: AppShadows.itemBoxShadow`) và so PNG reference (card có elevation rõ ràng).

## 2. Root cause

DEV cycle viết 4 card widget bằng cách copy pattern `Container(width: double.infinity, color: AppColors.bgBase, padding: ...)` — pattern này đúng cho 1 flat section không cần elevation, nhưng KHÔNG đúng cho "card" theo spec (card = surface nổi, cần radius + shadow). Widget author bỏ sót bước đối chiếu spec §Card/ProductHeaderInfo (`radius`/`Shadow` field) khi implement, chỉ mang theo `color` mà quên `decoration`.

## 3. Fix

Đổi cả 4 `Container` (trong `_HeaderCard`, `_GeneralInfoCard`, `_TechnicalSpecCard`, `_SpecDescriptionCard`) từ:

```dart
Container(
  width: double.infinity,
  color: AppColors.bgBase,
  padding: const EdgeInsets.all(AppSizes.spacing16),
  ...
)
```

sang:

```dart
Container(
  width: double.infinity,
  decoration: BoxDecoration(
    color: AppColors.bgBase,
    borderRadius: BorderRadius.circular(8),
    boxShadow: AppShadow.itemBoxShadow,
  ),
  padding: const EdgeInsets.all(AppSizes.spacing16),
  ...
)
```

Pattern khớp chính xác với `feature_tile.dart` (`Ink(decoration: BoxDecoration(color: AppColors.bgBase, borderRadius: BorderRadius.circular(16), boxShadow: AppShadow.itemBoxShadow))`) và `mission_item.dart` (`Container(decoration: BoxDecoration(color: AppColors.bgBase, borderRadius: BorderRadius.circular(8), boxShadow: AppShadow.itemBoxShadow))`) — cross-ref confirm đây là canonical card-decoration idiom đã dùng nơi khác trong codebase (không phải pattern tự sáng tác). Đã verify `AppShadow.itemBoxShadow` tồn tại thật trong `lib/core/common/styles/app_shadows.dart` trước khi dùng (không đoán tên field).

Thêm import còn thiếu `package:cardoctor_garage_v3/core/common/styles/app_shadows.dart` (file trước đó không cần `AppShadow` nên chưa import).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | 4× `Container(color: AppColors.bgBase, ...)` → `Container(decoration: BoxDecoration(color: AppColors.bgBase, borderRadius: BorderRadius.circular(8), boxShadow: AppShadow.itemBoxShadow), ...)` (`_HeaderCard`, `_GeneralInfoCard`, `_TechnicalSpecCard`, `_SpecDescriptionCard`); added `app_shadows.dart` import. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_card_decoration_test.dart` | **New** — regression test (static source assertion, 3 sub-test). |

## 5. Regression / verification

- **Test type**: static source assertion, KHÔNG widget-tree pump. Lý do: `_HeaderCard`/`_GeneralInfoCard`/`_TechnicalSpecCard`/`_SpecDescriptionCard` là library-private class trong `internal_product_detail_page.dart` — không thể import trực tiếp từ file test khác library trong Dart. Pump full `InternalProductDetailPage` đòi hỏi DI (`get_it`/`injectable`) + mock `InventoryCatalogRepository`/`ProductDetailCubit`; codebase hiện KHÔNG có tiền lệ page-level widget-pump test nào (rà soát `test/` toàn repo — chỉ có cubit test + isolated-widget fidelity test kiểu `material_group_list_fidelity_test.dart`), nên chọn source-assertion nhất quán với convention hiện có thay vì mở tiền lệ DI-mock mới cho 1 fix P2 hẹp phạm vi.
- Assertion cụ thể (đã tự verify bằng script trước khi ghi vào test): đúng 4× `borderRadius: BorderRadius.circular(8)`, đúng 4× `boxShadow: AppShadow.itemBoxShadow` trong file, và regex `Container(width: double.infinity, color: AppColors.bgBase,` (anti-pattern trước fix) KHÔNG còn match — fail-trước-fix / pass-sau-fix đã tự chạy `python3` mô phỏng regex để confirm trước khi coi test hợp lệ.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` → **OK: 0 anti-pattern hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: `AppShadow.itemBoxShadow` field tồn tại thật (`app_shadows.dart:16-22`), import mới thêm đúng path (`core/common/styles/app_shadows.dart`, khớp cách `feature_tile.dart`/`mission_item.dart` import), không đổi signature/constructor nào của 4 class card — không có rủi ro compile error rõ ràng. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không đổi golden/screenshot test (không có golden baseline hiện hữu cho page này để extend; tạo mới golden baseline cho 1 fix P2 hẹp phạm vi là scope creep — theo dõi như follow-up nếu wave sau cần golden coverage cho PROD Detail).
- Không sửa `internal_product_search_page.dart` / `internal_product_filter_page.dart` / `material_group_search_page.dart` — đang được 1 FIX cycle khác (BUG-W03-030/031/032) sửa song song, tránh merge conflict.
- Không refactor 4 card widget thành shared component (dù cả 4 dùng chung 1 decoration pattern) — ngoài phạm vi fix, giữ minimum-scope.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — 4 card đổi từ `Container(color:)` phẳng sang `Container(decoration: BoxDecoration(borderRadius: circular(8), boxShadow: itemBoxShadow))`. Thêm import `app_shadows.dart`. Regression test mới (static source assertion). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
