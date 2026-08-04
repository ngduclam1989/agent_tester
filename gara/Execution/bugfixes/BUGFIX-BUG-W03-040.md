# BUGFIX — BUG-W03-040

> AppBar "Sản phẩm" (`internal_product_list_page.dart`) thiếu `hasShape: false` — double-border dưới title, cùng lớp lỗi BUG-W03-024
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`internal_product_list_page.dart:88` build `AppBarCustom` cho FEAT-CAT-PROD-LIST mà KHÔNG set `hasShape`. `AppBarCustom` mặc định `hasShape: true` tự vẽ 1 border ngay dưới title (`shape: Border(bottom: BorderSide(...))`); `ListTabBarWidget` ngay bên dưới (trong `body: Column`) tự vẽ 1 border riêng ngay dưới chính nó. Kết quả: 2 đường kẻ liền kề nhau dưới AppBar — double/redundant border — **y hệt lớp lỗi BUG-W03-024** đã fix cho `material_group_list_page.dart` (sibling list page, cùng feature Inventory Catalog). Gap này đã được flag ngay khi fix BUG-W03-024 ("cross-feature: internal_product_list_page.dart dùng cùng pattern, khả năng cùng lỗi, cần verify riêng") nhưng chưa file bug — user (mobile dev) xác nhận trên máy thật ngày 2026-07-02.

## 2. Root cause

`AppBarCustom.hasShape` default `true` được thiết kế cho AppBar đứng riêng, không có widget liền kề tự vẽ border. `InternalProductListPage` có `ListTabBarWidget` ngay dưới AppBar trong `body: Column` — theo rule đã established ở `rules-mobile SKILL.md §2` (bullet 2, nguồn BUG-W03-024): khi widget liền kề tự vẽ border riêng, `AppBarCustom` phải opt-out `hasShape: false`. `MaterialGroupListPage` (sibling, cùng cấu trúc `AppBarCustom` + `body: Column([ListTabBarWidget, Expanded(ListWidget)])`) đã được fix đúng ở BUG-W03-024; `InternalProductListPage` dùng cùng cấu trúc nhưng bị bỏ sót khi fix trước đó chỉ scope cho 1 file.

## 3. Fix

Thêm đúng 1 dòng `hasShape: false,` vào `AppBarCustom(...)` trong `internal_product_list_page.dart`, khớp chính xác pattern `material_group_list_page.dart` đã dùng từ BUG-W03-024:

```dart
appBar: AppBarCustom(
  title: LocaleKeys.catProd_title.tr(),
  hasShape: false,
  actions: [...],
),
```

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart` | Thêm `hasShape: false,` vào `AppBarCustom(...)` — 1 dòng |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_list/internal_product_list_appbar_fidelity_test.dart` | **New** — widget test (`AppBarCustom.hasShape == false` → `AppBar.shape == null`; default `hasShape` (unset) → `AppBar.shape is Border`) + static source assertion trên block `appBar: AppBarCustom(...)` trước `actions: [` |

## 5. Regression / verification

- 1 test file mới, standalone widget test (no BlocProvider/DI/router — cùng strategy với BUG-W03-021/024/030/036 test trong suite này vì cubit thật wire qua getIt+AutoRoute). Assert 2 nhánh: `hasShape: false` → `AppBar.shape == null`; `AppBarCustom` không set `hasShape` (default) → `AppBar.shape is Border` (chứng minh default THẬT SỰ vẽ border, không phải giả định). Static source assertion: cắt substring từ `appBar: AppBarCustom(` tới `actions: [` (loại trừ false-positive nếu `hasShape: false` xuất hiện ở block khác trong file) và assert chứa `hasShape: false`.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart` → **OK: 0 anti-pattern hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: `AppBarCustom.hasShape` param đã tồn tại sẵn (dùng nguyên vẹn ở `material_group_list_page.dart` từ BUG-W03-024, cùng widget class) — không phát sinh lỗi type/undefined-param. Brace/paren balance verified thủ công. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không touch `material_group_list_page.dart` (đã có `hasShape: false` từ BUG-W03-024, không cần sửa lại).
- Không touch `internal_product_filter_page.dart`/`internal_product_filter_cubit.dart` (đang có 1 FIX cycle song song khác — BUG-W03-037/038/039 — trên các file đó; ngoài scope report này).
- 1 diff line duy nhất trong `internal_product_list_page.dart` — không chạm phần diff khác đang uncommitted trên cùng file từ FIX cycle song song BUG-W03-037/038 (state round-trip filter route argument) — verify bằng `git diff` sau khi apply, đúng 1 hunk isolated.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — thêm `hasShape: false` vào `AppBarCustom` của `internal_product_list_page.dart`, cùng pattern BUG-W03-024. Regression test mới (widget test, 2 nhánh). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
