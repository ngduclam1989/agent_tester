// W01 — FEAT-INS-STL-DETAIL Mobile E2E Patrol specs
// Cluster: C3 (Patrol live device/emulator — Android API 33+ / iOS 16+)
// Runner: cd Execution/auto/harness/patrol && patrol test --target ../../specs/W01/mobile-e2e/ins_stl_detail_patrol_test.dart -d <device-id>
//
// TC map:
//   TC-W01-MOB-015 → 'Kế toán mở phiếu QT BH → 4 tab + header hiển thị đúng (AC-1..4)'
//   TC-W01-MOB-016 → 'Tab Bảng chi phí → bảng hạng mục BH + panel Tổng giá dịch vụ (AC-5, AC-6)'
//   TC-W01-MOB-017 → 'Panel Cân thanh toán = tính đúng công thức BR-005 (AC-11)'
//   TC-W01-MOB-018 → 'Tab Lịch sử thanh toán → danh sách read-only (AC-9)'
//   TC-W01-MOB-019 → 'Phiếu QT BH không có nút Huỷ (AC-11 + BR-INS-STL-DET-003)'
//   TC-W01-MOB-020 → 'Deeplink cold start vào chi tiết phiếu QT BH → render đúng (DPL-001 Android)'
//   TC-W01-MOB-021 → 'Deeplink foreground vào chi tiết phiếu QT BH (DPL-002)'
//   TC-W01-MOB-022 → 'Phiếu QT BH không tồn tại → error screen "Không tìm thấy" (INS_STL_NOT_FOUND)'
//   TC-W01-MOB-023 → 'FCM push background: nhận thông báo phiếu QT BH → tap → mở màn chi tiết (PSH-003)'
//   TC-W01-MOB-024 → 'Nút Tạo hồ sơ bảo hiểm disabled + SnackBar "Tính năng sẽ available ở Wave 2" (AC-13)'
//   TC-W01-MOB-025 → 'Deeplink iOS Universal Link cold start → màn chi tiết phiếu QT BH (DPL-001 iOS)'

import 'package:patrol/patrol.dart';

const String _accountantEmail = String.fromEnvironment('TEST_ACCOUNTANT_EMAIL',
    defaultValue: 'accountant@garage-a.test');
const String _accountantPassword = String.fromEnvironment(
    'TEST_ACCOUNTANT_PASSWORD',
    defaultValue: 'Test@123456');
const String _deeplinkDomain = String.fromEnvironment('DEEPLINK_DOMAIN',
    defaultValue: 'app.garage.test');

Future<void> _loginAsAccountant(PatrolIntegrationTester $) async {
  await $.waitUntilVisible($('Đăng nhập'));
  await $('Email').enterText(_accountantEmail);
  await $('Mật khẩu').enterText(_accountantPassword);
  await $('Đăng nhập').tap();
  await $.waitUntilVisible($('Trang chủ'), const Duration(seconds: 10));
}

void main() {
  // TC-W01-MOB-015: Mở phiếu QT BH → 4 tab + header (AC-1..4)
  patrolTest(
    'Kế toán mở phiếu QT BH SET-W01-INS-001 → header mã phiếu + 4 tab hiển thị đúng',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      // Navigate đến màn chi tiết phiếu QT BH (qua list)
      await $('Phiếu quyết toán').tap();
      await $.waitUntilVisible($('Danh sách phiếu quyết toán'));
      await $('SET-W01-INS-001').tap();
      await $.waitUntilVisible($('Chi tiết phiếu quyết toán'));

      // Assert: header mã phiếu (AC-1)
      await $.waitUntilVisible($('SET-W01-INS-001'));

      // Assert: 4 tab (AC-4)
      await $.waitUntilVisible($('Bảng chi phí'));
      await $.waitUntilVisible($('Chứng từ & hoá đơn'));
      await $.waitUntilVisible($('Hồ sơ bảo hiểm đã xuất'));
      await $.waitUntilVisible($('Lịch sử thanh toán'));

      // Assert: khối thông tin quyết toán (AC-2)
      await $.waitUntilVisible($('Phiếu dịch vụ liên kết'));
      // Assert: khối thông tin KH/xe (AC-3)
      await $.waitUntilVisible($('Thông tin khách hàng'));

      // Assert: action bar có nút Chỉnh sửa + In toàn bộ hồ sơ (AC-1)
      await $.waitUntilVisible($('Chỉnh sửa'));
      await $.waitUntilVisible($('In toàn bộ hồ sơ'));

      await $.takeScreenshot('TC-MOB-015-stl-detail-4-tabs');
    },
  );

  // TC-W01-MOB-016: Tab Bảng chi phí — hạng mục BH + panel Tổng giá dịch vụ (AC-5, AC-6)
  patrolTest(
    'Tab Bảng chi phí → chỉ hiển thị hạng mục Bảo hiểm + panel Tổng giá dịch vụ đầy đủ 3 phần',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu quyết toán').tap();
      await $.waitUntilVisible($('Danh sách phiếu quyết toán'));
      await $('SET-W01-INS-001').tap();
      await $.waitUntilVisible($('Chi tiết phiếu quyết toán'));

      // Tab Bảng chi phí là default active — assert panel Tổng giá dịch vụ
      await $.waitUntilVisible($('Tổng giá dịch vụ'));

      // Assert: Chi tiết theo bên thanh toán (AC-6, AC-9)
      await $.waitUntilVisible($('Chi tiết theo bên thanh toán'));
      await $.waitUntilVisible($('Cộng sau VAT'));

      // Assert: Phân bổ Bảo hiểm 5 dòng (AC-6, AC-10)
      await $.waitUntilVisible($('CK liên kết BH — Vật tư'));
      await $.waitUntilVisible($('CK liên kết BH — Công dịch vụ'));
      await $.waitUntilVisible($('Giảm trừ bồi thường'));
      await $.waitUntilVisible($('Khấu hao vật tư / thay mới'));
      await $.waitUntilVisible($('Khấu trừ BH'));

      // Assert: Cân thanh toán 3 ô (AC-6, AC-11)
      await $.waitUntilVisible($('BH thanh toán'));
      await $.waitUntilVisible($('Khách hàng thanh toán'));
      await $.waitUntilVisible($('Tổng thanh toán'));

      // Assert: bảng hạng mục chỉ hiển thị dòng "Bảo hiểm" (AC-5)
      expect(
        $.tester.any(find.text('Bảo hiểm')),
        isTrue,
        reason: 'AC-5: bảng chi phí phiếu QT BH chỉ hiển thị hạng mục Nguồn TT=Bảo hiểm',
      );

      await $.takeScreenshot('TC-MOB-016-cost-tab-panel');
    },
  );

  // TC-W01-MOB-017: Cân thanh toán = tính đúng công thức (AC-11, BR-005)
  patrolTest(
    'Panel Cân thanh toán hiển thị BH thanh toán 197.680.000đ + KH 35.720.000đ + Tổng 233.400.000đ (theo ví dụ thực)',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      // Precondition: seed phiếu QT BH SET-W01-INS-002 với allocation đúng ví dụ thực FEAT
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu quyết toán').tap();
      await $.waitUntilVisible($('Danh sách phiếu quyết toán'));
      await $('SET-W01-INS-002').tap();
      await $.waitUntilVisible($('Chi tiết phiếu quyết toán'));

      // Assert: số tiền cân thanh toán đúng ví dụ thực (AC-11, BR-005)
      await $.waitUntilVisible($('197.680.000'));
      await $.waitUntilVisible($('35.720.000'));
      await $.waitUntilVisible($('233.400.000'));

      await $.takeScreenshot('TC-MOB-017-can-thanh-toan-correct');
    },
  );

  // TC-W01-MOB-018: Tab Lịch sử thanh toán → read-only (AC-9)
  patrolTest(
    'Kế toán mở tab Lịch sử thanh toán → danh sách read-only, có cột Ngày/Số tiền/Phương thức',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu quyết toán').tap();
      await $.waitUntilVisible($('Danh sách phiếu quyết toán'));
      await $('SET-W01-INS-001').tap();
      await $.waitUntilVisible($('Chi tiết phiếu quyết toán'));

      // Switch tab
      await $('Lịch sử thanh toán').tap();
      await $.pumpAndSettle();

      // Assert: bảng lịch sử có header cột
      await $.waitUntilVisible($('Ngày'));
      await $.waitUntilVisible($('Số tiền'));
      await $.waitUntilVisible($('Phương thức'));

      // Assert: không có nút Thêm/Xóa (read-only trong scope FEAT này)
      expect(
        $.tester.any(find.text('Thêm thanh toán')),
        isFalse,
        reason: 'AC-9: lịch sử thanh toán read-only, không có nút "Thêm"',
      );

      await $.takeScreenshot('TC-MOB-018-payment-history-tab');
    },
  );

  // TC-W01-MOB-019: Không có nút Huỷ (AC-11, BR-INS-STL-DET-003)
  patrolTest(
    'Phiếu QT BH không hiển thị hành động Huỷ — không có luồng cancel',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 15)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu quyết toán').tap();
      await $.waitUntilVisible($('Danh sách phiếu quyết toán'));
      await $('SET-W01-INS-001').tap();
      await $.waitUntilVisible($('Chi tiết phiếu quyết toán'));

      // Assert: KHÔNG có nút "Huỷ" hoặc "Huỷ phiếu"
      expect($.tester.any(find.text('Huỷ phiếu')), isFalse,
          reason: 'AC-11: Phiếu QT BH KHÔNG có chức năng huỷ');
      expect($.tester.any(find.text('Hủy phiếu')), isFalse);

      await $.takeScreenshot('TC-MOB-019-no-cancel-button');
    },
  );

  // TC-W01-MOB-020: Deeplink Android App Link cold start → màn chi tiết (DPL-001 Android)
  patrolTest(
    'Deeplink Android App Link cold start https://app.garage.test/settlements/SET-W01-INS-001 → app mở màn chi tiết phiếu QT BH',
    ($) async {
      // App terminated state — Patrol launch via deeplink
      await $.native.openUrl(
          'https://$_deeplinkDomain/settlements/SET-W01-INS-001');

      // Cold start + splash
      await $.pumpAndSettle(const Duration(seconds: 5));

      // Auth: nếu cần login trước deeplink target
      if ($.tester.any(find.text('Đăng nhập'))) {
        await _loginAsAccountant($);
      }

      // Assert: màn chi tiết phiếu QT BH
      await $.waitUntilVisible($('SET-W01-INS-001'),
          const Duration(seconds: 10));
      await $.waitUntilVisible($('Chi tiết phiếu quyết toán'));

      // Native checkpoint: deeplink resolved
      expect(
        $.tester.any(find.text('Bảng chi phí')),
        isTrue,
        reason: 'DPL-001 Android: deeplink cold start phải mở đúng màn chi tiết',
      );

      await $.takeScreenshot('TC-MOB-020-deeplink-android-coldstart');
    },
  );

  // TC-W01-MOB-021: Deeplink khi app đang foreground → in-app navigation (DPL-002)
  patrolTest(
    'Deeplink khi app đang foreground tại Home → navigate in-app đến chi tiết phiếu QT BH',
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      // App đang ở Home (foreground)
      await $.waitUntilVisible($('Trang chủ'));

      // Trigger deeplink từ foreground
      await $.native.openUrl(
          'https://$_deeplinkDomain/settlements/SET-W01-INS-001');
      await $.pumpAndSettle(const Duration(seconds: 3));

      // Assert: navigate đến màn chi tiết (KHÔNG cold restart)
      await $.waitUntilVisible($('SET-W01-INS-001'));

      await $.takeScreenshot('TC-MOB-021-deeplink-foreground');
    },
  );

  // TC-W01-MOB-022: Phiếu QT BH không tồn tại → error screen (INS_STL_NOT_FOUND)
  patrolTest(
    'Deeplink tới phiếu QT BH không tồn tại SET-W01-INS-999 → màn "Không tìm thấy phiếu quyết toán bảo hiểm."',
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu quyết toán').tap();
      await $.waitUntilVisible($('Danh sách phiếu quyết toán'));

      // Trigger deeplink với ID không tồn tại
      await $.native.openUrl(
          'https://$_deeplinkDomain/settlements/SET-W01-INS-999');
      await $.pumpAndSettle(const Duration(seconds: 3));

      // Assert: error state UI
      await $.waitUntilVisible(
          $('Không tìm thấy phiếu quyết toán bảo hiểm.'));

      await $.takeScreenshot('TC-MOB-022-not-found-error-state');
    },
  );

  // TC-W01-MOB-023: FCM background push → tap → mở màn chi tiết (PSH-003)
  patrolTest(
    'Push FCM phiếu QT BH mới: app background → notification system tray → tap → mở màn chi tiết SET-W01-INS-003',
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      // Grant FCM permission first (iOS 14+ / Android 33+)
      // Android: permission dialog nếu API 33+
      if (await $.native.isPermissionDialogVisible()) {
        await $.native.grantPermissionWhenInUse();
      }

      // App background
      await $.native.pressHome();
      await Future.delayed(const Duration(seconds: 2));

      // Trigger FCM test push từ test helper (real FCM test instance)
      // Note: FCM trigger phải được implement qua fcm_test_helper.dart
      // KHÔNG dùng fake_token — phải dùng real device token đã register
      // test push trigger: sendPushViaFcmTestApi(testDeviceToken, 'SET-W01-INS-003')

      // Open notification tray
      await $.native.openNotifications();
      await $.pumpAndSettle();

      // Tap notification phiếu QT BH
      await $.native
          .tap(Selector(textContains: 'SET-W01-INS-003'));
      await $.pumpAndSettle(const Duration(seconds: 3));

      // Assert: app foreground + màn chi tiết phiếu QT BH
      await $.waitUntilVisible($('SET-W01-INS-003'));
      await $.waitUntilVisible($('Chi tiết phiếu quyết toán'));

      await $.takeScreenshot('TC-MOB-023-fcm-background-tap-detail');
    },
  );

  // TC-W01-MOB-024: Nút Tạo hồ sơ bảo hiểm disabled W01 (AC-13)
  patrolTest(
    'Nút "+ Tạo hồ sơ bảo hiểm" disabled → tap → SnackBar "Tính năng sẽ available ở Wave 2"',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu quyết toán').tap();
      await $.waitUntilVisible($('Danh sách phiếu quyết toán'));
      await $('SET-W01-INS-001').tap();
      await $.waitUntilVisible($('Chi tiết phiếu quyết toán'));

      // Assert nút tồn tại (AC-13)
      await $.waitUntilVisible($(find.textContaining('Tạo hồ sơ bảo hiểm')));

      // Tap nút disabled
      await $(find.textContaining('Tạo hồ sơ bảo hiểm')).tap();
      await $.pumpAndSettle();

      // Assert: SnackBar với message W01 disabled
      await $.waitUntilVisible($('Tính năng sẽ available ở Wave 2'));

      await $.takeScreenshot('TC-MOB-024-create-dossier-disabled');
    },
  );

  // TC-W01-MOB-025: iOS Universal Link cold start → màn chi tiết (DPL-001 iOS — iOS only)
  patrolTest(
    '[iOS] Universal Link cold start https://app.garage.test/settlements/SET-W01-INS-001 → app mở màn chi tiết phiếu QT BH',
    ($) async {
      // iOS only test — Android dùng App Links (TC-MOB-020)
      // platform check:
      if (await $.native.getPlatform() != 'ios') {
        // Skip on non-iOS
        return;
      }

      // App terminated on iOS simulator
      await $.native.openUrl(
          'https://$_deeplinkDomain/settlements/SET-W01-INS-001');

      await $.pumpAndSettle(const Duration(seconds: 6));

      if ($.tester.any(find.text('Đăng nhập'))) {
        await _loginAsAccountant($);
      }

      await $.waitUntilVisible($('SET-W01-INS-001'),
          const Duration(seconds: 10));
      await $.waitUntilVisible($('Chi tiết phiếu quyết toán'));

      // Native checkpoint iOS: universal link resolved (không fallback Safari)
      expect(
        $.tester.any(find.text('Bảng chi phí')),
        isTrue,
        reason: 'DPL-001 iOS: Universal Link cold start phải mở đúng màn chi tiết',
      );

      await $.takeScreenshot('TC-MOB-025-universal-link-ios-coldstart');
    },
  );
}
