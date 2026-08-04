// HARNESS SMOKE — W02 mobile E2E pre-flight gate (no BFF dependency)
// Purpose: verify Patrol toolchain + device + APK install + app cold-start
//          all green BEFORE running product-level patrol specs.
// Cluster: C3 (Patrol live device/emulator)
// Runner: patrol test --target Execution/auto/specs/W02/mobile-e2e/harness_smoke_patrol_test.dart
// TC map: preflight gate — NOT a product testcase
//
// Pass criteria (gate):
//   1. Device reachable (adb devices)
//   2. APK build + install (flavor dev → com.cardoctor.garage.squad.dev)
//   3. Patrol JUnit runner launches Dart side
//   4. pumpAndSettle completes within 30s without exception
//
// PATCH v2 (Run 9, 2026-06-24):
//   - $.pumpAndSettle() API changed from positional Duration arg (patrol ^3.x)
//     to named parameter (patrol ^4.x used in mobile app via git ref).
//     Fixed: await $.pumpAndSettle() → uses named 'duration:' instead of positional.
//   - flavor changed from stag → dev because stag Flavor returns '' for
//     graphQLUrl / graphQLSSOUrl (empty endpoints → app cannot connect to BFF).
//     dev Flavor points to http://192.168.110.191:45401/garage/graphql (remote BFF, LAN).
//     package_name for dev: com.cardoctor.garage.squad.dev.
//
// Gap fixed by original smoke: W01 145/145 mobile TC BLOCKED — root cause
// was patrol.yaml `package_name`/`flavor` drift, NOT toolchain absent.
// See Tracking/WAVE01/REPORT-QC-FINAL §1.5.1 + memory `patrol-yaml-config-drift`.

import 'package:patrol/patrol.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  patrolTest(
    'harness: APK installed + app cold-start completes pumpAndSettle',
    config: PatrolTesterConfig(
      visibleTimeout: const Duration(seconds: 15),
      settleTimeout: const Duration(seconds: 30),
    ),
    ($) async {
      // patrol ^4.x: pumpAndSettle uses named parameters (no positional Duration)
      await $.pumpAndSettle(duration: const Duration(seconds: 5));
      expect($.tester.allWidgets.isNotEmpty, isTrue,
          reason: 'App must have rendered at least one widget after cold-start. '
              'Empty widget tree = APK install failed or main() crashed before first frame.');
    },
  );
}
