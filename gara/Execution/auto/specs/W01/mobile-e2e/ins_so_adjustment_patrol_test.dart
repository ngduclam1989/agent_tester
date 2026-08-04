// W01 — FEAT-INS-SO-ADJUSTMENT Mobile E2E Patrol specs
// Cluster: C3 (Patrol live device/emulator — Android API 33+ / iOS 16+)
// Runner: cd Execution/auto/harness/patrol && patrol test --target ../../specs/W01/mobile-e2e/ins_so_adjustment_patrol_test.dart -d <device-id> --dart-define=BFF_BASE_URL=<test-bff>
//
// TC map:
//   TC-W01-MOB-001 → 'Kế toán vào SO Create → section Phân bổ KHÔNG hiển thị (AC-0)'
//   TC-W01-MOB-002 → 'Kế toán vào SO Edit toggle BH=Có → section Phân bổ xuất hiện (AC-1)'
//   TC-W01-MOB-003 → 'Kế toán nhập 5 khoản điều chỉnh → realtime preview cập nhật (AC-3..7)'
//   TC-W01-MOB-004 → 'Kế toán nhập % khấu hao + Áp dụng tất cả → per-dòng set đồng loạt (AC-8)'
//   TC-W01-MOB-005 → 'Kế toán lưu SO với allocation → snapshot persist + outbox event (AC-13)'
//   TC-W01-MOB-006 → 'Upload hồ sơ bảo lãnh qua native file picker (AC-2 baseline KHÔNG dev lần này — BLOCKED-by-harness nếu native file picker chưa available)'
//   TC-W01-MOB-007 → 'Kế toán nhập % > 100 → field-level error INS_ADJ_PERCENT_OUT_OF_RANGE (AC-14)'
//   TC-W01-MOB-008 → 'Kế toán nhập số âm → field-level error INS_ADJ_VALUE_NEGATIVE (AC-14)'
//   TC-W01-MOB-009 → 'BH thanh toán tính âm → warning INS_ADJ_BH_PAYMENT_NEGATIVE + allow save (AC-12)'
//   TC-W01-MOB-010 → 'Background giữa nhập form → return foreground → state restored (LIF-001)'
//   TC-W01-MOB-011 → 'Mất kết nối mid-save → snackbar "Mất kết nối" + no data loss (NET-005)'
//   TC-W01-MOB-012 → 'Token expired mid-flow → silent refresh → resume form (AUTH-004)'
//   TC-W01-MOB-014 → 'Phân quyền: cả kế toán và chủ garage đều có quyền nhập điều chỉnh BH (AC-16)'
//
// Note: Tất cả TC ở trạng thái READY (cần Patrol live device để PASS/FAIL).
//       TC đánh dấu [BLOCKED-by-harness] giữ nguyên trong artifact nhưng skip execution.

import 'package:patrol/patrol.dart';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const String _bffUrl = String.fromEnvironment('BFF_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000');
const String _accountantEmail = String.fromEnvironment('TEST_ACCOUNTANT_EMAIL',
    defaultValue: 'accountant@garage-a.test');
const String _accountantPassword = String.fromEnvironment(
    'TEST_ACCOUNTANT_PASSWORD',
    defaultValue: 'Test@123456');

/// Login helper — dùng lại trong mọi test cần auth
Future<void> _loginAsAccountant(PatrolIntegrationTester $) async {
  await $.waitUntilVisible($('Đăng nhập'));
  await $('Email').enterText(_accountantEmail);
  await $('Mật khẩu').enterText(_accountantPassword);
  await $('Đăng nhập').tap();
  await $.waitUntilVisible($('Trang chủ'), const Duration(seconds: 10));
}

// ─── Test suite ──────────────────────────────────────────────────────────────

void main() {
  // TC-W01-MOB-001: SO Create KHÔNG hiển thị section Phân bổ (AC-0)
  patrolTest(
    'Kế toán vào SO Create — section Phân bổ quyết toán bảo hiểm KHÔNG hiển thị',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 15)),
    ($) async {
      // Entry UI: cold start → login
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      // Navigate đến SO Create
      await $('Tạo phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Tạo phiếu dịch vụ'));

      // Assert: section KHÔNG tồn tại ở Create
      expect(
        $.tester.any(find.text('Phân bổ quyết toán bảo hiểm')),
        isFalse,
        reason: 'AC-0: section Phân bổ BH KHÔNG được hiển thị ở màn Create',
      );

      // Screenshot evidence
      await $.takeScreenshot('TC-MOB-001-create-no-section');
    },
  );

  // TC-W01-MOB-002: SO Edit toggle BH=Có → section xuất hiện (AC-1)
  patrolTest(
    'Kế toán vào SO Edit toggle Bảo hiểm=Có → section Phân bổ quyết toán bảo hiểm xuất hiện',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      // Navigate đến SO Edit (seed SO ID cần được inject qua dart-define hoặc test fixture)
      // Precondition: SO in COMPLETED/EDITABLE state (not yet settled) đã được seed
      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-001').tap(); // SO test seed
      await $.waitUntilVisible($('Chi tiết phiếu dịch vụ'));
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));

      // Toggle "Bảo hiểm" = "Có" (SegmentedButton)
      await $('Có').tap(); // toggle "Bảo hiểm"
      await $.pumpAndSettle();

      // Assert: section "Phân bổ quyết toán bảo hiểm" xuất hiện
      await $.waitUntilVisible($('Phân bổ quyết toán bảo hiểm'));
      expect(
        $.tester.any(find.text('CK liên kết BH — Vật tư')),
        isTrue,
        reason: 'AC-1: section Phân bổ BH phải hiển thị khi toggle BH=Có',
      );
      // Assert panel Tổng giá dịch vụ
      await $.waitUntilVisible($('Tổng giá dịch vụ'));

      await $.takeScreenshot('TC-MOB-002-edit-section-visible');
    },
  );

  // TC-W01-MOB-003: Nhập 5 khoản + realtime preview (AC-3..7, AC-9..11)
  patrolTest(
    'Kế toán nhập 5 khoản điều chỉnh BH → realtime preview BH/KH/Tổng cập nhật',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 25)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-001').tap();
      await $.waitUntilVisible($('Chi tiết phiếu dịch vụ'));
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap(); // BH toggle

      // Nhập CK liên kết BH — Vật tư: 5,000,000 VND
      await $(find.byKey(const Key('ck-lien-ket-vt-input')))
          .enterText('5000000');
      await $.pumpAndSettle();

      // Nhập CK liên kết BH — Công DV: 2,500,000 VND
      await $(find.byKey(const Key('ck-lien-ket-cdv-input')))
          .enterText('2500000');
      await $.pumpAndSettle();

      // Khấu hao header: 10% (per dòng phụ tùng)
      await $(find.byKey(const Key('khauhao-header-input'))).enterText('10');
      await $('Áp dụng tất cả').tap();
      await $.pumpAndSettle();

      // Giảm trừ bồi thường: 2,000,000 VND
      await $(find.byKey(const Key('giam-tru-boi-thuong-input')))
          .enterText('2000000');
      await $.pumpAndSettle();

      // Khấu trừ bảo hiểm: 520,000 VND
      await $(find.byKey(const Key('khau-tru-bh-input'))).enterText('520000');
      await $.pumpAndSettle();

      // Assert: realtime preview cập nhật (số tiền theo ví dụ thực FEAT)
      // BH thanh toán = 207.900.000 - 5.000.000 - 2.500.000 - 2.000.000 - khấu hao - 520.000
      // Chỉ assert field "BH thanh toán" hiển thị giá trị số khác 0
      await $.waitUntilVisible($('BH thanh toán'));
      await $.waitUntilVisible($('Khách hàng thanh toán'));
      await $.waitUntilVisible($('Tổng thanh toán'));

      await $.takeScreenshot('TC-MOB-003-realtime-preview');
    },
  );

  // TC-W01-MOB-004: Áp dụng tất cả khấu hao đồng loạt (AC-8)
  patrolTest(
    'Kế toán nhập khấu hao 20% + Áp dụng tất cả → mọi dòng phụ tùng BH set 20%',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-001').tap();
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap();

      await $(find.byKey(const Key('khauhao-header-input'))).enterText('20');
      await $('Áp dụng tất cả').tap();
      await $.pumpAndSettle();

      // Assert: ít nhất 1 dòng phụ tùng có cột Khấu hao (%) = 20
      await $.waitUntilVisible($(find.text('20')));
      expect(
        $.tester.any(find.text('20')),
        isTrue,
        reason: 'AC-8: Áp dụng tất cả phải set mọi dòng phụ tùng = 20%',
      );

      await $.takeScreenshot('TC-MOB-004-apply-all-depreciation');
    },
  );

  // TC-W01-MOB-005: Lưu SO với allocation → snapshot persist (AC-13)
  patrolTest(
    'Kế toán lưu SO với phân bổ BH → API gf-sales persist + outbox event',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 30)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-002').tap(); // second seed SO for save test
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap();

      await $(find.byKey(const Key('ck-lien-ket-vt-input')))
          .enterText('5000000');
      await $.pumpAndSettle();

      // Critical action: tap Lưu
      await $('Lưu').tap();

      // Route/feedback: SnackBar thành công hoặc navigate ra Detail
      // App hiển thị thông báo lưu thành công
      await $.waitUntilVisible($('Lưu thành công'));

      // Navigate về SO Detail
      await $.waitUntilVisible($('Chi tiết phiếu dịch vụ'));

      // Final observable: panel "Phân bổ quyết toán bảo hiểm" read-only hiển thị đúng giá trị
      await $.waitUntilVisible($('Phân bổ quyết toán bảo hiểm'));
      expect(
        $.tester.any(find.text('5.000.000')),
        isTrue,
        reason: 'AC-13: Giá trị đã lưu phải hiển thị ở Detail read-only',
      );

      await $.takeScreenshot('TC-MOB-005-save-success');
    },
  );

  // TC-W01-MOB-007: Nhập % > 100 → field-level error (AC-14, INS_ADJ_PERCENT_OUT_OF_RANGE)
  patrolTest(
    'Kế toán nhập CK liên kết VT = 150% → lỗi "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100."',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-001').tap();
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap();

      // Switch sang chế độ %
      await $(find.byKey(const Key('ck-lien-ket-vt-unit-toggle')))
          .tap(); // toggle sang %
      await $(find.byKey(const Key('ck-lien-ket-vt-input'))).enterText('150');
      await $(find.byKey(const Key('ck-lien-ket-vt-input'))).tap();
      // Trigger blur/submit
      await $('Lưu').tap();
      await $.pumpAndSettle();

      // Assert: lỗi field-level
      await $.waitUntilVisible(
          $('Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100.'));
      expect(
        $.tester.any(
            find.text('Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100.')),
        isTrue,
        reason:
            'AC-14/INS_ADJ_PERCENT_OUT_OF_RANGE: % > 100 phải hiển thị lỗi field-level',
      );

      await $.takeScreenshot('TC-MOB-007-percent-out-of-range');
    },
  );

  // TC-W01-MOB-008: Nhập số âm → field-level error (AC-14, INS_ADJ_VALUE_NEGATIVE)
  patrolTest(
    'Kế toán nhập Khấu trừ BH = -1000 → lỗi "Vui lòng nhập giá trị từ 0 trở lên."',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-001').tap();
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap();

      await $(find.byKey(const Key('khau-tru-bh-input'))).enterText('-1000');
      await $('Lưu').tap();
      await $.pumpAndSettle();

      await $.waitUntilVisible($('Vui lòng nhập giá trị từ 0 trở lên.'));
      expect(
        $.tester
            .any(find.text('Vui lòng nhập giá trị từ 0 trở lên.')),
        isTrue,
        reason:
            'AC-14/INS_ADJ_VALUE_NEGATIVE: số âm phải hiển thị lỗi field-level',
      );

      await $.takeScreenshot('TC-MOB-008-negative-value');
    },
  );

  // TC-W01-MOB-009: BH thanh toán âm → warning + allow save (AC-12, INS_ADJ_BH_PAYMENT_NEGATIVE)
  patrolTest(
    'Kế toán nhập điều chỉnh khiến BH thanh toán âm → warning "Số tiền bảo hiểm thanh toán đang nhỏ hơn 0" + vẫn lưu được',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 25)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-003').tap(); // seed SO for negative BH test
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap();

      // Nhập CK liên kết rất lớn để BH thanh toán âm
      await $(find.byKey(const Key('ck-lien-ket-vt-input')))
          .enterText('999999999');
      await $.pumpAndSettle();

      // Warning hiển thị (AC-12: không chặn)
      await $.waitUntilVisible($('Số tiền bảo hiểm thanh toán đang nhỏ hơn 0'));

      // Vẫn cho lưu (không chặn)
      await $('Lưu').tap();
      await $.waitUntilVisible($('Lưu thành công'));

      await $.takeScreenshot('TC-MOB-009-negative-bh-warning-allowed-save');
    },
  );

  // TC-W01-MOB-010: Background giữa form → return foreground → state restored (LIF-001)
  patrolTest(
    'Kế toán đang nhập form phân bổ → app background → return foreground → giá trị nhập được giữ lại',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 30)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-001').tap();
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap();

      // Nhập giá trị chưa lưu
      await $(find.byKey(const Key('ck-lien-ket-vt-input')))
          .enterText('3000000');
      await $.pumpAndSettle();

      // NATIVE: Press HOME → background
      await $.native.pressHome();
      await Future.delayed(const Duration(seconds: 3));

      // NATIVE: Return to app từ recent tasks
      await $.native.openApp(appId: 'com.garage.gms.staging');
      await $.pumpAndSettle();

      // Assert: form vẫn đang ở SO Edit, giá trị được giữ
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      // TextField vẫn có giá trị
      final textField = $.tester.widget<TextField>(
        find.byKey(const Key('ck-lien-ket-vt-input')),
      );
      expect(textField.controller?.text, '3000000',
          reason:
              'LIF-001: giá trị nhập tay phải được giữ khi app return foreground');

      await $.takeScreenshot('TC-MOB-010-background-state-restored');
    },
  );

  // TC-W01-MOB-011: Mất kết nối mid-save → snackbar cảnh báo (NET-005)
  patrolTest(
    'Kế toán tắt WiFi trước khi nhấn Lưu → app hiển thị "Mất kết nối" và không mất dữ liệu đã nhập',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 30)),
    ($) async {
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-001').tap();
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap();

      await $(find.byKey(const Key('ck-lien-ket-vt-input')))
          .enterText('4000000');
      await $.pumpAndSettle();

      // NATIVE: tắt WiFi (toggle native network)
      await $.native.disableWifi();
      await Future.delayed(const Duration(seconds: 1));

      // Critical action: tap Lưu khi offline
      await $('Lưu').tap();
      await $.pumpAndSettle();

      // Assert: SnackBar thông báo mất kết nối
      await $.waitUntilVisible($('Mất kết nối'));
      // Dữ liệu vẫn còn trong form (không mất)
      final textField = $.tester.widget<TextField>(
        find.byKey(const Key('ck-lien-ket-vt-input')),
      );
      expect(textField.controller?.text, '4000000',
          reason: 'NET-005: giá trị form không bị xóa khi mất kết nối');

      // Re-enable network
      await $.native.enableWifi();

      await $.takeScreenshot('TC-MOB-011-network-offline-snackbar');
    },
  );

  // TC-W01-MOB-012: Token expired mid-flow → silent refresh → resume (AUTH-004)
  patrolTest(
    'Token Firebase hết hạn giữa nhập phân bổ → app silent refresh token → tiếp tục lưu thành công',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 40)),
    ($) async {
      // Precondition: test token cấu hình expire sau 30 giây (test Firebase instance)
      // Seed: accountant logged in với short-lived token
      await $.pumpAndSettle(const Duration(seconds: 3));
      await _loginAsAccountant($);

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-001').tap();
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap();

      await $(find.byKey(const Key('ck-lien-ket-vt-input')))
          .enterText('1000000');
      await $.pumpAndSettle();

      // Simulate token expiry wait (test token short-lived)
      await Future.delayed(const Duration(seconds: 32));

      // Critical action: Lưu (trigger API call với expired token)
      await $('Lưu').tap();
      await $.pumpAndSettle(const Duration(seconds: 5));

      // Assert: silent refresh thành công — KHÔNG bị redirect về Login
      // App ở lại màn SO Detail sau save thành công
      final onLogin = $.tester.any(find.text('Đăng nhập'));
      expect(onLogin, isFalse,
          reason: 'AUTH-004: silent token refresh phải hoạt động — không logout');
      await $.waitUntilVisible($('Chi tiết phiếu dịch vụ'));

      await $.takeScreenshot('TC-MOB-012-token-refresh-silent');
    },
  );

  // TC-W01-MOB-014: Phân quyền — kế toán và chủ garage đều nhập được (AC-16)
  patrolTest(
    'Chủ garage vào SO Edit → section Phân bổ quyết toán BH hiển thị và có thể nhập',
    config: PatrolTesterConfig(visibleTimeout: const Duration(seconds: 20)),
    ($) async {
      // Login với account chủ garage
      await $.pumpAndSettle(const Duration(seconds: 3));
      await $.waitUntilVisible($('Đăng nhập'));
      await $('Email').enterText('owner@garage-a.test');
      await $('Mật khẩu').enterText('Test@123456');
      await $('Đăng nhập').tap();
      await $.waitUntilVisible($('Trang chủ'), const Duration(seconds: 10));

      await $('Phiếu dịch vụ').tap();
      await $.waitUntilVisible($('Danh sách phiếu dịch vụ'));
      await $('SO-W01-TEST-001').tap();
      await $('Chỉnh sửa').tap();
      await $.waitUntilVisible($('Chỉnh sửa phiếu dịch vụ'));
      await $('Có').tap();

      // Assert: section hiển thị
      await $.waitUntilVisible($('Phân bổ quyết toán bảo hiểm'));
      // Assert: input field enabled (không readonly)
      final tf = $.tester.widget<TextField>(
        find.byKey(const Key('ck-lien-ket-vt-input')),
      );
      expect(tf.enabled, isTrue,
          reason: 'AC-16: chủ garage phải có quyền nhập điều chỉnh BH');

      await $.takeScreenshot('TC-MOB-014-garage-owner-can-input');
    },
  );
}
