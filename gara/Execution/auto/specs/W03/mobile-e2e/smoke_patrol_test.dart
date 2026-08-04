// SMOKE PROBE — W03 mobile E2E harness preflight (EP-INVENTORY-CATALOG slice 1/4)
// Purpose: verify Patrol can cold-start the REAL app (flavor dev, remote BFF
// via adb reverse -> socat -> 192.168.110.191) and assert 1 Vietnamese widget.
// Cluster: C3 (Patrol live device/emulator)
// Runner:
//   cd mobile/gf-garage-app
//   $HOME/.pub-cache/bin/patrol test --flavor dev \
//     --target ../../Execution/auto/specs/W03/mobile-e2e/smoke_patrol_test.dart \
//     -d emulator-5554
// TC map: preflight gate — NOT a product testcase (Environment Readiness Gate step 0.f)
//
// ROOT CAUSE NOTE (2026-07-03): `patrol test`/`flutter_test` KHÔNG tự chạy
// app thật — nó chỉ reset tree về "_preTestMessage" ("Test starting...")
// rồi gọi thẳng testBody(). Phải tự gọi bootstrapApp() (= main_dev.dart's
// start()) thì UI thật mới render — nếu không, assertion
// `allWidgets.isNotEmpty` (bản gốc smoke test) PASS giả vì "Test starting..."
// Text cũng là 1 widget non-empty, không chứng minh app thật đã lên.

import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

import './_helpers.dart';

void main() {
  patrolTest(
    'harness: bootstrap app thật + cold-start hiển thị màn Đăng nhập tiếng Việt',
    config: PatrolTesterConfig(
      visibleTimeout: const Duration(seconds: 20),
      settleTimeout: const Duration(seconds: 30),
    ),
    ($) async {
      await bootstrapApp($);
      final found = await _waitForLoginOrHome($);
      expect(found, isTrue,
          reason:
              'App thật phải render màn Đăng nhập (hoặc Home nếu có session) sau bootstrapApp() + tối đa ~30s cold-start');
    },
  );
}

Future<bool> _waitForLoginOrHome(PatrolIntegrationTester $) async {
  for (var i = 0; i < 15; i++) {
    await $.pumpAndSettle(duration: const Duration(seconds: 2));
    if ($(find.text('Đăng nhập')).exists || $(find.textContaining('kho hàng')).exists) {
      return true;
    }
  }
  return false;
}
