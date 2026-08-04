---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: garage-web
last_reviewed: "2026-05-12"
---

# Events - `garage-web` boundary

> `Producer` / `Consumer` = `gf-gms-web` browser runtime. Convention chung xem [`_CONVENTIONS.md`](_CONVENTIONS.md), nhưng cần lưu ý `garage-web` **không publish Kafka event**.
>
> File này mô tả **client runtime events** trong browser: `BroadcastChannel(auth_channel)`, `Firebase Messaging` service worker / foreground events và `CometChat SDK` events. Các event này phục vụ `UX/runtime coordination`, không phải `durable business event` và không dùng `KafkaMessageWrapper`.
>
> `Source of truth`: [`garage-web.knowledge-graph.yaml`](../../Execution/knowledge-graphs/garage-web.knowledge-graph.yaml), HLD [`garage-web-HLD.md`](../hld/garage-web-HLD.md), ADR-012 [`garage-web-frontend-architecture.md`](../decisions/ADR-012-garage-web-frontend-architecture.md).

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| `Producer boundary` | `garage-web` / `gf-gms-web` |
| `Runtime` | Browser React/Vite SPA + `service worker` + provider SDKs |
| `Owned epics` | Auth/session UX, notification center, CometChat chat/call shell, Superset dashboard UX |
| `Schema artifact` | `Execution/knowledge-graphs/garage-web.knowledge-graph.yaml` |
| `Total events` | 2 outbound browser events + 5 inbound runtime event families |
| `Reliability` | `Best-effort` browser runtime; `source of truth` vẫn là BFF/domain services |
| `Canonical envelope` | Provider/browser native payloads; **không dùng `KafkaMessageWrapper`** |

**Boundary note**: các event bên dưới không được dùng để `enforce authorization`, `durable business state` hoặc `payment state`. Backend/BFF vẫn là `authority`.

---

## 2. Catalog

### 2.1 Outbound _(garage-web publish trong browser)_

| # | Event Type | Channel | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `AuthBroadcastLogin` | `BroadcastChannel(auth_channel)` | Login success ở một tab | Các tab `garage-web` khác | ≤ 1s | `source-aligned-producer-only` | Payload hiện tại là literal string `"login"` |
| 2 | `AuthBroadcastLogout` | `BroadcastChannel(auth_channel)` | Logout mutation success ở một tab | Các tab `garage-web` khác | ≤ 1s | `source-aligned-producer-only` | Payload hiện tại là literal string `"logout"` |

### 2.2 Inbound runtime/provider events _(garage-web consumes)_

| # | Event Type | Source channel | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 3 | `FirebaseForegroundMessage` | Firebase Messaging `onMessage` | `Firebase Messaging SDK` | Update in-app notification UI; refetch unread/list state | ≤ 5s | `consumer-only-confirmed` | Provider event |
| 4 | `FirebaseNotificationClick` | Firebase service worker notification click | Browser service worker / Firebase | Redirect tới notification target route | ≤ 5s | `consumer-only-confirmed` | Chỉ route redirect |
| 5 | `CometChatMessageEvent` | CometChat browser SDK | CometChat | Update chat conversation/message UI | ≤ 5s | `consumer-only-confirmed` | Degrade ở widget-level |
| 6 | `CometChatIncomingCall` | CometChat Calls SDK | CometChat | Hiển thị incoming call popup/ringtone và call controls | ≤ 2s | `consumer-only-confirmed` | Shell runtime |
| 7 | `AuthBroadcastReceived` | `BroadcastChannel(auth_channel)` | Tab `garage-web` khác | Apply login/logout state change ở tab hiện tại | ≤ 1s | `confirmed-two-sided` | Chỉ same-origin tabs |

> **SLA convention**: browser runtime events là mục tiêu phản hồi UX, không phải broker delivery guarantees.

---

## 3. Schemas

### 3.1 `AuthBroadcastLogin`

**Trigger**: `Login` mutation success thiết lập authenticated state ở một browser tab.
Source: `src/features/auth/login/hooks/use-login.ts` trong `gf-gms-web`.

**Payload** (`BroadcastChannel(auth_channel)` message):
```json
"login"
```

**Idempotency**:
- `Producer`: `best-effort` browser postMessage; duplicate login broadcasts được tolerate.
- `Consumer`: tab hiện tại lấy truth từ cookies/session helpers, không tin riêng broadcast payload.

**Critical use case**: Đồng bộ authenticated shell state giữa nhiều tab mà không cần page reload.

### 3.2 `AuthBroadcastLogout`

**Trigger**: User confirm logout và `logout` mutation trả success.
Source: `src/hooks/use-logout.ts` trong `gf-gms-web`.

**Payload**:
```json
"logout"
```

**Idempotency**:
- `Producer`: duplicate logout broadcasts được phép xảy ra.
- `Consumer`: repeated cleanup phải an toàn; clear cookies/stores và redirect về login nếu cần.

**Critical use case**: Ngăn một tab tiếp tục authenticated sau khi tab khác đã logout.

### 3.3 `FirebaseForegroundMessage`

**Producer source**: `Firebase Messaging SDK`.

**Trigger upstream**: Firebase nhận foreground push payload cho browser session hiện tại.

**Payload** (Firebase provider payload shape):
```json
{
  "messageId": "string",
  "notification": {
    "title": "string",
    "body": "string"
  },
  "data": {
    "targetRoute": "string",
    "routeParams": "object | stringified object",
    "search": "string | undefined",
    "notificationId": "string | number"
  },
  "from": "string",
  "sentTime": "number"
}
```

**Consumer logic** (`garage-web` xử lý):
1. Receive foreground message trong notification runtime.
2. Update in-app notification UI.
3. Refetch unread count và notification list từ `agg-sso-graph`.
4. Không coi push payload là `source of truth` cho authorization hoặc business state.

**Idempotency**: UI updates tolerate duplicate `messageId`; read state vẫn server-authoritative qua notification queries.

### 3.4 `FirebaseNotificationClick`

**Producer source**: Browser service worker + `Firebase Messaging`.

**Trigger upstream**: User click browser notification được render từ background push payload.

**Payload**:
```json
{
  "messageId": "string",
  "data": {
    "targetRoute": "string",
    "routeParams": "object | stringified object",
    "search": "string | undefined",
    "notificationId": "string | number"
  },
  "action": "click"
}
```

**Consumer logic**:
1. Service worker/browser mở hoặc focus `garage-web`.
2. Runtime resolve target route từ payload.
3. UI navigate tới route phù hợp và để protected route guards/BFF authorization enforce access.

**Idempotency**: Multiple clicks/focus events phải an toàn; route navigation có thể replace và server reads vẫn authoritative.

### 3.5 `CometChatMessageEvent`

**Producer source**: `CometChat` browser SDK.

**Trigger upstream**: Message received, message updated, group changed hoặc conversation list changed trong `CometChat runtime`.

**Payload**:
```json
{
  "eventId": "string",
  "conversationId": "string",
  "groupId": "string | undefined",
  "senderId": "string",
  "messageType": "enum: text | media | custom | call",
  "sentAt": "number"
}
```

**Consumer logic**:
1. Update chat conversation runtime state.
2. Refresh group/conversation UI bị ảnh hưởng khi cần qua `GroupConversationList`.
3. Cô lập provider failures ở chat widget/shell runtime.

**Idempotency**: Dùng provider `messageId` / `conversationId` để UI dedup nếu có; durable chat state thuộc CometChat/conversation backend.

### 3.6 `CometChatIncomingCall`

**Producer source**: `CometChat Calls SDK`.

**Trigger upstream**: Incoming call event được emit tới authenticated browser user.

**Payload**:
```json
{
  "eventId": "string",
  "callSessionId": "string",
  "conversationId": "string",
  "callerId": "string",
  "callType": "enum: audio | video",
  "startedAt": "number"
}
```

**Consumer logic**:
1. Hiển thị incoming call popup và ringtone.
2. Cho phép accept/reject actions qua `CometChat SDK/runtime`.
3. Clear call runtime state khi call ends, times out hoặc route changes.

**Idempotency**: Duplicate incoming call events cho cùng `callSessionId` không được mở nhiều popup.

### 3.7 `AuthBroadcastReceived`

**Producer source**: Tab `garage-web` same-origin khác.

**Trigger upstream**: Tab khác publish literal message `"login"` hoặc `"logout"` qua `BroadcastChannel(auth_channel)`.

**Payload**:
```json
"login | logout"
```

**Consumer logic**:
1. Receive event qua `BroadcastChannel(auth_channel)`.
2. Nếu payload là `"logout"` thì redirect về `/login`.
3. Nếu payload là `"login"` thì redirect về route default `/protected-permission`.

**Idempotency**: Consumer chỉ xử lý hai literal string hiện có; duplicate redirect phải an toàn ở browser/runtime layer.

---

## 4. Workflow correlation

Không có Temporal workflow correlation trong `garage-web`. Runtime events correlate với FE flows:

1. `Login` mutation success qua `agg-sso-graph` → `AuthBroadcastLogin` với payload `"login"` + Firebase/CometChat runtime initialization.
2. `logout` mutation success → cleanup cookies/stores/provider tokens + `AuthBroadcastLogout` với payload `"logout"`.
3. Refresh token failure trong source hiện tại chỉ `clearUserData()` và redirect tab hiện tại về `/login`; chưa broadcast logout sang tab khác.
4. Firebase foreground/background payload → notification UI/refetch hoặc route redirect.
5. CometChat SDK event → chỉ update chat/call widget; business workflow vẫn backend/provider-owned.

---

## 5. Forbidden patterns

- ❌ Coi `BroadcastChannel`, Firebase payload hoặc CometChat payload là final authorization source — backend/BFF vẫn là authority.
- ❌ Persist Superset guest token, CometChat auth token, Firebase provider token hoặc payment/card data trong long-lived browser storage.
- ❌ Dùng browser/provider event payload để mutate durable business state trực tiếp; phải gọi approved GraphQL operation và để backend enforce invariants.
- ❌ Để Firebase/CometChat/Superset runtime error block toàn bộ module shell; chỉ degrade ở widget/runtime layer.
- ❌ Áp Kafka-style `KafkaMessageWrapper` cho browser runtime events nếu chưa có coordinated architecture migration.

---

## 6. References / Cross-references

- **HLD**: [garage-web-HLD.md](../hld/garage-web-HLD.md)
- **ADR**: [ADR-012-garage-web-frontend-architecture.md](../decisions/ADR-012-garage-web-frontend-architecture.md)
- **Integration contracts**:
  - [INTEG-FE-garage-web-agg-garage-graph.md](../integrations/INTEG-FE-garage-web-agg-garage-graph.md)
  - [INTEG-FE-garage-web-agg-sso-graph.md](../integrations/INTEG-FE-garage-web-agg-sso-graph.md)
- **Knowledge graph**: [garage-web.knowledge-graph.yaml](../../Execution/knowledge-graphs/garage-web.knowledge-graph.yaml)
- **Conventions**: [_CONVENTIONS.md](_CONVENTIONS.md) — global Kafka event rules; file này document browser-runtime exception cho FE.

---

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-12 | v1.1 | Source-aligned auth BroadcastChannel payloads với `gf-gms-web`: producer/consumer dùng literal string `"login"` / `"logout"`; refresh token failure hiện chỉ redirect tab hiện tại, chưa broadcast logout. |
| 2026-05-12 | v1 | Initial client-runtime events cho `garage-web`: auth BroadcastChannel login/logout, Firebase notification foreground/click flows, CometChat message/call runtime events và forbidden patterns. |
