# BUGFIX — BUG-W03-046

> `AppBarCustom.backgroundColor` constructor param là dead code — luôn hardcode `Colors.white` trong `build()`, khiến mọi call site truyền `backgroundColor:` bị bỏ qua, PROD search AppBar (cần `bgPrimary` xám) sai màu.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`lib/ui/widgets/app_bar/app_bar_custom.dart` khai `final Color backgroundColor;` (default `Colors.transparent`) làm constructor param, nhưng `build()` render `AppBar(... backgroundColor: Colors.white, ...)` — literal hardcode, không đọc `this.backgroundColor` ở bất kỳ đâu. Mọi page truyền `AppBarCustom(backgroundColor: X)` đều bị AppBar bỏ qua hoàn toàn, luôn hiện trắng. Hệ quả cụ thể tracking cho wave này: `Product/ux/figma-mobile/wave03-cat-prod-list.md` dòng 200 yêu cầu `ProductSearchAppBar` (trạng thái search input của PROD list) phải có `BG: AppColors.bgPrimary` (xám nhạt) — không đạt được vì dead-code này.

`AppBarCustom` là **shared widget** với 124 call site trong `lib/` (không tính class definition + `ConversationsAppBarCustom`, một widget khác không liên quan chỉ trùng suffix tên) — bắt buộc Shared-Symbol Blast-Radius Gate trước khi sửa theo `rules-mobile/SKILL.md` §2 R-CTA "Variant" + `.claude/memory/fix.md` FIX-025.

## 2. Root cause

DEV cycle ban đầu thêm `backgroundColor` vào constructor signature (có thể để dự phòng use-case tương lai) nhưng khi viết `build()` lại copy/hardcode `Colors.white` trực tiếp vào `AppBar(...)` thay vì tham chiếu `this.backgroundColor` — lỗi "constructor param không thực sự được truyền xuống widget con trong `build()`", không bị bắt bởi `flutter analyze` (không phải lỗi biên dịch — param vẫn hợp lệ, chỉ đơn giản unused ở nhánh runtime thực tế) và không lộ ra cho tới khi so sánh trực tiếp với Figma fidelity của 1 trạng thái cụ thể (PROD search AppBar).

## 3. Blast-Radius Gate (re-run `grep -rn "AppBarCustom(" lib`, KHÔNG dùng danh sách cũ)

Tổng **124** call site hợp lệ (excl. class `AppBarCustom` definition + `ConversationsAppBarCustom`, widget riêng biệt trong `lib/ui/comet_chat/widgets/conversations_app_bar_custom.dart` chỉ trùng suffix tên, không liên quan).

Paren-balance script (không phải fixed-line-window, tránh false-positive từ widget kế tiếp) tìm đúng 18/124 truyền `backgroundColor:` khác default:

| Nhóm | Count | backgroundColor truyền | Sau fix |
|---|---|---|---|
| Không truyền `backgroundColor:` (default) | 106 | — (default cũ `Colors.transparent`) | Default đổi → `Colors.white`. AppBar vẫn render TRẮNG như trước fix (dead-code trước đó luôn hardcode trắng) → **0 regression**. |
| Truyền `AppColors.bgBase` (= `BaseColor.white`) | 4 | `stock_detail_page.dart:47`, `service_detail_page.dart:47`, `period_stock_detail_page.dart:54`, `account_page.dart:33` | No-op — `bgBase` = trắng, giống hệt hardcode cũ. **0 visual change.** |
| Truyền `AppColors.bgSecondary` (= `NeutralColor.s50`, xám nhạt) | 14 | `request_quote_list_search_page.dart:90`, `request_quote_list_filter_page.dart:64`, `service_order_list_v3_page.dart:75`, `service_order_detail_v3_page.dart:340`, `service_order_list_filter_v3_page.dart:90`, `service_order_list_search_v3_page.dart:75`, `part_order_page.dart:124`, `employee_create_page.dart:183`, `employee_detail_page.dart:105`, `employee_list_page.dart:74`, `employee_search_page.dart:78`, `employee_filter_page.dart:50`, `customer_search_page.dart:117`, `list_purchase_request_filter_page.dart:64` | **ĐỔI MÀU THẬT** — từ trắng (dead-code) → xám nhạt đúng ý đồ code gốc. |

**Xác nhận cố ý, không phải copy-paste nhầm**: `customer_search_page.dart` là 1 trong 14 trang này — và chính file này được `rules-mobile/SKILL.md` §0 "Structural exemplar" cite làm **chuẩn tham chiếu chính thức** cho search full-page pattern trong toàn app. 14 trang trải khắp 6 domain riêng biệt (quotation, service_order_v3, employee_accounts/human_resource, customer, purchase_request) đều nhất quán dùng `bgSecondary` cho AppBar trạng thái search/filter/detail — pattern hệ thống, không phải lỗi cục bộ 1 trang.

→ Tổng **18/124** consumer đổi behavior thật khi bật `this.backgroundColor` (4 no-op + 14 đổi màu thật), **106/124** giữ nguyên 100% nhờ đổi default sang `Colors.white`.

## 4. Fix

### 4.1 `app_bar_custom.dart`

```dart
// Constructor default — giữ backward-compat cho 106 consumer không set param
// (Colors.transparent trước đây không tương đương white opaque — nếu giữ,
// 106 trang sẽ đổi hành vi hiển thị ngoài ý muốn sau khi field có hiệu lực).
this.backgroundColor = Colors.white,   // was: Colors.transparent

// build() — dùng đúng field instance thay vì hardcode literal
AppBar(
  ...
  backgroundColor: backgroundColor,    // was: Colors.white
  foregroundColor: Colors.white,       // unchanged — không phải constructor param, ngoài scope bug này
  surfaceTintColor: Colors.white,      // unchanged — không phải constructor param, ngoài scope bug này
  ...
)
```

`foregroundColor`/`surfaceTintColor` (dòng 65-66 gốc) verify là literal hardcode, **KHÔNG phải** constructor param configurable — để nguyên, không mở rộng sửa ngoài scope bug này (không ai yêu cầu đổi).

### 4.2 Wire 2 trang search catalog theo đúng Figma

`internal_product_search_page.dart` (`ProductSearchAppBar`, `wave03-cat-prod-list.md` dòng 200) và `material_group_search_page.dart` (`GroupSearchAppBar`, `wave03-cat-grp-list.md` dòng 236 — tự đọc lại spec GRP để verify, KHÔNG giả định giống PROD, xác nhận GRP list CŨNG yêu cầu `BG: AppColors.bgPrimary` cho search AppBar) — cả 2 trước đó KHÔNG set `backgroundColor:` (thuộc nhóm 106 no-op) → thêm mới:

```dart
appBar: AppBarCustom(
  isCenterTitle: false,
  hasShape: false,
  backgroundColor: AppColors.bgPrimary,   // NEW — per Figma ProductSearchAppBar/GroupSearchAppBar
  titleWidget: ...,
),
```

## 5. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/widgets/app_bar/app_bar_custom.dart` | Constructor default `backgroundColor` `Colors.transparent` → `Colors.white`; `build()` `AppBar(backgroundColor: Colors.white)` → `AppBar(backgroundColor: backgroundColor)` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | `AppBarCustom(...)` thêm `backgroundColor: AppColors.bgPrimary` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | `AppBarCustom(...)` thêm `backgroundColor: AppColors.bgPrimary` |
| `mobile/gf-garage-app/test/ui/widgets/app_bar/app_bar_custom_test.dart` | **New** — regression test (explicit `backgroundColor` renders correctly + default stays white) |

## 6. Regression / verification

- `test/ui/widgets/app_bar/app_bar_custom_test.dart` — 2 case:
  1. `AppBarCustom(title: 'Test', backgroundColor: Colors.red)` → `tester.widget<AppBar>(find.byType(AppBar)).backgroundColor == Colors.red` (xác nhận field thực sự wire xuống, không còn dead-code).
  2. `AppBarCustom(title: 'Test')` (không truyền `backgroundColor`) → `AppBar.backgroundColor == Colors.white` (backward-compat cho 106 consumer).
- Blast-Radius Gate output (§3 bảng) đã confirm 106 consumer 0-regression + 4 no-op + 14 đổi màu đúng ý đồ (bao gồm exemplar `customer_search_page.dart`) trước khi apply fix.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — sandbox chỉ có Flutter 3.32.8 (Dart 3.8.1) tại `/home/all_engineer/flutter`, KHÔNG có `fvm`. `flutter pub get` xác nhận version-solving FAILED: repo `pubspec.yaml` yêu cầu `sdk: ^3.11.0` (Flutter 3.41 baseline), sandbox chỉ có Dart 3.8.1 — pre-existing gap `DEBT-W01-MOBILE-BUILD-ENV`, không phải lỗi mới. Verify thủ công: 2 edit trong `app_bar_custom.dart` là single-line literal swap (không đổi cấu trúc widget tree), 2 page-file edit chỉ thêm 1 named-param mới (`backgroundColor:`) vào constructor call đã tồn tại — không ảnh hưởng import/signature khác. Paren/brace balance verify thủ công trên cả 4 file sửa/mới.

## 7. Non-goals / out of scope

- KHÔNG đổi `foregroundColor`/`surfaceTintColor` — vẫn hardcode `Colors.white`, không phải constructor param, không ai yêu cầu đổi trong bug này.
- KHÔNG đụng `material_group_list_page.dart`, `*_detail_page.dart`, `*_filter_page.dart` — đang được 1 agent khác sửa song song cho BUG-W03-043/044/045.
- KHÔNG đổi hành vi hiển thị cho 18 consumer đã truyền `backgroundColor:` từ trước — 4 `bgBase` giữ nguyên trắng (no-op), 14 `bgSecondary` ĐỔI MÀU THẬT nhưng đây chính là hành vi ĐÚNG mà code gốc đã cố ý (không phải side-effect ngoài ý muốn của fix này).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `app_bar_custom.dart` wire `backgroundColor` field xuống `AppBar` thực (thay hardcode `Colors.white`), default đổi `Colors.transparent` → `Colors.white` giữ backward-compat 106/124 consumer. Blast-Radius Gate re-run xác nhận 4 no-op + 14 đổi màu đúng ý đồ (18 consumer pre-existing) + wire mới `backgroundColor: AppColors.bgPrimary` cho `internal_product_search_page.dart` + `material_group_search_page.dart` theo Figma (`wave03-cat-prod-list.md` L200, `wave03-cat-grp-list.md` L236 — cả 2 tự verify độc lập). New regression test `app_bar_custom_test.dart`. `flutter analyze`/`flutter test` DEFERRED (no toolchain, DEBT-W01-MOBILE-BUILD-ENV). |
