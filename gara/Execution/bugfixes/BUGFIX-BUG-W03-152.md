# BUGFIX — BUG-W03-152

> `MainCubit.initialCometChat()` re-throw trong async callback CometChat SDK sau login → uncaught async exception trip `flutter_test`/Patrol binding (`_pendingExceptionDetails != null`)
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-03

## 1. Summary

Sau khi login thành công, `MainPage.initState()` gọi `initialCometChat(context)` (fire-and-forget, không `await`) → `MainCubit.initialCometChat()` khởi tạo CometChat + login CometChat. Nếu bước init/login CometChat lỗi (rất hay xảy ra trong môi trường test/emulator: CometChat chưa sẵn sàng, token lỗi, hoặc gọi method trước khi login CometChat hoàn tất — native log `E/CometChat: Please log in to CometChat before calling this method`), callback `onError` của `loginWithAuthToken` **re-throw** một `Exception`. Vì CometChat SDK bắt lỗi platform bên trong rồi mới gọi `onError`, việc throw ở đó làm `loginWithAuthToken` reject; `initialCometChat()` không có guard nào và được chạy fire-and-forget → lỗi trở thành **uncaught async exception** lọt vào zone.

Trên app thật, `runZonedGuarded`/`PlatformDispatcher.onError` trong `start.dart` nuốt lỗi này (chỉ log Crashlytics, không crash) — nên KHÔNG chặn end-user. Nhưng dưới `flutter_test`/Patrol binding, zone error handler bị test framework override, uncaught error trip assertion nội bộ `_pendingExceptionDetails != null` → toàn bộ `patrolTest()` đi qua login báo verdict `failure` (dù business logic PASS), và có thể STALL tiến trình test khi lỗi resolve muộn (quan sát ở luồng xoá Nhóm vật tư — trigger #2). Chặn 100% khả năng mobile E2E Patrol báo PASS sạch cho mọi TC qua login (49/49 TC `TC-W03-MOBILE-E2E.md`).

## 2. Root cause

- **Call site**: `mobile/gf-garage-app/lib/ui/main/bloc/main_cubit.dart`, `MainCubit.initialCometChat()`, dòng 102 (trước fix): `onError: (err) => throw Exception('Login Failed: $err')`.
- CometChat SDK (`cometchat_sdk-4.0.28/lib/main/cometchat.dart` → `loginWithAuthToken`) tự bọc `try/catch` quanh `channel.invokeMethod('loginWithAuthToken')`; khi platform lỗi nó gọi `onError(CometChatException)`. Re-throw trong callback đó → propagate ra ngoài `loginWithAuthToken` như rejection của Future.
- `initialCometChat()` KHÔNG có `try/catch` bao ngoài, và caller (`MainPage.initState` → `initialCometChat(context)`) chạy fire-and-forget → rejection không ai bắt → **uncaught async exception**.
- **Trigger #2 (xoá Nhóm vật tư) cùng nguồn**: luồng xoá Nhóm vật tư (`material_group_delete_cubit.dart`) KHÔNG hề gọi CometChat (đã grep xác nhận 0 reference). Vì mọi TC đều đi qua login, `initialCometChat()` login CometChat resolve bất đồng bộ; khi nó lỗi/resolve muộn đúng lúc test đang ở bước xoá nhóm → cùng uncaught error, cùng assertion signature, chỉ khác thời điểm surface. Fix ở `initialCometChat()` xử lý cả 2 trigger.
- Lưu ý: `MainCubit.getUnreadCometChatCount()` (gọi `CometChat.getUnreadMessageCount`) đã **SDK-safe** — `getUnreadMessageCount` trong SDK tự `try/catch` mọi lỗi rồi route về `onError` (set count = 0), KHÔNG throw. Đây KHÔNG phải nguồn uncaught → cố ý KHÔNG sửa (smallest-correct-change, tránh noise).

## 3. Fix

`mobile/gf-garage-app/lib/ui/main/bloc/main_cubit.dart` — `initialCometChat()`:

1. `onError: (err) => throw Exception('Login Failed: $err')` → `onError: (err) => logger.e('CometChat login failed: $err')` — log lỗi thay vì re-throw (chat là tính năng non-critical, không được để chặn bootstrap Home).
2. Bọc toàn bộ thân method trong `try { ... } catch (error, stackTrace) { logger.e('initialCometChat failed: $error $stackTrace'); }` — defense-in-depth: mọi lỗi async từ `CometChatUIKit.init` / `getCometChatToken` / `loginWithAuthToken` được bắt + log, KHÔNG propagate uncaught.

Kết quả: `initialCometChat()` luôn hoàn tất bình thường (không reject), lỗi CometChat được nuốt an toàn + log — không còn uncaught async exception lọt vào zone/test binding.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/main/bloc/main_cubit.dart` | `initialCometChat()`: onError log thay re-throw + bọc try/catch toàn thân method (log lỗi async CometChat, không propagate uncaught) |
| `mobile/gf-garage-app/test/ui/main/bloc/main_cubit_comet_chat_async_guard_test.dart` | **New** — regression test (fail-trước-fix / pass-sau-fix): drive CometChat SDK channel (`cometchat`, `cometchat_uikit_shared`) fail deterministic (mirror `ERROR_UID_NOT_LOGGED_IN` / "Please log in to CometChat…") + assert `initialCometChat()` fire-and-forget KHÔNG sinh uncaught async error trong zone |

## 5. Regression / verification

- **Regression test** `test/ui/main/bloc/main_cubit_comet_chat_async_guard_test.dart` (headless `flutter test`, KHÔNG Patrol/emulator):
  - Mock 2 method channel CometChat (`cometchat` + `cometchat_uikit_shared`) throw `PlatformException(code: ERROR_UID_NOT_LOGGED_IN, message: 'Please log in to CometChat before calling this method')` — tái hiện đúng lỗi native trong bug.
  - Test 1: chạy `unawaited(cubit.initialCometChat())` trong `runZonedGuarded`, assert `uncaughtError == null`.
  - Test 2: `expectLater(cubit.initialCometChat(), completes)` — method hoàn tất bình thường, không rethrow.
- **RED xác nhận (trước fix)**: `FLUTTER_EXIT=1` — Test 1 fail với `Expected: null / Actual: _Exception:<Exception: Login Failed: CometChatException{code: ERROR_UID_NOT_LOGGED_IN … Please log in to CometChat before calling this method}>`, stack trỏ đúng `main_cubit.dart 102:27 MainCubit.initialCometChat.<fn>` → pin chính xác root cause line 102.
- **GREEN xác nhận (sau fix)**: `flutter test test/ui/main/bloc/main_cubit_comet_chat_async_guard_test.dart` → `00:00 +2: All tests passed!` `GREEN_EXIT=0` (cả 2 test PASS — headless, ~vài giây).
- **Analyze**: `flutter analyze lib/ui/main/bloc/main_cubit.dart` → `No issues found!` (0 error).
- **Lưu ý E2E**: verdict Patrol E2E thật (JUnit XML) chỉ được TEST_GROUP re-run trên emulator ở stage verify (flip `FIX_DONE → VERIFIED`). FIX cycle này KHÔNG chạy Patrol (chậm/dễ treo — chính bug harness của Run 3).

## 6. Non-goals / out of scope

- KHÔNG sửa `getUnreadCometChatCount()` — đã SDK-safe (getUnreadMessageCount tự nuốt lỗi + onError), thêm try/catch chỉ là noise, không fix gì.
- KHÔNG đụng `CometChatManager` (`lib/core/managers/comet_chat/comet_chat_manager.dart`) — không nằm trong luồng bootstrap Home (chỉ dùng ở màn chat), ngoài scope bug.
- KHÔNG thêm workaround ở tầng test/harness (`_helpers.dart`/`patrolTest()` reset `FlutterError.onError`) — root cause thật đã fix ở tầng app, không cần band-aid tầng test.
- KHÔNG refactor cross-boundary (BFF/BE): lỗi CometChat là client-side runtime, không phải schema/contract.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-03 | 1 | agent-fix-garage-mobile | Fix root-cause BUG-W03-152 — `MainCubit.initialCometChat()`: onError log thay re-throw (dòng 102) + bọc try/catch toàn thân method. Regression test mới (headless): RED-confirmed fail-before tại `main_cubit.dart:102:27`, GREEN-confirmed `All tests passed!` (2/2) sau fix. `flutter analyze` = `No issues found!` (0 error). Patrol E2E DEFERRED cho TEST_GROUP verify (flip FIX_DONE → VERIFIED). |
