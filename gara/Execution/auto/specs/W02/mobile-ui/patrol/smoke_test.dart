// SPEC: Patrol smoke preflight
// Cluster: C3 — Patrol live device smoke (verify Patrol pipeline works before running TCs)
// Runner: patrol test --target Execution/auto/specs/W02/mobile-ui/patrol/smoke_test.dart
// Purpose: 1 Patrol test that opens the app and asserts 1 widget — validates patrol.yaml
//          package_name/flavor + emulator connection before running substantive TCs.
// NOTE: If this fails, check patrol.yaml drift per TL-W01-MUI-004 (package_name/flavor
//       must match build.gradle applicationId and flavor configuration).

import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

void main() {
  patrolTest(
    'PATROL-SMOKE-W02 — App launches and renders at least 1 text widget',
    ($) async {
      // App should launch via patrol.yaml appId configuration
      // Verify: at least 1 Text widget rendered (app not blank/crashed)
      await $.pumpAndSettle();

      // Generic assertion: any text widget present = app launched successfully
      expect(find.byType(Text), findsWidgets,
          reason: 'Patrol smoke: app launched and rendered at least 1 Text widget');
    },
  );
}
