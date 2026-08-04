# BUGFIX BUG-W01-293 — STL Detail tab indicator/body desync sau pull-to-refresh

> **Status**: RESOLVED.
> **Severity**: P2 (UX, core interaction — không affect data/calc/persist).
> **Boundary**: garage-mobile (Flutter).
> **Authored by**: agent-fix-garage-mobile (Wave 01) — documented from applied working tree 2026-06-17.
> **Related**: FEAT-INS-STL-DETAIL.

---

## 1. Failure mode

User đang focus tab "Lịch sử thanh toán" (TabBar underline đúng tab) → pull-to-refresh reload data → body render nội dung tab khác ("Dịch vụ thực hiện" + "Phụ tùng sử dụng") thay vì list PaymentHistory. Underline giữ tab cũ, body nhảy về default → user nhìn nhầm context.

## 2. Root cause

`insurance_settlement_detail_screen.dart` dùng `DefaultTabController(length:4)` tạo **bên trong `builder()`** (line cũ 108) + `_TabContentView` riêng mirror controller index vào local `_index` của nó (qua `DefaultTabController.of(context)` trong `didChangeDependencies`). Khi BLoC emit (pull-to-refresh) rebuild `builder()`, `DefaultTabController` bị tạo lại / `_TabContentView` re-resolve → `_index` desync với index TabBar đang hiển thị.

## 3. Fix — Layer 1 (state mgmt)

Nâng MỘT `TabController` vào `_InsuranceSettlementDetailPageState`:

- `with TickerProviderStateMixin`; `late final TabController _tabController = TabController(length: 4, vsync: this)` trong `initState`; `dispose` controller.
- Bỏ `DefaultTabController`; truyền cùng `_tabController` cho `TabBar(controller: _tabController)` và `_TabContentView(controller: _tabController)`.
- `_TabContentView` nhận controller qua constructor (bỏ `DefaultTabController.of`), listen trong `initState` + re-wire trong `didUpdateWidget`.
- `_handleRefresh()` chỉ `cubit.onFetchDetailData` — KHÔNG đụng `_tabController.index`.

Controller giờ là single source of truth, sống ngoài builder() → refresh không reset.

## 4. Blast radius

- Chỉ STL Detail insurance screen; lifecycle controller chuẩn (initState/dispose).
- Không đụng data/calc/persist.

## 5. Regression test

`test/ui/settlement/insurance_settlement_detail_tab_sync_test.dart` — sau refresh, `controller.index` được giữ + body khớp tab đang chọn.

## 6. Files changed

- `mobile/gf-garage-app/lib/ui/settlement/settlement_detail/insurance_settlement_detail_screen.dart`
- `mobile/gf-garage-app/test/ui/settlement/insurance_settlement_detail_tab_sync_test.dart` (NEW)

## 7. Verification

- `flutter test` / `flutter analyze` — DEFERRED cho TEST_GROUP.

## 8. Follow-up

Re-test pull-to-refresh trên cả 4 tab (không chỉ "Lịch sử thanh toán") để chắc parity.
