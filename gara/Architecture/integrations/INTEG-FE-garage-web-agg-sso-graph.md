---
type: architecture
artifact_kind: integration-frontend
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: garage-web
boundary_frontend: garage-web
boundary_bff: agg-sso-graph
last_reviewed: "2026-05-12"
---

# INTEG-FE - Garage Web <-> `agg-sso-graph`

> **FM-016 bắt buộc** - auth, notification, CometChat và Superset action phải map rõ UI trigger -> GraphQL operation trước khi giao DEV.

## 1. Thông tin Frontend

| Thuộc tính | Giá trị |
|---|---|
| Frontend | `gf-gms-web` / `garage-web` - React 19 + TypeScript + Vite SPA |
| HLD | [garage-web-HLD.md](../hld/garage-web-HLD.md) |
| BFF | `agg-sso-graph` |
| Schema | [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md) |
| Endpoint | `VITE_GRAPHQL_SSO_URI` |
| Auth Apollo client | `src/layouts/auth/apollo-client-auth.tsx` |
| Imperative/basic client | `getBasicClient(ENV.GRAPHQL_SSO_URI)` |
| Provider bên ngoài | Firebase Messaging, CometChat, Superset |
| Nhóm người dùng | garage user, admin, operator, support staff |

## 2. Luồng xác thực theo route

| Route/UI | Xác thực | Nhóm operation | Ghi chú |
|---|---|---|---|
| `/login` | Không | `Login`, `UserToken`, Firebase `saveToken` sau success | Login form thuộc auth shell |
| `/forgot-password` | Không | `ForgotPassword`, `ForgotPasswordConfirm` | Wizard quên mật khẩu nhiều bước |
| `/first-change-password` | Không, phụ thuộc challenge/session | `FirstChangePassword` | Được kích hoạt sau login challenge session |
| `/change-password` | Có | `ChangePassword` | Link từ header user popover |
| `/_modules/*` sau 401 | Có | `RefreshToken` | Gọi bởi Apollo error link/retry flow |
| Header logout popover | Có | GraphQL document `mutation Mutation`, root field `logout` + Firebase cleanup | Xóa cookies/store và broadcast `"logout"` qua `BroadcastChannel(auth_channel)` khi mutation success |
| Notification popover | Có | Notification center read/read-state operations đi qua `agg-garage-graph` trong source hiện tại | Mount trong module shell; SSO scope chỉ còn Firebase device token registration |
| Chat/call widgets | Có | CometChat/conversation helper operations | Mount trong module shell / chat routes |
| `/dashboard` Superset embed | Có | `SupperSetQuestToken` | Guest token do BFF tạo, FE không tự tạo |

## 3. Ánh xạ UI Action -> GraphQL Operation

### 3.1 Auth và session

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Login form submit bằng button `{t("login.submit")}` | `/login` | `mutation Login` | `src/features/auth/login/components/login-form.tsx`, `hooks/use-login.ts` | `identifier`, `password`, `subdomain`, `rememberMe`; button disabled khi form thiếu field/loading |
| Checkbox `{t("login.remember")}` trong login form | `/login` | Không gọi GraphQL trực tiếp | `src/features/auth/login/components/login-form.tsx` | Chỉ ảnh hưởng max-age cookie sau `Login` success |
| Link `{t("login.forgot")}` trong login form | `/login` -> `/forgot-password` | Chỉ điều hướng | `src/features/auth/login/components/login-form.tsx` | Forgot wizard tự gọi operation ở bước tiếp theo |
| Challenge session tồn tại thì `Navigate` tới first-change-password | `/login` -> `/first-change-password` | Chỉ điều hướng | `src/features/auth/login/index.tsx`, `store` | `FirstChangePassword` gọi khi user submit form đổi mật khẩu lần đầu |
| First login/change password form submit button `{t("button.confirm")}` | `/first-change-password` | `mutation FirstChangePassword` | `src/features/auth/login/screens/first-login/components/first-login-form.tsx`, `hooks/use-first-login.ts` | New password input map vào `FirstChangePasswordInput` |
| Header user popover `Link` "Đổi mật khẩu" | `/change-password` | Chỉ điều hướng | `src/layouts/home/common/header.tsx` | Form trên route `/change-password` gọi `ChangePassword` |
| Change password form submit button `{t("button.confirm")}` | `/change-password` | `mutation ChangePassword` | `src/features/auth/change-password/index.tsx`, `hooks/use-change-password.ts` | Reuse `FirstLoginForm`; success điều hướng theo callback hiện tại |
| Forgot password phone/identifier step submit | `/forgot-password` | `mutation ForgotPassword` | `src/features/auth/forgot-password/screens/password-phone-number-form.tsx`, `hooks/use-forgot-password.ts` | Chuyển wizard sang OTP/password step sau success |
| Forgot password confirm/reset submit | `/forgot-password` | `mutation ForgotPasswordConfirm` | `src/features/auth/forgot-password/screens/password-otp-form.tsx`, `screens/password-reset-form.tsx`, `hooks/use-forgot-password.ts` | Verification code + new password |
| Apollo domain graph nhận 401 | Mọi protected route | `mutation RefreshToken` | `src/layouts/home/common/refresh-token.ts`, `src/layouts/home/common/home-client.ts` | Refresh token cookie -> update auth cookies -> retry operation gốc |
| Header user popover logout item `{t("button.logout")}` mở confirm dialog | Header shell | Chỉ mở dialog | `src/layouts/home/common/header.tsx` | Confirm dialog quyết định có gọi logout hay không |
| Confirm dialog button `{t("button.confirm")}` trong logout dialog | Header shell | GraphQL operation name `Mutation`, root field `logout` | `src/layouts/home/common/header.tsx`, `src/hooks/use-logout.ts` | Gửi `accessToken` + `deviceId`; cleanup Firebase, cookies, stores, CometChat token; broadcast literal `"logout"` khi success |
| Confirm dialog button `{t("button.close")}` trong logout dialog | Header shell | Không gọi GraphQL | `src/layouts/home/common/header.tsx` | Đóng dialog |

### 3.2 Firebase notification token

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Login success gọi init Firebase notification permission/token | Sau `/login` success | GraphQL operation name `Mutation`, root field `saveToken` | `src/firebase.tsx`, `src/features/notifications/hooks/use-save-token.ts`, `src/features/auth/login/hooks/use-login.ts` | FCM token + platform `"WEB"`; lưu `deviceId` trả về bằng cookie |
| Browser foreground `onMessage(messaging, ...)` | Module shell | Không gọi save token; refetch unread/list | `src/features/notifications/index.tsx` | `handleInAppNotification()` update UI và gọi `refetch()` unread count |
| Logout cleanup push subscription/FCM token | Header logout confirm | GraphQL operation name `Mutation`, root field `logout`; Firebase cleanup theo best-effort | `src/hooks/use-logout.ts` | Clear local auth không phụ thuộc tuyệt đối vào Firebase cleanup success |

### 3.3 Notification center cross-reference

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Notification bell icon `NotificationBing` trigger mở popover | Header/module shell | `query UnreadCountApiResponse`; tab content gọi `GetNotifications` | `src/features/notifications/index.tsx`, `hooks/use-unread-count.ts`, `hooks/use-notifications.ts` | Source dùng `HOME_CLIENT` -> `VITE_GRAPHQL_URI`; chi tiết contract thuộc `INTEG-FE-garage-web-agg-garage-graph.md` |
| Tab "unread/read/all" trong notification popover | Header/module shell | `query GetNotifications` | `src/features/notifications/constants/index.ts`, `hooks/use-notifications.ts` | Tab value/filter map vào `NotificationRequest`; endpoint là `VITE_GRAPHQL_URI` |
| Button "Đánh dấu tất cả đã đọc" | Notification popover | `mutation MarkAllAsRead` | `src/features/notifications/index.tsx`, `hooks/use-read-all.ts` | Success refetch unread count và regenerate `uid` để reload list; endpoint là `VITE_GRAPHQL_URI` |
| Click `NotificationItem` Link tới `redirectTo.link` | Notification popover -> target route | `mutation MarkAsRead` nếu item đang unread | `src/features/notifications/components/notification-item.tsx`, `hooks/use-read.ts` | Click vừa close popover vừa navigate theo `targetRoute/routeParams/search`; endpoint là `VITE_GRAPHQL_URI` |
| Dot unread trên notification item | Notification popover | Không gọi GraphQL riêng | `src/features/notifications/components/notification-item.tsx` | Dot chỉ là UI state từ query result |

### 3.4 CometChat và conversation helpers

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Login success lấy CometChat auth token | Sau `/login` success | `query UserToken` | `src/features/auth/login/hooks/use-token.ts`, `src/features/comet-chat/hooks/use-comet-chat-token.ts`, `src/features/auth/login/hooks/use-login.ts` | Lưu vào common/chat Zustand store; không persist dài hạn |
| Mount `CometLayout` / bubble chat trong module shell | `/_modules/*`, chat routes | Khởi tạo provider SDK; có thể dùng `UserToken` đã lấy | `src/layouts/home/comet-layout.tsx`, `src/components/customs/button/bubble-chat` | Realtime chat/call tồn tại xuyên route |
| Chat/call widget cần group theo source entity | Chat widget/detail pages | `query GroupConversationList` | `src/features/comet-chat/hooks/use-get-group-chat.tsx` | `sourceCode` map vào `GroupConversationFilter` |
| Upload file trong chat/call composer | Chat/call UI | `mutation GroupUpload` | `src/features/chat/func/upload-contract.ts`, `src/features/call-chat/func/upload-contract.ts` | File selected -> `GroupUploadRequest`; response dùng cho CometChat message attachment |
| Button "Tạo nhóm mới" trong CSKH create group form | Call/chat support UI | `mutation RoutingCandidate` | `src/features/call-chat/components/create-group-cskh.tsx`, `hooks/use-create-cs-group.tsx`, `grahpql/chat.ts` | Form name/member data map vào group routing request |
| CS support widget search form submit | Chat support/call center widgets | Query/mutation helper tùy flow; không tự tạo group nếu chỉ search | `src/features/call-chat/view/widget/call-center.tsx`, `call-center-support.tsx` | Search local/provider state; create group button mới gọi mutation |
| Add CS/weekend CS action trong group info | Call/chat support UI | `mutation AddCS`, `mutation AddCSWeekend` | `src/features/call-chat/hooks/use-group-info.ts`, `src/features/call-chat/grahpql/chat.ts` | Refetch/update group info sau success |

### 3.5 Superset dashboard

| UI / Kích hoạt trong code | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Click sidebar overview route và mount Superset embed component | `/dashboard` | `query SupperSetQuestToken` | `src/features/dashboard/hooks/use-superset.ts`, `src/features/dashboard/components/superset-embed.tsx` | `dashboardId` lấy từ env/config; BFF tạo guest token và RLS |
| Switch dashboard/time filter nếu component yêu cầu token mới | `/dashboard` | `query SupperSetQuestToken` refetch | `src/features/dashboard/hooks/use-superset.ts` | FE không tự build guest token, không cache dài hạn |

## 4. Tác động tới quản lý trạng thái

- Auth tokens/session dùng cookie helpers hiện có.
- `BroadcastChannel("auth_channel")` đồng bộ login/logout giữa browser tabs bằng literal payload `"login"` / `"logout"` trong source hiện tại.
- `deviceId` từ `saveToken` lưu bằng cookie để logout/unregister.
- Notification unread/list state đi qua GraphQL query và refetch sau read mutations.
- CometChat auth token là runtime/chat store state, không lưu vào long-lived storage.
- Superset guest token là short-lived runtime state cho embed.

## 5. Pattern không được dùng

- Không gọi trực tiếp IAM, notification, conversation, DynamoDB, Superset hoặc CometChat backend services từ browser.
- Không build Superset guest token, CometChat auth token hoặc signed deep-link token ở frontend.
- Không persist CometChat auth token, Superset guest token, payment/card data vào localStorage/sessionStorage dài hạn.
- Không bỏ qua `Authorization` cho `saveToken`, `logout`, `supperSetQuestToken` hoặc conversation helper operations.
- Không giả định browser notification permission luôn được cấp; phải xử lý `denied/default`.
- Không đổi cách dùng `APP_ENVIRONMENT` / legacy `APP_ENVIROMENT` trong integration work nếu chưa có migration config.

## 6. Tham chiếu

- HLD [garage-web-HLD.md](../hld/garage-web-HLD.md)
- BFF HLD [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md)
- API [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md)
- Source tham chiếu: `gf-gms-web`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-12 | v1.1 | Source-aligned logout/saveToken mapping: GraphQL document dùng operation name `Mutation`, root field `logout`/`saveToken`; BroadcastChannel payload hiện là literal `"login"` / `"logout"`; notification center read/read-state operations trong source đi qua `VITE_GRAPHQL_URI`. |
| 2026-05-07 | v1 | Initial integration contract `garage-web` (React 19 + TypeScript + Vite SPA, `gf-gms-web`) -> `agg-sso-graph` (BFF GraphQL): GraphQL/HTTPS qua Apollo Client (`apollo-client-auth.tsx` cho auth shell + `getBasicClient(ENV.GRAPHQL_SSO_URI)` imperative), auth bearer JWT (login -> tokens -> refresh-token retry trên 401, logout broadcast clear cookies/store); key operations Login/UserToken/Firebase saveToken/ForgotPassword/FirstChangePassword/ChangePassword/RefreshToken/logout, CometChat/conversation widgets, `SupperSetQuestToken` cho Superset embed; FE không tự tạo guest token (BFF cấp). Bao gồm Thông tin Frontend, Luồng xác thực theo route, Ánh xạ UI Action -> GraphQL Operation (auth + Firebase token + chat + Superset), Tác động tới quản lý trạng thái, Pattern không được dùng, Tham chiếu. |
