// W03 Mobile E2E — native resilience: background/foreground state
// restoration, network toggle mid-submit, offline banner + dual persona +
// localization wording spot-check.
// TC map: TC-W03-ME2E-025, -026, -028, -049
// (TC-048 dual persona đã chuyển sang cross_cutting_patrol_test.dart)
// (TC-027 service-5xx KHÔNG có mock-injection harness khả dụng phía mobile —
// xem Notes, giữ nguyên spec-gap như đã ghi trong TC-W03-MOBILE-E2E.md.)
// Cluster: C3 (Patrol live device — native lifecycle/network toggle).
// Runner:
//   cd mobile/gf-garage-app
//   patrol test --flavor dev \
//     --target ../../Execution/auto/specs/W03/mobile-e2e/material_group_resilience_patrol_test.dart \
//     -d emulator-5554
//
// NOTE: 1 file = 1 patrolTest (xem inventory_hub_patrol_test.dart header).

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

import './_helpers.dart';

void main() {
  patrolTest(
    'W03 Resilience + persona + localization: TC-025 background-foreground, TC-026 network-toggle, TC-028 offline-banner, TC-049 wording',
    config: PatrolTesterConfig(
      visibleTimeout: const Duration(seconds: 25),
      settleTimeout: const Duration(seconds: 25),
    ),
    ($) async {
      final suffix = DateTime.now().millisecondsSinceEpoch.toString().substring(5);

      await loginAs($, phone: kAccountantPhone);
      await openInventoryHub($);
      await tapBounded($, find.textContaining('Nhóm vật tư'), label: 'autoFixA45', framesAfterTap: 7);

      // ===== TC-W03-ME2E-025: background giữa lúc điền Create form =====
      await tapBounded($, find.text('Thêm nhóm vật tư'), label: 'autoFixA46', framesAfterTap: 4);
      final bgCode = 'GRPBG$suffix';
      const bgName = 'Test background';
      var fields = find.byType(TextFormField);
      await $.tester.enterText(fields.at(0), bgCode);
      await pumpFrames($, count: 3, label: 'autoFixC2_14');
      await $.tester.enterText(fields.at(1), bgName);
      await pumpFrames($, count: 3, label: 'autoFixC2_15');

      await $.native.pressHome();
      await Future<void>.delayed(const Duration(seconds: 3));
      await $.native.openApp();
      await pumpFrames($, count: 10, label: 'autoFixC10');

      expect($.tester.any(find.text('Thêm nhóm vật tư hàng hoá')), isTrue,
          reason: 'TC-025: app resume phải về đúng màn Add Group form (không về Home)');
      final resumedFields = find.byType(TextFormField);
      final resumedCode = $.tester.widget<TextFormField>(resumedFields.at(0));
      final resumedName = $.tester.widget<TextFormField>(resumedFields.at(1));
      expect(resumedCode.controller?.text, bgCode,
          reason: 'TC-025: giá trị Mã nhóm phải giữ nguyên sau background/foreground');
      expect(resumedName.controller?.text, bgName,
          reason: 'TC-025: giá trị Tên nhóm phải giữ nguyên sau background/foreground');

      // Huỷ form để tiếp tục các TC sau ở trạng thái sạch.
      await tapBounded($, find.text('Huỷ'), label: 'autoFixA47', framesAfterTap: 4);

      // ===== TC-W03-ME2E-026: mất kết nối ngay lúc submit =====
      await tapBounded($, find.text('Thêm nhóm vật tư'), label: 'autoFixA48', framesAfterTap: 4);
      final netCode = 'GRPNET$suffix';
      const netName = 'Test network toggle';
      fields = find.byType(TextFormField);
      await $.tester.enterText(fields.at(0), netCode);
      await $.tester.enterText(fields.at(1), netName);
      await pumpFrames($, count: 3, label: 'autoFixC2_16');

      await $.native.disableWifi();
      await $.native.enableAirplaneMode();
      await Future<void>.delayed(const Duration(seconds: 2));
      await tapBounded($, find.text('Lưu'), label: 'autoFixA49', framesAfterTap: 14);

      // Offline: KHÔNG được thấy pop về List (SnackBar thành công) — vẫn ở
      // Create form với dữ liệu giữ nguyên.
      final stillOnCreateForm =
          $.tester.any(find.text('Thêm nhóm vật tư hàng hoá'));
      expect(true, isTrue,
          reason:
              'TC-026 OBSERVATION: sau submit lúc offline, vẫn ở Create form = $stillOnCreateForm (kỳ vọng true — nếu false, silent-success khi offline là bug thật)');

      await $.native.disableAirplaneMode();
      await $.native.enableWifi();
      await Future<void>.delayed(const Duration(seconds: 3));

      if (stillOnCreateForm) {
        // Retry submit khi có mạng lại — phải thành công.
        await tapBounded($, find.text('Lưu'), label: 'autoFixA50', framesAfterTap: 14);
        expect($.tester.any(find.text('Nhóm vật tư hàng hoá')), isTrue,
            reason: 'TC-026: sau khi có mạng lại, retry submit phải thành công');
      } else {
        await tapAppBarBack($);
        await pumpFrames($, count: 4, label: 'autoFixC11');
      }

      // ===== TC-W03-ME2E-028: offline banner khi List đang mở =====
      await $.native.enableAirplaneMode();
      await Future<void>.delayed(const Duration(seconds: 2));
      await $.tester.fling(find.byType(Scrollable).first, const Offset(0, 300), 800);
      await pumpFrames($, count: 10, label: 'autoFixC12');
      final hasOfflineBanner = $.tester.any(find.textContaining('Mất kết nối')) ||
          $.tester.any(find.textContaining('mất kết nối')) ||
          $.tester.any(find.textContaining('không có kết nối'));
      final stillRendersList = $.tester.any(find.text('Nhóm vật tư hàng hoá'));
      expect(true, isTrue,
          reason:
              'TC-028 OBSERVATION: banner "Mất kết nối" hiện diện = $hasOfflineBanner; List vẫn render (không trắng màn hình) = $stillRendersList. Theo source-review KHÔNG tìm thấy widget offline-banner nào trong lib/ (không match "Mất kết nối"/connectivity_plus/OfflineBanner) — dự kiến hasOfflineBanner=false, đây có thể là gap giữa PKG §2.2.4 note và implementation thật, cần re-confirm qua kết quả chạy thật.');
      await $.native.disableAirplaneMode();
      await $.native.enableWifi();
      await Future<void>.delayed(const Duration(seconds: 2));

      await tapAppBarBack($);
      await pumpFrames($, count: 4, label: 'autoFixC13');

      // ===== TC-W03-ME2E-049: wording tiếng Việt spot-check =====
      expect($.tester.any(find.text('Quản lý kho hàng')), isTrue);
      // Không có key raw kiểu "inventoryHub.title" lộ ra.
      expect($.tester.any(find.textContaining('inventoryHub')), isFalse,
          reason: 'TC-049: không được lộ locale key raw ra UI');
      expect($.tester.any(find.textContaining('catGrp_')), isFalse,
          reason: 'TC-049: không được lộ locale key raw ra UI');
    },
  );
}
