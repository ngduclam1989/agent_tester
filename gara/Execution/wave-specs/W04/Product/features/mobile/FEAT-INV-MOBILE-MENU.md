---
type: execution
artifact_kind: converted-feature
tier_role: mobile
source_ref: "Product/features/FEAT-INV-MOBILE-MENU.md"
source_version: 3
source: "gen-execution-spec"
source_feat_id: "FEAT-INV-MOBILE-MENU"
source_feat_sha: "01742b27ecf68e515ad96190405c94c641f736acb96114c25879200bdfad93f9"
generated_at: "2026-07-08T04:51:55+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
experience: "garage-mobile"
platform: mobile
modifies: []
change_type: "brownfield-enhancement"
consumes_backend_feats: []
consumes_bff_feats: []
screens_touched: ["lib/ui/inventory/inventory_hub/inventory_hub_page.dart"]
flutter_packages: ["flutter_bloc", "get_it", "injectable", "auto_route", "firebase_remote_config", "easy_localization"]
figma_refs:
  - "Product/ux/figma-mobile/wave04-inv-mobile-menu.md (node 21729:24201 — Hub screen \"Quản lý kho hàng\", root frame 21519:27371)"
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "not-computed (no SHA tool available in authoring session — orchestrator to backfill)"
  template_sha: "not-computed (no SHA tool available in authoring session — orchestrator to backfill)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-INV-MOBILE-MENU.mobile.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-INV-MOBILE-MENU (Mobile): Màn quản lý kho hàng — hub điều hướng mobile

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12. **Feature này KHÔNG có tier BE/BFF/FE-web tương ứng** — hub là mobile-only, pure client-side navigation, zero backend call (BR-INV-MENU-003).

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INV-MOBILE-MENU` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) — **mobile-only**, không có FE-web tương đương |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../../../../Product/epics/EP-INVENTORY-CATALOG.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `lib/ui/inventory/inventory_hub/inventory_hub_page.dart` (MODIFY — page đã ship từ W03, xem §7) |
| Flutter packages | `flutter_bloc`, `get_it`, `injectable`, `auto_route`, `firebase_remote_config`, `easy_localization` |
| Cross-tier consume | BE: (không có) \| BFF: (không có) — pure client navigation |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INV-MOBILE-MENU` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INV-MOBILE-MENU.md`](../../../../../Product/features/FEAT-INV-MOBILE-MENU.md) |
| Source version | v3 |
| Source SHA | `01742b27ecf68e515ad96190405c94c641f736acb96114c25879200bdfad93f9` |
| Generated at | 2026-07-08T04:51:55+00:00 |

## 1. Mục đích nghiệp vụ

Garage cần một điểm vào (entry point) duy nhất trên app mobile để chủ garage/kế toán truy cập nhanh các module Quản lý kho hàng V2, thay vì phải dò tìm qua menu dài. Hub tile-grid giúp người dùng nhận diện module bằng icon trực quan, đồng thời cho phép hệ thống mở dần từng module theo tiến độ ship (W03→W06) mà không phá vỡ trải nghiệm điều hướng đã quen thuộc. Đây là nền tảng điều hướng cho toàn bộ Epic Inventory V2 trên mobile — web dùng sidebar tương ứng, không cần hub riêng.

## 2. Trách nhiệm Mobile (`garage-mobile`)

- Duy trì màn hub `InventoryHubPage` (đã ship từ W03, entry qua mission tile "Quản lý kho hàng" tại Home) — render header AppBar + grid 2 cột các tile module kho **đã enable** theo state matrix hiện hành.
- **W04 delta**: mở rộng state matrix client-side để bật thêm tile **"Tồn đầu kỳ"** (trỏ tới `FEAT-OB-LIST` mobile view-only) bên cạnh 2 tile đã có từ W03 ("Sản phẩm", "Nhóm vật tư"); 3 tile còn lại ("Phiếu nhập", "Phiếu xuất", "Tồn kho") tiếp tục ẨN HOÀN TOÀN cho tới W05/W06.
- **W04 delta**: bổ sung gate feature-flag `Inventory:InventoryV2` qua Firebase RemoteConfig — khi flag OFF, toàn bộ hub coi như không có module nào khả dụng (tái dùng pattern empty-state đã định nghĩa ở EC-2 nguồn).
- Tap tile → push route sub-module tương ứng qua `auto_route`, giữ back stack (back từ sub-module quay lại hub, không phải root); debounce 300ms chống double-tap.
- KHÔNG gọi GraphQL/REST cho bản thân màn hub — pure client-side navigation (BR-INV-MENU-003); permission gate diễn ra ở route đích, không tại hub (BR-INV-MENU-003, AC-6).
- i18n label ARB cho header + tile label + empty state; a11y `Semantics` cho từng tile (screen-reader announce tên module khi focus).

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage gate: 8/8 source AC-ID cover ở §3 hoặc §4.

### Cluster A — Hiển thị màn hub

#### AC-1 → Mở màn hub từ mission tile Home

- **Khi**: người dùng tap mission tile "Quản lý kho hàng" trong grid mission tile màn Home (Sảnh chính).
- **Mobile phải**: push route `InventoryHubRoute` qua `auto_route`, giữ nguyên back stack Home phía dưới.
- **State transition**: N/A (điều hướng, không có state loading — hub render ngay từ client-side constant, xem AC-4).
- **Widget**: entry point là widget Home mission tile hiện hữu (ngoài phạm vi file map FEAT này — xem §12 cross-FEAT touchpoint); `InventoryHubPage` là widget đích.
- **GraphQL op**: không có.
- **i18n key (ARB)**: nhãn mission tile Home thuộc FEAT khác — không đổi ở đây.
- **a11y**: N/A tại AC này (thuộc entry point Home).
- **Ref**: HLD `garage-mobile-HLD.md` §11b.1 (evidence code W03 `mission_function_widget.dart:107-110`), Figma node `21729:24201`.

#### AC-2 → Header "Quản lý kho hàng"

- **Khi**: màn `InventoryHubPage` render.
- **Mobile phải**: hiển thị `CustomAppBar` với title verbatim **"Quản lý kho hàng"** (KHÔNG đổi tên) + nút back (←) bên trái + chuông thông báo + signal/battery icon theo template app hiện hành (kế thừa `CustomAppBar` sẵn có).
- **State transition**: static, không có loading state cho header.
- **Widget**: REUSE `CustomAppBar` (`lib/ui/widgets/custom_app_bar.dart`).
- **GraphQL op**: không có.
- **i18n key (ARB)**: `inventory_hub_title` = "Quản lý kho hàng" (vi) / "Warehouse Management" (en).
- **a11y**: `Semantics(header: true, label: LocaleKeys.inventory_hub_title.tr())`.
- **Platform-specific**: không.
- **Ref**: Figma icon catalog `chevron-back` → `Icons.arrow_back_ios_new` (§G.Y bundle), node `21519:27371`.

#### AC-3 → Tile grid 2 cột

- **Khi**: màn render với danh sách tile đã enable từ state matrix (xem AC-4).
- **Mobile phải**: render `GridView` 2 cột (Flutter `SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2)`), mỗi tile gồm: icon (vòng tròn nhạt 48×48 + biểu tượng) ở trên, nhãn tile ở dưới, padding đều, shadow nhẹ + bo góc (`BoxDecoration` + `AppShadow.*` token). Thứ tự cố định theo bảng state matrix nguồn §3 FEAT gốc (Sản phẩm · Nhóm vật tư · Phiếu nhập · Phiếu xuất · Tồn kho · Tồn đầu kỳ) — tile ẩn bị lọc ra trước khi build grid, các tile còn lại tự reflow giữ đúng thứ tự tương đối.
- **State transition**: `InventoryHubCubit` emit 1 state duy nhất chứa `List<InventoryHubTile>` đã filter (không có network loading state — data là constant, chỉ phụ thuộc RemoteConfig fetch xong hay chưa — xem AC-4).
- **Widget**: NEW `InventoryHubTileWidget` (local widget, `lib/ui/inventory/inventory_hub/widgets/inventory_hub_tile_widget.dart`) — build-new, không có widget fit trong `lib/ui/widgets/**` cho pattern "icon tròn + nhãn dưới" theo §G.X scan (container/badge/chip không đúng semantic). Icon asset render qua REUSE `AppImage` (`lib/ui/widgets/images/app_image.dart`).
- **GraphQL op**: không có.
- **i18n key (ARB)**: nhãn tile lấy theo key riêng từng tile (xem bảng AC-4).
- **a11y**: mỗi tile `Semantics(button: true, label: "Mở {tileLabel}")`.
- **Platform-specific**: không.
- **Ref**: Figma icon catalog "tile-icon" (§G.Y bundle) — 48×48 circle blue-tint bg; screenshot `assets/wave04-inv-mobile-menu/21519-27371.png`.

#### AC-4 → Tile chỉ render khi module đã ship — ẨN tile chưa ship (W04 state matrix)

- **Khi**: hub cần quyết định danh sách tile hiển thị.
- **Mobile phải**: filter tile theo state matrix client-side constant cho W04:

| Tile | Trạng thái W04 | FEAT đích | Route |
|---|---|---|---|
| Sản phẩm | ✅ hiện (từ W03) | `FEAT-CAT-PROD-LIST` (view-only) | route sẵn có W03 |
| Nhóm vật tư | ✅ hiện (từ W03) | `FEAT-CAT-GRP-LIST` (full CRUD) | route sẵn có W03 |
| **Tồn đầu kỳ** | ✅ hiện **(mới W04)** | `FEAT-OB-LIST` (view-only) | route mới — cross-FEAT, xem §12 |
| Phiếu nhập | ❌ ẩn hoàn toàn | `FEAT-IR-LIST-V2` (W05) | — |
| Phiếu xuất | ❌ ẩn hoàn toàn | `FEAT-ID-LIST-V2` (W05) | — |
| Tồn kho | ❌ ẩn hoàn toàn | `FEAT-STK-LIST-V2` (W06) | — |

  Không hiển thị placeholder, không hiển thị badge "Sắp ra mắt" cho tile ẩn (hide-only strategy, BA quyết 2026-06-29).
- **Feature-flag gate bổ sung (W04, CR-20260707-02 — RemoteConfig, không phải AC nguồn nhưng ràng buộc trực tiếp AC-4)**: trước khi build danh sách tile, `InventoryHubCubit` check `FirebaseRemoteConfig.instance.getBool('Inventory:InventoryV2')` — nếu `false` → toàn bộ 3 tile active bị coi như KHÔNG có module nào khả dụng, hub render empty state (tái dùng pattern EC-2 nguồn: **"Chưa có module nào khả dụng"**). Xem §4.6 chi tiết fetch/fallback.
- **State transition**: `InventoryHubCubit` state `loaded(tiles: [])` khi flag OFF hoặc tất cả tile ẩn; `loaded(tiles: [...3 tiles])` khi bình thường.
- **Widget**: `LoadEmpty`-style empty view custom (do template `LoadEmpty` gắn với `ListWidget`, ở đây cần custom static message widget — REUSE text/icon compose từ `lib/ui/widgets/loading/empty_data_widget.dart` nếu generic-compatible, verify tại DEV time; nếu không fit → build inline `Column(icon + Text)` đơn giản).
- **GraphQL op**: không có (RemoteConfig, không phải GraphQL/REST).
- **i18n key (ARB)**: `inventory_hub_tile_product`, `inventory_hub_tile_material_group`, `inventory_hub_tile_opening_balance`, `inventory_hub_empty_state`.
- **a11y**: empty state `Semantics(liveRegion: true, label: LocaleKeys.inventory_hub_empty_state.tr())`.
- **Ref**: FEAT nguồn §3 state matrix v2, HLD §11b.1, CR-20260707-02 scope item (5).

#### AC-5 → Tap tile → điều hướng tới sub-module

- **Khi**: người dùng tap 1 tile bất kỳ đang hiển thị.
- **Mobile phải**: push route tới màn list sub-module tương ứng (route đã có từ W03 cho Sản phẩm/Nhóm vật tư; route mới tới `OpeningBalanceListRoute` cho tile "Tồn đầu kỳ" — sở hữu bởi `FEAT-OB-LIST` mobile, không thuộc file map FEAT này). Back stack preserve — back từ sub-module quay về hub.
- **State transition**: N/A (điều hướng thuần).
- **Widget**: `InventoryHubTileWidget.onTap` callback qua `InventoryHubCubit` hoặc trực tiếp `context.router.push(...)`.
- **GraphQL op**: không có (thuộc sub-module đích).
- **i18n key (ARB)**: N/A.
- **a11y**: N/A (đã cover ở AC-3 Semantics button).
- **Platform-specific**: debounce navigation 300ms (EC-3 nguồn) — dùng `SingleTapDetector` (`lib/ui/widgets/tap_detector/single_tap_detector.dart`, REUSE) hoặc cờ `_isNavigating` trong Cubit.
- **Ref**: BR-INV-MENU-004 (tap tile → push route giữ back stack).

### Cluster B — Phân quyền

#### AC-6 → Phân quyền truy cập hub — không filter tại hub

- **Khi**: chủ garage hoặc kế toán mở màn hub.
- **Mobile phải**: KHÔNG filter tile theo role tại lớp hub — cả 2 persona thấy đúng cùng 1 danh sách tile đã enable (theo state matrix + RemoteConfig, không theo permission). Permission per sub-module được gate ở route đích (route guard `PermissionGuard` của sub-FEAT, ngoài phạm vi FEAT này).
- **State transition**: N/A — cùng 1 state cho mọi persona.
- **Widget**: không có widget riêng cho role filter (chủ ý KHÔNG implement filter).
- **GraphQL op**: không có.
- **i18n key (ARB)**: N/A.
- **a11y**: N/A.
- **Ref**: BR-INV-MENU-003, tương tự pattern `BR-WH-002` (tenant-scoped only, không role-scoped ở layer này).

### Cluster C — Tenant isolation & Platform scope

#### AC-7 → Phạm vi theo garage

- **Khi**: người dùng đăng nhập garage X mở màn hub.
- **Mobile phải**: hub không hiển thị dữ liệu thuộc garage khác — thỏa mãn tự nhiên vì hub là pure client navigation, zero data fetch (không có gì để leak). Tenant isolation thực sự enforce ở từng sub-module sau khi tap (ngoài phạm vi FEAT này).
- **State transition**: N/A.
- **Widget**: N/A.
- **GraphQL op**: không có.
- **i18n key (ARB)**: N/A.
- **a11y**: N/A.
- **Ref**: BR-INV-MENU-003 (pure client, no BFF/BE call).

#### AC-8 → Phạm vi nền tảng — mobile-only

- **Khi**: BA/Architecture review scope.
- **Mobile phải**: implement hub CHỈ trên mobile. Nhãn tile (`Sản phẩm`, `Nhóm vật tư`, `Tồn đầu kỳ`) phải khớp verbatim với label sidebar web tương ứng (per FEAT-CAT-PROD-LIST / FEAT-CAT-GRP-LIST / FEAT-OB-LIST fe-web sidebar item — cross-tier label consistency, không phải cross-tier logic reuse). Không tạo counterpart FE-web cho FEAT này.
- **State transition**: N/A (scope declaration, không phải runtime behaviour).
- **Widget**: N/A.
- **GraphQL op**: không có.
- **i18n key (ARB)**: dùng chung key với AC-3/AC-4 (label nhất quán 2 platform ở tầng content, không phải code-share).
- **a11y**: N/A.
- **Ref**: Source FEAT §Metadata "Platform scope: Mobile only".

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Không re-invent layout/spacing/color — bám Figma node `21729:24201` / root frame `21519:27371` (`Product/ux/figma-mobile/wave04-inv-mobile-menu.md`).
- Design tokens: `AppColors.*` / `AppTextStyle.*` / `AppSizes.spacing*` / `AppShadow.*` từ `lib/core/common/styles/`. **KHÔNG** hardcode `Color(0xFF…)` / `TextStyle(...)` literal.
- **AppBar title token — LL-MOB-009 lesson**: dùng `AppTextStyle.textSubtitleS4` cho title "Quản lý kho hàng" — **KHÔNG** dùng `textHeadingH3` (sai token đã gây incident wave03, 8/8 mobile spec).
- Tile icon circle background: token màu cụ thể (vd `AppColors.primaryLight` hoặc tương đương blue-tint 10%) **NEED CONFIRMATION** — DEV verify tên token chính xác trong `app_colors.dart` khớp Figma screenshot (circle blue bg), KHÔNG hardcode hex.
- Responsive: phone/tablet qua `MediaQuery`/`LayoutBuilder` cho grid cross-axis-count (2 cột phone, có thể 3+ cột tablet — verify Figma có breakpoint tablet hay không, nếu không có thì giữ 2 cột mọi kích thước).
- Không áp dụng rule "required asterisk" (FEAT này không có form).

### 4.2 State machine + error handling

- Bloc/Cubit state: `initial | loaded(tiles, isFlagLoading)` — KHÔNG có network `error` state cổ điển vì hub zero-backend; "error" duy nhất có thể là RemoteConfig fetch fail → xử lý bằng fallback default ON (xem §4.6), KHÔNG hiển thị SnackBar lỗi cho user (fail-open, invisible fallback).
- Không silent fail: log RemoteConfig fetch fail qua Crashlytics/logger (non-blocking).
- Không áp dụng rule form-validity gating (FEAT này không có form/submit button).

### 4.3 Native interaction + permission

- Không có native permission nào cần xin (camera/storage/location) cho FEAT này.
- Không có deeplink scheme riêng cho hub (entry point chỉ qua mission tile Home).

### 4.4 Offline + connectivity

- Hub là **online-independent** cho phần render tile (state matrix là constant, không cần network) — hub vẫn hiển thị đúng ngay cả khi offline.
- RemoteConfig fetch có thể fail khi offline → dùng cached/fallback value (default ON) — xem §4.6. KHÔNG hiển thị banner offline cho riêng màn hub (banner offline là app-wide concern, ngoài phạm vi FEAT này).
- Retry: không cần retry logic riêng — RemoteConfig tự fetch lại ở lần resume kế tiếp.

### 4.5 i18n + a11y

- Mọi label qua ARB key (`mobile/gf-garage-app/lib/l10n/intl_vi.arb` + `intl_en.arb`) — KHÔNG hardcode tiếng Việt inline. LocaleKeys MANDATORY (M-30).
- a11y: `Semantics` cho mỗi tile (label = tên module + "Mở"); `Semantics(header: true)` cho AppBar title; tap target tile ≥ 48dp (đã đảm bảo qua kích thước tile card); contrast WCAG AA cho label + icon.

### 4.6 RBAC render + feature flag

- **Feature flag `Inventory:InventoryV2`** (CR-20260707-02, status RAISED/PENDING_APPROVAL tại thời điểm author spec — flag CHƯA formal APPROVED, implement theo design đã mô tả trong CR, chờ REVIEW_GROUP sign-off trước GA) — cơ chế: **Firebase RemoteConfig** (package `firebase_remote_config`, đã có sẵn trong baseline `pubspec.yaml` qua Firebase Core, KHÔNG phải flow `AppFeatureFlag`/GraphQL flag hiện hữu — quyết định kiến trúc riêng cho mobile theo CR scope item (5)).
  - **Fetch trigger**: gọi `FirebaseRemoteConfig.instance.fetchAndActivate()` khi `AppLifecycleState.resumed` (app quay lại foreground) — không fetch mỗi lần mở hub để tránh network overhead; giá trị cached dùng cho các lần mở hub tiếp theo trong cùng session.
  - **Fallback**: nếu fetch fail (network lỗi/timeout) → dùng **compile-time constant default `true` (ON)** — đồng bộ với default ON server-side (per CR: "tránh false-OFF UX khi network yếu"). Flag hoạt động như **kill-switch per-tenant**, KHÔNG phải pilot rollout gate.
  - **Khi OFF**: `InventoryHubCubit` trả `tiles: []` → hub render empty state (tái dùng EC-2 pattern, xem AC-4).
  - **NEED CONFIRMATION**: liệu mission tile Home (entry point) cũng cần ẩn khi flag OFF, hay chỉ hub-content ẩn (thiết kế hiện tại chọn phương án **B — chỉ ẩn nội dung hub**, giữ mission tile Home luôn hiển thị, để tránh đụng file `mission_function_widget.dart` ngoài phạm vi FEAT này/tránh cross-FEAT scope creep). Nếu BA/Architecture yêu cầu ẩn cả mission tile Home → cần CR bổ sung + touch file Home domain (ngoài file map §7 hiện tại).
- Không filter theo role tại hub (AC-6) — `PermissionGuard` chỉ áp dụng ở route đích của từng sub-module.

### 4.7 Business rule secondary (UI hint)

- FEAT này **không có tier BE** — BR-INV-MENU-001..004 được enforce **primary tại chính mobile client** (không phải secondary hint) vì hub là pure client-side feature, không có backend đối chiếu:
  - `BR-INV-MENU-001` (thứ tự + label cố định) — enforce qua constant list trong `InventoryHubCubit`, không cho phép user reorder/relabel.
  - `BR-INV-MENU-002` (tile enable theo GA state) — enforce qua state matrix hard-code (AC-4).
  - `BR-INV-MENU-003` (dual persona, permission ở route đích) — enforce qua thiết kế "không filter tại hub" (AC-6).
  - `BR-INV-MENU-004` (push route giữ back stack) — enforce qua `auto_route` mặc định push behaviour (AC-5).

### 4.8 Performance

- Hub load target ≤ 50ms render (client-side constant, không network) per `garage-mobile-HLD.md` §11b.4 item 1.
- Tile-tap → next-screen navigation ≤ 100ms (route push + lazy-load màn đích).
- Không dùng `ListWidget`/pagination cho hub (không phải list scroll — grid cố định tối đa 6 item, không cần virtualization).
- Avoid rebuild toàn screen — `const` constructor cho tile widget không đổi giữa các state.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| (không có — hub zero-backend, không có BFF error code nào áp dụng) | — | — | — |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `InventoryHubPage` | `InventoryHubRoute` (route path kế thừa từ W03, không đổi) | **MODIFY** (đã ship W03 — thêm tile "Tồn đầu kỳ" + RemoteConfig gate) | `21729:24201` (node hub), `21519:27371` (root frame) | AC-1, AC-2, AC-3, AC-4, AC-5 |

### 5.2 Widgets

| Widget | Path | Change type | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|
| `CustomAppBar` | `lib/ui/widgets/custom_app_bar.dart` | REUSE | StatelessWidget | AppBar title "Quản lý kho hàng" + back + notification bell — canonical flat path (KHÔNG `widgets/app_bar/custom_app_bar.dart` — path trap §G.X) | AC-2 |
| `InventoryHubTileWidget` | `lib/ui/inventory/inventory_hub/widgets/inventory_hub_tile_widget.dart` | NEW | StatelessWidget | build-new — justification: không có widget fit pattern "icon tròn 48×48 + nhãn dưới, shadow nhẹ" trong `lib/ui/widgets/**` (container/badge/chip không đúng semantic) per §G.X scan | AC-3, AC-4 |
| `AppImage` | `lib/ui/widgets/images/app_image.dart` | REUSE (indirect, render icon asset trong tile) | StatelessWidget | render icon SVG/PNG 48×48 cho từng tile | AC-3 |
| `SingleTapDetector` | `lib/ui/widgets/tap_detector/single_tap_detector.dart` | REUSE | StatelessWidget | debounce chống double-tap trên `InventoryHubTileWidget.onTap` | AC-5 |
| Empty state widget | inline `Column(icon + Text)` hoặc REUSE `lib/ui/widgets/loading/empty_data_widget.dart` nếu generic-compatible (verify tại DEV time) | NEW/REUSE (verify) | StatelessWidget | render "Chưa có module nào khả dụng" khi `tiles.isEmpty` (flag OFF hoặc tất cả tile ẩn) | AC-4 |

### 5.3 Navigation

| Route | Page | Loader/Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `InventoryHubRoute` | `InventoryHubPage` | `AuthGuard` (auto_route, kế thừa W03) | không có (entry chỉ qua mission tile Home) | AC-1 |
| (tile "Sản phẩm") | route sub-FEAT `FEAT-CAT-PROD-LIST` (sẵn có W03) | `AuthGuard` + `PermissionGuard` tại đích | — | AC-5 |
| (tile "Nhóm vật tư") | route sub-FEAT `FEAT-CAT-GRP-LIST` (sẵn có W03) | `AuthGuard` + `PermissionGuard` tại đích | — | AC-5 |
| (tile "Tồn đầu kỳ") | route `OpeningBalanceListRoute` — **sở hữu bởi `FEAT-OB-LIST` mobile spec** (cross-FEAT, không thuộc file map FEAT này) | `AuthGuard` + `PermissionGuard` tại đích | — | AC-5 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events/States | AC ref |
|---|---|---|---|---|
| Hub state | Cubit | `lib/ui/inventory/inventory_hub/inventory_hub_cubit.dart` | `InventoryHubState` (`@freezed`): `loaded(tiles: List<InventoryHubTile>)` — computed từ state-matrix constant AND-combine với RemoteConfig flag result. `extends BaseCubit<InventoryHubState>`, `@Injectable()` | AC-3, AC-4 |
| RemoteConfig fetch lifecycle | mixin `WidgetsBindingObserver` trong `InventoryHubPage` hoặc app-wide resume stream đã có sẵn (`GlobalEvent`, verify) → gọi `cubit.refreshFlag()` khi `AppLifecycleState.resumed` | `inventory_hub_page.dart` + `inventory_hub_cubit.dart` | `refreshFlag()` method | AC-4 |

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter | Repository class | AC ref |
|---|---|---|---|---|
| (không có — hub là pure client-side navigation, zero GraphQL call, per BR-INV-MENU-003) | — | — | — | — |

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| (không có) | — | — | — | — |

### 6.3 Offline-first strategy

| Concern | Pattern | Storage | Sync trigger | AC ref |
|---|---|---|---|---|
| Tile state matrix | Client-side constant (hard-code per app version) | in-memory (Cubit) | app release (upgrade wave adds tile) | AC-4 |
| RemoteConfig flag `Inventory:InventoryV2` | Firebase RemoteConfig SDK cache (built-in) | Firebase SDK local cache | `AppLifecycleState.resumed` fetch, fallback default ON khi fail | AC-4 |

### 6.4 Platform-specific behaviors

| Concern | iOS-only | Android-only | Notes |
|---|---|---|---|
| RemoteConfig | Firebase iOS SDK (đã init sẵn — HLD §2 bootstrap) | Firebase Android SDK (đã init sẵn) | cùng cơ chế 2 platform, không có khác biệt |
| Push notification / Deep link / Background task | N/A cho FEAT này | N/A cho FEAT này | hub không dùng các cơ chế này |

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`. Các file dưới đây phần lớn là **MODIFY** (page/cubit/state đã ship từ W03) — W04 chỉ mở rộng state matrix + thêm RemoteConfig gate.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/inventory/inventory_hub/` | `inventory_hub_page.dart` | MODIFY (existing W03) | Page (@RoutePage, StatelessWidget) — thêm tile mới vào build | ~30 delta | AC-3, AC-4 |
| `lib/ui/inventory/inventory_hub/widgets/` | `inventory_hub_tile_widget.dart` | NEW (nếu W03 chưa tách riêng widget — verify DEV) hoặc MODIFY | Card-based tile (local widget) | ~80 | AC-3 |
| `lib/ui/inventory/inventory_hub/` | `inventory_hub_cubit.dart` | MODIFY (existing W03) — thêm logic RemoteConfig fetch + filter | Cubit (BaseCubit<State>, @Injectable) | ~60 delta | AC-4 |
| `lib/ui/inventory/inventory_hub/` | `inventory_hub_state.dart` | MODIFY (existing W03) — thêm field `isFlagEnabled`/tiles rebuild logic | @freezed union state | ~20 delta | AC-4 |
| `assets/icons/inventory_hub/` | `opening_balance.svg` (asset mới cho tile "Tồn đầu kỳ") | NEW | asset bundled | — | AC-3, AC-4 |
| `lib/i18n/{vi,en}.arb` | — | ADDITIVE | thêm key `inventory_hub_tile_opening_balance` + `inventory_hub_empty_state` (nếu chưa có từ W03) | ~10 | AC-2, AC-3, AC-4 |
| `test/ui/inventory/inventory_hub/` | `inventory_hub_cubit_test.dart` | NEW | bloc_test — verify state matrix W04 + RemoteConfig ON/OFF branch | ~120 | AC-3, AC-4, AC-6, AC-7 |
| `test/ui/inventory/inventory_hub/` | `inventory_hub_page_test.dart` | NEW | widget test + golden (alchemist) — 2 golden state: 3-tile grid / empty-state | ~100 | AC-2, AC-3, AC-4 |
| `integration_test/` | `inventory_hub_navigation_test.dart` | NEW | Patrol — tap mission tile → hub → tap tile "Tồn đầu kỳ" → back stack verify | ~80 | AC-1, AC-5 |

> **Cross-FEAT touchpoint (ngoài file map này)**: route đích `OpeningBalanceListRoute` được tạo/sở hữu bởi `FEAT-OB-LIST` mobile spec (song song wave W04) — hub chỉ tham chiếu route name, không định nghĩa. Mission tile Home (`mission_function_widget.dart`, evidence W03) KHÔNG bị chạm bởi FEAT này (xem §4.6 NEED CONFIRMATION).

## 8. Implementation sequence DAG (Mobile — S6)

> FEAT này KHÔNG phụ thuộc BFF/BE (zero backend) — entry condition khác template mặc định.

```
(← Figma confirmed + RemoteConfig key "Inventory:InventoryV2" seeded trên Firebase console, Ops concern)

S6  Mobile UI wire (Flutter) — hub state-matrix + RemoteConfig gate
    Entry: Figma confirmed + state-matrix W04 chốt (Sản phẩm/Nhóm vật tư/Tồn đầu kỳ) + RemoteConfig key seeded
    Exit: Patrol E2E happy path green (mission tile → hub → tile "Tồn đầu kỳ" → sub-screen → back)
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Cubit state-matrix mở rộng + RemoteConfig fetch/fallback + tile widget mới + i18n + a11y | features + i18n | Figma confirmed + RemoteConfig key seeded | Patrol E2E green | (song song `FEAT-OB-LIST` mobile S6 cho route đích) |

## 9. Business Rules to enforce (Mobile — primary, không có tier BE)

> FEAT này **không có** paired BE tier — 4 BR-INV-MENU enforce **primary tại mobile client** (không phải secondary UI hint như các FEAT khác).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-INV-MENU-001` | CORNERSTONE | thứ tự + label tile cố định, không cho reorder/relabel | `inventory_hub_cubit.dart::_tileStateMatrix` (constant) | AC-3 | Primary tại mobile (no BE) |
| `BR-INV-MENU-002` | CORNERSTONE | tile chỉ enable khi sub-module GA — ẩn hoàn toàn tile chưa GA, không badge | `inventory_hub_cubit.dart::_tileStateMatrix` | AC-4 | Primary tại mobile (no BE) |
| `BR-INV-MENU-003` | CORNERSTONE | không filter theo role tại hub; zero GraphQL/REST call | `inventory_hub_cubit.dart` (không có repository injection) | AC-6, AC-7 | Primary tại mobile (no BE) |
| `BR-INV-MENU-004` | NORMAL | tap tile → push route giữ back stack | `inventory_hub_tile_widget.dart::onTap` + `auto_route` default push | AC-5 | Primary tại mobile (no BE) |
| (CR-20260707-02, không phải BR-ID chính thức) | NORMAL | RemoteConfig `Inventory:InventoryV2` OFF → tiles=[] → empty state | `inventory_hub_cubit.dart::refreshFlag()` | AC-4 | Status CR RAISED/PENDING_APPROVAL tại thời điểm author — implement theo design đã mô tả, chờ REVIEW_GROUP formal approve trước GA |

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Integration/E2E (navigation từ Home) | test-mobile-e2e | Patrol — mission tile tap → route push |
| AC-2 | Widget test (AppBar render) | test-mobile-ui | verify title text + token `textSubtitleS4` |
| AC-3 | Widget test + golden | test-mobile-ui | grid 2 cột, 3 tile visible W04 |
| AC-4 | bloc_test (state matrix + RemoteConfig ON/OFF) | test-mobile-ui | mock `FirebaseRemoteConfig` cả 2 nhánh (ON/OFF/fetch-fail-fallback) |
| AC-5 | Widget test (tap → navigate) + debounce | test-mobile-ui | verify double-tap chỉ navigate 1 lần |
| AC-6 | Widget test (dual persona same grid) | test-mobile-ui + test-isolation | mock 2 persona, verify tile list identical |
| AC-7 | N/A (không có data fetch để test tenant leak — trivially satisfied) | — | ghi nhận trong test report là "N/A by design" |
| AC-8 | Review-only (platform scope declaration) | — | không có runtime test — verify qua code review không có FE-web counterpart |
| (smoke) | Mobile E2E happy path | test-mobile-e2e | Home → hub → tile "Tồn đầu kỳ" → OB list → back → back |

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

| Key | vi | en | AC ref |
|---|---|---|---|
| `inventory_hub_title` | "Quản lý kho hàng" | "Warehouse Management" | AC-2 |
| `inventory_hub_tile_product` | "Sản phẩm" | "Products" | AC-3, AC-4 |
| `inventory_hub_tile_material_group` | "Nhóm vật tư" | "Material Groups" | AC-3, AC-4 |
| `inventory_hub_tile_opening_balance` | "Tồn đầu kỳ" | "Opening Balance" | AC-3, AC-4 |
| `inventory_hub_empty_state` | "Chưa có module nào khả dụng" | "No modules available yet" | AC-4 |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-2 | `Semantics(header: true, label: title)` cho AppBar | TalkBack/VoiceOver |
| AC-3 | `Semantics(button: true, label: "Mở {tileLabel}")` per tile | focus order theo thứ tự grid (trái→phải, trên→dưới) |
| AC-4 | `Semantics(liveRegion: true)` cho empty-state message | announce khi state chuyển sang empty |
| AC-5 | tap target tile ≥ 48dp | đảm bảo qua kích thước tile card cố định |

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | (không có) | N/A | FEAT này mobile-only, không có backend tương ứng — pure client navigation |
| BFF | (không có) | N/A | zero GraphQL/REST call |
| FE Web | (không có) | N/A | Web dùng sidebar điều hướng, không có hub tile tương đương (per AC-8) — chỉ cần đồng bộ **label** tile với sidebar item của `FEAT-CAT-PROD-LIST` / `FEAT-CAT-GRP-LIST` / `FEAT-OB-LIST` fe-web |
| Cross-FEAT (mobile) | `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-LIST.md` | song song W04 | Tile "Tồn đầu kỳ" navigate tới route sở hữu bởi FEAT này — cần route name/class xác nhận khớp khi cả 2 FEAT complete |

**Source ID consistency**: FEAT này không có BE/BFF/FE-web tier sibling để đối chiếu `source_feat_sha` — chỉ tự thân mobile tier.

## 13. References

- **Source**: [`Product/features/FEAT-INV-MOBILE-MENU.md`](../../../../../Product/features/FEAT-INV-MOBILE-MENU.md) v3
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md) §3.0 (hub mobile)
- **Figma spec**: [`Product/ux/figma-mobile/wave04-inv-mobile-menu.md`](../../../../../Product/ux/figma-mobile/wave04-inv-mobile-menu.md) (node `21729:24201`)
- **HLD Mobile**: [`Architecture/hld/garage-mobile-HLD.md`](../../../../../Architecture/hld/garage-mobile-HLD.md) §11b.1
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **CR**: `Tracking/CHANGE-REQUESTS.md` CR-20260707-02 (feature-flag `Inventory:InventoryV2` backfill + mobile RemoteConfig gate)
- **Sibling W04 mobile FEAT**: `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-LIST.md` (route đích tile "Tồn đầu kỳ")
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-INV-MOBILE-MENU` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm Mobile, §3 behaviour map cover 8/8 AC nguồn, §4 visual (LL-MOB-009 AppBar token) + state machine + RemoteConfig feature-flag gate (CR-20260707-02) + i18n + a11y + BR primary (không có tier BE), §5-§11 Mobile-specific (page MODIFY từ W03, tile widget NEW, cubit state-matrix mở rộng), §12 cross-tier N/A (mobile-only feature) + cross-FEAT touchpoint với `FEAT-OB-LIST` mobile. NEED CONFIRMATION: (a) design token màu circle icon bg chính xác; (b) có cần ẩn mission tile Home khi flag OFF hay chỉ ẩn nội dung hub (chọn phương án B — chỉ ẩn nội dung). |

---

<!-- TEMPLATE Evolution Audit (KHÔNG copy vào instance spec) -->
