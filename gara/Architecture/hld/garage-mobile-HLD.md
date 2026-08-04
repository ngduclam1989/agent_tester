---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 11
tier: T1
owner_authority: Architecture Authority
boundary: garage-mobile
last_reviewed: "2026-07-08"  # v10 W04 upstream sync — (a) Figma designer chốt rename node `21290:52697` AppBar title "Tồn đầu kỳ đã import" → "Tồn đầu kỳ" (verified via screenshot 2026-07-08); §11b.2 gỡ note "pending Figma rename" khỏi bullet screen elements; (b) agg-garage-graph-graphql v7.50 add `OpeningBalanceLine.mainUnitName: String` nullable BFF-enriched field — reuse cache `fetchAllUnits()` catalog V2 mechanism (§3d resolver), TTL 5min shared key `UNIT::{tenantId}`, KHÔNG fan-out per-row, nullable defensive khi enrichment miss. Gap `mainUnitCode` code-vs-name (Figma render "Cái" name vs SDL trả code "PCS") ĐÃ ĐÓNG via Option A implementation. §11b.2 card field enumeration đổi `mainUnitCode` → `mainUnitName` (fallback to `mainUnitCode` khi nullable enrichment miss). Follow-up (a)+(c) từ v9 ĐÃ ĐÓNG. Follow-up còn treo: UX-FLOW-INVENTORY-OPENING-BALANCE §29 wording clarify search in-scope + FEAT-OB-LIST spec add AC search mobile — cần BA/PO fix. v9 W04 gap fix — §11b.2 add Search flow (Figma canonical `21290:52992` "Tìm kiếm sản phẩm" 3-state Default/Results/No Results). Gỡ wording sai "no keyword search on mobile v1 (defer to gesture-search bar future)" — Figma canonical FEAT-OB-LIST section `21290:55831` đã có full search feature dedicated screen + Search icon 🔍 trên AppBar `21290:52697`. Map `keyword` → SDL `OpeningBalanceSearchInput.keyword` (BE LIKE theo `productCode` OR `productName`). Đồng thời sửa mapping node reference cho screen list: từ section cha `21632:28894` sang screen chính `21290:52697` + expand card field enumeration (5 rows: warehouseName + asOfDate + quantityOnHand + valueOnHand + mainUnitCode). **AppBar title chốt "Tồn đầu kỳ"** (không phải "Tồn đầu kỳ đã import") — user đã báo designer sẽ rename Figma node `21290:52697` bỏ hậu tố "đã import"; HLD align với title final. Follow-up flag: (a) Product UX-FLOW-INVENTORY-OPENING-BALANCE §29 "App Garage chỉ XEM" wording không loại trừ search — cần BA/PO confirm search in-scope; (b) FEAT-OB-LIST spec cần add AC search; (c) `mainUnitCode` code-vs-name gap vẫn treo (Figma hiển thị `"Cái"` name, SDL trả code `"PCS"`) — chờ BA/PO chốt Option A (BE add `mainUnitName`) hoặc Option B (FE mapping); (d) Figma rename pending — sau khi designer commit rename `21290:52697` title, verify visually và gỡ note "pending Figma rename" khỏi §11b.2. v8 W04 Q1 fix — §11b.1 entry-point-to-hub chốt là **mission tile "Quản lý kho hàng"** trong grid mission tile màn Home (Sảnh chính), khớp FEAT-INV-MOBILE-MENU AC-1 v3 (BA/PO chốt 2026-07-06) + code W03 đã ship `mission_function_widget.dart:107-110`. Gỡ hoàn toàn wording "NEED CONFIRMATION" + default-assumption drawer sai (V1 dùng `persistent_bottom_nav_bar` không phải drawer). Không đụng Product docs (BA đã tự update AC-1). v7 W04 fix — Add explicit §11b.4 Performance & Scale section (6/6 items scoped to Mobile Hub + OB view-only: hub zero-backend explicit as load answer, infinite-scroll 75%-threshold, index N/A Flutter, cubit in-memory only no Hive/SharedPreferences, N+1 N/A denormalized + hub inherently safe, single-user session no client-throttle needed). Main-agent post-hoc verification catch: v6 mentioned infinite-scroll in Change Log but no perf section grouped; v7 promotes to a named section satisfying Reviewer G12 shape. v6 W04 — §11b Mobile Hub + OB view-only added.
depends_on:
  - "../TECHSTACK.md"
  - "../SYSTEM-ARCHITECTURE.md"
  - "../decisions/ADR-002-graphql-aggregator-pattern.md"
  - "../decisions/ADR-010-feature-flags-governance.md"
  - "../decisions/ADR-011-garage-mobile-decisions.md"
  - "../integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md"
  - "../integrations/INTEG-MOB-garage-mobile-agg-sso-graph.md"
  - "../events/garage-mobile-events.md"
  - "../../Product/PRD-GARAGE.md"
  - "../../Product/BUSINESS-RULES.md"
---

# HLD - `garage-mobile`

> Scope note: tài liệu này phản ánh mobile app Flutter của Garage/App Garage trong repo này.

## 1. Overview

`garage-mobile` là mobile app **internal operational channel** cho Garage Management System, chạy trên **một Flutter codebase** cho iOS và Android. App phục vụ thao tác nhanh tại hiện trường, notification, image/file capture, OCR scan, chat/call, follow-up, payment WebView, feedback WebView và một phần luồng nghiệp vụ Garage phù hợp với phone context.

**Owned scope:**

- Auth UI, session bootstrap và các boot gate của mobile.
- App shell, persistent bottom tabs, route guards, permission UX, app version check, feature gates.
- Policy-first flow: `firstLoginChallenge`, `tcConfirmed`, privacy/T&C confirmation trước khi user vào main shell.
- Feature modules cho:
  - dashboard/home,
  - booking,
  - quotation / request quote,
  - ordering / purchase request / purchase order / cart / confirm order,
  - service order V1 và V3,
  - customer / supplier / product / inventory / settlement / employee / vehicle management,
  - notification inbox,
  - chat / audio-video call,
  - OCR scan giấy xe.
- Runtime bridges cho:
  - payment/auth WebView,
  - document export/download,
  - push/call trên Android và iOS qua Firebase/APNs/PushKit/CallKit/CometChat bridge.
- Multi-flavor runtime cho `dev`, `sit`, `uat`, `pt`, `stag`, `preprod`, `prod`.

**Not in scope / non-ownership:**

- Không sở hữu durable business state, DB, business state machine hoặc authorization authority.
- Không thay thế Web GMS như full desktop console.
- Không trực tiếp sở hữu third-party identity, payment gateway page, CometChat Cloud, Firebase service hoặc backend domain authority.
- Không sở hữu durable async broker plane kiểu Kafka eventing; runtime event surface của mobile chỉ là callback/bridge/in-memory stream contracts.

**Current implementation baseline:**

- Flutter 3.x + Dart 3.x + FVM
- `flutter_bloc` / Cubit
- `BasePage` / `BaseCubit` / `BaseState`
- `get_it` + `injectable`
- `auto_route`
- `persistent_bottom_nav_bar`
- `graphql_flutter`
- REST helper qua `Dio` + `Retrofit` cho upload/export/non-GraphQL endpoints
- Firebase (`core`, `messaging`, `crashlytics`, `remote_config`)
- `flutter_local_notifications`
- CometChat + native call adapters
- `webview_flutter` + MethodChannel bridges

## 2. Component Diagram (C4 Level 3)

```text
+-------------------------------- garage-mobile (Flutter) --------------------------------+
|                                                                                         |
|  Bootstrap / runtime                                                                    |
|    main*.dart -> start.dart                                                             |
|      -> WidgetsFlutterBinding                                                           |
|      -> Firebase init + Crashlytics                                                     |
|      -> Hive init for GraphQL cache                                                     |
|      -> GetIt/Injectable wiring                                                         |
|      -> EasyLocalization                                                                |
|      -> Local notification bootstrap                                                    |
|      -> Remote Config init                                                              |
|                                                                                         |
|  App shell                                                                              |
|    AppCubit                                                                             |
|      - app open / logout / force-update gate                                            |
|    MainCubit                                                                            |
|      - notification bootstrap / unread count / payment gate                             |
|    ProfileCubit                                                                         |
|      - tenant/profile snapshot                                                          |
|    PolicyFirstCubit                                                                     |
|      - privacy/T&C confirmation                                                         |
|    App                                                                                  |
|      - MaterialApp.router                                                               |
|      - OverlaySupport / Toastification                                                  |
|      - GraphQL debug overlay                                                            |
|                                                                                         |
|  Navigation layer                                                                       |
|    AppRouter + AuthGuard + PermissionGuard + route observers                            |
|    MainPage persistent tabs                                                             |
|      - Home                                                                             |
|      - Chat                                                                             |
|      - Hoi gia                                                                          |
|      - Notification shortcut flow                                                       |
|      - Tai khoan                                                                        |
|                                                                                         |
|  Feature / state layer                                                                  |
|    BasePage + BaseCubit + BaseState                                                     |
|    Cubit per feature                                                                    |
|    GlobalEvent streams                                                                  |
|      - conversationsStream                                                              |
|      - refreshPRStream                                                                  |
|      - permissionStream                                                                 |
|                                                                                         |
|  Domain access layer                                                                    |
|    Repositories per domain                                                              |
|    GraphQLService      -> Garage graph                                                  |
|    GraphQLSSOService   -> SSO graph                                                     |
|    ApiService          -> upload/export/helper REST endpoints                           |
|                                                                                         |
|  Local persistence / cache                                                              |
|    SharedPreferences                                                                    |
|    HiveStore for GraphQL cache                                                          |
|    .ff_cache feature flag file cache                                                    |
|                                                                                         |
|  Runtime bridges                                                                        |
|    WebView JS channels: FlutterChannel / PaymentChannel / AuthChannel                   |
|    Deep-link handlers: app://* / payment/ipn / oauth/* / auth/*                        |
|    MethodChannel: com.cometchat.sampleapp / ...flutter.ios / app.documents.channel     |
|    Firebase Messaging / Local notifications / CometChat UIKit / Calls                   |
|    Android incoming-call intent + lock-screen handling                                  |
|    iOS APNs / PushKit / CallKit / AppDelegate bridge                                    |
+-----------------------------------------------------------------------------------------+
       |                        |                        |                      |
       v                        v                        v                      v
  F.graphQLUrl            F.graphQLSSOUrl          F.apiUrl /            Firebase / APNs /
  business GraphQL        auth/SSO GraphQL         F.apiUrlNoAuth        PushKit / CallKit /
                                                    export/helper REST    CometChat providers
```

## 3. Key Design Decisions

| Decision | Current implementation | Rationale / note |
|---|---|---|
| Platform/codebase | Single Flutter codebase for iOS + Android | Giữ shared business/UI flow và release cadence chung |
| Multi-environment runtime | 7 flavors qua `main*.dart` + `F.appFlavor` | Endpoint, app title, provider id, bundle/application id tách theo môi trường |
| Navigation | `auto_route` + centralized `AppRouter` + guards | Typed route tree, auth/permission gate và centralized navigation |
| Route surface | `127` routed pages theo KG baseline | HLD dùng routed surface, không dùng raw `_page.dart` file count |
| State management | `flutter_bloc` / Cubit | Repo hiện có `120` cubit files trong `lib/ui` |
| Common lifecycle shell | `BasePage` / `BaseCubit` / `BaseState` | Chuẩn hóa loading / error / processing / retry |
| Shell ownership split | `AppCubit`, `MainCubit`, `ProfileCubit`, `PolicyFirstCubit` | Tránh god-object cho toàn bộ shell/runtime state |
| Mandatory boot gates | force-update, `firstLoginChallenge`, `tcConfirmed` | User không được vào main shell nếu chưa qua đủ gate |
| Dependency injection | `get_it` + `injectable` | Wiring tập trung, singleton lifecycle rõ |
| Backend communication | **GraphQL-primary** qua `GraphQLService` và `GraphQLSSOService` | GraphQL là transport chính cho business/auth flow |
| REST exception policy | `ApiService` cho upload/export/non-GraphQL helper endpoints | REST tồn tại có kiểm soát; không là baseline ngang hàng với GraphQL |
| Token refresh | Tập trung trong `GraphQLServiceBase` | Tránh duplicate refresh logic giữa feature modules |
| Feature flags | GraphQL fetch -> `.ff_cache` -> asset fallback | App vẫn boot được với feature defaults khi API lỗi/chưa sẵn sàng |
| Payment gate | `KEY_PAYMENT_QR` + `KEY_SUPPORTED_PAYMENT_QR` | Chỉ mở QR/card payment khi backend toggle và app version cho phép |
| Runtime APIs produced | WebView channels, deep-link callbacks, MethodChannels | Đây là boundary interfaces chính thức của mobile |
| Runtime event plane | provider callbacks + local notification replay + `GlobalEvent` streams | Không phải durable Kafka plane; cần governance như runtime contract |
| Push/call runtime | Firebase Messaging + APNs/PushKit/CallKit + CometChat managers | Required cho foreground/background/terminated/lock-screen flow |
| Product boundary | App Garage là mobile operational channel, không phải desktop parity target | Bám PRD: Web-full, App-focused |
| Local persistence | `SharedPreferences` + Hive cache + feature-flag file cache | Chưa có local DB domain/offline sync trong baseline hiện tại |

## 4. Dependencies

### 4.1 Inbound

| Caller / source | Type | Purpose |
|---|---|---|
| Garage staff / internal mobile users | Mobile UI interaction | Sử dụng các luồng nghiệp vụ và thao tác nhanh của App Garage |
| Firebase / APNs / PushKit / CallKit | Push/call delivery | Notification, wake-up, incoming-call payload, lock-screen actions |
| CometChat Cloud | SDK runtime callback | Chat/call events, unread count sync, active conversation/call lifecycle |
| Payment/auth WebView pages | JS + URL callback | Trả payment/auth result về app qua `FlutterChannel` / `PaymentChannel` / `AuthChannel` và redirect callback |
| OS notification center | Local notification launch replay | Rehydrate tap payload ở terminated state |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `F.graphQLUrl` | GraphQL HTTPS | Business data: home, notification, quotation, ordering, booking, inventory, service order, settlement, customer, supplier, vehicle management, OCR |
| `F.graphQLSSOUrl` | GraphQL HTTPS | Login, logout, refresh token, forgot/change password, permission/session-related data, save device token |
| `F.apiUrl` | REST HTTPS | Export PDF/image và helper endpoint gắn với Garage API |
| `F.apiUrlNoAuth` | REST HTTPS | Upload/helper endpoint không đi qua GraphQL auth flow |
| payment gateway pages | WebView HTTPS | Credit-card / online payment flow cho purchase request / order |
| feedback web portal | WebView HTTPS | Survey/feedback form theo tenant subdomain |
| Firebase Core / Messaging / Crashlytics / Remote Config | SDK | Bootstrap, push, crash reporting, force update |
| CometChat Cloud | SDK + network | Chat message, unread count, call session, push token registration |
| Apple APNs / PushKit / CallKit | iOS native capability | Push receive, VoIP receive, incoming-call UI |
| Android notification / call intent stack | Android native capability | Full-screen incoming call, accept/decline/end, lock-screen behavior |
| App Store / Google Play | Distribution plane | Release delivery và force-update handoff |

## 5. Boundary Interfaces

### 5.1 Consumed API surfaces

| Surface | Type | Role |
|---|---|---|
| `agg-garage-graph` | GraphQL | Business data cho home, notifications, quotation, ordering, booking, inventory, service order, settlement, customer, supplier, vehicle management, OCR |
| `agg-sso-graph` | GraphQL | Auth/session, forgot/change password, permission/session data |
| `garage-rest-export-api` | REST | Export PDF/image service orders, settlements |
| `garage-rest-upload-helper` | REST | Upload/helper endpoint bounded exception |
| payment gateway pages | WebView | Credit-card / online payment |
| feedback web portal | WebView | Survey/feedback form theo subdomain |
| Firebase | SDK | Messaging, Remote Config, Crashlytics, Analytics |
| CometChat | SDK | Realtime chat, unread count, audio/video call, push token registration |
| APNs / PushKit / CallKit | Native runtime | iOS notification + VoIP + incoming-call UX |

### 5.2 Produced runtime APIs

| Surface | Type | Role |
|---|---|---|
| `FlutterChannel`, `PaymentChannel`, `AuthChannel` | JavaScriptChannel | Nhận callback/message từ payment/auth WebView pages |
| `app://*`, `payment/ipn`, `oauth/*`, `auth/*` | Deep-link / URL intercept | Xử lý redirect/payment result trong `CreditCardPaymentPage` |
| `com.cometchat.sampleapp` | Android MethodChannel | `get_initial_call_intent`, lock-screen/call actions, `saveAppSettings`, `getAppInfo` |
| `com.cometchat.sampleapp.flutter.ios` | iOS MethodChannel | Native call accept/end bridge từ CallKit/AppDelegate |
| `app.documents.channel` | MethodChannel | `saveFileToDownloads` / `exportFileToFilesApp` cho export/download |

### 5.3 Runtime event surfaces

**Produced runtime events:**

- `PushTokenRegistrationRequested`
- `LocalNotificationDisplayed`
- `IncomingCallUiRequested`
- `NotificationReadAcknowledged`
- `ConversationRefreshRequested`
- `PurchaseRequestRefreshRequested`

**Consumed runtime events:**

- `FirebaseMessageReceived`
- `LocalNotificationLaunchReplay`
- `VoipPushWakeup`
- `CometChatCallOrMessageEvent`
- `PaymentWebViewCallback`

Note:

- Đây là runtime contracts qua provider SDK, local notification plugin, WebView callback và in-memory stream.
- Không được diễn giải chúng như durable backend event plane.

## 6. Data Ownership (client-side only)

App **không own server DB**. Dữ liệu lưu cục bộ hiện tại chỉ phục vụ session, cache và runtime bootstrap.

### 6.1 Client-side snapshots / value objects

| Snapshot | Description |
|---|---|
| `SessionState` | access token, id token, refresh token, identifier, device id, CometChat token, subdomain, auth-adjacent bootstrap state |
| `TenantContextSnapshot` | `BusinessInfoResponse` + `tcConfirmed` để quyết định policy-first routing và tenant runtime context |
| `PermissionSnapshot` | Kết quả `policyClientGetPermissions` cho `PermissionGuard`, `Widget.withPermission`, action-level checks |
| `FeatureFlagSnapshot` | Feature flags từ GraphQL + `.ff_cache` fallback |
| `PaymentFeatureGateSnapshot` | `KEY_PAYMENT_QR` + `KEY_SUPPORTED_PAYMENT_QR` cho QR/card payment UX |
| `DashboardSnapshot` | `StatsData`, `SpendingOverview`, `SpendingChart`, `DashboardRealtime` |
| `NotificationCallBootstrapState` | persisted firebase payload + `SessionId` / `callType` + local launch hints |
| `VehicleRecognitionDraft` | resized image + `attachmentUrl` + OCR payload |
| `PaymentWebViewSession` | `paymentUrl` + URL callback + JS channel messages |

### 6.2 SharedPreferences

Current implementation đang persist hoặc truy cập các key/state chính:

- `KEY_AUTH_TOKEN`
- `KEY_REFRESH_TOKEN`
- `KEY_ID_TOKEN`
- `KEY_IDENTIFIER`
- `KEY_DEVICE_TOKEN`
- `KEY_COMET_TOKEN`
- `PROFILE`
- `KEY_PERMISSIONS`
- `SUB_DOMAIN`
- `TC_AUTH`
- `KEY_PAYMENT_QR`
- `KEY_SUPPORTED_PAYMENT_QR`
- last firebase payload (`firebase`)
- call bootstrap hints như `SessionId`, `callType`
- first-login challenge hint từ auth flow

Ghi chú:

- `KEY_DEVICE_TOKEN` đang gắn với device registration state backend/CometChat bootstrap, không phải durable source of truth cho raw FCM token.

### 6.3 File / cache

- `HiveStore` cho GraphQL cache.
- `.ff_cache` trong `ApplicationSupportDirectory` cho feature flags.

### 6.4 Important note

- Repo hiện tại **chưa dùng secure storage** cho auth/session tokens.
- Đây là implementation reality của repo hiện tại và nên được coi là **security hardening gap** nếu muốn nâng chuẩn bảo mật sau này.

### 6.5 Never persist

- Raw PAN / CVV / card secret
- Raw biometric data
- Raw password / OTP / JWT for debug/log payload replay
- Durable business source-of-truth cho booking, service order, inventory, settlement, purchase

## 7. Architecture Invariants

| Invariant | Enforcement point |
|---|---|
| Business/auth/session flow mới phải bám baseline GraphQL-primary; REST chỉ là bounded exception | `GraphQLServiceBase` + `GraphQLService` + `GraphQLSSOService` + `ApiService` + repository layer |
| `401`/Unauthorized phải đi qua refresh-token flow tập trung | `GraphQLServiceBase._handleGraphQLResponse + _refreshOrWait()` |
| Permission-gated route/widget/action phải bám `PermissionSnapshot` | `PermissionGuard` + permission widgets + backend auth |
| V1/V3 flow selection và module visibility phải resolve bằng feature flags runtime | `AppFeatureFlag` + resolver/widgets theo module |
| QR/card payment chỉ được expose khi gate backend + min version cho phép; payment success chỉ được xác nhận từ callback | `MainCubit.getEnablePaymentMethodMobile` + `CreditCardPaymentPage` |
| OCR không được coi local-only source of truth; app phải upload rồi dùng backend OCR response | `VehicleInfoRecognizerCubit` + media repository |
| Mobile là online-first; offline mutation/local domain DB không thuộc baseline | connectivity guard + repository/GraphQL execution path |
| Feature page không gọi trực tiếp native push/call APIs; phải đi qua managers/bridges tập trung | `FirebaseNotificationManager`, `ApnsNotificationManager`, `VoipNotificationManager`, MethodChannel wrappers |
| User không được vào luồng vận hành nếu chưa qua đủ `force-update`, `firstLoginChallenge`, `tcConfirmed` | `AppVersionManager`, auth/profile repositories, `LoginCubit`, `PolicyFirstCubit`, `AppCubit` |
| Module mới trên mobile phải chứng minh phone-context value; không lấy desktop parity làm baseline | PRD/HLD review + architecture review |

## 8. Quality Attributes

| Attribute | Current mechanism / expectation |
|---|---|
| Availability | `AuthGuard` + centralized refresh-token flow + logout fallback khi refresh fail |
| Observability | Firebase Crashlytics, app logger, GraphQL debug overlay |
| Configurability | flavor-based config + Remote Config + feature flags |
| UX consistency | portrait-first layout, shared `BasePage` lifecycle, centralized routing |
| Notification reliability | Firebase/APNs + local notification bootstrap + `LocalNotificationLaunchReplay` từ SharedPreferences |
| Call reliability | native lock-screen / background / terminated-state handling trên cả Android và iOS; dedup theo `sessionId` |
| Runtime interface stability | WebView channels, deep-link callbacks, MethodChannels và `GlobalEvent` streams được coi là explicit contracts |
| Security posture | permission UX ở client; auth/authorization authority vẫn thuộc backend; local token storage hiện là hardening gap |
| Performance posture | GraphQL documents per domain + repo layer + cache; chưa có offline-sync complexity |
| Product fit | app tập trung vào mobile-context flow thay vì desktop parity |

## 9. Forbidden Actions

- Do not introduce routing stack mới song song với `auto_route`.
- Do not introduce state-management stack mới song song với Cubit cho feature mới nếu chưa có ADR supersede.
- Do not bypass `GraphQLService` / `GraphQLSSOService` cho business flow mới; REST chỉ được dùng cho upload/export/non-GraphQL helper có lý do rõ.
- Do not hardcode environment URL, provider ID hoặc bundle/app id ngoài `flavors.dart` và platform flavor config.
- Do not gọi trực tiếp platform push/call APIs từ feature page; phải đi qua managers / native bridge hiện có.
- Do not bypass `force-update`, `firstLoginChallenge` hoặc `tcConfirmed` rồi cho user vào main shell.
- Do not đánh dấu payment success bằng local optimism; phải chờ callback URL hoặc JS channel response.
- Do not thêm JavaScript channel, deep-link callback hoặc MethodChannel mới mà không update HLD/ADR/integration-contract.
- Do not dùng `GlobalEvent` stream như durable backend event contract.
- Do not persist payment secrets, raw biometric data, raw password/OTP/JWT hoặc business source-of-truth vào local storage.
- Do not introduce local DB domain/offline-sync mà không có ADR/HLD riêng.
- Do not coi client-side permission guard là authorization enforcement cuối cùng.
- Do not refactor notification/call layer theo cách làm hỏng foreground/background/terminated/lock-screen flow.

## 10. Current Feature Surface (repo evidence)

Các module lớn hiện có trong repo:

| Domain / module | Evidence in `lib/ui` |
|---|---|
| App shell / account / policy / profile / QR | `ui/main/**` |
| Auth / forgot password / change password | `ui/auth/**`, `ui/login/**`, `ui/change_user_password/**` |
| Chat / call | `ui/comet_chat/**` |
| Notifications | `ui/notification/**` |
| Quotation / request quote | `ui/quotation/**` |
| Ordering / PO / cart / order detail / payment | `ui/ordering/**` |
| Booking | `ui/booking/**` |
| Service order V1 / V3 | `ui/service_order/**`, `ui/service_order_v3/**` |
| Customer / supplier / product / inventory | `ui/customer/**`, `ui/supplier/**`, `ui/product/**`, `ui/inventory/**` |
| Employee / employee accounts / HR | `ui/human_resource/**`, `ui/employee_accounts/**` |
| Settlement | `ui/settlement/**` |
| Vehicle management / OCR | `ui/vehicle_management/**`, `ui/vehicle_info_recognizer/**` |

Scale evidence:

- `127` routed pages theo knowledge graph/router baseline
- `120` cubit files trong `lib/ui`
- `24` GraphQL document files trong `lib/core/services/graphql/documents`

## 11. Insurance Settlement (DESIGN — EP-INSURANCE-SETTLEMENT)

> Wave W01 slice 1/3 — Flutter equivalent của insurance allocation + phiếu QT BH detail. Canonical scope: `Execution/work-packages/PKG-W01-insurance-foundation.md §2.2 garage-mobile`. Mobile (Flutter) đã dùng bottom sheet native — **không** trong scope V3 web. Cross-ref: ADR-014, `INTEG-MOB-garage-mobile-agg-garage-graph.md §3.4`, `UX-FLOW-INSURANCE-SETTLEMENT.md`.

### 11.1 SO Insurance Allocation

- `InsuranceAllocationBottomSheet` — mở từ **SO Edit + SO Detail** screen, **KHÔNG** từ SO Create (AC-0 / BR-INS-SO-PS-006). Toggle "Bảo hiểm = Có" + chọn DN BH/HĐ/SĐT giám định vẫn hiển thị ở Create (PKG-W01 v8); chỉ panel 5 khoản phân bổ giới hạn Edit/Detail.
- `InsuranceAllocationCubit` (BLoC) quản lý state 5 trường + realtime preview "BH thanh toán" / "KH thanh toán" / "Tổng".
- UI: `SegmentedButton` toggle "%" / "Số tiền" cho 3 trường (CK liên kết VT, CK liên kết CDV, Giảm trừ bồi thường); `TextField` (keyboard number) cho Khấu trừ BH; `TextField` % per dòng phụ tùng cho Khấu hao (trong list line item).
- Validation: % range 0-100, số tiền non-negative — error inline.
- Offline: SO save với allocation cần network online (KHÔNG offline-first — match web); snackbar khi mất kết nối.

### 11.2 Insurance Settlement Detail

- `InsuranceSettlementDetailScreen` — `DefaultTabController` 4 tab (Chi phí + panel "Tổng giá dịch vụ" / Hồ sơ BH / Chứng từ / Lịch sử thanh toán) + `AppBar` header (mã phiếu + back + action) + section "Thông tin quyết toán" (Card) + section KH/Xe (Card).
- Nút "+ Tạo hồ sơ bảo hiểm" trong AppBar action menu — `disabled` (greyed) với SnackBar khi tap: "Tính năng sẽ available ở Wave 2".

### 11.3 Transport & Invariants

- GraphQL operations qua `graphql_flutter`; auth + tenant context (X-Tenant-Id, X-Branch-Id, Authorization) propagate qua `Link` interceptor — share cùng GraphQL schema với garage-web (1 source từ agg-garage-graph, không double work BFF).
- KHÔNG tự tính `insurancePayableAmount` ở client — nhận từ backend snapshot (BR-GF-ACCOUNTING-006).

## 11b. Inventory V2 — Mobile Hub + Opening Balance (DESIGN — W04, FEAT-INV-MOBILE-MENU + FEAT-OB-LIST view-only)

> W04 scope: (a) **FEAT-INV-MOBILE-MENU** mobile-only navigation hub tile grid; (b) **FEAT-OB-LIST view-only** danh sách tồn đầu kỳ mobile. Full CRUD OB (import/edit/delete) NOT mobile — web-only per UX-FLOW-INVENTORY-OPENING-BALANCE §29 "App Garage chỉ XEM". Backend contract: same as web (`gf-inventory /api/v2/opening-balances/search` W04-1 via BFF `searchOpeningBalances`). Cross-ref: `INTEG-MOB-garage-mobile-agg-garage-graph.md §3.4b`.

### 11b.1 Mobile Hub "Quản lý kho hàng" (FEAT-INV-MOBILE-MENU)

- **Pure client-side navigation** — zero GraphQL / REST call cho hub itself.
- Screen render: `AppBar` "Quản lý kho hàng" (verbatim Figma per FEAT-INV-MOBILE-MENU AC-2) + GridView 2-col tiles.
- **State matrix W04** (from FEAT-INV-MOBILE-MENU §3 v2): 3 tiles visible — "Sản phẩm" (W03 view-only) + "Nhóm vật tư" (W03 full CRUD) + **"Tồn đầu kỳ" (W04 view-only)**. 3 tiles hidden ("Phiếu nhập"/"Phiếu xuất"/"Tồn kho") per AC-4 hide-only strategy.
- **Tile-tap** → push route to sub-FEAT list screen; back stack preserved (AC-5). Debounce 300ms per AC-EC-3.
- `InventoryHubCubit` (BLoC) — client-only state; tile state matrix hard-coded per app version (upgrade wave adds tile via app release).
- Permission gate at route destination (per AC-6 + BR-INV-MENU-003 — no filter at hub); dual persona see identical grid.
- **Entry point** (BA/PO chốt tại FEAT-INV-MOBILE-MENU AC-1 v3): **mission tile "Quản lý kho hàng"** trong **grid mission tile màn Home (Sảnh chính)** — tap tile → push `InventoryHubRoute`, back về Home + preserve back stack. Khớp code W03 đã ship (`mission_function_widget.dart:107-110`). KHÔNG dùng drawer, KHÔNG dùng bottom-nav tab — pattern nhất quán với các module mission-driven khác trong V1.

### 11b.2 Opening Balance view-only (FEAT-OB-LIST mobile)

- Route: mobile OB list screen (linked from hub tile "Tồn đầu kỳ").
- `InventoryRepository` add ops: `searchOpeningBalances(input)` — call GraphQL query `searchOpeningBalances(input: {warehouseId?, importedFrom?, importedTo?, page, size})`.
- Screen elements: `AppBar` **"Tồn đầu kỳ"** (verbatim Figma node `21290:52697`) + back + **search icon** + filter icon; `SliverList` of `OpeningBalanceCard` (card layout mobile-first per Figma FEAT-OB-LIST section `21290:55831` — main list screen `21290:52697` w/ 5 field rows: `productCode` header + `productName` + `warehouseName` + `asOfDate` + `quantityOnHand` + `valueOnHand` + **`mainUnitName`** — BFF enrichment per agg-garage-graph-graphql v7.50 §3g.1, nullable fallback to `mainUnitCode` khi enrichment miss); footer sticky "Tổng" (dòng aggregate); infinite-scroll pagination (`page` + `hasNextPage` client compute from `totalPages`).
- **Search flow** (mobile v1 in-scope per Figma canonical `21290:52992` "Tìm kiếm sản phẩm - Default" + Results + No Results states): tap Search icon AppBar → push dedicated search screen (AppBar back + full-width `TextField` placeholder "Tìm kiếm", body hint `"Tìm kiếm sản phẩm theo từ khoá"` với 2 bullet `Mã sản phẩm` / `Tên sản phẩm`); submit keyword → call `searchOpeningBalances(input: { keyword, ...activeFilters, page: 0, size: 20 })`; results render list layout giống `OpeningBalanceCard`; empty-state screen `Không có kết quả phù hợp` khi `totalElements == 0`. `keyword` field maps SDL `OpeningBalanceSearchInput.keyword: String` (BE LIKE search theo `productCode` OR `productName` denormalized snapshot). Debounce user input ≥ 300ms trước khi fire query.
- Filter bottom-sheet: **title "Bộ lọc"** (verbatim Figma nodes `21290:54167` Default + `21290:54179` Filled) — chỉ **2 filter**: (a) **Ngày Import** date-picker range `dd/mm/yyyy - dd/mm/yyyy` → SDL `importedFrom` + `importedTo`; (b) **Kho** dropdown `"Chọn kho"` → SDL `warehouseId`. Footer buttons: `[Thiết lập lại]` (secondary) + `[Áp dụng]` (primary). Reset = clear values về default, KHÔNG apply (giữ sheet mở). Apply = close sheet + reset list page 0 + fetch. Search + filter độc lập nhưng có thể combine (search screen giữ activeFilters current, submit gọi `searchOpeningBalances` với đầy đủ `input`).
- **Kho dropdown — paginated + preserve selection** (mới, BA quannn chốt 2026-07-08): dropdown call GraphQL `searchWarehouses(input: WarehouseSearchRequest)` per agg-garage-graph-graphql op #305 với `size=20` default + **load more pattern**. Response `PagedApiResponseWarehouseResponse.data.content` + `pageInfo.hasNext`. **Preserve selection logic** khi user quay lại filter đã có selection trước: (i) load page 0 mặc định + hiển thị **header/badge "Đang chọn: {warehouseName}"** ở top dropdown nếu selected item không nằm trong 20 item đầu; (ii) khi user scroll load more đến page chứa selected item → item render check-mark/highlight "selected" state đúng logic (không double-render). Alternative pattern (BA/UX chốt approach cụ thể nếu cần refine): prefetch page chứa selected item HOẶC "sticky" selected item ở top. Selection state persist trong bottom-sheet lifecycle (user đóng sheet chưa Áp dụng → reopen giữ nguyên selection).
- **NO import/edit/delete UI** on mobile — remove any AppBar action / row swipe / long-press action.
- **AP interaction implicit**: mobile view-only KHÔNG trigger lock-check (view chỉ đọc). AP W04 out of scope mobile (per UX-FLOW-INVENTORY-ACCOUNTING-PERIOD §31 web-only).

### 11b.3 Transport & Invariants

- GraphQL via `graphql_flutter` (shared với web); auth + tenant context propagate via `Link` interceptor.
- KHÔNG persist OB data locally — mobile online-first per §6.4 "Never persist".
- Component reuse-first (per PKG-W04 §DEV Playbook step 1): reuse existing list/card/filter/date-picker widgets; NO new component unless inventory thiếu + BR-registered.

### 11b.4 Performance & Scale — Mobile Hub + OB View-Only (W04)

> Scoped to §11b W04 additions only (Mobile Hub `FEAT-INV-MOBILE-MENU` + OB view-only `FEAT-OB-LIST` mobile). §8 Quality Attributes remain the baseline for other features.

1. **Expected load** — **Mobile Hub `FEAT-INV-MOBILE-MENU` is zero-backend-impact**: hub screen is pure client-side navigation (per §11b.1 explicit), renders tile grid from client-side state matrix, no GraphQL/REST call. Tap tile → route push only. Hub load target: ≤ 50ms render on mid-range Android device (Flutter frame budget); tile-tap → next-screen navigation ≤ 100ms (route push + subsequent lazy-load). **OB view-only list**: expected ≤ 5 opens/tenant/day (mobile is not primary OB review surface — web-first per UX-FLOW §29); p95 first-page render ≤ 500ms cold (network fetch + card layout), ≤ 200ms warm (revisit from back-stack).
2. **Pagination strategy** — **Infinite-scroll** for mobile OB list (contrast web offset-paging per garage-web-HLD §8b.2 — mobile UX standard). Default `size=20` per page (matches BE default per gf-inventory §6b.2, keeps parity with web); trigger threshold: fetch next page when scroll position hits **75% of current list length** (leaves buffer to hide network latency); loading indicator at list bottom while fetching; hasNextPage computed as `page + 1 < totalPages` from `PagedOpeningBalanceData` response. First-load empty state = card `"Chưa có tồn đầu kỳ"` (no CTA — view-only per UX-FLOW §29). Filter bottom-sheet apply → reset list to page 0 + scroll top.
3. **Index list** — **N/A** at Flutter client (no DB, no persistence per §6 "Never persist"). Filter fields used at UI (`warehouseId`, `importedFrom`/`importedTo`) align with tenant-prefixed indexes in gf-inventory §6b.3 (`idx_ob_tenant_warehouse_asof`) — client only needs to know these combinations are supported.
4. **Cache strategy** — **In-memory cubit cache only, no disk persistence** for OB list. `InventoryRepository` OB ops cache last-fetched page in Cubit state for back-navigation warm-return (session lifetime only). No `Hive` / `SharedPreferences` persistence for OB rows (per §6.5 "Never persist" — OB contains sensitive stock/value figures + always-fresh audit workflow). Cubit state cleared on: (a) explicit filter change, (b) app resume after `> 5min` background (staleness invalidation), (c) logout/tenant switch. Contrast: catalog v2 mobile flat-card list (per INTEG-MOB v6 R12) uses same pattern — mobile client caching is deliberately shallow. **Mobile Hub tile visibility state matrix** IS a client-side constant (hard-coded per app version) — not a cache; upgrade wave requires app release (per FEAT-INV-MOBILE-MENU AC-4 hide-only).
5. **N+1 avoidance** — **N/A specifically for OB view-only** because the list endpoint returns fully-denormalized rows (`productName`, `warehouseName`, `mainUnitCode` snapshot per gf-inventory §6b.5 + data-model §4b.2). `OpeningBalanceCard` renders directly from response — no per-row lookup. **Mobile Hub also N+1-safe** — pure client-side, zero downstream call, cannot generate N+1 by construction.
6. **Tenant fairness** — Mobile is single-user per session (each user scoped to 1 tenant via JWT); client-side per-tenant throttle is unnecessary (server-side gf-inventory Redisson lock + circuit breaker per gf-inventory §6b.6 own cross-user coordination). **Mobile Hub cannot amplify load** — zero backend interaction guarantees zero contribution to tenant-level quota. OB list requests are rate-bounded by user scroll speed (≤ 1 page-fetch per ~2s user action); no burst risk. Retry policy for `searchOpeningBalances` on network error = exponential backoff 3-attempt (matches existing `InventoryRepository` legacy behavior — no W04-specific override).

## 12. References

- Product:
  - [PRD-GARAGE.md](../../Product/PRD-GARAGE.md)
  - [BUSINESS-RULES.md](../../Product/BUSINESS-RULES.md)
- Architecture:
  - [TECHSTACK.md](../TECHSTACK.md)
  - [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
  - [ADR-002-graphql-aggregator-pattern.md](../decisions/ADR-002-graphql-aggregator-pattern.md)
  - [ADR-010-feature-flags-governance.md](../decisions/ADR-010-feature-flags-governance.md)
  - [ADR-011-mobile-decisions.md](../decisions/ADR-011-garage-mobile-decisions.md)
  - [ADR-012-garage-web-frontend-architecture.md](../decisions/ADR-012-garage-web-frontend-architecture.md)
  - [INTEG-MOB-garage-mobile-agg-garage-graph.md](../integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md)
  - [INTEG-MOB-garage-mobile-agg-sso-graph.md](../integrations/INTEG-MOB-garage-mobile-agg-sso-graph.md)
  - [garage-mobile-events.md](../events/garage-mobile-events.md)
  - [garage-mobile.knowledge-graph.yaml](../../Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml)
- Implementation evidence:
  - `../../../pubspec.yaml`
  - `../../../lib/start.dart`
  - `../../../lib/flavors.dart`
  - `../../../lib/injection_container.dart`
  - `../../../lib/app/app.dart`
  - `../../../lib/app/app_cubit.dart`
  - `../../../lib/core/router/router.dart`
  - `../../../lib/core/router/auth_guard.dart`
  - `../../../lib/core/router/permission_guard.dart`
  - `../../../lib/core/common/bases/bloc/base_page.dart`
  - `../../../lib/core/services/graphql/graphql_service_base.dart`
  - `../../../lib/core/services/graphql/graphql_service.dart`
  - `../../../lib/core/services/graphql/graphql_sso_service.dart`
  - `../../../lib/core/services/api_service.dart`
  - `../../../lib/core/services/api_util.dart`
  - `../../../lib/core/repositories/base_repository.dart`
  - `../../../lib/core/repositories/auth/auth_repository.dart`
  - `../../../lib/core/repositories/profile/profile_repository.dart`
  - `../../../lib/core/repositories/media/media_repository_impl.dart`
  - `../../../lib/core/local_storage/share_preferences.dart`
  - `../../../lib/core/feature_flag/app_feature_flag.dart`
  - `../../../lib/core/global/global_event.dart`
  - `../../../lib/core/managers/versions/app_version_manager.dart`
  - `../../../lib/core/managers/notifications/firebase_notification_manager.dart`
  - `../../../lib/core/managers/notifications/apns_notification_manager.dart`
  - `../../../lib/core/managers/notifications/voip_notification_manager.dart`
  - `../../../lib/core/managers/comet_chat/comet_chat_manager.dart`
  - `../../../lib/core/services/file/file_exporter.dart`
  - `../../../lib/ui/main/main_page.dart`
  - `../../../lib/ui/main/bloc/main_cubit.dart`
  - `../../../lib/ui/main/bloc/profile_cubit.dart`
  - `../../../lib/ui/main/policy/policy_first/policy_first_cubit.dart`
  - `../../../lib/ui/auth/login/login_cubit.dart`
  - `../../../lib/ui/ordering/credit_card_payment/credit_card_payment_page.dart`
  - `../../../ios/Runner/AppDelegate.swift`
  - `../../../android/app/src/main/AndroidManifest.xml`
  - `../../../android/app/src/main/kotlin/com/example/cardoctor_garage_v3/MainActivity.kt`

## Change Log

| Date | Version | Summary |
|---|---:|---|
| 2026-05-03 | 1 | Initial placeholder HLD for future Pulse mobile |
| 2026-05-05 | 2 | Rewrote HLD to reflect actual Flutter mobile implementation instead of old Pulse placeholder |
| 2026-05-07 | 3 | Aligned HLD with ADR-011: GraphQL-primary transport, controlled REST exceptions, native push/call baseline, and App Garage product boundary |
| 2026-05-12 | 4 | Synced HLD with `garage-mobile` knowledge graph: added boundary interfaces, runtime event surfaces, client-side snapshots, architecture invariants, explicit boot gates (`force-update`, `firstLoginChallenge`, `tcConfirmed`) and corrected scale baseline (`127` routed pages / `120` cubits / `24` GraphQL documents). |
| 2026-06-02 | 5 | Add §11 Insurance Settlement (EP-INSURANCE-SETTLEMENT W01): `InsuranceAllocationBottomSheet` (SO Edit/Detail-only, AC-0) + `InsuranceAllocationCubit` realtime preview + SegmentedButton %/amount toggles; `InsuranceSettlementDetailScreen` 4-tab + disabled "Tạo hồ sơ BH" (W02); graphql_flutter transport + no client-side payable calc. Renumber References §11→§12. (frontmatter version 3→5 — sync với changelog v4 đã có). |
| 2026-07-06 | 6 | **W04 — Add §11b Inventory V2 Mobile Hub + Opening Balance view-only**. (a) **FEAT-INV-MOBILE-MENU** — pure client-side hub screen "Quản lý kho hàng" (AppBar verbatim Figma) + GridView 2-col tiles, state matrix per FEAT §3 v2 renders 3 tiles W04 (Sản phẩm view-only + Nhóm vật tư full CRUD + Tồn đầu kỳ view-only); 3 remaining tiles hidden per AC-4 hide-only strategy. Zero GraphQL/REST call; tile-tap push route with back-stack preserve; `InventoryHubCubit` client-only. Permission gate at destination. Entry-point (drawer / bottom-nav / màn chính) NEED CONFIRMATION — default drawer per V1 pattern. (b) **FEAT-OB-LIST view-only** — mobile OB list screen consumes `searchOpeningBalances` only (per UX-FLOW §29 "App Garage chỉ XEM"); `OpeningBalanceCard` layout mobile-first per Figma node `21632:28894`; footer sticky "Tổng"; infinite-scroll pagination; filter bottom-sheet Kho + Ngày Import range. NO import/edit/delete UI on mobile. AP interaction implicit KHÔNG (view-only zero write-path). GraphQL via `graphql_flutter` shared với web. Component reuse-first per PKG-W04 DEV Playbook step 1. v5 → v6. |
| 2026-07-06 | 7 | **W04 fix — add missing §11b.4 Performance & Scale section (main-agent post-hoc verification catch)**. v6 §11b.2 mentioned infinite-scroll pagination pattern and §11b.3 mentioned "KHÔNG persist" but did not group perf items under a named "Performance & Scale" heading — Reviewer G12 shape gate requires a named section covering ≥5/6 items. Add §11b.4 covering all 6 items scoped to Mobile Hub + OB view-only: (1) expected load — **Mobile Hub explicitly stated as zero-backend-impact**; hub render ≤50ms, OB list ≤5 opens/tenant/day, p95 first-page ≤500ms cold; (2) infinite-scroll — 75% scroll threshold, `size=20` default parity with BE, empty state card, filter-apply resets page 0; (3) index list — **N/A** Flutter client; filter fields align with gf-inventory §6b.3 tenant-prefixed indexes; (4) cache — cubit in-memory only, no Hive/SharedPreferences persistence (audit freshness + sensitive stock/value data), staleness invalidation `> 5min` background, cleared on filter/logout; Hub state matrix explicitly not a cache (app-version constant); (5) N+1 — **N/A** denormalized backend response + Hub inherently safe; (6) tenant fairness — single-user session obviates client-side throttle; Hub cannot amplify (zero backend); OB list rate-bounded by user scroll ~1 page/2s; retry policy inherits legacy `InventoryRepository` 3-attempt exponential. No other file touched. v6 → v7. |
| 2026-07-06 | 8 | **W04 Q1 fix — BA/PO chốt entry-point mobile hub tại FEAT-INV-MOBILE-MENU AC-1 v3 (2026-07-06)**. Đóng câu hỏi Q1 cuối cùng từ `Tracking/ARCH-REVIEW-W04.md` audit độc lập. Entry point chốt là **mission tile "Quản lý kho hàng"** trong grid mission tile màn Home (Sảnh chính) — KHÔNG dùng drawer, KHÔNG dùng bottom-nav tab. Khớp code W03 đã ship (`mission_function_widget.dart:107-110`). Sửa 1 bullet trong §11b.1: gỡ hoàn toàn wording "NEED CONFIRMATION: entry-point-to-hub — currently open ... Default assumption: drawer menu item aligns với existing V1 pattern" (đã sai kép: Product chốt mission tile Home không phải drawer; `pubspec.yaml:66` V1 dùng `persistent_bottom_nav_bar` không phải drawer). Thay bằng bullet chốt entry point với evidence code W03. Không đụng Product docs (BA đã tự update FEAT-INV-MOBILE-MENU AC-1). Không đụng file khác. v7 → v8. |
| 2026-07-08 | 9 | **W04 gap fix — §11b.2 add Search flow (mobile v1 in-scope per Figma canonical) + expand card field enumeration + fix node reference**. Cross-check Figma section `FEAT-OB` (`21290:55831`) phát hiện: (a) canonical FEAT-OB-LIST screen chính là `21290:52697` "Tồn đầu kỳ đã import" (không phải section cha `21632:28894` như v6 dẫn), 5 field rows (`warehouseName` + `asOfDate` "Tồn đến ngày" + `quantityOnHand` + `valueOnHand` + `mainUnitCode`); (b) FEAT-OB section chứa **3 state Search screen dedicated** (`21290:52992` Default + Results + `21290:53004` No Results) + Search icon 🔍 hiển thị trên AppBar canonical → **Search là in-scope W04 mobile**, mâu thuẫn wording v6 "no keyword search on mobile v1 (defer to gesture-search bar future)". Sửa §11b.2 dòng screen elements: (1) đổi node ref `21632:28894` → `21290:52697`; (2) enumerate 5 field rows để tránh miss field khi DEV; (3) chốt AppBar title **"Tồn đầu kỳ"** (user đã báo designer rename Figma node `21290:52697` bỏ hậu tố "đã import" — pending Figma rename; HLD align title final); (4) add Search icon vào AppBar element list; add bullet mới **Search flow** mô tả tap Search icon → push dedicated screen (AppBar + full-width TextField placeholder "Tìm kiếm", body hint "Tìm kiếm sản phẩm theo từ khoá" 2 bullet Mã sản phẩm/Tên sản phẩm) → submit → gọi `searchOpeningBalances(input.keyword)` map SDL `OpeningBalanceSearchInput.keyword` (BE LIKE search `productCode` OR `productName`), empty state screen "Không có kết quả phù hợp", debounce ≥300ms; update Filter bullet ghi rõ search + filter độc lập nhưng có thể combine. **Follow-up flag (không đụng file khác trong CR này)**: (i) `Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md §29` wording "App Garage chỉ XEM" không phân biệt search vs write — cần BA/PO confirm search read-only in-scope + có thể cần thêm 1 section mô tả search flow mobile; (ii) `Product/features/FEAT-OB-LIST.md` chưa thấy AC cho search mobile → BA/PO cần add AC "Search theo mã/tên sản phẩm mobile" khớp Figma 3 state; (iii) gap `mainUnitCode` code-vs-name vẫn treo (Figma render "Cái" name, SDL trả code "PCS") — chờ BA/PO chốt Option A (BE add `mainUnitName` denormalized) hoặc Option B (FE mapping). Không đụng: `agg-garage-graph-graphql.md` (SDL đã đủ, `keyword` field có sẵn); `gf-inventory-api.md` (W04-1 endpoint đã hỗ trợ). v8 → v9. |
| 2026-07-08 | 10 | **W04 upstream sync — Figma rename + SDL `mainUnitName` add** (đóng 2 follow-up từ v9). (a) **Figma rename verified 2026-07-08 via screenshot node `21290:52697`**: AppBar title final "Tồn đầu kỳ" (bỏ hậu tố "đã import") — designer commit rename. §11b.2 screen elements bullet gỡ note "pending Figma rename" khỏi wording "AppBar 'Tồn đầu kỳ' (verbatim Figma node `21290:52697` — designer chốt đổi title từ 'Tồn đầu kỳ đã import' → 'Tồn đầu kỳ', pending Figma rename)" → giờ ngắn gọn "AppBar 'Tồn đầu kỳ' (verbatim Figma node `21290:52697`)". Follow-up (d) v9 ĐÓNG. (b) **agg-garage-graph-graphql v7.50 add `OpeningBalanceLine.mainUnitName: String` nullable** — BFF enrichment reuse cache `fetchAllUnits()` mechanism từ catalog V2 §3d resolver (batch query gf-erp-mdm `POST /api/v1/catalog/inquiry` với `directory=UNIT`, TTL 5min shared key `UNIT::{tenantId}`, KHÔNG fan-out per-row, nullable defensive khi enrichment miss). Gap `mainUnitCode` code-vs-name (Figma render "Cái" name vs SDL trả code "PCS") ĐÓNG via Option A implementation. Sửa §11b.2 screen elements card field enumeration: 5 field rows đổi `mainUnitCode` → **`mainUnitName`** với fallback note "fallback to `mainUnitCode` khi nullable enrichment miss". Follow-up (c) v9 ĐÓNG. **Follow-up còn treo** (không đụng scope này): (i) UX-FLOW-INVENTORY-OPENING-BALANCE §29 wording clarify search in-scope + add §3.3 mobile wireframe — BA/PO fix; (ii) FEAT-OB-LIST spec add AC search mobile + platform scope markers AC-1..AC-11 + fix §3 Figma nodes reference — BA/PO fix. Không đụng: `agg-garage-graph-graphql.md` (v7.50 đã ratified upstream); `gf-inventory-api.md` (backend vẫn chỉ trả `mainUnitCode`, enrichment BFF-only không cross-boundary). v9 → v10. |
| 2026-07-08 | 11 | **W04 mobile filter — chốt 2 filter canonical + add Kho paginated behavior** (đồng bộ với `UX-FLOW-INVENTORY-OPENING-BALANCE v10 §3.3` + `FEAT-OB-LIST v8 AC-5b/AC-5c`). Đóng follow-up (i) + (ii) v10. 3 changes trong §11b.2 Filter bullet: (a) **Confirmed 2 filter Figma canonical** via screenshot node `21290:54167` (Default) + `21290:54179` (Filled) — bottom-sheet title verbatim "Bộ lọc"; 2 filter fields "Ngày Import" (date-picker range `dd/mm/yyyy - dd/mm/yyyy` → SDL `importedFrom`+`importedTo`) + "Kho" (dropdown "Chọn kho" → SDL `warehouseId`). KHÔNG có "Người import" (web-only). Designer resolved label inconsistency Ngày import vs Ngày nhập → thống nhất "Ngày Import". (b) **Fix footer buttons wording**: `[Đặt lại]` → **`[Thiết lập lại]`** verbatim Figma canonical. Add reset vs apply semantic: Reset = clear values về default nhưng KHÔNG apply (giữ sheet mở để user tuỳ chọn lại); Apply = close sheet + reset list page 0 + fetch. (c) **Add Kho dropdown paginated + preserve selection** (BA quannn chốt 2026-07-08 — new logic layer): dropdown call GraphQL `searchWarehouses(input: WarehouseSearchRequest)` per agg-garage-graph-graphql op #305 với `size=20` default + **load more pattern** (scroll cuối trang → fetch next page). Response `PagedApiResponseWarehouseResponse.data.content` + `pageInfo.hasNext`. **Preserve selection logic** khi user quay lại filter đã có selection trước: (i) selected warehouse ở page 0 → check-mark bình thường; (ii) selected warehouse ngoài page 0 (page N > 0) → mở dropdown load page 0 + hiển thị header/badge "Đang chọn: {warehouseName}" ở top; (iii) khi user load more đến page chứa item → item render check-mark/highlight "selected" đúng logic (không double-render). Alternative pattern (BA/UX chốt nếu cần refine): prefetch page chứa selected item HOẶC "sticky" selected item top. Selection state persist trong bottom-sheet lifecycle. **Không đụng**: §11b.1 Hub; §11b.2 AppBar/list/Search bullet; §11b.3 Transport; §11b.4 Performance — chỉ scope 1 bullet Filter. Backend contract impact: `searchWarehouses` op #305 đã ratified upstream — không cần đụng SDL. Priority DEV mobile: HIGH — pattern preserve-selection cần implement đúng ngay từ đầu để tránh confusion UX. v10 → v11. |
