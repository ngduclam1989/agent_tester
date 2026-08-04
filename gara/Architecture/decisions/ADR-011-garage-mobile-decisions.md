---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: garage-mobile
last_reviewed: "2026-05-12"
supersedes: "ADR-011 v2"
---

# ADR-011: Garage Mobile App Architecture Baseline — Flutter single codebase + Cubit/DI + GraphQL-primary transport + runtime boundary adapters

## Status
ACCEPTED — 2026-05-07; reviewed/expanded 2026-05-12

## Context

Repo hiện tại có một mobile app Flutter production-size cho Garage/App Garage. Sau khi đối chiếu source Flutter, Product PRD và TECHSTACK, cần chốt lại baseline mobile vì đây là runtime riêng với nhiều platform concern:

1. Mobile app có giữ một Flutter codebase dùng chung cho iOS/Android hay tách native app riêng?
2. Kiến trúc feature-level chuẩn của mobile là gì: state management, DI, routing, lifecycle shell?
3. App-to-backend transport có được chuẩn hóa hay cho phép repo drift sang nhiều kiểu gọi API song song?
4. Push/call/chat có được coi là native integration chính thức hay chỉ là incidental plugin usage?
5. Ranh giới sản phẩm giữa App Garage và Web GMS được thể hiện thế nào trong quyết định kiến trúc mobile?
6. Những runtime APIs/events mà mobile boundary tự expose ra web/native/provider context có được coi là contract kiến trúc chính thức hay không?

**Evidence từ source / docs:**

- Mobile app dùng Flutter/Dart với bootstrap tập trung ở `lib/start.dart` và nhiều entrypoint flavor `lib/main*.dart`.
- Runtime config môi trường tập trung ở `lib/flavors.dart`, gồm `dev`, `sit`, `uat`, `pt`, `stag`, `preprod`, `prod`.
- UI shell dùng `flutter_bloc`/Cubit, `BasePage`, `BaseCubit`, `BaseState`, `get_it` + `injectable`, `auto_route` và route guards.
- App shell state thực tế split qua `AppCubit`, `MainCubit`, `ProfileCubit`, `PolicyFirstCubit`; boot/runtime gate còn gồm `firstLoginChallenge`, `tcConfirmed` và force-update từ Remote Config.
- Repository baseline inject đồng thời `GraphQLService` và `GraphQLSSOService`, phản ánh 2 GraphQL gateway tách theo domain và SSO.
- GraphQL là transport chính cho business flow; REST/Dio/Retrofit vẫn tồn tại có chủ đích cho upload, export PDF/image và một số endpoint file/non-GraphQL.
- Mobile boundary consume các API/provider surface sau: `agg-garage-graph`, `agg-sso-graph`, `F.apiUrl`, `F.apiUrlNoAuth`, payment/feedback WebView pages, Firebase, CometChat, APNs/PushKit/CallKit.
- Mobile boundary cũng **produce/expose** runtime interfaces chính thức:
  - WebView JavaScript bridge: `FlutterChannel`, `PaymentChannel`, `AuthChannel`.
  - Deep-link/callback handlers: `app://*`, `payment/ipn`, `oauth/*`, `auth/*`.
  - Native MethodChannels: `com.cometchat.sampleapp`, `com.cometchat.sampleapp.flutter.ios`, `app.documents.channel`.
- Push/call flow là native-sensitive:
  - iOS dùng `PushKit`, `CallKit`, `flutter_callkit_incoming` và AppDelegate bridge.
  - Android có intent/action handling, manifest receivers/services và MainActivity logic cho incoming/accept/decline/end call flow.
  - App có `FirebaseNotificationManager`, `ApnsNotificationManager`, `VoipNotificationManager`, `CometChatManager`.
- Knowledge graph hiện tại chốt thêm các runtime event surface cần governance:
  - Produced: `PushTokenRegistrationRequested`, `LocalNotificationDisplayed`, `IncomingCallUiRequested`, `NotificationReadAcknowledged`, `ConversationRefreshRequested`, `PurchaseRequestRefreshRequested`.
  - Consumed: `FirebaseMessageReceived`, `LocalNotificationLaunchReplay`, `VoipPushWakeup`, `CometChatCallOrMessageEvent`, `PaymentWebViewCallback`.
- Runtime bootstrap/data snapshots đã thành explicit architecture vocabulary: `SessionState`, `TenantContextSnapshot`, `PermissionSnapshot`, `FeatureFlagSnapshot`, `PaymentFeatureGateSnapshot`, `DashboardSnapshot`, `NotificationCallBootstrapState`, `VehicleRecognitionDraft`, `PaymentWebViewSession`.
- Product PRD xác định **Web GMS là full business console** còn **App Garage là mobile channel cho thao tác nhanh, notification, image capture, tracking và follow-up**, không phải bề mặt thay thế toàn bộ Web.

**Constraints từ runtime:**

- Mobile app phải chạy đa môi trường và đa store/bundle/application id.
- Call/chat/notification phải hoạt động được ở foreground, background và terminated state.
- Boot flow chỉ được vào main operational shell sau khi xử lý đủ force-update gate, `firstLoginChallenge` và `tcConfirmed`.
- Team đã có codebase lớn theo Cubit/DI/document-based GraphQL pattern; cho phép drift sang nhiều pattern mới sẽ làm tăng mạnh chi phí maintain.
- WebView bridge, deep-link callback và MethodChannel surfaces có nguy cơ drift cao nếu không được coi là contract chính thức và quản trị tập trung.
- App cần online-first để tránh lệch booking, service order, inventory, settlement và notification state.

**Business rules liên quan:**

- `PRD-GARAGE.md`: Web-full, App-focused; App Garage không thay thế Web GMS.
- `BUSINESS-RULES.md`: mọi flow vẫn chịu RBAC, tenant/branch context, auditability và external integration boundary.

## Decision

**Chốt mobile app của Garage thành một Flutter codebase dùng chung cho iOS và Android, với baseline `Cubit + BasePage + DI + AutoRoute`, transport chuẩn là dual GraphQL gateway theo hướng GraphQL-primary, và runtime boundary adapters (native bridges, WebView bridges, local notification/call/event surfaces) là contract kiến trúc chính thức.**

### 1. Platform và codebase

- Dùng **một Flutter codebase** cho iOS + Android.
- Dùng **bootstrap chung** qua `start.dart`.
- Dùng **entrypoint theo flavor** qua `main*.dart`.
- Dùng **flavor config tập trung** qua `F.appFlavor` trong `flavors.dart`.

Lý do: repo hiện tại đã embodied decision này; việc tách thành hai native codebase sẽ nhân đôi domain flow, auth flow, notification flow, QA matrix và release cadence.

### 2. UI/runtime architecture baseline

| Concern | Baseline |
|---|---|
| State management | `flutter_bloc` / Cubit |
| Feature shell | `BasePage`, `BaseCubit`, `BaseState` |
| Dependency injection | `get_it` + `injectable` |
| Navigation | `auto_route` + `AppRouter` + guards |
| App shell concerns | auth state, `firstLoginChallenge`, `tcConfirmed`, app version check, permission check, notification bootstrap, payment feature gate, GraphQL debug overlay |
| Shell ownership split | `AppCubit` cho open/logout/version/T&C gating; `MainCubit` cho notification bootstrap, unread counts, payment feature gate; `ProfileCubit` cho tenant/profile context; `PolicyFirstCubit` cho privacy/T&C confirmation |
| Runtime/bootstrap snapshots | `SessionState`, `TenantContextSnapshot`, `PermissionSnapshot`, `FeatureFlagSnapshot`, `PaymentFeatureGateSnapshot`, `DashboardSnapshot`, `NotificationCallBootstrapState`, `VehicleRecognitionDraft`, `PaymentWebViewSession` |
| Lightweight local persistence | `SharedPreferences`, GraphQL cache via Hive store, feature-flag file cache |

Quy tắc:

- Feature mới trên mobile **không được** tự ý đưa thêm state-management stack mới như Riverpod, Redux, Provider-state, MobX hoặc GetX-state nếu không có ADR supersede hoặc migration plan rõ.
- Loading/error/retry/processing behavior nên đi qua `BasePage`/`BaseCubit` thay vì mỗi màn hình tự nghĩ lifecycle riêng.
- Không gom toàn bộ shell state vào một Cubit "god object"; ownership tối thiểu phải giữ tách giữa `AppCubit`, `MainCubit`, `ProfileCubit`, `PolicyFirstCubit`.
- Permission UX có thể chặn ở client, nhưng authorization authority vẫn thuộc backend/service owner.

### 3. Backend communication baseline

**Mobile transport là GraphQL-primary, không phải GraphQL-only.**

Quy tắc chuẩn:

- Business query/mutation chính đi qua:
  - `GraphQLService` cho Garage domain graph.
  - `GraphQLSSOService` cho SSO/auth-adjacent graph.
- Repository/domain flow ưu tiên documents-based GraphQL, typed model mapping và xử lý auth/retry tập trung qua `GraphQLServiceBase`.
- REST/Dio/Retrofit **được phép** tồn tại nhưng chỉ cho các lớp integration cụ thể như:
  - upload non-GraphQL,
  - export PDF/image/file download,
  - các endpoint phụ trợ chưa hoặc không nên expose qua GraphQL.
- Không được tạo REST client mới cho business flow chỉ vì tiện; nếu muốn bypass GraphQL cho một module lớn, phải có ADR hoặc HLD update nêu rõ lý do ownership/performance/security.

Nói ngắn gọn:

- **GraphQL là contract chính của mobile với backend Garage.**
- **REST là ngoại lệ có kiểm soát, không phải baseline ngang hàng.**
- **WebView bridges, deep-link callbacks và MethodChannels là boundary APIs mà mobile tự expose; chúng là contract chính thức, không phải incidental plugin wiring.**

Inventory boundary interface hiện tại:

- **Consumed APIs/providers**:
  - `agg-garage-graph`, `agg-sso-graph`
  - `F.apiUrl`, `F.apiUrlNoAuth`
  - payment/feedback WebView pages
  - Firebase, CometChat, APNs/PushKit/CallKit
- **Produced runtime APIs**:
  - `FlutterChannel`, `PaymentChannel`, `AuthChannel`
  - `app://*`, `payment/ipn`, `oauth/*`, `auth/*`
  - `com.cometchat.sampleapp`, `com.cometchat.sampleapp.flutter.ios`, `app.documents.channel`

Quy tắc bổ sung:

- Không được thêm JavaScript channel, deep-link callback hoặc MethodChannel mới như ad-hoc workaround trong feature page; phải update HLD/ADR/integration contract khi thêm surface mới.
- Export/download bridge và payment WebView callback cũng thuộc architecture baseline, không coi là "helper code" có thể drift tự do.

### 4. Product boundary của mobile

App Garage là **mobile operational channel**, không phải desktop console thu nhỏ 1:1.

Quy tắc:

- Mobile ưu tiên flow phù hợp với phone context: quick actions, notifications, image/file capture, scan/OCR, chat/call, follow-up, detail view, short create/edit flows.
- Web GMS vẫn là bề mặt chính cho data grid lớn, bulk operations, reconciliation, accounting-heavy flows, inventory/admin workflows phức tạp và reporting sâu.
- Mobile có thể expose thêm module nghiệp vụ nếu có giá trị thực trên điện thoại, nhưng không lấy desktop parity làm baseline architecture goal.
- Mobile không được tạo state machine nghiệp vụ riêng khác backend hoặc khác Web GMS.

### 5. Push/call/chat + runtime event baseline

Push/call/chat và các runtime callback liên quan là **first-class platform runtime concern**, không phải incidental UI feature.

Quy tắc:

- Native bridge cho iOS (`PushKit`, `CallKit`, AppDelegate integration) và Android (manifest/action intent/MainActivity handling) là **một phần chính thức** của kiến trúc mobile.
- `FirebaseNotificationManager`, `ApnsNotificationManager`, `VoipNotificationManager`, `CometChatManager` là các integration manager chuẩn; feature code không được gọi native channel tản mát ngoài các lớp quản lý này nếu không có lý do rõ ràng.
- Runtime event surface chính thức hiện tại gồm:
  - **Consumed runtime events**: `FirebaseMessageReceived`, `LocalNotificationLaunchReplay`, `VoipPushWakeup`, `CometChatCallOrMessageEvent`, `PaymentWebViewCallback`.
  - **Produced runtime events**: `PushTokenRegistrationRequested`, `LocalNotificationDisplayed`, `IncomingCallUiRequested`, `NotificationReadAcknowledged`, `ConversationRefreshRequested`, `PurchaseRequestRefreshRequested`.
- Các event ở trên là runtime contracts qua provider SDK, `flutter_local_notifications`, `StreamController`, WebView channels và native bridges; **không** phải durable Kafka topic/event plane.
- Local notification replay, call end dedup và unread refresh đều là concern kiến trúc; không được bỏ qua idempotency/dedup chỉ vì "đó là callback UI".
- Mọi thay đổi liên quan call/VoIP/incoming notification phải được QA ở foreground, background và terminated state.
- Không chấp nhận giả định "Flutter abstraction alone là đủ" nếu chưa chứng minh được parity với runtime native hiện có.

### 6. Online-first, feature flags và RBAC

- Mobile baseline là **online-first**.
- Không đưa local domain database/offline sync thành baseline hiện tại.
- App shell có 3 mandatory runtime gates ngoài auth token:
  - force-update từ Firebase Remote Config,
  - `firstLoginChallenge` buộc first password change,
  - `tcConfirmed` buộc policy/T&C confirmation trước khi vào luồng vận hành.
- Feature visibility và behavior có thể bị gate bằng feature flags.
- Mọi business action vẫn phải tôn trọng permission/RBAC và tenant/branch scoping.

Điều này có nghĩa:

- Cache local được dùng cho `SessionState`, config, bootstrap hints và cache nhỏ; không phải source of truth cho booking, service order, inventory, settlement hoặc purchase state.
- Nếu tương lai cần offline-first thực thụ, đó là một ADR/HLD riêng.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Tách 2 app native riêng** | Toàn quyền platform API; native ownership rõ | Nhân đôi business logic, release process, regression surface, cost maintain | Không phù hợp codebase embodied hiện tại |
| **Cho phép nhiều state-management stack cùng tồn tại** | Linh hoạt cục bộ cho từng team | Repo drift nhanh, onboarding khó, debug khó, refactor tốn kém | Mobile repo đã đủ lớn để cần một baseline thống nhất |
| **REST-first hoặc REST-only cho mobile** | Debug network đơn giản hơn ở vài flow | Mất lợi thế aggregator composition, token/retry logic bị duplicate, frontend biết quá nhiều endpoint topology | Không khớp cách app đang gọi 2 GraphQL gateway làm contract chính |
| **GraphQL-only tuyệt đối** | Ranh giới transport rất sạch | Không phản ánh thực tế export/upload/file helpers; buộc proxy không cần thiết | Source có REST có chủ đích và hợp lý cho file/export |
| **Flutter-only push/call abstraction, bỏ native bridge** | Ít native code hơn | Incoming-call/background/terminated/lock-screen flow kém tin cậy | Không đáp ứng runtime requirement hiện có |
| **Offline-first ngay ở baseline** | UX tốt hơn khi mất mạng | Sync/conflict/migration complexity rất cao, nhất là với inventory và settlement | Chưa có requirement và data model đủ chín để chấp nhận |

## Consequences

**Positive:**

- Mobile có baseline rõ và nhất quán với repo thực tế.
- GraphQL giữ vai trò transport chính nhưng vẫn cho phép ngoại lệ có kiểm soát cho file/export endpoints.
- Boundary interfaces của mobile được gọi tên rõ: consumed APIs, produced runtime APIs và runtime event surfaces đều là contract phải govern.
- Auth/retry/connectivity logic tập trung hơn ở GraphQL layer, giảm duplicate handling trong feature code.
- Notification/call/chat runtime được coi là phần kiến trúc cốt lõi, tránh việc feature team vô tình phá background/terminated behavior.
- Force-update, `firstLoginChallenge` và `tcConfirmed` được nâng thành gate kiến trúc explicit thay vì logic rải rác khó audit.
- Product boundary giữa App Garage và Web GMS rõ hơn, giúp tránh kỳ vọng mobile phải mirror desktop 1:1.

**Negative:**

- Flutter + native bridge làm mobile runtime phức tạp hơn app Flutter thuần. **Mitigation**: giữ native touchpoints tập trung vào manager/bridge thay vì tản trong feature code.
- WebView bridges + MethodChannels + runtime callbacks làm contract surface rộng hơn một app chỉ consume HTTP API. **Mitigation**: coi đây là boundary interfaces chính thức, cập nhật HLD/ADR/integration-contract khi thay đổi.
- Không có offline domain model chuẩn nên experience khi mất mạng vẫn phụ thuộc backend availability. **Mitigation**: giữ online-first explicit; nếu cần offline-first thì mở ADR/HLD riêng.
- GraphQL-primary với dual gateway đòi hỏi governance tốt cho documents/models và mapping error. **Mitigation**: tiếp tục dùng repository + typed models + central GraphQL handling.
- Multi-flavor và multi-provider integration làm QA matrix lớn. **Mitigation**: giữ bootstrap/flavor config tập trung, không hardcode env trong feature code.

**Risks:**

- Feature team có thể lạm dụng REST helper và làm transport drift khỏi GraphQL baseline. **Mitigation**: mọi REST call mới phải justify là non-GraphQL/file/export/integration-specific.
- Feature team có thể thêm ad-hoc JS/native callback surface ngoài governance và làm drift runtime contract. **Mitigation**: channel/deep-link/MethodChannel mới phải update ADR/HLD/integration contract.
- Permission guard ở UI có thể bị hiểu nhầm là authorization thật. **Mitigation**: backend/service owner vẫn là authorization authority.
- App có thể dần trôi sang “desktop parity on phone” nếu không giữ product boundary. **Mitigation**: mọi module mới trên mobile phải justify phone-context value.
- Token/session bootstrap hiện vẫn dựa một phần vào `SharedPreferences`, chưa phải secure storage baseline. **Mitigation**: ghi nhận đây là hardening gap cần ADR/HLD riêng nếu muốn nâng chuẩn bảo mật.

**Trade-off accept:** chấp nhận complexity của cross-platform runtime + native bridge + dual transport governance để đổi lấy một mobile baseline scale được với codebase hiện tại, giữ business logic dùng chung và vẫn đáp ứng được notification/call runtime thực tế.

## References

- Product:
  - [PRD-GARAGE.md](../../Product/PRD-GARAGE.md)
  - [BUSINESS-RULES.md](../../Product/BUSINESS-RULES.md)
- Architecture:
  - [TECHSTACK.md](../TECHSTACK.md)
  - [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
  - [ADR-002-graphql-aggregator-pattern.md](./ADR-002-graphql-aggregator-pattern.md)
  - [ADR-010-feature-flags-governance.md](./ADR-010-feature-flags-governance.md)
  - [ADR-012-garage-web-frontend-architecture.md](./ADR-012-garage-web-frontend-architecture.md)
  - [garage-mobile-HLD.md](../hld/garage-mobile-HLD.md)
  - [INTEG-MOB-garage-mobile-agg-garage-graph.md](../integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md)
  - [INTEG-MOB-garage-mobile-agg-sso-graph.md](../integrations/INTEG-MOB-garage-mobile-agg-sso-graph.md)
  - [garage-mobile-events.md](../events/garage-mobile-events.md)
  - [garage-mobile.knowledge-graph.yaml](../../Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml)
- Implementation evidence:
  - `../../../lib/start.dart`
  - `../../../lib/flavors.dart`
  - `../../../lib/app/app.dart`
  - `../../../lib/injection_container.dart`
  - `../../../lib/core/router/router.dart`
  - `../../../lib/core/router/auth_guard.dart`
  - `../../../lib/core/router/permission_guard.dart`
  - `../../../lib/core/services/graphql/graphql_service_base.dart`
  - `../../../lib/core/services/graphql/graphql_service.dart`
  - `../../../lib/core/services/graphql/graphql_sso_service.dart`
  - `../../../lib/core/services/api_service.dart`
  - `../../../lib/core/services/api_util.dart`
  - `../../../lib/core/global/global_event.dart`
  - `../../../lib/core/managers/versions/app_version_manager.dart`
  - `../../../lib/core/repositories/base_repository.dart`
  - `../../../lib/core/repositories/auth/auth_repository.dart`
  - `../../../lib/core/repositories/profile/profile_repository.dart`
  - `../../../lib/core/repositories/media/media_repository_impl.dart`
  - `../../../lib/core/feature_flag/app_feature_flag.dart`
  - `../../../lib/core/services/file/file_exporter.dart`
  - `../../../lib/core/managers/notifications/firebase_notification_manager.dart`
  - `../../../lib/core/managers/notifications/apns_notification_manager.dart`
  - `../../../lib/core/managers/notifications/voip_notification_manager.dart`
  - `../../../lib/core/managers/comet_chat/comet_chat_manager.dart`
  - `../../../lib/ui/main/main_page.dart`
  - `../../../lib/ui/main/bloc/main_cubit.dart`
  - `../../../lib/ui/main/bloc/profile_cubit.dart`
  - `../../../lib/ui/main/policy/policy_first/policy_first_cubit.dart`
  - `../../../lib/ui/auth/login/login_cubit.dart`
  - `../../../lib/ui/ordering/credit_card_payment/credit_card_payment_page.dart`
  - `../../../android/app/src/main/AndroidManifest.xml`
  - `../../../android/app/src/main/kotlin/com/example/cardoctor_garage_v3/MainActivity.kt`
  - `../../../ios/Runner/AppDelegate.swift`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-12 | v3 | Đồng bộ ADR-011 với knowledge graph `garage-mobile`: bổ sung catalog boundary interfaces (consumed APIs + produced runtime APIs như WebView channels, deep-link callbacks, MethodChannels), làm explicit shell ownership split `AppCubit/MainCubit/ProfileCubit/PolicyFirstCubit`, thêm runtime event surface produced/consumed, và chốt 3 mandatory gates `force-update`, `firstLoginChallenge`, `tcConfirmed`. |
| 2026-05-07 | v2 | Initial rewritten mobile baseline ADR cho repo `garage-mobile`: single Flutter codebase, Cubit/DI/AutoRoute, GraphQL-primary with controlled REST exceptions, native push/call adapters, online-first mobile operational channel. |
