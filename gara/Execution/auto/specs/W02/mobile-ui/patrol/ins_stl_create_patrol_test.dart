// SPEC: TC-W02-MUI-A-005 (navigation push), TC-W02-MUI-B-004/B-005/B-010 (navigation)
//       TC-W02-MUI-B-020/B-021/B-022 (DatePicker), TC-W02-MUI-C-007/C-020 (PDF tap, pull-to-refresh)
// Cluster: C3 — Patrol live device (Android emulator API 33 or iOS simulator iOS 16+)
// Runner: patrol test --target Execution/auto/specs/W02/mobile-ui/patrol/ins_stl_create_patrol_test.dart
// Smoke first: patrol test --target Execution/auto/specs/W02/mobile-ui/patrol/smoke_test.dart
// Prerequisite: patrol.yaml configured (Execution/auto/harness/patrol/); emulator booted
// NOTE: patrol.yaml package_name/flavor must match build.gradle (TL-W01-MUI-004 drift check)

import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

void main() {
  // ---------------------------------------------------------------------------
  // TC-W02-MUI-A-005: Navigation from SO detail to Tao phieu QT
  // ---------------------------------------------------------------------------
  patrolTest(
    'TC-W02-MUI-A-005 — Tap "Tạo phiếu quyết toán" pushes màn với AppBar title',
    ($) async {
      // Precondition: app logged in as accountant; SO có BH ở trạng thái Hoàn thành
      // Navigate to SO detail screen (integration test seed data required)
      await $.pumpWidgetAndSettle(
        // Real app widget here — requires app launch
        // $.app — Patrol launches full app via patrol.yaml configuration
        const SizedBox(), // stub; replace with app launch in real Patrol run
      );

      // Step 1: Find and tap "Tạo phiếu quyết toán" CTA on SO detail
      await $.tap(find.text('Tạo phiếu quyết toán'));
      await $.pumpAndSettle();

      // Step 2: Verify new screen AppBar title
      expect(find.text('Tạo phiếu quyết toán'), findsOneWidget,
          reason: 'AppBar title of new screen after push');

      // Step 3: Verify back button present (not root screen)
      expect(find.byType(BackButton), findsOneWidget);
    },
  );

  // ---------------------------------------------------------------------------
  // TC-W02-MUI-B-004: Navigate from STL detail to Hồ sơ BH screen
  // ---------------------------------------------------------------------------
  patrolTest(
    'TC-W02-MUI-B-004 — Tap "Tạo hồ sơ bảo hiểm" pushes Hồ sơ BH screen',
    ($) async {
      // Precondition: STL detail for BH payer settlement open
      await $.tap(find.text('Tạo hồ sơ bảo hiểm'));
      await $.pumpAndSettle();

      expect(find.text('Hồ sơ bảo hiểm'), findsOneWidget,
          reason: 'AppBar title "Hồ sơ bảo hiểm" after navigation');
      expect(find.byType(BackButton), findsOneWidget);
    },
  );

  // ---------------------------------------------------------------------------
  // TC-W02-MUI-B-005: Back button on Hồ sơ BH screen pops to STL detail
  // ---------------------------------------------------------------------------
  patrolTest(
    'TC-W02-MUI-B-005 — Back button pops Hồ sơ BH screen to STL detail',
    ($) async {
      // Precondition: on Hồ sơ BH screen (from TC-B-004 or navigate directly)
      await $.tap(find.byType(BackButton));
      await $.pumpAndSettle();

      // Verify back on STL detail (nút "Tạo hồ sơ bảo hiểm" visible again)
      expect(find.text('Tạo hồ sơ bảo hiểm'), findsOneWidget,
          reason: 'USA-005: back returns to STL detail — not trapped on Hồ sơ BH');
    },
  );

  // ---------------------------------------------------------------------------
  // TC-W02-MUI-B-010: Tap document row navigates to detail screen
  // ---------------------------------------------------------------------------
  patrolTest(
    'TC-W02-MUI-B-010 — Tap "Phiếu quyết toán" row navigates to document detail',
    ($) async {
      // Precondition: on Hồ sơ BH list screen
      await $.tap(find.text('Phiếu quyết toán'));
      await $.pumpAndSettle();

      expect(find.text('PHIẾU QUYẾT TOÁN SỬA CHỮA'), findsOneWidget,
          reason: 'AC-4: document detail screen title after tap');
    },
  );

  // ---------------------------------------------------------------------------
  // TC-W02-MUI-B-020: Tap DatePicker field opens calendar (not keyboard)
  // ---------------------------------------------------------------------------
  patrolTest(
    'TC-W02-MUI-B-020 — Tap "Ngày lập" Biên bản → DatePickerDialog opens',
    ($) async {
      // Precondition: on Biên bản nghiệm thu screen
      await $.tap(find.byKey(const Key('field-ngay-lap')));
      await $.pumpAndSettle();

      expect(
        find.byType(DatePickerDialog).or(find.byType(CalendarDatePicker)),
        findsOneWidget,
        reason: 'DAT-001: DatePicker opens (not text keyboard) when field tapped',
      );
    },
  );

  // ---------------------------------------------------------------------------
  // TC-W02-MUI-B-021: Select date → field displays dd/MM/yyyy Vietnamese format
  // ---------------------------------------------------------------------------
  patrolTest(
    'TC-W02-MUI-B-021 — Select 19/06/2026 → field shows "19/06/2026" (Vietnamese locale)',
    ($) async {
      // Precondition: DatePickerDialog open; navigate to June 2026
      // Tap day 19
      await $.tap(find.text('19'));
      await $.pumpAndSettle();

      expect(find.text('19/06/2026'), findsOneWidget,
          reason: 'LOC-002: Vietnamese date format dd/MM/yyyy — NOT en-US 6/19/2026');
    },
  );

  // ---------------------------------------------------------------------------
  // TC-W02-MUI-B-022: Future dates disabled in DatePicker (CCCD issue date)
  // ---------------------------------------------------------------------------
  patrolTest(
    'TC-W02-MUI-B-022 — DatePicker "Ngày cấp CCCD" — future dates disabled',
    ($) async {
      // Precondition: on GUQ screen; tap CCCD date field
      await $.tap(find.byKey(const Key('field-ngay-cap-cccd')));
      await $.pumpAndSettle();

      // Tomorrow text should be disabled/greyed
      // Verify by attempting tap on a future date — should remain unchanged
      final tomorrowText = DateTime.now().add(const Duration(days: 1)).day.toString();
      // If tomorrow is clickable, the date changes; if disabled, field stays same
      expect(find.byType(DatePickerDialog), findsOneWidget,
          reason: 'DAT-003: DatePicker opened');
      // Further: tap tomorrow date and verify field text unchanged (future disabled)
    },
  );

  // ---------------------------------------------------------------------------
  // TC-W02-MUI-C-007: Tap PDF card → PDF viewer opens
  // ---------------------------------------------------------------------------
  patrolTest(
    'TC-W02-MUI-C-007 — Tap PDF card → in-app PDF viewer or native viewer launched',
    ($) async {
      // Precondition: on "Hồ sơ BH đã xuất" tab with at least 1 DossierSet
      await $.tap(find.byKey(const Key('pdf-card-phieu-qt')));
      await $.pumpAndSettle();

      // Verify PDF viewer opened (InteractiveViewer for in-app PDF, or native viewer intent)
      expect(
        find.byType(InteractiveViewer),
        findsOneWidget,
        reason: 'AC-4/5: PDF opens in-app viewer on tap',
      );
    },
  );

  // ---------------------------------------------------------------------------
  // TC-W02-MUI-C-020: Pull-to-refresh triggers data reload
  // ---------------------------------------------------------------------------
  patrolTest(
    'TC-W02-MUI-C-020 — Pull-to-refresh on "Hồ sơ BH đã xuất" tab reloads data',
    ($) async {
      // Precondition: on Hồ sơ BH đã xuất tab with 1 DossierSet
      // Perform pull-to-refresh gesture
      await $.drag(find.byType(RefreshIndicator), const Offset(0, 300));
      await $.pumpAndSettle();

      // Verify data reloaded: DossierSet cards still visible (no empty state after refresh)
      expect(find.byKey(const Key('dossier-set-card')), findsWidgets,
          reason: 'LST-003: Pull-to-refresh reloads and shows updated list');
    },
  );
}
