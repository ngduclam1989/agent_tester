---
type: architecture
artifact_kind: integration-mobile-bff
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary_mobile: "{{mobile-boundary}}"
boundary_bff: "{{bff-boundary}}"
platforms: ["ios", "android"]
last_reviewed: "2026-05-02"
supersedes: "none"
---

# Integration — Mobile App (Flutter) ↔ BFF (Apollo GraphQL)

> Document tích hợp giữa **{{mobile-boundary}}** (Flutter app) và **BFF Apollo GraphQL**.
> Mobile environment — concerns chính: offline-first, secure token storage, network awareness, app lifecycle, platform differences (iOS/Android), battery, push notifications.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Mobile boundary | `{{mobile-boundary}}` |
| BFF endpoint | `{{https://api.example.com/graphql}}` |
| Flutter version | `{{Flutter 3.x}}` |
| GraphQL client | `{{ferry / graphql_flutter / artemis}}` |
| Codegen | `{{ferry_generator / build_runner}}` |
| Generated types path | `{{lib/generated/graphql/}}` |
| Min iOS version | `{{iOS 14+}}` |
| Min Android API | `{{API 23 / Android 6+}}` |
| Persisted queries | {{Yes / No}} |

## 2. Client Library Choice

| Library | Pros | Cons | Recommended for |
|---|---|---|---|
| `ferry` | Strong typing, code generation, normalized cache | Steeper learning curve | Production, large schemas |
| `graphql_flutter` | Simple API, big community | Weaker typing, manual cache work | Prototypes, simple apps |
| `artemis` (deprecated-ish) | Code-gen focused | Maintenance status | Legacy projects |

**Decision**: {{Library chosen + why}} — Ref: ADR-{{NNN}}

## 3. Network Layer Setup

### 3.1 Client construction

```dart
{{
  // Sample code
  // - HttpLink with BFF URL
  // - AuthLink (reads token from secure storage)
  // - ErrorLink (categorizes errors)
  // - RetryLink (transient errors only)
  // - WebSocketLink for subscriptions (if used)
}}
```

Code path: `{{lib/data/graphql/client.dart}}`

### 3.2 Cache backend

| Option | Choice |
|---|---|
| In-memory | Always (Apollo-style normalized) |
| Persistent | {{Hive / sqflite / drift — for offline support}} |
| Cache size limit | {{50MB on device}} |
| Eviction | {{LRU when limit hit}} |

## 4. Authentication & Token Storage

### 4.1 Token storage

| Aspect | Choice | Why |
|---|---|---|
| Library | `flutter_secure_storage` | Uses Keychain (iOS) / Keystore (Android) — encrypted at rest |
| Stored items | Access token, refresh token | NOT in SharedPreferences (plaintext) |
| Biometric gate | {{Optional — `local_auth` for sensitive ops}} | Re-auth before payments etc. |
| Encryption (Android) | `EncryptedSharedPreferences` fallback | Keystore-backed |

### 4.2 Auth flow

```
[App start]
  → Read token from secure storage
  → If valid → init Apollo with auth header
  → If expired → silent refresh
  → If refresh fails → navigate to login
```

### 4.3 Refresh strategy

| Aspect | Detail |
|---|---|
| Trigger | Before expiry (proactive) OR on 401 (reactive — retry once) |
| Concurrency | Single-flight: 1 refresh in progress; queue concurrent requests |
| Failure | Clear all tokens, navigate to login, clearCache |

### 4.4 Multi-factor / step-up auth

For sensitive ops (payment, profile change):
- Require recent biometric/PIN unlock (`local_auth`)
- Pass step-up token to BFF as additional header

## 5. Code Generation

```bash
{{flutter pub run build_runner build --delete-conflicting-outputs}}
```

Watch mode during dev:
```bash
{{flutter pub run build_runner watch}}
```

CI gate: build_runner check should pass with no diff to committed generated files.

### 5.1 Operation files

```
lib/
├── features/
│   └── orders/
│       ├── graphql/
│       │   ├── get_order.graphql
│       │   ├── list_orders.graphql
│       │   └── place_order.graphql
│       └── pages/
│           └── order_list_page.dart    # imports generated query
```

## 6. UI Action ↔ GraphQL Operation Mapping (MANDATORY)

> **Without this table, Mobile DEV agent cannot code correctly.** See FM-016.
>
> **Coverage requirement**: every actionable UI element (`ElevatedButton`, `TextButton`, `InkWell`, `GestureDetector` with onTap, swipe-to-action, pull-to-refresh, bottom-sheet action, push notification tap, deep link arrival, screen mount auto-load, infinite scroll, polling timer) must have a row OR be marked "local only".

### 6.1 Mapping table

| # | UI Element / Trigger | Screen | User Intent | Pre-conditions | Op Type | Op Name (codegen) | Variables Mapping | Loading UX | Success Handler | Error Handlers | Cache + Offline Behavior | Network Type Gate | Haptic / Feedback |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `[Key('place-order-btn')]` ElevatedButton onPressed | `CheckoutPage` | Submit cart | Cart non-empty, payment selected, T&C accepted | Mutation | `PlaceOrder` | Cart items + payment id from BLoC state | Disable + CircularProgressIndicator inside btn | Navigate `OrderConfirmationPage`; clear cart BLoC; success snackbar | `BAD_USER_INPUT` → field-level inline; `PAYMENT_DECLINED` → modal w/ retry; offline → queue + show "Pending sync" | Optimistic: insert temp order in cache; if **offline** queue to local DB + persist mutation, replay on reconnect | Allow on any network (critical) | `HapticFeedback.mediumImpact()` on tap; `lightImpact` on success |
| 2 | `ListView` onMount | `OrderListPage` | View orders | Logged in | Query | `ListOrders` | `first: 20`, `filter: bloc.filter` | Skeleton list (3 shimmer cards) | Render list | Network → show cached + retry banner; `INTERNAL` → snackbar | `cache_and_network`; persist to Hive for offline read | If cellular metered → reduce `first` to 10; lower image res | None |
| 3 | `RefreshIndicator` onRefresh | `OrderListPage` | Pull-to-refresh | Has cached data | Query | `ListOrders` | Reset cursor, `first: 20` | RefreshIndicator default | Replace cache | Same as row 2 | Bypass cache (`network_only`); update Hive | Always (user-initiated) | `HapticFeedback.selectionClick()` on refresh start |
| 4 | InfiniteScroll trigger (`ScrollController` near end) | `OrderListPage` | Paginate | Has more cursor | Query | `ListOrders` | `after: lastCursor`, `first: 20` | Inline progress at end | Append edges | Network → silent; max 1 retry | Append to connection cache | Skip if metered + cache > 50 items | None |
| 5 | Subscribe on mount, dispose on unmount | `OrderTrackerPage` | Live status | order.status active | Subscription | `OrderStatus` | `orderId: $id` | "Connecting..." badge → "Live" dot | `cache.write` for order entity; show banner on status change | Reconnect ws with backoff; cap 60s; show "offline tracker" if fail; pause on `AppLifecycleState.paused` | Update cached order; do NOT persist sub events to Hive (transient) | Only on WiFi (battery) — fall back to push notif on cellular | `HapticFeedback.lightImpact()` on status change |
| 6 | Push notification tap → deep link | (system) → `OrderDetailPage` | Open from FCM/APNs | Notification has `orderId` payload | Query | `GetOrder` | `id: notification.payload.orderId` | Skeleton on detail | Render detail | `NOT_FOUND` → return to list w/ error toast | `cache_first`; trigger background refetch | Network attempt regardless | Default system notification haptic |
| 7 | Slidable swipe-left "Cancel" | `OrderListPage` row | Cancel pending order | `order.status == 'PENDING'` | Mutation | `CancelOrder` | `id: order.id`, `reason: dialog.value` | Slidable closes; row dims + spinner | Toast "Cancelled"; refetch | `FORBIDDEN` → toast undo not allowed; `CONFLICT` → reload row | Optimistic update; offline queue | Allow any | `HapticFeedback.heavyImpact()` on swipe commit |
| 8 | (none — local) | `CheckoutPage` | Toggle "Save card" | — | — | — | — | — | — | — | Local BLoC state only | n/a | n/a |

### 6.2 Mutation queue semantics (offline)

For mutations marked "queue if offline" in the table:

```
[User triggers mutation]
   ↓
[Check connectivity]
   ↓
   ├── online → execute via Apollo, optimistic UI, on error → categorize
   └── offline → write to local mutation queue (Hive table `pending_mutations`)
                 mark UI as "Pending sync" badge
                 ↓
[On connectivity restore (connectivity_plus listener)]
   ↓
[Replay queue in FIFO order]
   ↓
   ├── success → remove from queue, update UI (badge cleared)
   ├── conflict → surface manual reconcile UI (e.g., "Order changed since you cancelled")
   └── permanent error → remove from queue, show error notification
```

Each queued mutation has:
- `id`: client UUID (= idempotency key sent to BFF)
- `operation`: GraphQL document
- `variables`: JSON
- `created_at`, `attempts`, `last_error`

### 6.3 Per-operation deep-dive

#### 6.3.1 `PlaceOrder` (offline-aware mutation)

```dart
// Pseudo-flow
Future<void> placeOrder(...) async {
  final connectivity = await Connectivity().checkConnectivity();
  if (connectivity == ConnectivityResult.none) {
    await mutationQueue.enqueue(PlaceOrderMutation(input));
    showBadge("Pending sync");
    return;
  }
  // ... proceed with online mutation + optimistic
}
```

Screen path: `{{lib/features/checkout/checkout_page.dart}}`

### 6.4 Coverage checklist (before coding)

Subagent **MUST** verify:

- [ ] Every interactive widget (button, gesture, swipe, pull, push tap, deep link, mount-load) has a row OR is marked "local only"
- [ ] Every Op Name matches a `build_runner` generated query/mutation/subscription class
- [ ] Every error code referenced exists in BFF schema's `extensions.code` enum
- [ ] Every offline-queueable mutation declares idempotency strategy
- [ ] Every subscription has a lifecycle plan (connect/disconnect on app state)
- [ ] Network type gates are realistic (don't gate critical actions on WiFi-only)
- [ ] Haptic feedback intensity matches Material Design / iOS HIG conventions

If any row is incomplete → STOP, raise `/cr-raise MODERATE`. Don't guess.

## 7. Offline-First Strategy

### 7.1 Read-side

| Pattern | Detail |
|---|---|
| Cache-first reads | Always render from cache, refresh in background |
| Stale data indicator | UI shows "Updated 5 min ago" badge if not fresh |
| Sync on app foreground | Re-fetch critical queries on resume |

### 7.2 Write-side (mutation queue)

| Pattern | Detail |
|---|---|
| Mutation queue | Persist failed mutations to local DB |
| Retry policy | On connectivity restore: replay in order with exponential backoff |
| Conflict resolution | {{Last-write-wins / version check / manual reconcile}} |
| User feedback | Show "Pending sync" badge per item |
| Idempotency | Each queued mutation has client-generated UUID; BFF dedupes |

### 7.3 Connectivity detection

```dart
{{
  // connectivity_plus package
  // Listen to ConnectivityResult.{none, wifi, mobile}
  // Trigger queue replay on transition: none → wifi/mobile
}}
```

## 8. App Lifecycle Handling

| Lifecycle event | Action |
|---|---|
| `AppLifecycleState.resumed` | Refresh critical queries; reconnect subscriptions |
| `AppLifecycleState.paused` | Persist Apollo cache to disk; pause subscriptions |
| `AppLifecycleState.detached` | Close WebSocket; flush queue if possible |
| Background fetch | {{iOS background tasks / Android WorkManager — limited use}} |

## 9. Subscriptions (WebSocket on Mobile)

Subscriptions on mobile are tricky — battery impact, connection drops, app backgrounding.

| Aspect | Strategy |
|---|---|
| When to use | Real-time critical only (chat, live order status); avoid for "nice-to-have" |
| Auth | `connectionParams` with token; refresh on 401-like ws errors |
| Reconnection | Exponential backoff; jitter; max 60s |
| Background | Pause WS in background; reconnect on resume |
| Battery | Prefer push notifications + on-demand fetch over long-lived WS for non-critical |

## 10. Push Notifications Integration

Push complements GraphQL — server triggers, client fetches details.

| Aspect | Detail |
|---|---|
| Service | {{FCM (Firebase) / APNs / OneSignal}} |
| Token registration | On login/foreground: send token to BFF via `Mutation.registerDeviceToken` |
| Token rotation | On token refresh from FCM, re-register |
| Notification → action | Tap → deep link → fetch latest data via GraphQL |
| Silent push | {{Optional — trigger background fetch of critical data}} |

## 11. Deep Links / Universal Links

| Aspect | iOS | Android |
|---|---|---|
| Mechanism | Universal Links (apple-app-site-association) | App Links (assetlinks.json) |
| URL pattern | `https://example.com/orders/:id` | Same |
| Routing | Map to GraphQL query (`GetOrder(id)`) on cold start |
| Auth gate | If unauthenticated → save link → /login → resume after |

## 12. Network Type Awareness

| Network type | Behavior |
|---|---|
| WiFi | Full operations, prefetching enabled |
| Cellular | Limit prefetching, smaller pagination, lower image quality |
| Cellular metered (Android) | Defer non-critical; show data usage warning |
| None (offline) | Cache-only reads; queue mutations |

```dart
{{
  // Use connectivity_plus + a NetworkPolicy class
  // to gate prefetch decisions per query
}}
```

## 13. Error Handling

### 13.1 Error categories

| Category | Detection | UX |
|---|---|---|
| Network unreachable | `SocketException`, `connectivity == none` | Banner + offline mode |
| Auth expired | GraphQL `UNAUTHENTICATED` | Silent refresh; on fail → login |
| Server error | GraphQL `INTERNAL_SERVER_ERROR` | Snackbar + retry |
| Validation | `BAD_USER_INPUT` | Inline form errors |
| Conflict (offline-induced) | Server rejects queued mutation | Manual reconcile UI |

### 13.2 Crash reporting

| Tool | Use |
|---|---|
| {{Sentry / Firebase Crashlytics}} | Auto-capture exceptions; manual `recordError` for handled |
| Breadcrumbs | GraphQL operations logged as breadcrumbs |
| User context | User ID + tenant attached |

## 14. Performance Targets

| Metric | Target |
|---|---|
| App cold start to first usable screen | {{< 2.5s on mid-range device}} |
| Cached query render | {{< 100ms}} |
| Mutation perceived latency (with optimistic UI) | {{< 50ms}} |
| Mutation actual server confirmation | {{< 1.5s on 4G}} |
| App size impact (graphql client + codegen) | {{< 5MB}} |

## 15. Platform Differences

| Aspect | iOS | Android |
|---|---|---|
| Token storage | Keychain | EncryptedSharedPreferences / Keystore |
| Push | APNs (silent push restricted) | FCM (more flexible) |
| Background fetch | Strict (15-min minimum, system-controlled) | WorkManager (more flexible) |
| WebSocket in background | Killed quickly | Killed quickly (Doze) |
| File system | Sandboxed; documents/cache distinction | Scoped storage post-API 30 |
| Biometric | Face ID / Touch ID | Fingerprint / Face Unlock |

## 16. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock GraphQL client; test BLoC/Provider logic |
| Widget | `mockito` + `MockedProvider` equivalent; render screens |
| Golden | Visual regression for critical screens |
| Integration | Flutter integration tests against staging BFF |
| E2E | {{Patrol / Maestro / Detox}} on real devices/simulators |
| Offline | Toggle airplane mode in tests; verify queue + replay |

## 17. Security

| Concern | Mitigation |
|---|---|
| Token theft | Secure storage (Keychain/Keystore); never SharedPreferences |
| Cert pinning | `dio_certificate_pinning` or platform channel |
| Jailbreak/root detection | {{Optional — `flutter_jailbreak_detection`}} |
| Reverse engineering | {{ProGuard/R8 (Android); strip debug symbols (iOS)}} |
| Sensitive screen | {{Hide from app switcher (`FLAG_SECURE` Android, `withScreenshotProtection` iOS)}} |
| Logs | NEVER log tokens, PII; redact in production builds |

## 18. App Store Distribution

| Aspect | iOS | Android |
|---|---|---|
| Update mechanism | App Store review (1-7 days) | Google Play (hours-days) |
| Forced update | In-app version check vs BFF `getMinAppVersion` query |
| Phased rollout | TestFlight → 10% → 100% | Internal → Closed → Open → 10% → 100% |
| Schema compat | BFF must support N-2 app versions for graceful upgrade |

## 19. Operational Runbook

| Scenario | Action |
|---|---|
| BFF schema breaking | App version check forces upgrade; older clients show "Please update" screen |
| Mass auth failure | Investigate refresh endpoint; check IdP status |
| Crash spike post-release | Rollback (Android via halt rollout; iOS via Phased Release pause) |
| Cache corruption reports | Add "Clear app data" recovery in Settings |
| Push notification storm | Throttle on BFF side; FCM/APNs has built-in dedup window |

## 20. Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-05-02 | 1 | Initial Mobile↔BFF integration contract | {{Architect}} |
