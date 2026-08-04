---
type: execution
artifact_kind: implementation-checklist
status: ACTIVE
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-07-08"
wave: "W04"
boundary: "garage-mobile"
checklist_source: "wave-spec"
---

# Implementation Checklist — W04 · garage-mobile

> Source: `Execution/wave-specs/W04/Product/features/mobile/FEAT-INV-MOBILE-MENU.md` (436 dòng, hub MODIFY)
> + `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-LIST.md` (530 dòng, list NEW read-only).
> Cross-ref `PKG-W04-inventory-period-opening-balance.md` §2.2.5 (garage-mobile narrow scope 2 screen)
> + §4.1 + §5.1 + CR-20260707-02 (Firebase RemoteConfig `Inventory:InventoryV2` piggyback gate hub tile).
>
> **Scope narrowed W04 mobile = 2 screen** per Figma registry `Product/ux/figma/figma-links.yaml` W04 mobile block:
> (1) `InventoryHubPage` **MODIFY** (page + cubit đã ship W03 per HLD-garage-mobile §11b.1 — chỉ thêm tile
> "Tồn đầu kỳ" + RemoteConfig gate); (2) `OpeningBalanceListPage` **NEW** (read-only list).
> **8 FEAT khác** (5 AP: FEAT-AP-{LIST,CREATE,DETAIL,EDIT,DELETE} + FEAT-OB-{IMPORT,EDIT,DELETE-LINES})
> = **web-only**, KHÔNG build mobile W04 (không có Figma mobile = không build).
>
> **Orchestrator review checklist này trước khi spawn.** DEV subagent maintain như todo —
> tick `[x]` khi xong, hoặc `[deferred:<lý do>]` nếu chủ động hoãn (vào DEBT-REGISTRY).
> Stop hook chặn handoff nếu còn item `[ ]`.

---

## Tasks

> Format: `- [ ] T{n} <mô tả tiếng Việt> · scope:<lib/path/glob> · ac:<FEAT-AC> · review:<R*/M-*> · layer:<screen|widget|cubit|route|graphql|test>`
> Luôn đọc thêm: `.harness/_REVIEW-CHECKLIST.md` (R*/M-* — shift-left).

- [ ] T1 `InventoryHubPage` **MODIFY** — thêm tile "Tồn đầu kỳ" vào state matrix W04. State W04 = **3 tile ACTIVE** (Sản phẩm + Nhóm vật tư đã ship W03 giữ nguyên tap route + tile "Tồn đầu kỳ" NEW → push `/inventory/opening-balance/list`); **3 tile W05/W06 (Phiếu nhập, Phiếu xuất, Tồn kho) HIDDEN HOÀN TOÀN** (per BR-INV-MENU-002, KHÔNG grey-out KHÔNG placeholder — filter out khỏi `visibleTiles` list). Layout giữ nguyên W03: `CustomScaffold(backgroundColor: AppColors.bgSecondary)` + `AppBarCustom(titleWidget: Text(LocaleKeys.inventoryHub_title.tr(), style: AppTextStyle.textSubtitleS4), hasBack: true)` + `SafeArea(bottom: false) → SingleChildScrollView(padding: EdgeInsets.all(AppSizes.spacing16)) → GridView.count(crossAxisCount: 2, mainAxisSpacing/crossAxisSpacing: AppSizes.spacing8, childAspectRatio: 1.61, shrinkWrap: true, NeverScrollableScrollPhysics, padding: EdgeInsets.zero)`. Reuse `FeatureTile` widget đã build W03 (167.5×104, BG `AppColors.bgBase`, radius 8, shadow `AppShadow.itemBoxShadow`, icon 32 trong circle 48×48 BG `AppColors.bgBadgeProcessing`). · scope:`mobile/gf-garage-app/lib/ui/inventory_catalog/hub/inventory_hub_page.dart` · ac:`FEAT-INV-MOBILE-MENU-AC-1,FEAT-INV-MOBILE-MENU-AC-2,FEAT-INV-MOBILE-MENU-AC-4,FEAT-INV-MOBILE-MENU-AC-5` · review:`R1,R5,M-28` · layer:`screen`

- [ ] T2 `InventoryHubCubit` **MODIFY** — Firebase RemoteConfig `Inventory:InventoryV2` gate: khi flag **OFF** → hub content = `tiles=[]` (reuse EC-2 empty-state pattern đã có W03 per FEAT-INV-MOBILE-MENU §NEED CONFIRMATION #2 decision — KHÔNG show error, KHÔNG show placeholder); khi flag **ON** → hub content = 3 tile active (Sản phẩm + Nhóm vật tư + Tồn đầu kỳ). **Compile-time fallback default = ON** nếu RemoteConfig fetch fail (avoid stuck empty state khi network offline). State model: `InventoryHubState { bool flagInventoryV2; List<FeatureTile> visibleTiles; ... }`. · scope:`mobile/gf-garage-app/lib/ui/inventory_catalog/hub/inventory_hub_cubit.dart` · ac:`FEAT-INV-MOBILE-MENU-AC-3,FEAT-INV-MOBILE-MENU-AC-4` · review:`R1,R5,R7` · layer:`cubit`

- [ ] T3 Route `InventoryHubRoute` — tile "Tồn đầu kỳ" tap → **pure client-side push** `/inventory/opening-balance/list` (KHÔNG gọi BFF khi tap, per BR-INV-MENU-003 — BFF chỉ được gọi khi target screen mount). Wire `AutoRoute(page: OpeningBalanceListRoute.page, guards: [AuthGuard()])` vào `lib/core/router/router.dart` (additive). SingleTapDetector debounce 300ms trên tile. · scope:`mobile/gf-garage-app/lib/core/router/router.dart` · ac:`FEAT-INV-MOBILE-MENU-AC-6` · review:`R1,R-TAP` · layer:`route`

- [ ] T4 RemoteConfig integration — inject `firebase_remote_config` package (đã có trong `pubspec.yaml` W03 nếu setup, else add `firebase_remote_config: ^4.x`); fetch on app start qua `main.dart` bootstrap + listener `AppLifecycleState.resumed` để re-fetch mitigate cache stale sau Ops flip flag; key = `Inventory:InventoryV2` boolean; default value `true` (fallback ON). Publish state qua `InventoryHubCubit` (T2). · scope:`mobile/gf-garage-app/lib/core/services/remote_config/remote_config_service.dart`,`mobile/gf-garage-app/lib/main.dart`,`mobile/gf-garage-app/pubspec.yaml` · ac:`FEAT-INV-MOBILE-MENU-AC-3` · review:`R7` · layer:`cubit`

- [ ] T5 `OpeningBalanceListPage` **NEW** scaffold — `CustomScaffold(backgroundColor: AppColors.bgSecondary)` + `AppBarCustom(titleWidget: Text(LocaleKeys.obList_pageTitle.tr(), style: AppTextStyle.textSubtitleS4), hasBack: true, trailing: [IconButton(icon: Icon(Icons.search), onPressed: bloc.openSearchFullPage), IconButton(icon: Icon(Icons.filter_list), onPressed: bloc.openFilterFullPage)])` + `SafeArea(bottom: true)` + body `Column { Expanded(ListWidget(...) skeleton loading state qua LoadingRowShimmerWidget × 4-6 slot) }`. Read-only page — KHÔNG có Add/Edit/Delete CTA. · scope:`mobile/gf-garage-app/lib/ui/opening_balance/list/opening_balance_list_page.dart` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-LIST-AC-2` · review:`R1,R5,M-28` · layer:`screen`

- [ ] T6 `OpeningBalanceListWidget` **NEW** — reuse canonical `ListWidget(isInitial/isLoading/isFailure/isEmpty, items: obLines.map(OpeningBalanceListCard), enablePullDown: true, enablePullUp: true, onRefresh, onLoading)` từ `lib/ui/widgets/list/` + `SmartRefresher` pull-to-refresh (callback `refreshCompleted/refreshFailed`); build new `OpeningBalanceListCard` (mã sản phẩm code blue `AppTextStyle.textSubtitleS4` + `StatusBadge` cho status Draft/Chốt/Đóng + tên sản phẩm + `StartInfoRow` × 4: "Kho" / "Ngày chốt (snapshotDate)" / "Số lượng" / "Giá trị"); reuse `StatusBadge` từ `lib/ui/inventory/widgets/status_badge.dart` + adapter `OpeningBalanceStatus implements InventoryStatusInterface`. · scope:`mobile/gf-garage-app/lib/ui/opening_balance/list/widgets/opening_balance_list_card.dart`,`mobile/gf-garage-app/lib/core/models/opening_balance/opening_balance_status_extension.dart` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-LIST-AC-3` · review:`R1,R5,R6` · layer:`widget`

- [ ] T7 `OpeningBalanceFilterPanel` **NEW** — filter sub-page route `/inventory/opening-balance/list/filter` (full-page pattern đồng bộ với W03 GroupFilter/ProductFilter); trường filter: `warehouseId` (dropdown, ACTIVE-only từ Q `warehouses`), `productCode` (text input), `snapshotDate` range (`from`, `to` date picker), `status` (multi-chip: Draft / Chốt / Đóng). Apply → return filter object về `OpeningBalanceListCubit`. Reuse widget catalog `lib/ui/widgets/filter/` nếu có. · scope:`mobile/gf-garage-app/lib/ui/opening_balance/list/opening_balance_filter_page.dart` · ac:`FEAT-OB-LIST-AC-4,FEAT-OB-LIST-AC-5` · review:`R1,R5` · layer:`widget`

- [ ] T8 `OpeningBalanceListCubit` **NEW** — `BaseCubit.launch()` cho async; state matrix (`initial`, `loading`, `success{items, hasMore, filter}`, `empty`, `error{code, message}`); pagination cursor-based (page/pageSize 20); filter change → reset page 1; refresh (pull-down) → keep filter reload page 1; loadMore (pull-up) → append. · scope:`mobile/gf-garage-app/lib/ui/opening_balance/list/opening_balance_list_cubit.dart` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-LIST-AC-2` · review:`R1,R5` · layer:`cubit`

- [ ] T9 GraphQL wire — `searchOpeningBalances(filter: {warehouseId, productCode, snapshotDateFrom, snapshotDateTo, statuses}, page, pageSize)` query consume `agg-garage-graph` W04-M1 §3g contract. Model class `OpeningBalanceLine { String code; String productCode; String warehouseCode; DateTime snapshotDate; Decimal quantity; Decimal value; OpeningBalanceStatus status; ... }` — **`snapshotDate: DateTime` NOT String** (per M-32 §5.2 model type fidelity), enums từ SDL ground truth (`OpeningBalanceStatus { draft, finalized, closed }` với `@JsonValue` mapping). · scope:`mobile/gf-garage-app/lib/core/services/graphql/documents/opening_balance_document.dart`,`mobile/gf-garage-app/lib/core/repositories/opening_balance/**`,`mobile/gf-garage-app/lib/core/models/opening_balance/opening_balance_line.dart` · ac:`FEAT-OB-LIST-AC-1` · review:`R3,M-32` · layer:`graphql`

- [ ] T10 LocaleKeys **MANDATORY** (M-30 §4.1) — thêm keys cho hub tile mới + OB list vào `assets/localizations/{vi,en}.json` (VN verbatim từ FEAT spec + EN reasonable translation) + regenerate `lib/generated/locale_keys.gen.dart`. Entries mới: `inventoryHub_tile_openingStock` (đã reserved W03), `obList_pageTitle`, `obList_empty`, `obList_filter_warehouse`, `obList_filter_product`, `obList_filter_dateFrom`, `obList_filter_dateTo`, `obList_filter_status`, `obList_field_warehouse`, `obList_field_snapshotDate`, `obList_field_quantity`, `obList_field_value`, `obList_status_draft`, `obList_status_finalized`, `obList_status_closed`. **CẤM hardcode VN literal** trong `lib/ui/opening_balance/**` và `lib/ui/inventory_catalog/hub/**`. · scope:`mobile/gf-garage-app/assets/localizations/vi.json`,`mobile/gf-garage-app/assets/localizations/en.json`,`mobile/gf-garage-app/lib/generated/locale_keys.gen.dart` · ac:`FEAT-INV-MOBILE-MENU-AC-1,FEAT-OB-LIST-AC-1` · review:`R6,M-30` · layer:`widget`

- [ ] T11 Typography binding-deterministic (M-28 hard rule) — AppBar title `AppTextStyle.textSubtitleS4` (W03 LL-MOB-009 consistency); tile label `AppTextStyle.textSubtitleS5` `AppColors.textPrimary` center maxLines:1; list card code `AppTextStyle.textSubtitleS4` code blue; row label/value `AppTextStyle.textBodyB2` / `textBodyB1`. **Mọi token resolve từ §1.5a binding-mapper** trong Figma spec (`wave04-inv-mobile-menu.md` + `wave04-ob-list.md`), KHÔNG đoán từ screenshot. · scope:`mobile/gf-garage-app/lib/ui/inventory_catalog/hub/**`,`mobile/gf-garage-app/lib/ui/opening_balance/**` · ac:`FEAT-INV-MOBILE-MENU-AC-2,FEAT-OB-LIST-AC-3` · review:`R1,M-28` · layer:`widget`

- [ ] T12 Tap detection canonical (R-TAP §2) — mọi tap surface (hub tile, list card row, filter chip, action IconButton) dùng `SingleTapDetector` với debounce 300ms. **CẤM tuyệt đối `InkWell` / `InkResponse`** (no Material ripple, no double-tap fire twice). Grep gate: `git grep -n 'InkWell\|InkResponse' lib/ui/inventory_catalog/hub/ lib/ui/opening_balance/` phải trả empty. · scope:`mobile/gf-garage-app/lib/ui/inventory_catalog/hub/**`,`mobile/gf-garage-app/lib/ui/opening_balance/**` · ac:`FEAT-INV-MOBILE-MENU-AC-6,FEAT-OB-LIST-AC-1` · review:`R-TAP` · layer:`widget`

- [ ] T13 Design tokens — mọi màu / typography / spacing / shadow / button dùng `AppColors.*` / `AppTextStyle.*` / `AppSizes.*` / `AppShadow.*` / `AppButton.*`. **CẤM hardcode `Color(0xFF...)` / `TextStyle(...)` literal** trong `lib/ui/opening_balance/**` và diff của `lib/ui/inventory_catalog/hub/**`. Grep gate: `git grep -nE 'Color\(0x[0-9A-Fa-f]{8}\)|TextStyle\(' lib/ui/opening_balance/ lib/ui/inventory_catalog/hub/` phải empty. · scope:`mobile/gf-garage-app/lib/ui/opening_balance/**`,`mobile/gf-garage-app/lib/ui/inventory_catalog/hub/**` · ac:`FEAT-INV-MOBILE-MENU-AC-2,FEAT-OB-LIST-AC-3` · review:`R1,R5` · layer:`widget`

- [ ] T14 Widget test — `InventoryHubPage` state matrix render: (a) flag ON → 3 tile visible (Sản phẩm + Nhóm vật tư + Tồn đầu kỳ), (b) flag OFF → EC-2 empty state (tiles=[]), (c) 3 tile hidden (Phiếu nhập / Phiếu xuất / Tồn kho) KHÔNG có trong widget tree (assert `find.text('Phiếu nhập')` = zero); tile "Tồn đầu kỳ" tap → verify push `/inventory/opening-balance/list`. · scope:`mobile/gf-garage-app/test/ui/inventory_catalog/hub/**` · ac:`FEAT-INV-MOBILE-MENU-AC-2,FEAT-INV-MOBILE-MENU-AC-4,FEAT-INV-MOBILE-MENU-AC-6` · review:`R9` · layer:`test`

- [ ] T15 Widget test — `OpeningBalanceListPage` render 4 state (loading/success/empty/error) + `ListWidget` skeleton visible khi `isInitial` + filter interaction (apply → cubit filter update → refetch) + pull-to-refresh callback fire. · scope:`mobile/gf-garage-app/test/ui/opening_balance/list/**` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-LIST-AC-2,FEAT-OB-LIST-AC-4` · review:`R9` · layer:`test`

- [ ] T16 `bloc_test` — `InventoryHubCubit`: (a) flag ON → emit state với 3 tile visible, (b) flag OFF → emit state với tiles=[], (c) transition flag OFF→ON (Ops flip) → re-emit; `OpeningBalanceListCubit`: (a) initial → loading → success, (b) empty result → empty state, (c) filter change → reset page 1 + refetch, (d) pagination loadMore → append items. · scope:`mobile/gf-garage-app/test/ui/inventory_catalog/hub/inventory_hub_cubit_test.dart`,`mobile/gf-garage-app/test/ui/opening_balance/list/opening_balance_list_cubit_test.dart` · ac:`FEAT-INV-MOBILE-MENU-AC-3,FEAT-OB-LIST-AC-1` · review:`R9` · layer:`test`

- [ ] T17 Alchemist golden — `InventoryHubPage` W04 state (3 tile grid) + `OpeningBalanceListPage` main state (list 3-5 item + AppBar trailing 2 IconButton search+filter); baseline snapshot commit. · scope:`mobile/gf-garage-app/test/goldens/inventory_catalog/hub/**`,`mobile/gf-garage-app/test/goldens/opening_balance/list/**` · ac:`FEAT-INV-MOBILE-MENU-AC-2,FEAT-OB-LIST-AC-3` · review:`R9` · layer:`test`

- [ ] T18 Coverage ≥ 60% — widget test + bloc_test + alchemist golden combined coverage của `lib/ui/inventory_catalog/hub/**` + `lib/ui/opening_balance/**` ≥ 60% (matches rules-mobile §9 threshold). Chạy `flutter test --coverage` + `lcov` filter. · scope:`mobile/gf-garage-app/coverage/lcov.info` · ac:`(coverage gate)` · review:`R9` · layer:`test`

- [ ] T19 KG `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` update — thêm entry: `InventoryHubRoute` W04 state (3 tile config: product/group/openingBalance + 3 hidden W05/W06), `OpeningBalanceListPage` / `OpeningBalanceListCubit` / `OpeningBalanceListWidget` / `OpeningBalanceListCard` / `OpeningBalanceFilterPage` (screens_touched), GraphQL op `searchOpeningBalances` (ops), model `OpeningBalanceLine` + `OpeningBalanceStatus` enum, LocaleKeys section `obList_*` + `inventoryHub_tile_openingStock`. **3-in-1 version bump** trên artifact chạm (version + last_reviewed + Change Log entry). · scope:`Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` · ac:`FEAT-INV-MOBILE-MENU-AC-1,FEAT-OB-LIST-AC-1` · review:`R1` · layer:`graphql`

---

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:...]`
- [ ] Chạy self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] Build + lint + test pass; coverage đạt ngưỡng ≥ 60% (T18)
- [ ] 3-in-1 version bump trên artifact chạm (KG, LocaleKeys gen file nếu commit)
- [ ] Grep gate T12 (InkWell/InkResponse) + T13 (hardcode Color/TextStyle) trả empty
- [ ] Firebase RemoteConfig `Inventory:InventoryV2` gate verified qua flag ON/OFF flip trên device

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority (/planning-wave 04 → Step 4.5) | Generated for W04/garage-mobile (source=wave-spec; 2 IN-SCOPE mobile files: hub MODIFY + OB-LIST NEW). Firebase RemoteConfig Inventory:InventoryV2 gate hub tile (CR-20260707-02 piggyback). 8 FEAT (5 AP + FEAT-OB-{IMPORT,EDIT,DELETE-LINES}) web-only excluded (không có Figma mobile). |
