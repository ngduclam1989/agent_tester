// Shared helpers cho W03 mobile E2E Patrol specs (EP-INVENTORY-CATALOG).
// Import qua relative path: import './_helpers.dart';
// KHÔNG phải file test (không có patrolTest/main độc lập).

import 'dart:async';

import 'package:cardoctor_garage_v3/flavors.dart';
import 'package:cardoctor_garage_v3/start.dart' as app_start;
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

/// ROOT CAUSE FIX (2026-07-03): `patrol test` KHÔNG tự động chạy app thật —
/// `flutter_test`'s `_runTestBody` chỉ reset tree về `_preTestMessage`
/// ("Test starting...", xem `flutter_test/lib/src/binding.dart:1940`) rồi
/// gọi thẳng `testBody()` (block `patrolTest(...)` của TC) — nó KHÔNG tự
/// invoke entrypoint thật của app (`lib/main_dev.dart` -> `start()`). Nếu
/// test không tự gọi `start()`, toàn bộ UI thật (Login/Home/...) sẽ KHÔNG
/// BAO GIỜ render — cây widget mãi mãi chỉ có "Test starting..." (quan sát
/// trực tiếp qua debugPrint dump Text widgets, xem lesson learned). Mọi
/// patrolTest() PHẢI gọi `bootstrapApp()` làm dòng đầu tiên.
bool _appBootstrapped = false;

/// Tài khoản test thật đã verify sống trên remote-box 192.168.110.191
/// (kế thừa từ Execution/auto/specs/W03/e2e/_helpers.ts loginAsAccountant /
/// loginAsOwner — cùng seed tenant garage-a dùng chung giữa web + mobile).
/// KHÔNG dùng định dạng email 'accountant@garage-a.test' như patrol.yaml
/// dart_defines cũ ghi — màn Đăng nhập mobile thực tế yêu cầu SỐ ĐIỆN THOẠI
/// (lib/ui/auth/login/login_page.dart, TextInputType.phone), không phải email.
const String kAccountantPhone =
    String.fromEnvironment('TEST_ACCOUNTANT_PHONE', defaultValue: '0810000002');
const String kOwnerPhone =
    String.fromEnvironment('TEST_OWNER_PHONE', defaultValue: '0810000001');
const String kTestPassword =
    String.fromEnvironment('TEST_PASSWORD', defaultValue: 'Test@12345');

// =====================================================================
// ROOT CAUSE FIX Run 3 (2026-07-03) — HARNESS TAP-HANG, root cause THẬT
// (xem TR-W03-MOBILE-E2E.md Run 2 §7.1c + Run 3 §7.1d + BUG-W03-150.verify
// §12 + TL-W03-MOB-E2E-004/005). Triệu chứng ban đầu (Run 2): SAU khi Home
// render, MỌI thao tác tap tự động (kể cả `$.native.tap()` UIAutomator,
// không phụ thuộc Flutter) treo vô thời hạn.
//
// ĐIỀU TRA THÊM Run 3 xác nhận CƠ CHẾ THẬT (KHÔNG phải port-forward, KHÔNG
// phải app ANR):
//  1. Bọc từng bước bằng `Future.timeout()` (diagnostic) xác định CHÍNH XÁC
//     điểm treo đầu tiên là `pumpAndSettle()` NGAY SAU khi tap nút "Đăng
//     nhập" (route Login -> Home) — vượt quá bound tường minh 20s.
//  2. QUAN TRỌNG: `Future.timeout()` của Dart KHÔNG HUỶ future gốc — khi
//     `pumpAndSettle()` (tức `WidgetTester.pumpAndSettle`, vòng lặp "bơm
//     frame tới khi hết animation") không bao giờ tự nhiên đạt trạng thái
//     "hasScheduledFrame == false" (do Home có `getDashboardRealtime`
//     polling định kỳ + khả năng có animation lặp vô hạn khác), việc dùng
//     `Future.timeout()` để "bỏ cuộc" phía Dart-code KHÔNG dừng được vòng
//     lặp bơm-frame phía dưới — nó tiếp tục chạy NỀN MÃI MÃI.
//  3. Xác nhận bằng `ps aux` + `adb shell dumpsys cpuinfo`: process qemu
//     (host) tăng vọt lên **>1000% CPU** (>10 lõi) trong khi vòng lặp orphan
//     này chạy — VÀ giảm ngay về ~60% CPU SAU KHI `adb shell am force-stop`
//     app trên device. Đây LÀ root cause: khi 1 `pumpAndSettle()` không tự
//     settle được, nó tạo ra 1 vòng lặp bơm-frame liên tục ăn CPU tới mức
//     TOÀN BỘ emulator (kể cả UIAutomator/native automator không phụ thuộc
//     Flutter widget tree) trở nên phản hồi cực chậm — biểu hiện giống hệt
//     "treo vô hạn" dù về mặt kỹ thuật không phải deadlock.
//
// FIX (thay thế HOÀN TOÀN `pumpAndSettle`/`pumpAndTrySettle`, không chỉ ở
// bước tap mà ở MỌI nơi trong file này):
//  1. [pumpFrames] — thay `pumpAndSettle` bằng bơm 1 SỐ LƯỢNG FRAME CỐ ĐỊNH
//     (KHÔNG lặp "tới khi hết animation") — dừng sau đúng N lần `$.pump()`
//     bất kể UI đã settle hay chưa. Không bao giờ tạo vòng lặp không hồi
//     kết vì KHÔNG có điều kiện "chờ tới khi ổn định".
//  2. [tapBounded] — tap dùng `settlePolicy: SettlePolicy.noSettle` (loại
//     trừ pumpAndSettle nội bộ của `PatrolFinder.tap()`) + [pumpFrames].
//  3. [withTimeout] — diagnostic wrapper GIỮ LẠI cho các thao tác vốn dĩ
//     "1 phát ăn ngay" (enterText, tap, pump đơn lẻ, fling) — những thao
//     tác này KHÔNG có cơ chế lặp nội tại nên orphan (nếu có) không gây
//     runaway CPU nghiêm trọng như pumpAndSettle. KHÔNG dùng withTimeout để
//     bọc pumpAndSettle nữa (đã loại bỏ pumpAndSettle hoàn toàn).
// =====================================================================

/// Bọc [future] với chẩn đoán timing + timeout tường minh. In timestamp
/// bắt đầu/kết thúc/lỗi ra debugPrint (xuất hiện trong logcat của lần
/// chạy) để nếu vẫn còn hang, có breadcrumb chính xác bước nào bị chặn.
/// CHỈ dùng cho thao tác "1 phát" (không có vòng lặp nội tại) — xem block
/// comment ROOT CAUSE FIX Run 3 phía trên, mục 3.
Future<T> withTimeout<T>(
  Future<T> future,
  String label, {
  Duration timeout = const Duration(seconds: 15),
}) async {
  final sw = Stopwatch()..start();
  // ignore: avoid_print
  debugPrint('[TIMING] START $label @ ${DateTime.now().toIso8601String()}');
  try {
    final result = await future.timeout(
      timeout,
      onTimeout: () {
        // ignore: avoid_print
        debugPrint(
            '[TIMING] *** TIMEOUT *** $label sau ${sw.elapsedMilliseconds}ms (bound=$timeout) — ENV-HANG-R3 candidate');
        throw TimeoutException(
            '$label KHÔNG hoàn tất trong $timeout (xem [TIMING] logcat để định vị bước treo)');
      },
    );
    // ignore: avoid_print
    debugPrint('[TIMING] DONE  $label sau ${sw.elapsedMilliseconds}ms');
    return result;
  } catch (e) {
    // ignore: avoid_print
    debugPrint('[TIMING] ERROR $label sau ${sw.elapsedMilliseconds}ms: $e');
    rethrow;
  }
}

/// Bơm 1 SỐ LƯỢNG frame CỐ ĐỊNH — KHÔNG BAO GIỜ "chờ tới khi idle" (xem
/// block comment ROOT CAUSE FIX Run 3). An toàn để gọi trên màn hình có
/// animation/timer vô hạn (Home dashboard polling) vì luôn dừng sau đúng
/// [count] lần bơm, không phụ thuộc trạng thái `hasScheduledFrame`.
Future<void> pumpFrames(
  PatrolIntegrationTester $, {
  int count = 6,
  Duration frameDuration = const Duration(milliseconds: 300),
  String label = 'pumpFrames',
}) async {
  for (var i = 0; i < count; i++) {
    await withTimeout($.pump(frameDuration), '$label#$i', timeout: const Duration(seconds: 10));
  }
}

/// Khởi động app thật (tương đương `main_dev.dart`) bên trong tiến trình
/// test — set flavor `dev` (khớp `--flavor dev` lúc build) rồi gọi
/// `start()` (Firebase, DI container, notifications, remote config, cuối
/// cùng `runApp(...)`). Idempotent trong phạm vi 1 process test.
Future<void> bootstrapApp(PatrolIntegrationTester $) async {
  if (_appBootstrapped) return;
  F.appFlavor = Flavor.dev;
  await withTimeout(app_start.start(), 'bootstrapApp.start()', timeout: const Duration(seconds: 30));
  _appBootstrapped = true;
  // start() tự runApp() bất đồng bộ ở cuối chain — bơm vài frame CỐ ĐỊNH
  // (KHÔNG pumpAndSettle) để init chain kịp render, không phụ thuộc UI có
  // settle được hay không.
  await pumpFrames($, count: 15, frameDuration: const Duration(milliseconds: 350), label: 'bootstrapApp.pump');
}

/// Chờ app thoát khỏi màn Patrol harness overlay ("Test starting...") và
/// render nội dung THẬT của app (Login hoặc Home). Poll tối đa
/// [maxAttempts] lần bằng [pumpFrames] (KHÔNG pumpAndSettle) trước khi bỏ
/// cuộc.
Future<bool> _waitForRealAppContent(
  PatrolIntegrationTester $, {
  int maxAttempts = 15,
}) async {
  for (var i = 0; i < maxAttempts; i++) {
    await pumpFrames($, count: 4, frameDuration: const Duration(milliseconds: 400), label: '_waitForRealAppContent.pump#$i');
    final hasLogin = $(find.text('Đăng nhập')).exists;
    final hasHomeHub = $(find.textContaining('kho hàng')).exists;
    if (hasLogin || hasHomeHub) return true;
  }
  return false;
}

/// Tap "bounded" thay thế `$(finder).tap()`/`$.tester.tap()` mặc định —
/// xem block comment ROOT CAUSE FIX Run 3 phía trên. `label` dùng cho
/// breadcrumb log, mặc định lấy từ `finder.toString()`.
Future<void> tapBounded(
  PatrolIntegrationTester $,
  Finder finder, {
  String? label,
  int framesAfterTap = 5,
  Duration frameDuration = const Duration(milliseconds: 300),
  Duration timeout = const Duration(seconds: 15),
}) async {
  final tag = label ?? finder.toString();
  await withTimeout(
    $(finder).tap(settlePolicy: SettlePolicy.noSettle),
    'tapBounded[$tag].tap(noSettle)',
    timeout: timeout,
  );
  await pumpFrames($, count: framesAfterTap, frameDuration: frameDuration, label: 'tapBounded[$tag].pump');
}

/// Login qua UI thật (Số điện thoại + Mật khẩu -> "Đăng nhập").
/// Idempotent: nếu app đã ở Home (session cũ còn) thì no-op.
Future<void> loginAs(
  PatrolIntegrationTester $, {
  required String phone,
  String password = kTestPassword,
}) async {
  await bootstrapApp($);
  final renderedReal = await _waitForRealAppContent($);
  if (!renderedReal) {
    final allTexts = find.byType(Text);
    final texts = <String>[];
    for (final element in allTexts.evaluate()) {
      final widget = element.widget;
      if (widget is Text && widget.data != null && widget.data!.trim().isNotEmpty) {
        texts.add(widget.data!);
      }
    }
    // ignore: avoid_print
    debugPrint(
        'loginAs DIAGNOSTIC — app KHÔNG render nội dung thật sau ~30s cold-start. Text hiện có: ${texts.take(20).join(" | ")}');
  }
  expect(renderedReal, isTrue,
      reason:
          'loginAs: app không render màn Đăng nhập/Home sau ~30s cold-start (proxy adb reverse -> socat -> 192.168.110.191 có thể quá chậm/không reachable) — kiểm tra lại port-forward trước khi coi đây là product bug');

  final loginButton = $(find.text('Đăng nhập'));
  final onLoginScreen = loginButton.exists;
  // ignore: avoid_print
  debugPrint('loginAs DIAGNOSTIC — onLoginScreen(text "Đăng nhập" tồn tại) = $onLoginScreen');
  if (!onLoginScreen) return; // đã có session -> Home rồi, bỏ qua.

  final fields = find.byType(TextFormField);
  await withTimeout($.tester.enterText(fields.at(0), phone), 'loginAs.enterText(phone)');
  await pumpFrames($, count: 2, label: 'loginAs.pump#phone');
  await withTimeout($.tester.enterText(fields.at(1), password), 'loginAs.enterText(password)');
  await pumpFrames($, count: 2, label: 'loginAs.pump#password');
  await tapBounded($, find.text('Đăng nhập'), label: 'loginButton', framesAfterTap: 3);

  // Sau tap login: KHÔNG pumpAndSettle (login -> getTenantInfo -> Home render
  // là chuỗi network-bound + Home có polling định kỳ, không bao giờ tự
  // settle) — poll CÓ GIỚI HẠN bằng pumpFrames, kiểm tra điều kiện cụ thể
  // (rời màn Login) mỗi vòng thay vì chờ "idle" toàn cục.
  var stillOnLogin = $(find.text('Đăng nhập')).exists;
  var waitAttempts = 0;
  while (stillOnLogin && waitAttempts < 20) {
    await pumpFrames($, count: 3, frameDuration: const Duration(milliseconds: 500), label: 'loginAs.pump#afterTap$waitAttempts');
    stillOnLogin = $(find.text('Đăng nhập')).exists;
    waitAttempts++;
  }
  // ignore: avoid_print
  debugPrint(
      'loginAs DIAGNOSTIC — sau khi tap Đăng nhập (~${waitAttempts * 1.5}s poll), vẫn còn ở Login = $stillOnLogin (kỳ vọng false)');
}

/// Điều hướng Home -> Hub "Quản lý kho hàng" qua mission tile.
/// Giả định app đã login xong và đang ở Home.
///
/// Robust chờ tile render (Home có thể mất vài giây load mission list qua
/// network sau login) — poll tối đa ~15 vòng bằng [pumpFrames] (KHÔNG
/// pumpAndSettle — xem ROOT CAUSE FIX Run 3), KHÔNG dùng dragUntilVisible
/// với ancestor Scrollable cứng (Home page có thể không có Scrollable bao
/// ngoài, gây "Bad state: No element" — quan sát thực tế run 2026-07-03).
Future<void> openInventoryHub(PatrolIntegrationTester $) async {
  await pumpFrames($, count: 4, label: 'openInventoryHub.pump#initial');
  // Home có nhiều mission tile — tìm đúng "Quản lý \nkho hàng" qua text chứa
  // "kho hàng" để tránh nhầm "Quản lý nhân viên"/"Quản lý khách hàng".
  final hubTile = find.textContaining('kho hàng');

  var found = $(hubTile).exists;
  var attempts = 0;
  while (!found && attempts < 10) {
    await pumpFrames($, count: 3, frameDuration: const Duration(milliseconds: 500), label: 'openInventoryHub.pump#poll$attempts');
    // Thử scroll nhẹ trong trường hợp tile nằm dưói fold — bỏ qua lỗi nếu
    // không có Scrollable nào (Home có thể fit 1 màn không cần scroll).
    try {
      await withTimeout(
        $.tester.fling(
          find.byType(Scrollable).first,
          const Offset(0, -200),
          800,
        ),
        'openInventoryHub.fling#$attempts',
        timeout: const Duration(seconds: 10),
      );
      await pumpFrames($, count: 2, label: 'openInventoryHub.pump#afterFling$attempts');
    } catch (_) {
      // Không có Scrollable — bỏ qua, chỉ dựa vào chờ render.
    }
    found = $(hubTile).exists;
    attempts++;
  }

  if (!found) {
    // Diagnostic dump — in ra toàn bộ Text widget hiện có trên màn hình để
    // xác định app đang dừng ở đâu (login chưa xong / Home khác dự kiến /
    // feature flag OFF) — log này xuất hiện trong logcat của lần chạy.
    final allTexts = find.byType(Text);
    final texts = <String>[];
    for (final element in allTexts.evaluate()) {
      final widget = element.widget;
      if (widget is Text && widget.data != null && widget.data!.trim().isNotEmpty) {
        texts.add(widget.data!);
      }
    }
    // ignore: avoid_print
    debugPrint(
        'openInventoryHub DIAGNOSTIC — Text widgets hiện có trên màn hình (${texts.length}): ${texts.take(40).join(" | ")}');
  }

  expect(found, isTrue,
      reason:
          'openInventoryHub: không tìm thấy mission tile chứa "kho hàng" trên Home sau ${attempts + 1} lần thử — kiểm tra feature flag inventory hoặc Home load chậm bất thường (xem debugPrint DIAGNOSTIC phía trên trong logcat để biết app đang ở màn nào)');

  await tapBounded($, hubTile, label: 'hubTile', framesAfterTap: 3);

  // Poll CÓ GIỚI HẠN cho AppBar "Quản lý kho hàng" render xong sau route
  // push — quan sát thực tế Run 3: 1.5s (5 frame) sau tap có thể CHƯA đủ để
  // InventoryHubCubit build xong AppBar (route transition + cubit init
  // async) — KHÔNG dùng pumpAndSettle (xem ROOT CAUSE FIX), chỉ poll thêm
  // bằng pumpFrames tối đa 8 vòng trước khi trả quyền cho spec's assertion.
  var hubTitleFound = $.tester.any(find.text('Quản lý kho hàng'));
  var hubPollAttempts = 0;
  while (!hubTitleFound && hubPollAttempts < 8) {
    await pumpFrames($, count: 2, frameDuration: const Duration(milliseconds: 400), label: 'openInventoryHub.pump#titlePoll$hubPollAttempts');
    hubTitleFound = $.tester.any(find.text('Quản lý kho hàng'));
    hubPollAttempts++;
  }
  // ignore: avoid_print
  debugPrint(
      'openInventoryHub DIAGNOSTIC — sau tap hubTile + poll (~${hubPollAttempts * 0.8}s), AppBar "Quản lý kho hàng" tồn tại = $hubTitleFound');
}

/// Tap back button trên AppBarCustom (IconButton leading, không có Key
/// riêng) — dùng find.byType(IconButton).first vì các action khác trên
/// AppBar dùng SingleTapDetector/GestureDetector (không phải IconButton).
Future<void> tapAppBarBack(PatrolIntegrationTester $) async {
  await tapBounded($, find.byType(IconButton).first, label: 'appBarBack');
}

/// Native hardware back (`$.native.pressBack()`) bọc timeout — quan sát
/// Run 3 (chạy `inventory_hub_patrol_test.dart` sau khi fix tap Flutter):
/// native back TỰ NÓ cũng có thể treo (khác cơ chế `pumpAndSettle` — CPU
/// KHÔNG runaway khi treo ở bước này, xác nhận qua `ps aux` — nên nghi vấn
/// là IPC/automator bridge chờ phản hồi native chậm/kẹt, KHÔNG phải vòng
/// lặp bơm-frame). Bọc [withTimeout] để KHÔNG treo vô hạn toàn bộ CLI —
/// nếu native back thật sự chậm bất thường, test FAIL nhanh với breadcrumb
/// rõ ràng thay vì treo hàng chục phút.
Future<void> nativeBackBounded(
  PatrolIntegrationTester $, {
  String label = 'nativeBack',
  Duration timeout = const Duration(seconds: 20),
}) async {
  await withTimeout($.native.pressBack(), '$label.pressBack', timeout: timeout);
  await pumpFrames($, count: 5, label: '$label.pump');
}
