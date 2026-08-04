// SMOKE PROBE — W01 mobile E2E harness preflight
// Purpose: verify Patrol can cold-start the app and assert 1 Vietnamese widget
// Cluster: C3 (Patrol live device/emulator)
// Runner: patrol test --target Execution/auto/specs/W01/mobile-e2e/smoke_patrol_test.dart -d <device-id>
// TC map: preflight gate — NOT a product testcase

import 'package:patrol/patrol.dart';

void main() {
  patrolTest(
    'Smoke — app cold-start và hiển thị màn đăng nhập tiếng Việt',
    config: PatrolTesterConfig(
      visibleTimeout: const Duration(seconds: 15),
      settleTimeout: const Duration(seconds: 10),
    ),
    ($) async {
      // Cold-start: app đã launch qua Patrol runner
      await $.pumpAndSettle(const Duration(seconds: 3));

      // Assert màn Đăng nhập render — widget tối thiểu phải có
      await $.waitUntilVisible($('Đăng nhập'));
      expect($.tester.any(find.text('Đăng nhập')), isTrue,
          reason: 'Màn đăng nhập phải hiển thị sau cold start');
    },
  );
}
