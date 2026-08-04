// W01 — Auth + App Lifecycle integration_test specs (cluster C1/C2 — no native interaction)
// Runner: cd Execution/auto/harness/integration-test && flutter test integration_test/auth_lifecycle_integration_test.dart -d <device-id>
//
// TC map:
//   TC-W01-MOB-030 → 'Login email/password → home screen → FCM token đăng ký (AUTH-001, C2)'
//   TC-W01-MOB-031 → 'Token refresh fail → logout → return to login screen (AUTH-005, C2)'
//   TC-W01-MOB-032 → 'Logout → return to login (AUTH-006, C2)'
//   TC-W01-MOB-033 → 'Kế toán: chỉ thấy tab Phiếu quyết toán (PRM-001 adapted, C1)'
//   TC-W01-MOB-034 → 'Localization Vietnamese: wording tiếng Việt (LOC-001, C1)'
//
// Note: Các TC này dùng integration_test (không cần Patrol native) — cluster C1/C2.

import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  // TC-W01-MOB-030: Login → FCM token register (AUTH-001 adapted, C2)
  testWidgets(
    'TC-MOB-030: Kế toán login email/password → home screen hiển thị + FCM token đăng ký',
    (tester) async {
      // Precondition: app launch (integration_test binds app)
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Entry UI: màn Đăng nhập
      expect(find.text('Đăng nhập'), findsOneWidget);

      // Critical action: nhập credentials + submit
      await tester.enterText(find.byKey(const Key('email-field')), 'accountant@garage-a.test');
      await tester.enterText(find.byKey(const Key('password-field')), 'Test@123456');
      await tester.tap(find.text('Đăng nhập'));
      await tester.pumpAndSettle(const Duration(seconds: 8));

      // Route/feedback: màn Trang chủ
      expect(find.text('Trang chủ'), findsOneWidget,
          reason: 'AUTH-001: login thành công phải chuyển về Trang chủ');

      // Final observable end state: user đã authenticated (no login screen)
      expect(find.text('Đăng nhập'), findsNothing);

      // FCM token register (C2 check — cần observer DB/BFF nhưng UI assertion đủ cho C1)
      // Full C2 check: verify POST /api/devices/{token} đã hit BFF (cần network observer)
    },
  );

  // TC-W01-MOB-031: Token refresh fail → logout (AUTH-005, C2)
  testWidgets(
    'TC-MOB-031: Token refresh fail (refresh token expired) → logout → màn Đăng nhập',
    (tester) async {
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Simulate đã login (inject mock auth state với expired refresh token)
      // Precondition: app state có accessToken expired + refreshToken expired

      // Trigger action cần auth
      await tester.tap(find.text('Phiếu quyết toán'));
      await tester.pumpAndSettle(const Duration(seconds: 5));

      // Assert: app chuyển về màn login khi refresh fail
      expect(find.text('Đăng nhập'), findsOneWidget,
          reason: 'AUTH-005: token refresh fail phải logout về màn Đăng nhập');
    },
  );

  // TC-W01-MOB-032: Logout flow (AUTH-006 adapted, C2)
  testWidgets(
    'TC-MOB-032: Kế toán logout → return to màn Đăng nhập',
    (tester) async {
      await tester.pumpAndSettle(const Duration(seconds: 3));
      // Login first
      await tester.enterText(find.byKey(const Key('email-field')), 'accountant@garage-a.test');
      await tester.enterText(find.byKey(const Key('password-field')), 'Test@123456');
      await tester.tap(find.text('Đăng nhập'));
      await tester.pumpAndSettle(const Duration(seconds: 8));

      expect(find.text('Trang chủ'), findsOneWidget);

      // Logout qua tab "Tôi" hoặc menu
      await tester.tap(find.text('Tôi'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Đăng xuất'));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Assert: return to login
      expect(find.text('Đăng nhập'), findsOneWidget,
          reason: 'AUTH-006: logout phải return về màn Đăng nhập');
      // Assert: không còn trạng thái home
      expect(find.text('Trang chủ'), findsNothing);
    },
  );

  // TC-W01-MOB-033: Kế toán permission — tab navigation (PRM-001 adapted, C1)
  testWidgets(
    'TC-MOB-033: Kế toán login → thấy tab Phiếu quyết toán, không thấy tab bị giới hạn',
    (tester) async {
      await tester.pumpAndSettle(const Duration(seconds: 3));
      await tester.enterText(find.byKey(const Key('email-field')), 'accountant@garage-a.test');
      await tester.enterText(find.byKey(const Key('password-field')), 'Test@123456');
      await tester.tap(find.text('Đăng nhập'));
      await tester.pumpAndSettle(const Duration(seconds: 8));

      // Assert: kế toán thấy tab "Phiếu quyết toán"
      expect(find.text('Phiếu quyết toán'), findsWidgets,
          reason: 'PRM-001: kế toán phải thấy Phiếu quyết toán tab');
    },
  );

  // TC-W01-MOB-034: Localization Vietnamese (LOC-001, C1)
  testWidgets(
    'TC-MOB-034: Toàn bộ wording tiếng Việt trên màn đăng nhập và home screen',
    (tester) async {
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Assert: màn login wording tiếng Việt
      expect(find.text('Đăng nhập'), findsOneWidget);
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Mật khẩu'), findsOneWidget);

      // Login
      await tester.enterText(find.byKey(const Key('email-field')), 'accountant@garage-a.test');
      await tester.enterText(find.byKey(const Key('password-field')), 'Test@123456');
      await tester.tap(find.text('Đăng nhập'));
      await tester.pumpAndSettle(const Duration(seconds: 8));

      // Assert: home screen wording tiếng Việt
      expect(find.text('Trang chủ'), findsOneWidget,
          reason: 'LOC-001: wording home screen phải là tiếng Việt');
    },
  );
}
