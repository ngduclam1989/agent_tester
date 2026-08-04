---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: "garage-mobile"
last_reviewed: "2026-05-12"
---

# Events - `garage-mobile` boundary

> Producer = `garage-mobile`. Boundary này không publish Kafka broker event; file này catalog các runtime event/channel app mobile phát ra và các inbound runtime callback từ producer external mà mobile phải mirror schema.
>
> Source hiện split §2.1 outbound (6 runtime events app phát ra) + §2.2 inbound external-source (5 callback/event class từ Firebase/APNs/PushKit/CometChat/WebView).

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `garage-mobile` |
| Owned epics | `TBD - cross-epic mobile shell, notifications/chat-call, ordering support` |
| Schema artifact | `TBD - runtime/mobile event catalog only; no Avro hardening` |
| Avro namespace | `N/A - mobile runtime boundary` |
| Total events | 6 outbound runtime events + 5 external-source inbound runtime events |
| Reliability | Best-effort provider callbacks + persisted tap replay (`SharedPreferences` firebase/session hints) + in-memory broadcast streams |
| Canonical envelope | Provider-native payload (`RemoteMessage`, `NotificationResponse`, `CallEvent`) + app-level `StreamController` / `MethodChannel` / `JavaScriptChannel` contracts |

---

## 2. Catalog

> Với mobile, cột `Topic` dùng de-facto runtime channel name thay cho Kafka topic: `FCM/APNs`, `flutter_local_notifications`, `GlobalEvent.*Stream`, `FlutterChannel`, `MethodChannel`.

### 2.1 Outbound _(boundary publish ra)_

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `PushTokenRegistrationRequested` | `Firebase token -> saveToken / CometChat PNRegistry` | Boot app và init notification managers | `agg-sso-graph`, `CometChat` | ≤ 10s | `source-aligned-producer-only` | overwrite `deviceId` cache |
| 2 | `LocalNotificationDisplayed` | `flutter_local_notifications` | Foreground push non-call hoặc APNs local display path | `LocalNotificationManager.handleNotificationTap`, user shell | ≤ 5s | `confirmed-two-sided` | `call` payload skip |
| 3 | `IncomingCallUiRequested` | `FlutterCallkitIncoming` / `CallKit` | Push call `initiated` hoặc native call intent | `CallKit`, `CometChatCalls`, `OngoingCallRoute` | ≤ 5s | `confirmed-two-sided` | dedup by `sessionId` |
| 4 | `NotificationReadAcknowledged` | `markAsRead*` GraphQL mutations | Open notification list, tap replay, notification bootstrap | `agg-garage-graph` | ≤ 10s | `source-aligned-producer-only` | null id skip |
| 5 | `ConversationRefreshRequested` | `GlobalEvent.conversationsStream` | Forward hoặc gửi media/chat attachment thành công | `ConversationCubit` | ≤ 5s | `confirmed-two-sided` | bool flag only |
| 6 | `PurchaseRequestRefreshRequested` | `GlobalEvent.refreshPRStream` | Cancel/update PR detail thành công | `ListPurchaseRequestCubit` | ≤ 5s | `confirmed-two-sided` | bool flag only |

### 2.2 Inbound - external-source

| # | Event Type | Topic | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 7 | `FirebaseMessageReceived` | `FCM/APNs payload` | External: Firebase / APNs relay | Route foreground/background/terminated push, local notification, unread recount, call bootstrap | ≤ 5s | `consumer-only-confirmed` | shared for chat + business notify |
| 8 | `LocalNotificationLaunchReplay` | `flutter_local_notifications launch payload` | External: OS notification center | Persist payload, replay route, then `markAsReadPush` on next boot | ≤ 5s | `consumer-only-confirmed` | uses pref `firebase` |
| 9 | `VoipPushWakeup` | `PushKit / CallKit / FCM call payload` | External: APNs PushKit / OS call UI | Wake app, show incoming call, accept/decline/end bridge | ≤ 5s | `consumer-only-confirmed` | iOS + Android variants |
| 10 | `CometChatCallOrMessageEvent` | `CometChat SDK listeners` | External: CometChat runtime | Sync unread counts, call end, active chat context | ≤ 5s | `consumer-only-confirmed` | SDK listener fan-in |
| 11 | `PaymentWebViewCallback` | `FlutterChannel` / `PaymentChannel` / `AuthChannel` / URL intercept | External: payment/auth page in WebView | Resolve payment/auth result, popup, pop route, optional GET callback | ≤ 5s | `consumer-only-confirmed` | JS + URL mixed |

---

## 3. Schemas

### 3.1 `PushTokenRegistrationRequested`

**Trigger**: `MainPage.initData` wire `FirebaseNotificationManager.init` và APNs bootstrap; manager lấy device token rồi gọi `MainCubit.saveFcmToken`. Source: `lib/ui/main/main_page.dart`, `lib/ui/main/bloc/main_cubit.dart`, `lib/core/managers/comet_chat/comet_chat_manager.dart`.

**Payload**:
```json
{
  "platform": "ANDROID|IOS",
  "pushToken": "opaque string - never log full value",
  "provider": "FCM|APNS|COMETCHAT_PN",
  "deviceId": "string|null",
  "requestedAt": "ISO-8601 UTC"
}
```

**Idempotency**: đăng ký lặp lại cùng token là an toàn; `saveToken` trả `deviceId` mới nhất và app overwrite cache. PN registry của CometChat cho phép re-register cùng token sau boot/login.

### 3.2 `LocalNotificationDisplayed`

**Trigger**: `FirebaseMessaging.onMessage` trên Android gọi `LocalNotificationManager.showNotification`; iOS foreground path dùng `_showNotification` trong `ApnsNotificationManager`. Source: `lib/core/managers/notifications/firebase_notification_manager.dart`, `lib/core/managers/notifications/local_notification_manager.dart`, `lib/core/managers/notifications/apns_notification_manager.dart`.

**Payload**:
```json
{
  "notificationId": "int - payload.tag or fallback hash",
  "title": "string",
  "body": "string",
  "type": "chat|system|other",
  "receiverType": "user|group|null",
  "routeHint": "conversationId|targetRoute|requestId|null"
}
```

**Idempotency**: nếu payload có `tag` thì reuse làm notification id; nếu không có thì fallback sang hash thời gian. Push `type=call` bị skip để tránh tạo local notification trùng với call UI.

### 3.3 `IncomingCallUiRequested`

**Trigger**: payload push `type=call` với `callAction=initiated` hoặc native `get_initial_call_intent` làm app dựng incoming call UI. Source: `lib/core/managers/notifications/voip_notification_manager.dart`, `lib/core/managers/notifications/apns_notification_manager.dart`.

**Payload**:
```json
{
  "sessionId": "string",
  "callAction": "initiated|cancelled|unanswered",
  "callType": "audio|video",
  "senderName": "string",
  "sentAt": "epoch millis|null"
}
```

**Idempotency**: `_endedSessions` và `activeCallSession` chặn end-call lặp lại; payload `cancelled/unanswered` chỉ đóng session đang active thay vì dựng UI mới.

### 3.4 `NotificationReadAcknowledged`

**Trigger**: user mở notification list, tap local notification hoặc app replay terminated-state payload rồi gọi `markAsRead`, `markAllAsRead`, `markAsReadPush`. Source: `lib/ui/notification/notification_cubit.dart`, `lib/ui/main/bloc/main_cubit.dart`, `lib/start.dart`.

**Payload**:
```json
{
  "requestId": "int|null",
  "mode": "MARK_ONE|MARK_ALL|MARK_PUSH",
  "source": "notification_list|tap_replay|boot_replay",
  "ackAt": "ISO-8601 UTC"
}
```

**Idempotency**: `requestId == null` bị bỏ qua. Re-ack cùng notification là acceptable vì server-side semantic của read-state là monotonic `unread -> read`.

### 3.5 `ConversationRefreshRequested`

**Trigger**: sau khi forward message hoặc gửi media attachment thành công, app broadcast `GlobalEvent.onConversationsUpdated(true)`. Source: `lib/ui/comet_chat/helper/message_helper.dart`, `lib/ui/comet_chat/messages/message_page.dart`, `lib/core/global/global_event.dart`.

**Payload**:
```json
{
  "isUpdated": true,
  "source": "forward_modal|media_send",
  "scope": "conversations"
}
```

**Idempotency**: event chỉ là refresh hint trong memory; duplicate emission chỉ làm `ConversationCubit` reload cùng projection, không tạo side effect bền vững.

### 3.6 `PurchaseRequestRefreshRequested`

**Trigger**: PR detail flow như cancel/update gọi `_globalEvent.onRefreshPR()` để yêu cầu màn danh sách reload. Source: `lib/ui/ordering/purchase_request/purchase_request_detail/purchase_request_detail_cubit.dart`, `lib/core/global/global_event.dart`.

**Payload**:
```json
{
  "refresh": true,
  "source": "purchase_request_detail",
  "scope": "purchase_request_list"
}
```

**Idempotency**: event là in-memory broadcast; duplicate refresh collapse về cùng hành vi `ListPurchaseRequestCubit` fetch lại danh sách.

### 3.7 `FirebaseMessageReceived`

**Producer source**: Firebase Cloud Messaging / APNs relay.

**Trigger upstream**: backend/provider gửi push data payload tới thiết bị ở foreground, background hoặc terminated state.

**Payload**:
```json
{
  "tag": "string|null",
  "type": "chat|call|system",
  "conversationId": "string|null",
  "receiverType": "user|group|null",
  "routeParams": "JSON string|null"
}
```

**Consumer logic**:
1. `FirebaseNotificationManager.handleReceivePushNotification` fan-in `getInitialMessage`, `onMessage`, `onMessageOpenedApp`.
2. Push non-call có thể thành local notification; push call đi qua call bootstrap.
3. App sync unread counters và route detail/chat screen nếu payload hợp lệ.

**Idempotency**: provider có thể redeliver; app giữ `firebase` payload trong prefs cho terminated replay và route best-effort theo payload mới nhất.

### 3.8 `LocalNotificationLaunchReplay`

**Producer source**: OS notification center + `flutter_local_notifications`.

**Trigger upstream**: user tap local notification khi app đang terminated.

**Payload**:
```json
{
  "payload": "JSON string from notification data",
  "notificationId": "int",
  "launchedApp": true
}
```

**Consumer logic**:
1. `start.dart` đọc `getNotificationAppLaunchDetails()` rồi lưu payload vào `AppPreferences.firebase`.
2. Sau boot, `LocalNotificationManager.handleNotificationTap` decode payload, fetch user/group nếu cần và replay route.
3. Callback `markAsReadPush` chạy sau khi route/tap đã được xử lý.

**Idempotency**: payload replay được clear sau khi main shell consume; nếu tap lặp lại cùng notification thì side effect chủ yếu chỉ là mở lại đúng screen và gửi read-ack cùng `requestId`.

### 3.9 `VoipPushWakeup`

**Producer source**: APNs PushKit, OS CallKit actions, hoặc FCM call payload.

**Trigger upstream**: upstream call runtime gửi incoming call / cancel / unanswered signal hoặc native lock-screen action.

**Payload**:
```json
{
  "sessionId": "string",
  "callAction": "initiated|cancelled|unanswered",
  "callType": "audio|video",
  "senderName": "string",
  "origin": "pushkit|callkit|fcm|native_intent"
}
```

**Consumer logic**:
1. `VoipNotificationManager.displayIncomingCall` hoặc `ApnsNotificationManager.displayIncomingCall` dựng call UI.
2. Accept/decline/end được bridge sang CometChat call runtime và native lock-screen helpers.
3. Nếu app mở từ native intent, `handleNativeCallIntent` tiếp tục route vào `OngoingCallRoute`.

**Idempotency**: dedup theo `sessionId`; `_endedSessions` ngăn `endCall` lặp, `activeCallSession` giữ current owner của call lifecycle.

### 3.10 `CometChatCallOrMessageEvent`

**Producer source**: CometChat SDK listeners (`MessageListener`, `GroupListener`, `CometChatCallEventListener`, `CometChatUIEventListener`).

**Trigger upstream**: có message/chat mutation, group membership change, active chat change hoặc call end trong SDK runtime.

**Payload**:
```json
{
  "eventClass": "message|group|call|ui",
  "conversationId": "string|null",
  "sessionId": "string|null",
  "unreadCount": "int|null"
}
```

**Consumer logic**:
1. `MainCubit` recompute unread counts thay vì tin vào delta event thô.
2. Notification/call managers end active call hoặc update active chat context.
3. UI chat surfaces dùng kết quả recompute để refresh badge/state.

**Idempotency**: callback SDK là ephemeral; app chọn recompute state từ SDK/API hiện tại nên duplicate callback chỉ dẫn đến cùng snapshot cuối.

### 3.11 `PaymentWebViewCallback`

**Producer source**: payment/auth page nhúng trong WebView qua JavaScript bridge hoặc redirect URL.

**Trigger upstream**: web page gọi `FlutterChannel` / `PaymentChannel` / `AuthChannel`, hoặc redirect `app://*`, `payment/ipn`, `oauth/*`, `auth/*`.

**Payload**:
```json
{
  "source": "js|payment|auth|url",
  "callbackType": "apiResponse|formSubmit|webMessage|payment|oauth|auth",
  "status": "success|failed|null",
  "url": "string|null",
  "transactionCode": "string|null"
}
```

**Consumer logic**:
1. `CreditCardPaymentPage` parse JS message hoặc intercept URL change/navigation request.
2. Payment callback có thể gọi GET callback URL, popup kết quả và `pop` route.
3. Auth callback có thể trả token/result tạm thời về caller route.

**Idempotency**: callback URL hoặc JS message có thể lặp; app key hành vi trên response code/callback type và đóng route một lần theo kết quả cuối cùng.

---

## 4. Forbidden patterns

- ❌ Log hoặc re-publish raw push token, JWT, password, OTP, card PAN/CVV trong local payload, debug log, JavaScript bridge hay MethodChannel.
- ❌ Gọi trực tiếp native push/call APIs từ feature page; mọi flow phải đi qua `FirebaseNotificationManager`, `ApnsNotificationManager`, `VoipNotificationManager` hoặc `LocalNotificationManager`.
- ❌ Coi `GlobalEvent.conversationsStream` hoặc `GlobalEvent.refreshPRStream` là durable integration contract; đây chỉ là in-memory refresh hint.
- ❌ Đánh dấu payment success trước khi callback URL hoặc `PaymentChannel` / `FlutterChannel` xác nhận kết quả cuối.
- ❌ Thêm JS channel, deep link callback hoặc MethodChannel mới mà không document trigger, payload, idempotency và owner ở file này cùng HLD/INTEG.
- ❌ Tạo inbound section trong file consumer nếu producer là internal boundary khác - vi phạm producer-view discipline; §2.2 ở đây chỉ dành cho external-source runtime events.

---

## 5. References

- Conventions: [`_CONVENTIONS.md`](_CONVENTIONS.md) §11-12 - discovery semantics được adapt cho mobile runtime plane
- HLD: [garage-mobile-HLD.md](../hld/garage-mobile-HLD.md) §4.2, §5, §8
- ADR: [ADR-011-mobile-decisions.md](../decisions/ADR-011-garage-mobile-decisions.md) §3, §5, §6
- Integration contracts: [INTEG-MOB-garage-mobile-agg-garage-graph.md](../integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md), [INTEG-MOB-garage-mobile-agg-sso-graph.md](../integrations/INTEG-MOB-garage-mobile-agg-sso-graph.md)
- Knowledge graph source: [garage-mobile.knowledge-graph.yaml](../../Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml)

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-12 | v1 | Initial mobile runtime events spec cho `garage-mobile`: 6 outbound runtime events (`PushTokenRegistrationRequested`, `LocalNotificationDisplayed`, `IncomingCallUiRequested`, `NotificationReadAcknowledged`, `ConversationRefreshRequested`, `PurchaseRequestRefreshRequested`) + 5 inbound external-source events (`FirebaseMessageReceived`, `LocalNotificationLaunchReplay`, `VoipPushWakeup`, `CometChatCallOrMessageEvent`, `PaymentWebViewCallback`); dùng de-facto channel names thay cho Kafka topics và bám source code Flutter hiện tại. |
