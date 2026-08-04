# BUGFIX — BUG-W03-153

> `lib/start.dart` override `FlutterError.onError` / `PlatformDispatcher.instance.onError` bằng Crashlytics handler mà KHÔNG chain/restore handler gốc → `flutter_test`/Patrol binding mất đồng bộ nội bộ, BẤT KỲ error nào (app-side hay test-side, kể cả TimeoutException có chủ đích của helper) trip `_pendingExceptionDetails != null` (`flutter_test/src/binding.dart:1911`)
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-03

## 1. Summary

Kế tục trực tiếp BUG-W03-152. Sau khi BUG-152 (CometChat re-throw) đã fix + verify đúng scope hẹp của nó, agent-test-mobile-e2e phát hiện CHUỖI lỗi async KHÁC (không liên quan CometChat) VẪN trip cùng assertion `_pendingExceptionDetails != null` — tái hiện 5/5 lần chạy Patrol live độc lập, mỗi lần từ 1 nguyên nhân khác nhau: (a) GraphQL `SaveTokenInput` schema-mismatch qua `saveFcmToken` fire-and-forget; (b) STALL deterministic 2/2 lần tại mở Group Detail; (c) 1 `TimeoutException` HOÀN TOÀN CÓ CHỦ ĐÍCH từ helper test (`withTimeout()` rethrow sau 15s) cũng trip cùng assertion.

Bằng chứng quyết định (Run 4d): NGAY CẢ một `TimeoutException` đúng-thiết-kế từ chính harness test cũng trip assertion → vấn đề KHÔNG nằm ở 1 call site cụ thể mà ở tầng **tương tác giữa app's global error-handler override và test binding**. Đây là root cause SÂU HƠN + RỘNG HƠN BUG-152 (không giới hạn 1 call site). Chặn 100% khả năng mobile E2E Patrol báo verdict PASS sạch/đáng tin cậy cho 49/49 TC `TC-W03-MOBILE-E2E.md`.

Không release-blocking cho user thật (Flutter release build không strict-fail trên uncaught async như test binding) nhưng là điều kiện tiên quyết CUỐI CÙNG để mobile E2E Patrol có verdict đáng tin.

## 2. Root cause

**Root cause chính (`lib/start.dart` dòng 39-42, trước fix):**

```dart
FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
PlatformDispatcher.instance.onError = (error, stack) {
  FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
  return true;
};
```

- `start()` được gọi 1 lần bởi `bootstrapApp()` (harness `_helpers.dart`) NGAY BÊN TRONG zone của `patrolTest()`/`flutter_test`. `TestWidgetsFlutterBinding` (nền tảng Patrol) tự cài `FlutterError.onError` RIÊNG để bắt lỗi framework trong 1 test + populate `_pendingExceptionDetails` cho quyết định PASS/FAIL.
- Khi `start()` **OVERWRITE hoàn toàn** 2 handler này bằng handler Crashlytics (đúng cho app thật — "nuốt lỗi, chỉ log, không crash user") mà KHÔNG lưu + gọi lại handler gốc, handler của test binding bị mất. Sau đó khi binding kiểm tra trạng thái nội bộ (teardown mỗi test) nó phát hiện KHÔNG NHẤT QUÁN → tự ném assertion `_pendingExceptionDetails != null` (line 1911): *"A test overrode FlutterError.onError but either failed to return it to its original state, or had unexpected additional errors that it could not handle."*
- Vì assertion này bị trip bởi BẤT KỲ error nào đi qua 2 hook (framework error, zone uncaught Future rejection, hay TimeoutException có chủ đích của helper), nó KHÔNG đặc thù cho 1 nguồn — đúng như 5/5 evidence độc lập.

**Root cause phụ (các call site fire-and-forget khuếch đại triệu chứng — cùng category "uncaught async" của BUG-098/152):**

- `FirebaseNotificationManager.requestPermission()` (`void async`) gọi KHÔNG await từ `init()` → nếu `FirebaseMessaging.requestPermission()` reject, uncaught.
- `MainCubit.saveFcmToken()` throw từ `AuthRepositoryImpl.saveFcmToken()` (GraphQL `SaveTokenInput` validation error) — gọi qua callback `fcmToken(token)` KHÔNG await trong `FirebaseNotificationManager.init()` (call site `main_page.dart:149` cả Android, `:183` cả iOS) → uncaught async.

**Contract gap (`SaveTokenInput`) — cross-boundary, KHÔNG sửa phía mobile:**

- `AuthRepositoryImpl.saveFcmToken()` gọi mutation `saveToken($input: SaveTokenInput)` qua `_graphQLSSOService` → gateway **agg-sso-graph** (module `firebase`), KHÔNG phải agg-garage-graph.
- Đối chiếu spec `Architecture/api/agg-sso-graph-graphql.md` (row 25 + §Mutation `saveToken`) + mirror `mobile/gf-garage-app/docs/Architecture/api/agg-sso-graph-graphql.md:1862`: contract **CÓ** `saveToken` với input `SaveTokenInput {notificationToken, platform}` + output `SaveTokenOutput { data { deviceId } }` — khớp CHÍNH XÁC document mobile (`auth_document.dart` `saveToken`) + biến `{'input': {'notificationToken': fcmToken, 'platform': platform}}`.
- NHƯNG BFF **deployed** trong môi trường test báo `Unknown type "SaveTokenInput". Did you mean "RefreshTokenInput"?` (`GRAPHQL_VALIDATION_FAILED`, evidence Run 4b). → **deployment/contract drift phía agg-sso-graph** (schema deployed thiếu type mà contract doc đã document). Mobile document ĐÚNG theo contract; không có type mobile-side thay thế đúng semantic (`RefreshTokenInput` là refresh access-token, KHÁC hẳn lưu FCM device token). ⇒ KHÔNG tự sửa cross-boundary → escalate **BUG-W03-154** (assign `agg-sso-graph` + `garage-mobile`). Mobile-side chỉ chứa lỗi (try/catch) để không uncaught.

## 3. Fix

**3a. CORE — `lib/start.dart`: chain handler gốc thay vì overwrite (pattern chuẩn Flutter + Crashlytics).**

Tách logic cài đặt thành top-level `configureGlobalErrorHandlers({recordFlutterError, recordPlatformError})` (recorder mặc định = Crashlytics; injectable để test headless KHÔNG cần Firebase), lưu handler gốc trước khi override, gọi lại handler gốc:

```dart
final originalFlutterOnError = FlutterError.onError;
FlutterError.onError = (details) {
  originalFlutterOnError?.call(details);   // giữ handler test binding
  recordFlutter(details);                   // + Crashlytics
};
final originalPlatformOnError = PlatformDispatcher.instance.onError;
PlatformDispatcher.instance.onError = (error, stack) {
  recordPlatform(error, stack);
  return originalPlatformOnError?.call(error, stack) ?? true;
};
```

`start()` chỉ còn gọi `configureGlobalErrorHandlers();`. → test binding lại track lỗi đúng cách, `_pendingExceptionDetails` không còn bị corrupt, hết STALL, test cho verdict thật. Production behavior giữ nguyên (Crashlytics vẫn record; thêm việc gọi handler gốc — default Flutter presentError — vô hại, đúng khuyến nghị Flutter docs).

**3b. Guard các call site fire-and-forget (cùng pattern uncaught async):**

- `FirebaseNotificationManager.requestPermission()` — bọc toàn thân `try { ... } catch (e) { logger.e('requestPermission failed: $e'); }`.
- `MainCubit.saveFcmToken()` — early-return khi token null + bọc thân `try { ... } catch (e) { logger.e('saveFcmToken failed: $e'); }`. Guard tại đây phủ CẢ 2 call path (Android `main_page.dart:149` + iOS `:183`, đều gọi `cubit.saveFcmToken`).

**3c. `SaveTokenInput` — chứa lỗi mobile-side + escalate BUG-W03-154 (KHÔNG sửa contract).** Try/catch tại `MainCubit.saveFcmToken` (3b) đảm bảo GraphQL validation error KHÔNG còn uncaught. `AuthRepositoryImpl.saveFcmToken()` + `auth_document.dart` GIỮ NGUYÊN (đúng contract). Fix contract thật thuộc agg-sso-graph (BUG-154).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/start.dart` | Tách `configureGlobalErrorHandlers()` (injectable recorder), chain `FlutterError.onError` + `PlatformDispatcher.instance.onError` với handler gốc thay vì overwrite; `start()` gọi helper |
| `mobile/gf-garage-app/lib/core/managers/notifications/firebase_notification_manager.dart` | `requestPermission()`: bọc try/catch toàn thân (log lỗi, không uncaught fire-and-forget) |
| `mobile/gf-garage-app/lib/ui/main/bloc/main_cubit.dart` | `saveFcmToken()`: early-return token null + bọc try/catch toàn thân (chứa GraphQL `SaveTokenInput` error, không uncaught) |
| `mobile/gf-garage-app/test/start/global_error_handlers_bug_153_test.dart` | **New** — regression: assert `configureGlobalErrorHandlers()` CHAIN (gọi lại) handler gốc của `FlutterError.onError` + `PlatformDispatcher.onError`, không overwrite; preserve return value platform handler |
| `mobile/gf-garage-app/test/ui/main/save_fcm_token_guard_bug_153_test.dart` | **New** — regression: `MainCubit.saveFcmToken` KHÔNG rethrow khi `AuthRepository.saveFcmToken` throw (uncaught-async guard) + token null short-circuit không gọi repo |

## 5. Regression / verification

- **Test 1 `test/start/global_error_handlers_bug_153_test.dart`** (headless, KHÔNG Firebase — recorder inject spy):
  - FlutterError.onError: cài sentinel handler → gọi `configureGlobalErrorHandlers(recordFlutterError: spy)` → fire → assert **cả** sentinel gốc **và** spy recorder đều nhận error (chain, không overwrite).
  - PlatformDispatcher.onError: cài sentinel trả `true` → configure → fire → assert recorder gọi + sentinel gốc gọi (delegate) + return value = `true`.
  - Regression guard: nếu ai revert về overwrite (bỏ `originalFlutterOnError?.call`) → `seenByOriginal == null` → test FAIL.
- **Test 2 `test/ui/main/save_fcm_token_guard_bug_153_test.dart`** (headless, mocktail):
  - Mock `AuthRepository.saveFcmToken` `thenThrow` (mirror GraphQL `Unknown type "SaveTokenInput"`) → `expectLater(cubit.saveFcmToken('...'), completes)` — hoàn tất bình thường (không rethrow). Trước fix (không try/catch) → future reject → `completes` FAIL.
  - Token null → `verifyNever` repo được gọi.
- **GREEN xác nhận (sau fix)**: `flutter test test/start/... test/ui/main/save_fcm_token_guard_bug_153_test.dart` → `00:00 +4: All tests passed!` (4/4, ~vài giây headless). Dòng `⛔ saveFcmToken failed: ...` trong log = log từ catch block (bằng chứng lỗi bị nuốt, không rethrow).
- **Analyze**: `flutter analyze lib/start.dart lib/core/managers/notifications/firebase_notification_manager.dart lib/ui/main/bloc/main_cubit.dart test/start/... test/ui/main/...` → `2 issues found` (chỉ 2 info `unnecessary_underscores` → đã sửa `(_, __)`→`(_, _)`, re-analyze `No issues found!`). **0 error / 0 warning.**
- **Toolchain**: Flutter 3.44.1 (host Homebrew, deps đã resolved). KHÔNG chạy Patrol/integration làm gate (chậm/treo CPU>800% — chính bug đã biết); Patrol E2E DEFERRED cho TEST_GROUP re-run trên emulator ở stage verify (flip `FIX_DONE → VERIFIED`).

## 6. Non-goals / out of scope

- KHÔNG sửa `AuthRepositoryImpl.saveFcmToken()` / `auth_document.dart` `saveToken` — mobile document ĐÚNG theo contract agg-sso-graph. Contract gap deployed thuộc BFF → **BUG-W03-154** (cross-boundary, escalate).
- KHÔNG thêm workaround tầng test/harness (`_helpers.dart` reset handler / `adb pm grant`) làm thay cho fix — root cause thật đã fix ở tầng app `start.dart`. (Gap harness `POST_NOTIFICATIONS` pre-grant vẫn nên thêm vào Environment Readiness Gate cho wave sau — lesson `TL-W03-MOB-E2E-008`, ngoài scope bug này.)
- KHÔNG refactor rộng `runZonedGuarded` zone-nesting của `start()` — chain handler đã đủ khôi phục đồng bộ binding; refactor zone là rủi ro thừa.
- Không đụng các fire-and-forget khác không nằm luồng bootstrap/login (chỉ guard 2 call site có evidence Run 4).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-03 | 1 | agent-fix-garage-mobile | Fix root-cause BUG-W03-153 — `start.dart` chain `FlutterError.onError`/`PlatformDispatcher.onError` (tách `configureGlobalErrorHandlers()` injectable) thay overwrite; guard fire-and-forget `requestPermission()` + `saveFcmToken()`. 2 regression test headless GREEN 4/4, `flutter analyze` 0 error. `SaveTokenInput` = contract drift agg-sso-graph → escalate BUG-W03-154 (KHÔNG sửa cross-boundary; try/catch chứa lỗi mobile-side). Patrol E2E DEFERRED cho TEST_GROUP verify (flip FIX_DONE → VERIFIED). |
