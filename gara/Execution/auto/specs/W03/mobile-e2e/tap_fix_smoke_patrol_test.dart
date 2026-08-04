// SMOKE PROBE Run 3 — verify harness tap-hang FIX (KHÔNG phải TC sản phẩm).
// Origin: TR-W03-MOBILE-E2E.md Run 2 §7.1c — mọi tap tự động sau khi Home
// render đều treo vô thời hạn. Fix: `tapBounded()` (settlePolicy noSettle +
// pump bounded + withTimeout diagnostic) trong `_helpers.dart`.
//
// Mục tiêu DUY NHẤT của file này: login -> tap CHÍNH XÁC 1 lần vào tile Hub
// "Quản lý kho hàng" -> assert điều hướng đúng vào Hub, KHÔNG treo. Nếu file
// này PASS trong thời gian hợp lý (< ~60s cho riêng bước tap), coi như fix
// harness thành công -> tiến hành chạy full suite 49 TC.
//
// Runner:
//   cd mobile/gf-garage-app
//   $HOME/.pub-cache/bin/patrol test --flavor dev \
//     --target ../../Execution/auto/specs/W03/mobile-e2e/tap_fix_smoke_patrol_test.dart \
//     -d emulator-5554

import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

import './_helpers.dart';

void main() {
  patrolTest(
    'SMOKE Run3: login -> tapBounded(Hub tile) KHÔNG treo -> Hub render đúng',
    config: PatrolTesterConfig(
      visibleTimeout: const Duration(seconds: 25),
      settleTimeout: const Duration(seconds: 25),
    ),
    ($) async {
      await loginAs($, phone: kAccountantPhone);
      await openInventoryHub($);

      expect($.tester.any(find.text('Quản lý kho hàng')), isTrue,
          reason:
              'SMOKE Run3: sau tapBounded(hubTile), AppBar phải là "Quản lý kho hàng" — nếu FAIL ở assertion này (không phải timeout) nghĩa là tap đã KHÔNG treo (fix harness OK) nhưng route sai (khác vấn đề, cần điều tra riêng)');
      expect($.tester.any(find.textContaining('Sản phẩm')), isTrue,
          reason: 'SMOKE Run3: Hub phải có tile "Sản phẩm"');
      expect($.tester.any(find.textContaining('Nhóm vật tư')), isTrue,
          reason: 'SMOKE Run3: Hub phải có tile "Nhóm vật tư"');
    },
  );
}
