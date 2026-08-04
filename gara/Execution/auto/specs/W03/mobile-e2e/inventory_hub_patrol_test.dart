// W03 Mobile E2E — Hub navigation + co-located regression finding.
// TC map: TC-W03-ME2E-001, -002, -003, -004, -005, -006
// Cluster: C3 (Patrol live device — native gesture / back stack).
// Runner:
//   cd mobile/gf-garage-app
//   patrol test --flavor dev \
//     --target ../../Execution/auto/specs/W03/mobile-e2e/inventory_hub_patrol_test.dart \
//     -d emulator-5554
//
// NOTE kỹ thuật (2026-07-03): 1 file CHỈ ĐƯỢC chứa đúng 1 patrolTest() —
// harness này có 2 lớp JUnit runner đồng thời trên androidTest classpath
// (`com.cardoctor.garage.squad.MainActivityTest#runDartTests` — legacy
// scaffold no-op — VÀ `pl.leancode.patrol.MainActivityTest` — patrol_cli 4.x
// @Parameterized generated). Với >1 patrolTest() trong 1 file, tổng số test
// scheduled (orchestrator ANDROIDX_TEST_ORCHESTRATOR) tăng lên và app process
// crash giữa chừng (INSTRUMENTATION_FAILED / "Process crashed") khi
// orchestrator relaunch cho dart-test thứ 2 trở đi — xác nhận qua diagnostic
// probe (2 test trivial cũng crash y hệt, không liên quan business logic).
// Toàn bộ TC nhóm được gộp SEQUENTIAL vào 1 patrolTest duy nhất bên dưới —
// mỗi TC vẫn có assertion + checkpoint riêng, chỉ khác là chạy chung 1
// session thay vì fresh app instance mỗi TC. Xem observation trong test
// report + lesson learned.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

import './_helpers.dart';

void main() {
  patrolTest(
    'W03 Hub journey: TC-001 render 2 tile -> TC-002 nav+back -> TC-003 Product tile -> TC-004 debounce -> TC-005 regression -> TC-006 hardware back',
    config: PatrolTesterConfig(
      visibleTimeout: const Duration(seconds: 20),
      settleTimeout: const Duration(seconds: 20),
    ),
    ($) async {
      await loginAs($, phone: kAccountantPhone);
      await openInventoryHub($);

      // ===== TC-W03-ME2E-001 =====
      expect($.tester.any(find.text('Quản lý kho hàng')), isTrue,
          reason: 'TC-001: AppBar Hub phải có title "Quản lý kho hàng"');
      expect($.tester.any(find.textContaining('Sản phẩm')), isTrue,
          reason: 'TC-001: Tile "Sản phẩm" phải hiển thị trên Hub');
      expect($.tester.any(find.textContaining('Nhóm vật tư')), isTrue,
          reason: 'TC-001: Tile "Nhóm vật tư" phải hiển thị trên Hub');
      for (final hiddenLabel in [
        'Phiếu nhập',
        'Phiếu xuất',
        'Tồn kho',
        'Tồn đầu kỳ',
      ]) {
        expect($.tester.any(find.textContaining(hiddenLabel)), isFalse,
            reason: 'TC-001: Tile "$hiddenLabel" KHÔNG được hiển thị ở W03 (AC-4)');
      }
      expect($.tester.any(find.textContaining('Sắp ra mắt')), isFalse);

      // ===== TC-W03-ME2E-002 =====
      await tapBounded($, find.textContaining('Nhóm vật tư'), label: 'TC002.groupTile');
      expect($.tester.any(find.text('Nhóm vật tư hàng hoá')), isTrue,
          reason: 'TC-002: AppBar Group List phải là "Nhóm vật tư hàng hoá"');
      await tapAppBarBack($);
      expect($.tester.any(find.text('Quản lý kho hàng')), isTrue,
          reason: 'TC-002: Back từ Group List phải về đúng Hub (BR-INV-MENU-004)');

      // ===== TC-W03-ME2E-003 =====
      await tapBounded($, find.textContaining('Sản phẩm'), label: 'TC003.productTile');
      expect($.tester.any(find.text('Sản phẩm')), isTrue,
          reason: 'TC-003: AppBar Product List phải là "Sản phẩm"');
      expect($.tester.any(find.text('Tất cả')), isTrue);
      expect($.tester.any(find.text('Đang hoạt động')), isTrue);
      expect($.tester.any(find.text('Ngừng hoạt động')), isTrue);
      await tapAppBarBack($);
      expect($.tester.any(find.text('Quản lý kho hàng')), isTrue);

      // ===== TC-W03-ME2E-004 =====
      final groupTile = find.textContaining('Nhóm vật tư');
      // rapid double-tap: tap thô (KHÔNG settle) 2 lần liên tiếp rồi mới bơm
      // frame bounded — vẫn giữ nguyên Ý ĐỊNH kiểm thử debounce (2 tap dồn
      // dập trước khi UI kịp phản hồi), chỉ đổi cơ chế chờ sau đó.
      await withTimeout($(groupTile).tap(settlePolicy: SettlePolicy.noSettle), 'TC004.tap1');
      await withTimeout($(groupTile).tap(settlePolicy: SettlePolicy.noSettle), 'TC004.tap2');
      await pumpFrames($, count: 6, label: 'TC004.pump');
      expect($.tester.any(find.text('Nhóm vật tư hàng hoá')), isTrue,
          reason: 'TC-004: rapid double-tap vẫn phải push đúng 1 Group List');
      await tapAppBarBack($);
      expect($.tester.any(find.text('Quản lý kho hàng')), isTrue,
          reason:
              'TC-004: sau 1 lần back phải về Hub — nếu còn route Group List thứ 2 tồn đọng thì double-push chưa được debounce đúng (EC-3)');

      // ===== TC-W03-ME2E-005 [REGRESSION][CRITICAL] =====
      // Re-verify Hub vẫn là đích duy nhất từ mission tile + không có tile
      // nào trỏ "Danh sách kho" V1 (Phiếu nhập/Phiếu xuất/Tồn kho/Tồn đầu kỳ).
      expect($.tester.any(find.text('Quản lý kho hàng')), isTrue,
          reason:
              'TC-005: mission tile "Quản lý kho hàng" phải push Hub (InventoryHubRoute) theo code hiện tại');
      for (final legacyTab in [
        'Phiếu nhập',
        'Phiếu xuất',
        'Tồn kho',
        'Tồn đầu kỳ',
      ]) {
        expect($.tester.any(find.textContaining(legacyTab)), isFalse);
      }
      // CRITICAL FINDING (escalate BA/mobile dev, xem TR-W03-MOBILE-E2E.md):
      // "Danh sách kho" V1 hiện KHÔNG còn entry point nào trên app cho tới
      // khi Hub W04-W06 bổ sung đủ tile — quan sát re-verify chính xác qua
      // Patrol live, KHÔNG tự ý kết luận severity.

      // ===== TC-W03-ME2E-006 =====
      await tapBounded($, find.textContaining('Nhóm vật tư'), label: 'TC006.groupTile');
      expect($.tester.any(find.text('Nhóm vật tư hàng hoá')), isTrue);
      await nativeBackBounded($, label: 'TC006.hardwareBack');
      expect($.tester.any(find.text('Quản lý kho hàng')), isTrue,
          reason:
              'TC-006: system back (hardware back) từ Group List phải pop về Hub, không crash');
    },
  );
}
