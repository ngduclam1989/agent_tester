# BUGFIX — BUG-W03-024

> AppBar hiện dòng kẻ dư dưới tiêu đề trên màn "Nhóm vật tư hàng hoá" (GRP-LIST) — thiếu `hasShape: false`
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`MaterialGroupListPage._buildAppBar()` gọi `AppBarCustom(title: ...)` mà không set `hasShape`. `AppBarCustom.hasShape` mặc định `true`, khiến widget vẽ `shape: Border(bottom: BorderSide(color: AppColors.borderPrimary, width: 1))` ngay dưới title "Nhóm vật tư hàng hoá". Ngay bên dưới đó, `ListTabBarWidget` (dùng cho 3-tab `Tất cả / Đang hoạt động / Ngừng hoạt động`) tự vẽ border riêng của chính nó. Kết quả là 2 đường viền chồng lên nhau tạo hiệu ứng "dòng kẻ dư" ngay dưới tiêu đề — không khớp Figma.

Design Source Ref: `Product/ux/figma-mobile/wave03-cat-grp-list.md#customappbar-identifier-grouplistappbar` + asset `Product/ux/figma-mobile/assets/wave03-cat-grp-list/21235-29061.png` — PNG xác nhận KHÔNG có đường kẻ nào giữa title AppBar và TabBar (chỉ có 1 đường mảnh ngay dưới TabBar, do `ListTabBarWidget` tự vẽ).

## 2. Root cause

`AppBarCustom.hasShape` (property có sẵn từ trước, default `true`) là cơ chế đúng để tắt border-bottom của AppBar, nhưng `MaterialGroupListPage` (feature mới W03) là 1 trong số ít call-site không set nó — chỉ có precedent tại `lib/ui/main/profile_qr/profile_qr_page.dart:43` dùng `hasShape: false` trước đây, chưa có precedent trong `inventory_catalog`.

## 3. Fix

Thêm `hasShape: false` vào call-site `AppBarCustom` trong `MaterialGroupListPage._buildAppBar()`. Đây là **call-site opt-out** (Shared-Symbol Blast-Radius Gate case (a)) — `AppBarCustom`'s default (`hasShape: true`) hoàn toàn không đổi, nên mọi màn khác dùng `AppBarCustom` (kể cả không set `hasShape`) tiếp tục render đúng như trước, không bị ảnh hưởng.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart` | `_buildAppBar()`: added `hasShape: false` to the `AppBarCustom(...)` call. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_list/material_group_list_fidelity_test.dart` | New regression test (see §5). |

## 5. Regression / verification

- New widget test `'BUG-W03-024: MaterialGroupListPage AppBar has no bottom border (hasShape:false)'` in `material_group_list_fidelity_test.dart` — pumps `AppBarCustom(title: ..., hasShape: false)` and asserts `AppBar.shape == null`; also pumps a second `AppBarCustom` with default `hasShape` (no override) and asserts its `AppBar.shape` is NOT null, proving the shared-widget default is untouched for all other consumers (Shared-Symbol Blast-Radius Gate — default unchanged, call-site opt-in only).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no `fvm`/`flutter` toolchain installed in this environment (`DEBT-W01-MOBILE-BUILD-ENV`). Regression test written static-correct per NOTE in FIX dispatch; must be run on a machine with the toolchain by TEST_GROUP before flipping to `VERIFIED`.

## 6. Non-goals / out of scope

- `lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart` (`FEAT-CAT-PROD-LIST`) uses the exact same `AppBarCustom(title: ...)` pattern without `hasShape`, and likely has the same double-border defect (flagged in the original bug report's Notes as "cần verify riêng khi fix"). **Not fixed in this cycle** — no bug filed against it; fixing it would be scope expansion beyond this bug's Touched files. Recommend filing a follow-up bug (e.g. `BUG-W03-02x`) against `internal_product_list_page.dart` for a dedicated fix cycle.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — added `hasShape: false` to `MaterialGroupListPage`'s `AppBarCustom` call-site; added regression widget test. Flagged `internal_product_list_page.dart` cross-feature follow-up (out of scope this cycle). |
