# BUGFIX — BUG-W03-032

> MaterialGroupSearchPage thiếu gap giữa 2 dòng bullet trong empty-keyword state so Figma
> Severity: **P3** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`material_group_search_page.dart` empty-keyword state có `Column [crossAxis=start]` chỉ đặt `SizedBox(height: AppSizes.spacing8)` giữa header và bullet đầu tiên ("Mã nhóm") — 2 dòng bullet ("Mã nhóm"/"Tên nhóm") xếp sát nhau không có gap. Figma `wave03-cat-grp-list.md` §"Search Default" widget tree ghi `Column [crossAxis=start, gap=Gap(AppSizes.spacing8)]` — gap này áp dụng ĐỀU cho mọi cặp children (header→bullet1 VÀ bullet1→bullet2), không chỉ 1 chỗ.

Minor spacing fidelity gap, không ảnh hưởng chức năng (P3).

## 2. Root cause

Khi viết `Column` với `gap=Gap(N)` annotation từ spec, tác giả chỉ literal-insert 1 `SizedBox` sau child đầu tiên (header) thay vì hiểu `gap=Gap(N)` là uniform spacing property áp dụng cho MỌI cặp children liên tiếp trong `Column`/`Row` (tương đương Flutter `spacing:` param hoặc `Gap` chèn đều giữa từng cặp). Đây là misread 1-lần của spec annotation, không phải pattern lặp lại nhiều nơi (chỉ xuất hiện tại 1 vị trí trong 1 file — GRP search).

## 3. Fix

Thêm `const SizedBox(height: AppSizes.spacing8)` giữa bullet1 (`catGrp_searchBulletCode`) và bullet2 (`catGrp_searchBulletName`) — cùng giá trị + cùng convention manual-`SizedBox`-insertion đã dùng cho cặp header→bullet1 trong chính file này (không đổi sang `Column(spacing:)` param — dù cũng là convention hợp lệ trong codebase [89 usage], `material_group_form.dart` cùng domain/wave dùng manual `Gap`/`SizedBox` insertion [342 usage repo-wide, convention chiếm ưu thế] nên giữ nguyên style để tối thiểu diff).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | Thêm `const SizedBox(height: AppSizes.spacing8)` giữa 2 bullet Text trong empty-keyword `Column` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_fidelity_test.dart` | **New** — widget test assert Column có 5 children (Text, SizedBox, Text, SizedBox, Text) với đúng 2 `SizedBox(height: spacing8)` |

## 5. Regression / verification

- `test/ui/inventory_catalog/material_group_search/material_group_search_fidelity_test.dart` — standalone widget test (no BlocProvider/DI/router, same strategy như BUG-W03-021/024/030/031) reconstruct widget-tree fragment từ page source đã fix: assert `Column.children` có length 5 (header, gap, bullet1, gap, bullet2) và đúng 2 `SizedBox` với `height == AppSizes.spacing8` (không phải 1 như code cũ).
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` → **OK: 0 anti-pattern hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: edit chỉ thêm 1 dòng `const SizedBox(height: AppSizes.spacing8),` — không đổi type/tham số nào khác, không có rủi ro compile error. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- Không đổi sang `Column(spacing:)` param dù đây cũng là convention hợp lệ trong codebase — giữ nguyên style manual-insertion đã có trong file để tối thiểu diff, tránh refactor ngoài phạm vi bug.
- Không touch `internal_product_search_page.dart` structure ngoài BUG-W03-030's riêng scope (xem `BUGFIX-BUG-W03-030.md`) dù 2 file có structure tương tự.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — thêm SizedBox(spacing8) giữa 2 bullet Text trong empty-keyword Column. Regression test mới (widget test x1). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
