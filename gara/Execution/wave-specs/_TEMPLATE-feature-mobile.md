---
type: execution
artifact_kind: converted-feature
tier_role: mobile                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-{{FEAT-ID}}.md"
source_version: {{N}}
source: "gen-execution-spec"
source_feat_id: "FEAT-{{FEAT-ID}}"
source_feat_sha: "{{sha256-source}}"
generated_at: "{{ISO8601-UTC}}"
status: DRAFT
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W{{NN}}"
parent_epic: "EP-{{EPIC-ID}}"
parent_pkg: "PKG-W{{NN}}-{{slug}}"
experience: "{{experience-mobile}}"                    # vd "garage-mobile"
platform: mobile
modifies: []
change_type: "{{brownfield-enhancement | new-capability}}"
consumes_backend_feats: ["FEAT-{{FEAT-ID}}"]
consumes_bff_feats: []                                 # nếu has_bff_touchpoint=true → ["FEAT-{ID}"]
screens_touched: []                                    # vd ["lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart"]
                                                       # CANONICAL Garage mobile: lib/ui/{domain}/{sub_feature}/{name}_page.dart
                                                       # KHÔNG: lib/features/{feat}/presentation/screens/ (web Clean Architecture pattern)
                                                       # File suffix: _page.dart (real codebase 125 _page vs 1 _screen). Class suffix: *Page (not *Screen).
flutter_packages: []                                   # vd ["flutter_bloc", "freezed", "get_it", "injectable", "auto_route", "graphql_flutter", "gap"]
                                                       # CANONICAL Garage mobile: auto_route (10.1.0+1, KHÔNG go_router) + injectable + flutter_bloc + graphql_flutter
                                                       # Verify dep against mobile/gf-garage-app/pubspec.yaml trước khi declare
authoring_inputs:
  pkg_ref: "PKG-W{{NN}}-{{slug}}"
  fanout_map_sha: "{{sha256-map-yaml}}"
  template_sha: "{{sha256-template}}"
reviewer_verdict: null
last_reviewed: "{{YYYY-MM-DD}}"
---

# FEAT-{{FEAT-ID}} (Mobile): {{Tiêu đề tiếng Việt}}

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-{{FEAT-ID}}` |
| Tier | **mobile** |
| Experience | `{{experience-mobile}}` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-{{EPIC-ID}}`](../../epics/EP-{{EPIC-ID}}.md) |
| Wave | W{{NN}} |
| Status | DRAFT |
| Screens touched | {{screens_touched}} |
| Flutter packages | {{flutter_packages}} |
| Cross-tier consume | BE: {{consumes_backend_feats}} \| BFF: {{consumes_bff_feats}} |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-{{FEAT-ID}}` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-{{FEAT-ID}}.md`](../../../../../Product/features/FEAT-{{FEAT-ID}}.md) |
| Source version | v{{N}} |
| Source SHA | `{{sha256-source}}` |
| Generated at | {{ISO8601-UTC}} |

## 1. Mục đích nghiệp vụ

> 3-5 dòng — vì sao feature tồn tại, user outcome, vị trí trong business flow. **Identical cross-tier**. KHÔNG copy AC text, KHÔNG mô tả screen/widget cụ thể.

{{Viết 3-5 dòng tiếng Việt — match nội dung §1 ở tier BE/BFF/FE Web}}

## 2. Trách nhiệm Mobile ({{experience-mobile}})

> 3-6 bullet ngắn — Mobile cần tạo trải nghiệm gì. Tier-specific (focus: screen, navigation, state, offline, native interaction, i18n, a11y, RBAC). KHÔNG mô tả schema DB hay GraphQL SDL.

- {{Màn hình / bottom sheet / modal nào — entry point, scope, layout responsive phone/tablet}}
- {{User flow chính — step-by-step trên mobile (touch, swipe, scroll, back gesture)}}
- {{State machine UI: loading / empty / error / success — kèm Bloc/Cubit}}
- {{Widget reuse-first — list widget foundation có sẵn để reuse, widget mới}}
- {{GraphQL op nào consume từ BFF — graphql_flutter}}
- {{Native interaction (nếu có): permission (camera/storage/photo), deeplink, push, file picker, biometric}}
- {{Offline + connectivity behaviour: cache fallback, banner, retry}}

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Mỗi source AC-ID → 1 Mobile behaviour statement. **Không copy text AC từ source** — viết lại theo góc nhìn Mobile: "Mobile phải render X / trigger Y / handle Z để user satisfy AC-N". Group theo screen / interaction.
>
> **Coverage gate** (reviewer item #1): mỗi source AC-ID phải xuất hiện ít nhất 1 lần ở §3 hoặc §4. AC nào Mobile không touch → khai báo explicit `→ N/A (xem be/ hoặc fe-web/ tier file)`.

### Cluster A — {{Tên màn hình hoặc interaction}}

#### AC-{{N}} → {{Tiêu đề Mobile behaviour}}

- **Khi**: {{user trigger — vd "tap button X", "pull-to-refresh", "swipe-to-dismiss", "deeplink open"}}
- **Mobile phải**: {{action — render widget, dispatch event, fetch op, navigate, show SnackBar/Dialog}}
- **State transition**: {{Loading / Loaded / Error — kèm Bloc/Cubit event}}
- **Widget**: {{widget path — reuse hoặc new}}
- **GraphQL op**: {{opName từ BFF — kèm input/output mapping}}
- **i18n key (ARB)**: {{label key dùng}}
- **a11y**: {{Semantics label, focus order, screen reader behaviour}}
- **Platform-specific** (iOS/Android): {{nếu có khác biệt — permission, file picker, native dialog}}
- **Ref**: paired BFF FEAT §6.1 op `{{opName}}`, Figma node `{{node-id}}` (§5.x)

#### AC-{{M}} → {{Tiêu đề}}

...

### Cluster B — {{tên}}

...

#### AC-{{P}} → N/A

- Source AC này chỉ BE state hoặc chỉ web-specific behaviour. Mobile không touch.

## 4. Ràng buộc & rule cần enforce

> MUST-NOT-VIOLATE list cho Mobile. Group: visual fidelity, state machine, native interaction, offline, i18n, a11y, RBAC, BR secondary, performance.

### 4.1 Visual fidelity (Figma SSOT)

- Không re-invent layout / spacing / color — bám Figma node-id ở §5.
- Design tokens lấy từ `lib/core/common/styles/{app_colors,app_text_styles,app_sizes,app_shadows}.dart` — `AppColors.*` / `AppTextStyle.*` / `AppSizes.spacing*` / `AppShadow.*`. **KHÔNG** hardcode `Color(0xFF…)` / `TextStyle(...)` literal / raw int spacing (per `rules-mobile` skill §1).
- Responsive: phone (compact) / tablet (medium+expanded) qua MediaQuery breakpoint hoặc LayoutBuilder.
- **[FORM FEATs only]** Required asterisk visual rule: asterisk `*` đỏ `AppColors.textErrorPrimary` (#ed1f42) render BÊN PHẢI label cho MỌI required field (per Figma PNG verbatim). Optional fields KHÔNG có asterisk. Wire qua `AppTextField(label: "...", required: true)` — widget tự render asterisk khi `required=true`. Even immutable fields (`enabled: false`) vẫn render asterisk nếu intrinsic required. Spec phải list explicit mỗi field nào required / optional ở §3 widget descriptions + §4.1 design token reference (`AppColors.textErrorPrimary` cho `*`).

### 4.2 State machine + error handling

- Bloc/Cubit state tường minh: `initial | loading | loaded | error`. Mỗi state có widget render tương ứng.
- Error → SnackBar / Dialog / inline error widget theo error code mapping ở §4.7.
- KHÔNG silent fail — log qua Sentry/equivalent.
- **[FORM FEATs only]** Form-validity gating cho submit button (MANDATORY rule, mirror EDIT v10 / CREATE v9 pattern):
  - Cubit declare **computed property** `isFormValid` (boolean) — recompute mỗi text-field changed event, AND-combine tất cả validation rules (required not-empty + regex + length cap).
  - Submit button (AppButton Lưu/Submit) **disabled khi** (composite 3-condition):
    - (a) `!cubit.isFormValid` — form invalid (required fields empty hoặc validation rule fail) — TRƯỚC user tap; visual: opacity 0.5, KHÔNG tap response, KHÔNG SnackBar.
    - (b) Loading/Submitting state — `CircularProgressIndicator` inline thay text, form non-interactive.
    - (c) Offline — connectivity banner active.
  - Wire pattern: `AppButton.text(..., onPress: cubit.isFormValid ? cubit.submit : null)` qua `BlocBuilder` rebuild khi state changed. `null onPress` = button disabled visually + KHÔNG trigger.
  - Anti-pattern: KHÔNG để button always enabled rồi validate sau khi tap (UX bad — error chỉ hiện sau tap).

### 4.3 Native interaction + permission

- {{Permission nào cần xin: camera, photo library, storage, location, microphone}}
- {{Permission rationale UI trước khi system prompt}}
- {{Platform handling: iOS Info.plist key, Android manifest permission}}
- {{Deeplink scheme nếu có}}

### 4.4 Offline + connectivity

- {{Online required hay offline-first}}
- {{Cache strategy: graphql_flutter cache, Hive/SharedPreferences fallback}}
- {{Banner / banner widget khi offline}}
- {{Retry policy khi reconnect}}

### 4.5 i18n + a11y

- Mọi label string qua ARB key (`mobile/gf-garage-app/lib/l10n/intl_en.arb` + `intl_vi.arb` — verify file tồn tại) — KHÔNG hardcode tiếng Việt inline (trừ Figma label verbatim ở widget tree).
- a11y: `Semantics` widget cho icon-only button, `excludeSemantics` cho decorative; screen reader test (TalkBack / VoiceOver).
- Tap target ≥ 48dp; contrast ratio đạt WCAG AA.

### 4.6 RBAC render + feature flag

- {{Feature flag gate — vd `insurance_settlement_enabled`}}
- Persona check: chỉ render action cho role được phép. Tab/route gate qua auto_route `AuthGuard` / `PermissionGuard` (`lib/core/router/auth_guard.dart`).

### 4.7 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired be/FEAT-{{FEAT-ID}}.md §9). Mobile chỉ UI hint:
  - Inline validation: field-level rule trước khi submit.
  - Disable button khi precondition không đủ.
  - SnackBar/Dialog khi server reject với error code.

### 4.8 Performance

- **`ListWidget` canonical** (`lib/ui/widgets/list/list_widget.dart`) cho list pattern — handle `isInitial/isLoading/isFailure/isEmpty` + auto-skeleton (LoadingListWidget 20 rows × LoadingRowShimmerWidget) + `SmartRefresher` pull-down + pull-up load-more qua `RefreshController` từ `pull_to_refresh: ^2.0.0`. KHÔNG dùng raw `ListView.builder` + KHÔNG dùng `infinite_scroll_pagination` (package NOT in pubspec — incident W03 2026-06-30).
- Image caching qua `cached_network_image`.
- Avoid rebuild toàn screen — split widget + `const` constructor + `BlocBuilder` granular.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| `{{err-code}}` | SnackBar / Dialog / inline | {{widget path}} | AC-{{N}} |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> Author tổng hợp từ Figma + UX flow + AC. Path glob ⊆ `mobile/gf-garage-app/lib/**`.
>
> **PATH CANONICAL Garage mobile** (verify against real codebase `mobile/gf-garage-app/lib/ui/**`):
> - **Screens (Pages)**: `lib/ui/{domain}/{sub_feature}/{sub_feature}_page.dart` — flat 3-level, KHÔNG nest `presentation/screens/`. Class suffix `*Page`. File `_page.dart`.
> - **Cubits / States**: COLOCATE cùng dir với page: `lib/ui/{domain}/{sub_feature}/{sub_feature}_cubit.dart` + `_state.dart` + `.freezed.dart` (generated).
> - **Local widgets** (chỉ dùng nội bộ feature): `lib/ui/{domain}/{sub_feature}/widgets/{widget_name}.dart`.
> - **Shared widget catalog**: `lib/ui/widgets/` (vd `AppButton`, `AppBarCustom`, `AppDialog`, `BaseFormBottomSheet`) — reuse trước khi build mới.
> - **Repositories**: `lib/core/repositories/{domain}/{name}_repository.dart` — `@LazySingleton(as: ...)`, inject `GraphQLService`. **KHÔNG** colocate repository trong feature dir.
> - **DataSource**: **KHÔNG có separate layer** trong Garage mobile — GraphQL call DIRECT trong repository qua `_graphQLService.client.mutate/query(MutationOptions(document: gql(...)))`. KHÔNG emit `*_remote_datasource.dart`.
> - **Models**: `lib/core/models/{domain}/{name}_model.dart` (entity), `lib/core/models/request/{domain}/{name}_request.dart`, `lib/core/models/response/{domain}/{name}_response.dart`. **KHÔNG** colocate model trong feature dir.
> - **Router**: **`auto_route` 10.1.0+1** (KHÔNG `go_router`) — `@RoutePage()` decorator trên page class, `lib/core/router/router.dart` + `router.gr.dart` (codegen). Guards: `AuthGuard`, `PermissionGuard`.
> - **DI**: `injectable` + `get_it` — `@Injectable()` trên Cubit; `@LazySingleton(as: ...)` trên Repository.
> - **Verify**: `mobile/gf-garage-app/lib/ui/inventory/inventory_list/` là exemplar (`inventory_list_page.dart` + `inventory_list_cubit.dart` + `inventory_list_state.dart` + `widgets/`).

### 5.1 Pages

> **MANDATORY (W03 retro Flow 9 — 2026-07-07)**: mỗi row PHẢI có `figma_node_id:` verbatim từ Figma spec §1 `_node_id:` — CẤM để `{{figma-url}}` placeholder khi commit spec. Reviewer item #16 count cross-check + item #17 verbatim label audit dựa trên node ID này để verify Figma vs impl mapping. Missing = **P0 REJECTED** (agent-checklist-gate D11-a).

| Page | auto_route path (@RoutePage) | Modifies/New | figma_node_id (verbatim) | figma_png (path) | AC ref |
|---|---|---|---|---|---|
| `{{PageName}}Page` | `/{{path}}/:{{id}}` | NEW | `21254:52586` | `Product/ux/figma-mobile/assets/wave{{NN}}-{{slug}}/21254-52586.png` | AC-3, AC-9 |
| `{{ExistingPage}}` | `/{{existing-path}}` | MODIFY (add tab) | `21254:52061` | `Product/ux/figma-mobile/assets/wave{{NN}}-{{slug}}/21254-52061.png` | AC-11 |

### 5.2 Widgets

| Widget | Path | Change type | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|
> **⚠️ MOBILE WIDGET CATALOG verified** — author MUST cross-check mọi REUSE row vs §G.X bundle filesystem ground truth scan. Path không có trong §G.X = file KHÔNG TỒN TẠI → BUILD-NEW hoặc reuse cross-domain `lib/ui/inventory/widgets/` siblings.
>
> **Phantom widget invent forbidden**: KHÔNG declare `AppDropdown` / `AppBottomSheet` / `AppTextarea` / `AppText(...)` / `EmptyStateWidget` / `EmptyDataWidget` / `AttributeField` / `DetailRow` / `TreeView` như Flutter class — đều NOT EXISTS trong filesystem. Substitutes (xem §G.X bundle): `DropdownTextField`, `showModalBottomSheet`, `AppTextField(maxLines)`, `Text`, `LoadEmpty`, `StartInfoRow`, flat card. KHÔNG dùng package `infinite_scroll_pagination` (NOT in pubspec) — dùng `pull_to_refresh: ^2.0.0` + `ListWidget` canonical.
>
> **Path traps** (verified): `widgets/app_bar/`, `widgets/scaffold/`, `widgets/badge/`, `widgets/empty_state/`, `widgets/dropdown/` (chỉ có `picker/app_dropdown_date_picker.dart` date specialized). Real subdir layout: `button/`, `text_field/`, `list/`, `loading/`, `notify/`, `picker/`, `animations/`, `chart/`, `image_picker/`, `payment/`, `roles/`, `text_types/`, `bubble_chat/`, `camera/`, `text/`, `dropdown/` (base only).

| `{{WidgetName}}` | `lib/ui/inventory_catalog/{{sub_feature}}/widgets/{{widget_name}}.dart` | NEW | StatelessWidget | domain-specific card composition (no fit ở `lib/ui/widgets/**` per §G.X scan) | AC-3 |
| `ListWidget` | `lib/ui/widgets/list/list_widget.dart` | REUSE | StatefulWidget | **CANONICAL list pattern** — handle `isInitial/isLoading/isFailure/isEmpty` + auto-skeleton + SmartRefresher pull-down/pull-up qua RefreshController. Items = `List<Widget>` hoặc custom `child` | AC-9 |
| `LoadingRowShimmerWidget` (via ListWidget) | `lib/ui/widgets/loading/loading_row_shimmer_widget.dart` | REUSE (indirect) | StatelessWidget | shimmer skeleton từ package `shimmer: ^3.0.0`; auto-rendered bởi ListWidget khi `isInitial=true`. Manual cho Detail page custom-height | AC-1 |
| `{{ModalWidget}}` | (no widget file — sử dụng Flutter built-in) | N/A | StatelessWidget | Flutter `showModalBottomSheet(context, builder)` HOẶC reuse `lib/ui/widgets/notify/app_alert_dialog_custom.dart` (extends Material AlertDialog) — KHÔNG có `AppBottomSheet` widget trong filesystem | AC-14 |

### 5.3 Navigation

| Route | Page | Loader/Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `/{{path}}/:{{id}}` | `{{PageName}}Page` | `AuthGuard` (auto_route) | `garage://{{path}}/{id}` | AC-3 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events/States | AC ref |
|---|---|---|---|---|
| Page state | Cubit | `lib/ui/{{domain}}/{{sub_feature}}/{{sub_feature}}_cubit.dart` | `Loading / Loaded / Error` (extends BaseCubit<{{sub_feature}}State>, @Injectable) | AC-3-AC-11 |
| Form state | Bloc | `lib/ui/{{domain}}/{{sub_feature}}/{{sub_feature}}_bloc.dart` | events: `Changed / Submitted` (extends BaseBloc<Event, State>, @Injectable) | AC-3 |
| List virtualization | `pull_to_refresh: ^2.0.0` via `ListWidget` (canonical — KHÔNG `infinite_scroll_pagination`, NOT in pubspec) | `lib/ui/widgets/list/list_widget.dart` | RefreshController.refreshCompleted() / loadComplete() | AC-9 |

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

> **MANDATORY (W03 retro Flow 9 — 2026-07-07)**: mỗi row PHẢI có `graphql_operation:` verbatim từ BFF SDL + `bff_sdl_ref:` trỏ file schema thật. Rule M-33 (rules-mobile §5.3): grep BFF SDL PHẢI paste output vào §Context Intake trước khi viết `*_document.dart`. Missing = **P0 REJECTED** (agent-checklist-gate D11-b). Response union type PHẢI theo convention generator `{DataType}ApiResponse` — CẤM `{Verb}{Noun}Response` tự đặt (BUG-W03-027 P1 CRITICAL evidence).

| Operation (verbatim SDL) | Type | Response union | bff_sdl_ref | Repository class | AC ref |
|---|---|---|---|---|---|
| `createMaterialGroup` | mutation | `MaterialGroupApiResponse` | `garage-functions/agg-garage-graph/src/graphql/modules/inventory/inventory.schema.ts:L45` | `lib/core/repositories/inventory_catalog/material_group_repository.dart` (@LazySingleton) | AC-15 |
| `searchMaterialGroups` | query | `PagedMaterialGroupApiResponse` | `garage-functions/agg-garage-graph/src/graphql/modules/inventory/inventory.schema.ts:L78` | `lib/core/repositories/inventory_catalog/material_group_repository.dart` | AC-9 |

> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #17 enforce). Verify verbatim qua `python3 scripts/check_graphql_sdl_fidelity.py` trước commit (rules-mobile §5.3 M-33).

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| GET | `/protected/v1/...` | offline-sync poll | low-bandwidth | AC-{{X}} |

### 6.3 Offline-first strategy

| Concern | Pattern | Storage | Sync trigger | AC ref |
|---|---|---|---|---|
| Local cache | Hive / Isar | local DB | bg refresh + manual pull | AC-9 |
| Offline queue | workmanager + Outbox table | local DB | reconnect → flush | AC-15 |
| Conflict resolution | LWW (server wins) | — | on sync error | EC-{{X}} |

### 6.4 Platform-specific behaviors

| Concern | iOS-only | Android-only | Notes |
|---|---|---|---|
| Permissions | NSCameraUsage info.plist | `<uses-permission CAMERA>` | scanner FEAT |
| Push notification | APNs | FCM | AC-{{X}} |
| Background task | BGProcessingTask | WorkManager | sync queue |
| Deep link | Universal Link | App Link | `garage://...` |

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/garage-mobile/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/{{domain}}/{{sub_feature}}/` | `{{sub_feature}}_page.dart` | NEW | Page (@RoutePage, StatelessWidget) | ~220 | AC-{{X}} |
| `lib/ui/{{domain}}/{{sub_feature}}/widgets/` | `{{widget}}.dart` | NEW | Card-based (local widget) | ~280 | AC-3-AC-11 |
| `lib/ui/{{domain}}/{{sub_feature}}/` | `{{sub_feature}}_cubit.dart` | NEW | Cubit (BaseCubit<State>, @Injectable) | ~150 | AC-3-AC-11 |
| `lib/ui/{{domain}}/{{sub_feature}}/` | `{{sub_feature}}_state.dart` | NEW | @freezed union state | ~120 | AC-3 |
| `lib/core/repositories/{{domain}}/` | `{{entity}}_repository.dart` | NEW | @LazySingleton(as: {{Entity}}Repository), GraphQLService injected | ~80 | AC-9, AC-15 |
| `lib/core/models/{{domain}}/` | `{{entity}}_model.dart` | NEW | @freezed + @JsonSerializable | ~80 | — |
| `lib/core/repositories/{{domain}}/` | (fold into repository — Garage mobile **KHÔNG** có separate datasource layer; GraphQL call direct trong repository) | — | — | — | — |
| (omit) | offline cache (Hive/Isar) — chỉ thêm khi feature thực sự cần offline (KHÔNG default) | — | — | — | (offline opt-in) |
| `lib/core/router/` | `router.dart` (+ `router.gr.dart` codegen) | MODIFY (add @RoutePage route entry) | auto_route 10.1.0+1 | ~15 | AC-3 |
| `lib/i18n/{{lang}}.arb` | — | ADDITIVE | flutter_localizations | ~30 | AC-3-AC-14 |
| `test/features/{{slice}}/` | `{{name}}_test.dart` | NEW | bloc_test + widget | ~180 | AC-3-AC-11 |
| `integration_test/` | `{{slice}}_e2e_test.dart` | NEW | patrol / integration_test | ~120 | (smoke) |

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 song song với FE Web S6 (cùng entry: BFF S5 stable). Mobile S6 exit hand-off Patrol E2E.

```
(← BFF tier S5: SDL + resolver stable)

S6  Mobile UI wire (Flutter)
    Entry: BFF S5 SDL stable + Figma confirmed + permission flow agreed
    Exit: Patrol E2E happy path green
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Widgets + bloc + repo + i18n | features + router + i18n | BFF S5 stable | Patrol E2E green | BFF S5 |

## 9. Business Rules to enforce (Mobile — UI hint + offline secondary)

> Mobile KHÔNG enforce business validation primary. Mobile chỉ:
> - Client-side validation hint (UX feedback)
> - Offline cache validation (LWW conflict)
> - RBAC-driven render
> - Platform permission gate

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-{{X}}-001` | CORNERSTONE | inline error hint | `widgets/{{form}}.dart::onChanged` | AC-3 | BE final enforce |
| `BR-{{X}}-RBAC-001` | CORNERSTONE | hide widget khi !canEdit | `widgets/{{action}}_button.dart` | AC-16 | Visibility |
| `BR-{{X}}-OFFLINE-001` | NORMAL | offline queue cap 100 | `data/sync_queue.dart` | AC-{{X}} | drop oldest |

> **Primary enforcement** = BE tier (`features/be/FEAT-{{FEAT-ID}}.md §9`).

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-0 | UI (negative — widget ẩn) | test-mobile-ui | gate Create form |
| AC-1 | Widget test (toggle) | test-mobile-ui | flutter_test |
| AC-3 | Widget test (form validation) | test-mobile-ui | bloc_test |
| AC-11 | Widget test (calculation display) | test-mobile-ui | golden snapshot |
| AC-16 | Widget test (RBAC visibility) | test-mobile-ui + test-isolation | dual persona |
| (smoke) | Mobile E2E happy path | test-mobile-e2e | Patrol / integration_test |
| (offline) | Repository + sync queue test | test-mobile-ui | Hive mock |

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

| Key | vi | en | AC ref |
|---|---|---|---|
| `{{slice}}_{{key}}_title` | "{{vi}}" | "{{en}}" | AC-3 |
| `{{slice}}_{{key}}_error` | "{{vi}}" | "{{en}}" | AC-14 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-3 | `Semantics(label: ...)` cho Input | TalkBack/VoiceOver |
| AC-9 | `SemanticsService.announce` cho list update | live region |
| AC-11 | Contrast WCAG AA cho read-only field | tokens |
| AC-14 | `Semantics(liveRegion: true)` cho inline error | announce on change |

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W{{NN}}/Product/features/be/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE}} | BR primary enforcement, contract source |
| BFF | `Execution/wave-specs/W{{NN}}/Product/features/bff/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE/N-A}} | GraphQL ops consumed (§6.1) |
| FE Web | `Execution/wave-specs/W{{NN}}/Product/features/fe-web/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE/N-A}} | Share feature scope khi cùng wave |

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/BFF/FE files.

## 13. References

- **Source**: [`Product/features/FEAT-{{FEAT-ID}}.md`](../../../../../Product/features/FEAT-{{FEAT-ID}}.md) v{{N}}
- **Paired BE**: [`features/be/FEAT-{{FEAT-ID}}.md`](../be/FEAT-{{FEAT-ID}}.md)
- **Paired BFF**: [`features/bff/FEAT-{{FEAT-ID}}.md`](../bff/FEAT-{{FEAT-ID}}.md) (nếu has_bff_touchpoint)
- **UX flow**: [`Product/ux/UX-FLOW-{{slug}}.md`](../../../../../Product/ux/UX-FLOW-{{slug}}.md)
- **HLD Mobile**: [`Architecture/hld/{{experience-mobile}}-HLD.md`](../../../../../Architecture/hld/{{experience-mobile}}-HLD.md)
- **Integration Mobile↔BFF**: [`Architecture/integrations/INTEG-MOB-{{experience-mobile}}-*.md`](../../../../../Architecture/integrations/)
- **PKG**: [`PKG-W{{NN}}-{{slug}}.md`](../../../../work-packages/PKG-W{{NN}}-{{slug}}.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| {{YYYY-MM-DD}} | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-{{FEAT-ID}}` W{{NN}}. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm Mobile, §3 Mobile behaviour map per AC-ID, §4 visual + state + native interaction + offline + i18n + a11y + RBAC + BR secondary + perf + error mapping, §5-§11 Mobile-specific (screens/widgets/Bloc/repository/cross-tier pair). Source FEAT chỉ audit. |

---

<!-- TEMPLATE Evolution Audit (KHÔNG copy vào instance spec) -->

## Template Change Log

| Date | Template Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | T2 | Delivery Authority (sonndt — in-session post W03 audit) | **Pattern align với real Garage mobile codebase** — đóng layer 1 gap đã gây 4 đợt fix W03 specs hôm nay. Updated defaults: (a) `screens_touched` example `lib/features/auth/login_screen.dart` → `lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart` (flat 3-level `lib/ui/{domain}/{sub_feature}/{name}_page.dart`, NOT web Clean Architecture nesting); (b) `flutter_packages` example `[bloc, freezed, get_it, go_router]` → `[flutter_bloc, freezed, get_it, injectable, auto_route, graphql_flutter, gap]` (real `pubspec.yaml`, `auto_route 10.1.0+1` NOT `go_router`); (c) §5.1 table header `go_router path` → `auto_route path (@RoutePage)`; (d) §5.1 class `*Screen` → `*Page` (codebase 125 `_page.dart` vs 1 `_screen.dart`); (e) §5.2-§7 widget/cubit/repository/model paths normalize từ `lib/features/{slice}/presentation\|application\|data/` → flat `lib/ui/{domain}/{sub_feature}/` cho UI + `lib/core/repositories/{domain}/` cho repo + `lib/core/models/{domain}/` cho model; (f) DataSource separate layer **REMOVED** (real Garage mobile fold graphql_flutter call DIRECT trong repository qua `GraphQLService`); (g) §4.1 design tokens `lib/theme/**` → `lib/core/common/styles/{app_colors,app_text_styles,app_sizes,app_shadows}.dart`; (h) §4.5 i18n path verify `mobile/gf-garage-app/lib/l10n/`; (i) §4.6 RBAC `go_router redirect` → `auto_route AuthGuard/PermissionGuard`. Header note §5 thêm "PATH CANONICAL Garage mobile" block 10-line cheat sheet. Cross-ref: `rules-mobile/SKILL.md` §0/§2/§3 + `_ref-mobile-transform-figma.md` v9 + real codebase `mobile/gf-garage-app/lib/ui/inventory/inventory_list/` exemplar. T1 (legacy template default web Clean Arch) → T2. |
| 2026-XX-XX | T1 | Delivery Authority | Initial template (Policy v2 tier-authoritative). |
