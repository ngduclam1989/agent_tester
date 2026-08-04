---
type: architecture
artifact_kind: integration-mobile
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: garage-mobile
boundary_frontend: garage-mobile
boundary_bff: agg-sso-graph
last_reviewed: "2026-05-13"
supersedes: "none"
---

# INTEG-MOB - Garage Mobile <-> `agg-sso-graph`

> **FM-016 bắt buộc** - mọi auth/session/chat-routing operation mới trên mobile phải được thêm vào mục 3 trước DEV.
>
> File này chỉ bao phủ contract giữa `garage-mobile` và `agg-sso-graph`. Business graph cho tenant/profile/dashboard/notification read-state và domain flows được tách sang [INTEG-MOB-garage-mobile-agg-garage-graph.md](./INTEG-MOB-garage-mobile-agg-garage-graph.md).

## 1. Thông tin Mobile

| Thuộc tính | Giá trị |
|---|---|
| Mobile | current Flutter mobile app / App Garage, single codebase iOS + Android |
| HLD | [garage-mobile-HLD.md](../hld/garage-mobile-HLD.md) |
| BFF | `agg-sso-graph` |
| Schema | [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md) |
| Endpoint | `F.graphQLSSOUrl` |
| Client/service | `GraphQLSSOService`, `GraphQLServiceBase` |
| Session persistence | `AppPreferences` / `SharedPreferences` |
| Provider side-effects | Firebase Messaging, CometChat, APNs/PushKit/CallKit bootstrap |
| Security baseline | bearer `idToken`, centralized refresh, logout teardown |
| Nhóm người dùng | garage user, support operator, call/chat runtime |

## 2. Luồng xác thực theo route

| Route/UI | Xác thực | Nhóm operation | Ghi chú |
|---|---|---|---|
| Login | NO | `login`, `userToken`, `saveToken` sau success | Login shell của mobile đi qua SSO graph |
| Forgot password wizard | NO | `forgotPassword`, `forgotPasswordConfirm` | Multi-step flow cho reset password |
| First-login password challenge | PARTIAL | `firstChangePassword` | Chỉ xuất hiện khi backend trả `firstLoginChallenge` |
| Change password trong profile | YES | `changePassword` | User đã có session hợp lệ |
| Protected routes gặp `401` / `Unauthorized` | YES | `refreshToken` | Retry 1 lần qua refresh tập trung |
| Logout | YES | `logout` | Teardown session + device registration |
| Chat/call support runtime | YES | `groupConversationList`, `routingCandidate`, `endCall`, `groupCS`, `addCS`, `addCSWeekend` | Authenticated runtime cho conversation/call routing |

## 3. Ánh xạ UI Action -> GraphQL Operation

### 3.1 Auth và session

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Submit login form | login | `login` | `AuthRepository`, `LoginCubit` | Trả `idToken`/`accessToken`/`refreshToken` hoặc `firstLoginChallenge` |
| Start forgot-password flow | forgot-password phone step | `forgotPassword` | `AuthRepository`, `ForgotPasswordCubit` | Khởi tạo OTP/reset flow |
| Confirm forgot-password OTP + password mới | forgot-password confirm step | `forgotPasswordConfirm` | `AuthRepository`, `ForgotPasswordCubit` | Gắn `identifier`, `code`, `newPassword` |
| Complete first-login temp password challenge | first login change-password | `firstChangePassword` | `ProfileRepository`, `LoginCubit` | Dùng `challengeSession` từ bootstrap auth state |
| Change password từ profile | change user password | `changePassword` | `AuthRepository`, `ChangeUserPasswordCubit` | Authenticated password rotation |
| Reactive refresh sau `401` / `Unauthorized` | protected runtime | `refreshToken` | `GraphQLServiceBase` | Single-flight refresh, retry operation gốc 1 lần |
| Logout current session | logout action / app teardown | `logout` | `AuthRepository`, `AppCubit` | Gửi `accessToken` + `deviceId`, sau đó clear local auth state |
| Delete current user account | personal profile | `deleteUser` | `AuthRepository`, `PersonalProfileCubit` | Account lifecycle action qua SSO graph |

### 3.2 Device token và CometChat bootstrap

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Register FCM token sau auth/bootstrap | shell bootstrap / main init | `saveToken` | `AuthRepository`, `MainCubit` | Lưu device registration ở backend; platform hiện map `ANDROID` / `IOS` |
| Fetch CometChat auth token | main shell / chat bootstrap | `userToken` | `AuthRepository`, `MainCubit` | Runtime token cho CometChat manager, không phải long-lived authority |
| Cross-reference notification read-state | notification center | không dùng `agg-sso-graph` trong source hiện tại | `MainCubit`, `NotificationRepository` | Notification inbox/read-state của mobile đang nằm ở `agg-garage-graph` |
| Cross-reference tenant/profile/policy gate | splash / policy-first / profile | không dùng `agg-sso-graph` trong source hiện tại | `ProfileRepository` | `getTenantInfo`, `getCurrentUser`, `tcDataPrivacyConfirmed` thuộc business graph |

### 3.3 Chat, conversation và call-routing support

| UI Action | Route/Màn hình | GraphQL Operation | Source chính | Ghi chú |
|---|---|---|---|---|
| Load conversation list theo source code | quotation / PR / PO / conversation widgets | `groupConversationList` | `CometChatRepository` | Query SSO-side conversation metadata |
| Resolve routing candidate cho waiting-call / support handoff | waiting call / support routing | `routingCandidate` | `CometChatRepository`, `WaitingCallCubit` | Routing theo `sessionCode` + `prevKey` |
| Sync server-side end-call handshake | waiting call / ongoing call teardown | `endCall` | `CometChatRepository`, `WaitingCallCubit` | Không thay thế native/provider end-call, chỉ sync server routing state |
| Create CS group room | home / conversation create room | `groupCS` | `CometChatRepository`, `ConversationCubit`, `HomeCubit` | Tạo support room theo `tenantType: GARAGE` |
| Add CS member vào group | message / support interaction | `addCS` | `CometChatRepository`, `MessageCubit` | Trigger khi cần escalate support vào room hiện tại |
| Add weekend CS member vào group | message / support interaction | `addCSWeekend` | `CometChatRepository`, `MessageCubit` | Rotation flow cho weekend support |

## 4. Tác động tới quản lý trạng thái

- `AppPreferences` đang persist `authToken`, `refreshToken`, `idToken`, `identifier`, `deviceId`, `cometToken`, `firstLoginChallenge` và một số bootstrap hints; đây là implementation reality hiện tại.
- `GraphQLServiceBase._refreshOrWait()` là điểm điều phối refresh-token single-flight cho cả `GraphQLSSOService` và `GraphQLService`.
- `saveToken` lưu backend device-registration state; nó không làm `agg-sso-graph` trở thành owner của unread notification state.
- `userToken` là runtime credential cho CometChat bootstrap; token này không nên bị coi là durable auth source ngoài chat runtime.
- Repo hiện chưa dùng secure storage cho auth/session tokens; đây là hardening gap cần ADR riêng nếu muốn nâng chuẩn bảo mật.

## 5. Pattern không được dùng

- Không bypass `GraphQLSSOService` cho auth/session/chat-routing flow mới.
- Không log hoặc persist raw JWT, password, OTP, CometChat token vào payload debug/plaintext ngoài flow cần thiết hiện có.
- Không thay thế centralized refresh/logout teardown bằng logic cục bộ ở từng feature cubit/page.
- Không chuyển notification read-state, tenant info hoặc policy confirmation sang `agg-sso-graph` nếu source hiện tại vẫn đi business graph.
- Không giả định notification permission, active session hoặc CometChat runtime luôn sẵn; mọi bootstrap phải chịu được trạng thái thiếu permission/expired session.

## 6. Tham chiếu

- HLD [garage-mobile-HLD.md](../hld/garage-mobile-HLD.md)
- BFF HLD [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md)
- API [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md)
- Source tham chiếu: `cardoctor_garage_v3` / `gf-garage-app`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-13 | v1 | Tạo contract mobile -> `agg-sso-graph`; gom riêng auth/session, refresh/logout, device token registration, CometChat auth bootstrap và conversation/call routing support. |
