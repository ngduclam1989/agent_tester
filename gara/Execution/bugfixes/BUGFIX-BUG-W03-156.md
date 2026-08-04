# BUGFIX — BUG-W03-156

> `handleReceivePushNotification()` gọi INLINE `FirebaseMessaging.instance.requestPermission()` (không await, không try/catch) chồng thời gian với `init()`'s guarded `requestPermission()` trên cùng native `firebase_messaging` channel → Android plugin reject request thứ 2 với `FirebaseException([firebase_messaging/unknown] A request for permissions is already running...)` → uncaught async ngay sau login/Home bootstrap
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-03

## 1. Summary

Kế tục trực tiếp BUG-W03-153. Sau khi 153 fix chain error-handler (test binding hết STALL, báo lỗi rõ ràng), agent-test-mobile-e2e phát hiện đây là blocker CHÍNH (dominant, 4/5 lần Run 5) chặn mobile E2E Patrol đạt verdict PASS: một `FirebaseException` uncaught fire cực sớm (10-14s sau cold-start, ngay sau login, TRƯỚC mọi Hub navigation).

Đây là **call site fire-and-forget THỨ 3** cùng họ BUG-098/152/153 — nằm NGOÀI phạm vi audit hẹp của fix 153 (153 chỉ guard `requestPermission()` đứng riêng + `MainCubit.saveFcmToken()`, KHÔNG guard lệnh gọi INLINE trong `handleReceivePushNotification()`).

KHÔNG release-blocking cho user thật (Crashlytics ghi nhận, app tiếp tục chạy — Flutter release build không strict-fail trên uncaught async như test binding) nhưng chặn verdict PASS sạch cho gần như 100% TC vì fire trước Hub nav.

## 2. Root cause

Luồng bootstrap Android — `_MainPageState.initialCometChat()` (`lib/ui/main/main_page.dart:146-192`):

```dart
await firebaseNotificationManager.init(cubit.saveFcmToken);   // (A)
...
firebaseNotificationManager.handleReceivePushNotification(     // (B) — KHÔNG await
  context, ...
);
```

- **(A)** `FirebaseNotificationManager.init()` (`firebase_notification_manager.dart:35-53`) nội bộ gọi `requestPermission();` (dòng 37, **fire-and-forget, KHÔNG await**). Method `requestPermission()` (dòng 84-105) ĐÃ được guard try/catch bởi fix BUG-153 + tự nó gọi cả `FirebaseMessaging.instance.requestPermission(...)` LẪN `setForegroundNotificationPresentationOptions(...)`. Vì KHÔNG await, `init()` return trước khi request permission bên trong thực sự xong.
- **(B)** Ngay sau `await init()` (chỉ await phần được-await của init, KHÔNG đợi fire-and-forget `requestPermission()` bên trong nó xong), code gọi `handleReceivePushNotification()`. Hàm này (trước fix, dòng 120-136) gọi TRỰC TIẾP INLINE:
  ```dart
  //check permission for ios
  FirebaseMessaging.instance.requestPermission(...).then((value) => logger.d(...));   // KHÔNG try/catch, KHÔNG await
  await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(...);
  ```
- Hai request (A-internal + B-inline) target CÙNG native platform channel gần như đồng thời (cách nhau vài chục ms, KHÔNG có `await` nào chờ A xong). Android `firebase_messaging` plugin phát hiện request thứ 2 khi request thứ 1 CHƯA hoàn tất → reject: `FirebaseException([firebase_messaging/unknown] A request for permissions is already running, please wait for it to finish before doing another request.)`.
- Call site (B) KHÔNG có try/catch + Future trả về KHÔNG được ai await/attach error handler → uncaught async → qua `PlatformDispatcher.instance.onError` (nay chain đúng nhờ fix 153) → Crashlytics + (test context) Flutter test framework catch → FAIL nhanh, sạch.

Stack trace evidence xác nhận call site: `firebase_notification_manager.dart:131` (`handleReceivePushNotification.<anonymous closure>`).

Bản chất: lệnh gọi permission INLINE trong (B) là **TRÙNG LẶP hoàn toàn** với những gì (A)'s `requestPermission()` đã làm (cả requestPermission + setForegroundNotificationPresentationOptions). `handleReceivePushNotification` là consumer DUY NHẤT (chỉ gọi tại `main_page.dart:155`, chỉ nhánh Android, LUÔN ngay sau `await init()`) → request permission trong (B) không bao giờ cần thiết.

## 3. Fix

**XOÁ lệnh gọi trùng lặp khỏi `handleReceivePushNotification()`** (`lib/core/managers/notifications/firebase_notification_manager.dart`) — thoả AC #3 (loại bỏ 1 trong 2 request chồng lấn, không chỉ giấu triệu chứng bằng try/catch):

```diff
   Future<void> handleReceivePushNotification(
     BuildContext context, {
     required VoidCallback onMessage,
     required ValueChanged<int?> onMessageOpenedApp,
   }) async {
-    //check permission for ios
-    FirebaseMessaging.instance
-        .requestPermission(alert: true, ..., sound: true)
-        .then((value) => logger.d('User granted permission: ${value.authorizationStatus}'));
-    await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
-      alert: true, badge: true, sound: true,
-    );
-
     try {
       FirebaseMessaging.instance.getInitialMessage().then(...);
       ...
     } catch (e) {
       logger.e(e);
     }
   }
```

Sau fix: `init()`'s guarded `requestPermission()` (đã có try/catch từ 153) là NGUỒN DUY NHẤT request permission + set foreground presentation options → KHÔNG còn 2 request chồng thời gian trong luồng bootstrap. Phần còn lại của `handleReceivePushNotification` (getInitialMessage/onMessage/onMessageOpenedApp listeners) vốn đã nằm trong try/catch → không còn đường uncaught.

**Audit fire-and-forget còn lại (`main_page.dart` + `lib/core/managers/notifications/`)** — yêu cầu mở rộng scope:
- Toàn repo còn đúng **1** lệnh gọi `.requestPermission(` (dạng method-chain Firebase) = trong `FirebaseNotificationManager.requestPermission()` guarded. `init()` gọi `requestPermission();` (method nội bộ, guarded). Không còn call site Firebase permission thứ 2.
- `ApnsNotificationManager` (nhánh iOS) KHÔNG gọi `requestPermission` — chỉ `getFirebaseDeviceToken()` (`getToken()`), không thuộc bug class permission-race.
- `MainCubit.saveFcmToken()` (callback fire-and-forget từ init) đã guarded bởi fix 153.
→ Không còn call site fire-and-forget uncaught cùng họ trong luồng bootstrap.

## 4. Touched files (blast radius)

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/core/managers/notifications/firebase_notification_manager.dart` | XOÁ inline `requestPermission()` + `setForegroundNotificationPresentationOptions()` trong `handleReceivePushNotification()` (17 dòng) |
| `mobile/gf-garage-app/test/core/managers/notifications/firebase_notification_manager_bug_156_test.dart` | **MỚI** — regression source-contract test |

**Don't-touch (giữ nguyên):** `init()` + `requestPermission()` method (guard 153 giữ nguyên); `main_page.dart` (call site không đổi — chỉ nội dung callee thay đổi); mọi consumer khác; contract/schema.

**Shared-Symbol Gate:** `handleReceivePushNotification` có ĐÚNG 1 consumer (`main_page.dart:155`) → không phải shared symbol; fix tại chính body callee an toàn, không kéo màn khác.

## 5. Regression test

`test/core/managers/notifications/firebase_notification_manager_bug_156_test.dart` — **headless, deterministic, GREEN 3/3**:

1. `handleReceivePushNotification` body KHÔNG còn `requestPermission(`/`setForegroundNotificationPresentationOptions(` (duplicate removed — AC #3).
2. Toàn manager còn ĐÚNG 1 `.requestPermission(` (Firebase method-chain call, guarded).
3. `requestPermission()` method GIỮ try/catch guard (invariant BUG-153 không hồi quy).

Fail-trước-fix: HEAD version có 2 `.requestPermission(` (dòng 87 + 122) + body chứa call → cả assertion #1/#2 FAIL. Pass-sau-fix: GREEN.

**Lý do dùng source-contract test thay behavioral:** race native-channel chỉ tái hiện trên live device (cần Firebase.app + 2 request concurrent qua BuildContext + DI) — thuộc phạm vi Patrol E2E (`TC-W03-ME2E-001..049`, live device) per L2 regression scope. Test headless này pin invariant "duplicate stays removed" để regression không âm thầm quay lại; chạy <1s, không thể treo.

## 6. Verify

- `flutter analyze` (pinned Flutter 3.41.9) trên file sửa: **0 error** ("No issues found!"). (10 error `router.gr.dart` missing quan sát ban đầu = pre-existing env DEBT — auto_route codegen chưa gen trong working tree, HEAD version cũng import file này; đã `build_runner` regen → analyze sạch.)
- `flutter test` 2 regression file: **GREEN 13/13** (10 BUG-155 + 3 BUG-156), `--timeout 60s`, hoàn tất <1s.
- Patrol E2E (`TC-W03-ME2E-001..049`, live device) **DEFERRED** cho TEST_GROUP re-run → flip FIX_DONE → VERIFIED.

## 7. Related

- Cùng họ "fire-and-forget async thiếu guard" với BUG-098/152/153 — call site THỨ 3, đã đóng.
- BUG-W03-155 (fix cùng session) — lỗi async uncaught ĐỘC LẬP cùng cửa sổ thời gian sau login (enum role decode), root cause khác hẳn.
