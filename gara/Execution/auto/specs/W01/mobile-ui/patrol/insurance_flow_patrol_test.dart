// insurance_flow_patrol_test.dart
// Cluster: C3 — Patrol live device / Android emulator / iOS simulator
// Run: patrol test --target Execution/auto/specs/W01/mobile-ui/patrol/insurance_flow_patrol_test.dart
// Covers: TC-MUI-057, TC-MUI-091..TC-MUI-098
//
// Prerequisite: patrol_cli installed, emulator booted
//   dart pub global activate patrol_cli
//   flutter emulators --launch Pixel_6_API_34  (Android)
//   OR: xcrun simctl boot <uuid>  (iOS)
//
// IMPORTANT: This file BLOCKED-by-harness until emulator/Patrol ready.

// import 'package:patrol/patrol.dart';

void main() {
  // TC-MUI-057: SO Edit Save → navigate SO Detail
  // patrolTest(
  //   'TC-MUI-057: Save allocation → navigate SO Detail read-only',
  //   ($) async {
  //     await $.pumpWidgetAndSettle(const MyApp());
  //     await $.tap(find.text('Lưu'));
  //     await $.pumpAndSettle();
  //     expect(find.byType(ServiceOrderDetailPage), findsOneWidget);
  //     expect(find.byType(TextField), findsNothing);
  //   },
  // );

  // TC-MUI-091: SO Edit Save → route push
  // TC-MUI-092: Back from STL Detail → pop
  // TC-MUI-093: Android hardware back dirty form → AlertDialog
  // TC-MUI-094: Orientation rotate STL Detail — 4 tab no overflow
  // TC-MUI-095: SO Edit rotation data persist
  // TC-MUI-096: Android API 28+ and iOS 14+ render
  // TC-MUI-097: Soft keyboard not covering last field
  // TC-MUI-098: Background resume form state preserved

  // Placeholder: awaiting harness bootstrap
  // All TC-MUI-057, TC-MUI-091..TC-MUI-098 marked BLOCKED-by-harness in TC artifact
}
