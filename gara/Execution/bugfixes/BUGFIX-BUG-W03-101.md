# BUGFIX — BUG-W03-101

> `EP-INVENTORY-CATALOG` — AppBar height của 4 màn GRP+PROD list/search không khớp Figma (52px); cả 4
> đang dùng `AppBarCustom`'s Flutter Material default `kToolbarHeight` (56px)
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

User report (mobile dev, 2026-07-02): "kích thước appbar của list với appbar của search có vẻ ko
bằng nhau, chiều cao ấy?" (link Figma node `21252:48381` — màn search). Orchestrator fetched live
Figma metadata for the design file (`5YU4H3iY726P8KNxI9oCYF`) and found every instance of the
"Bars / Nav Bars: Standard" component across the whole board (list, search, add, edit alike)
consistently renders at `height="52"` — the app's canonical nav-bar row height per the design
system, confirmed across many instances at different node IDs, not a one-off.

## 2. Root cause

`AppBarCustom` (`lib/ui/widgets/app_bar/app_bar_custom.dart`) has `toolbarHeight = kToolbarHeight`
(Flutter's Material default, 56.0) as its constructor default param. None of the 4 wave-3 inventory
catalog screens passed an explicit `toolbarHeight:` override, so all 4 rendered at 56px instead of
Figma's 52px:

- `material_group_list_page.dart`
- `material_group_search_page.dart`
- `internal_product_list_page.dart`
- `internal_product_search_page.dart`

This is also the likely source of the "list vs search look different height" complaint — even
though both screens were using the SAME wrong default (56px), subtle content-height differences
between a plain title `Text` (list screens) vs an embedded search `AppTextField` (search screens)
made the mismatch against the true 52px target more visually apparent on one screen than the other.

## 3. Fix

Added explicit `toolbarHeight: 52` to the `AppBarCustom(...)` call in each of the 4 files:

```dart
// material_group_list_page.dart:142-144 (before)
return AppBarCustom(
  title: LocaleKeys.catGrp_title.tr(),
  hasShape: false,

// (after)
return AppBarCustom(
  title: LocaleKeys.catGrp_title.tr(),
  toolbarHeight: 52,
  hasShape: false,
```

```dart
// material_group_search_page.dart:83-85 and internal_product_search_page.dart:83-85 (before)
appBar: AppBarCustom(
  isCenterTitle: false,
  hasShape: false,

// (after)
appBar: AppBarCustom(
  isCenterTitle: false,
  toolbarHeight: 52,
  hasShape: false,
```

```dart
// internal_product_list_page.dart:88-90 (before)
appBar: AppBarCustom(
  title: LocaleKeys.catProd_title.tr(),
  hasShape: false,

// (after)
appBar: AppBarCustom(
  title: LocaleKeys.catProd_title.tr(),
  toolbarHeight: 52,
  hasShape: false,
```

`AppBarCustom`'s own default (`toolbarHeight = kToolbarHeight`) in `app_bar_custom.dart` was **not**
touched — per-consumer override only (Shared-Symbol Blast-Radius Gate, §4).

Also verified the 2 search screens' `AppTextField(textFieldHeight: 40, ...)` still fits comfortably
within a 52px toolbar (52 - 40 = 12px total vertical space, ~6px top/bottom when centered) — no
overflow risk, no change needed there.

## 4. Blast radius

- 4 lib files, 1 line each (`toolbarHeight: 52,` added at the existing `AppBarCustom(...)` call
  site). No public API/contract/entity/event change.
- **Shared-Symbol Blast-Radius Gate**: `AppBarCustom` is used at 100+ call sites across the whole
  app (`rg -l "AppBarCustom\(" lib/ui` → booking, customer, employee_accounts, human_resource,
  insurance_dossier, inventory, main, notification, ordering, product, quotation, service_order_v3,
  settlement, supplier, survey_form, tenant_transporter_registry, vehicle_management, comet_chat,
  and the widget's own definition file). Locus classified as **(a) call-site defect** per
  `bug-scope-guard.md`: the widget itself is not wrong (its 56px default may be correct in other
  domains not yet audited against Figma), only these 4 wave-3 screens need the 52px value — so the
  fix is a per-call-site opt-in override, leaving the shared default untouched by construction. No
  other consumer's rendered `toolbarHeight` changes.

## 5. Regression test

`mobile/gf-garage-app/test/ui/inventory_catalog/appbar_toolbar_height_bug_101_test.dart` (new):

1. `testWidgets` — `AppBarCustom(title: 'x', toolbarHeight: 52)` renders `AppBar.toolbarHeight == 52`
   and `AppBarCustom.preferredSize.height == 52`.
2. `testWidgets` — `AppBarCustom(title: 'x')` (no override) still falls back to
   `AppBar.toolbarHeight == kToolbarHeight` (56) — pins that the shared widget's default was **not**
   changed by this fix.
3. 4× `test` — static source-pin per page: locates the page's single `AppBarCustom(...)` call site
   (bounded to that call only, so a hypothetical second `AppBarCustom(` in the same file can't
   false-positive the assertion) and asserts it contains `toolbarHeight: 52`.

## 6. Verification status

- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` → **OK: 0 anti-pattern hit**
  on all 4 touched lib files.
- Brace/paren balance verified (string/comment-aware count) on all 4 lib files + the new test file →
  all balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED — no `fvm`/`flutter`/`dart` toolchain in
  this environment** (`DEBT-W01-MOBILE-BUILD-ENV`). Regression test written statically-correct.
  TEST_GROUP phải chạy `fvm flutter analyze` + `fvm flutter test` trên máy có toolchain trước khi
  flip `VERIFIED`.
- KG (`Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml`): **not updated** — pure
  layout/style fix, không đổi entity/event/permission/screen contract.

## 7. Non-goals / out of scope

- Không đổi `AppBarCustom`'s own default `toolbarHeight = kToolbarHeight` — các consumer khác ngoài
  wave 3 không bị audit/đổi trong bug này.
- Không đụng `AppTextField(textFieldHeight: 40, ...)` trong 2 màn search — đã xác nhận fit trong
  52px toolbar không overflow.
- Không đụng phần `hintStyle:` mới thêm bởi BUG-W03-100 (concurrent fix cycle) trong
  `material_group_search_page.dart` / `internal_product_search_page.dart` — different param, no
  overlap.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial fix — added explicit `toolbarHeight: 52` to the `AppBarCustom(...)` call site in all 4 wave-3 inventory-catalog screens (`material_group_list_page.dart`, `material_group_search_page.dart`, `internal_product_list_page.dart`, `internal_product_search_page.dart`), matching Figma's canonical 52px nav-bar row height confirmed across the whole board. `AppBarCustom`'s own shared default (56px) left untouched (100+ other consumers). New regression test `appbar_toolbar_height_bug_101_test.dart` (2 widget tests + 4 static source-pin tests). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
