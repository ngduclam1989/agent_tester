// SPEC: TC-W02-MUI-A-004 (golden — phone portrait, fullInsurance state)
// Cluster: C2 — alchemist golden (deterministic Roboto font, no emulator)
// Runner: flutter test Execution/auto/specs/W02/mobile-ui/ins_stl_create_golden_test.dart
//         (requires QC harness: cd Execution/auto/harness/alchemist && flutter pub get)
// STATUS: BLOCKED-by-harness — native plugin chain prevents widget pump from QC harness.
//         Project-native runner in mobile/gf-garage-app/test/ required (TL-W01-MUI-003).
//         Also: golden test requires alchemist 0.14.0 smoke pass first (TL-W01-MUI-002).
//
// Figma oracle 553:25702: Inter font, #0052ff primary, #262626 text, #f3f3f4 bg secondary,
// 16dp card padding, 8dp row gap. NOTE: alchemist harness uses Roboto (bundled) — Inter
// font drift acceptable for CI determinism; visual drift from oracle noted.

import 'package:alchemist/alchemist.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('TC-W02-MUI-A-004 — STL Create golden — phone portrait 375×812', () {
    goldenTest(
      'stl_create_full_insurance_portrait',
      fileName: 'stl_create_full_insurance_portrait',
      pumpBeforeTest: (tester) async {
        await tester.pumpAndSettle();
      },
      builder: () => GoldenTestGroup(
        children: [
          GoldenTestScenario(
            name: 'fullInsurance state (mock)',
            child: const SizedBox(
              width: 375,
              height: 812,
              child: Placeholder(
                // TODO: Replace with real SettlementCreateScreen widget pump
                // when running in project-native mobile/gf-garage-app/test/
                // MockInsuranceSettlementCreateCubit emitting LoadedState(soHasInsurance: true)
                fallbackHeight: 812,
                fallbackWidth: 375,
                color: Color(0xFFF3F3F4), // #f3f3f4 bg secondary per oracle
              ),
            ),
          ),
        ],
      ),
    );
  });
}
