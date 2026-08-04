# BUGFIX — BUG-W03-097

> Dropdown option panel always opened at a fixed 5-item (240px) height regardless of `dataList.length`, leaving visible empty space below the last item when fewer than 5 options existed.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User (mobile dev) reported that every dropdown in the W03 Inventory Catalog mobile screens opened with a fixed-size panel regardless of how many options it had — verbatim: *"tôi thấy các dropdown đang bị xổ ra một size cố định, tôi muốn nó nếu mà item ít hơn size cố định đó thì sẽ tự động thu gọn lại vừa bằng số item, còn nếu nhiều hơn thì có thể cuộn lên vẫn trong size cố định đó, hãy rà soát lại các dropdown ở tất cả màn hình trong wave 3 này nhé đối với mobile thôi"*. A sweep of the W03 mobile scope confirmed there is exactly **1** shared widget backing every dropdown — `DropdownMenuWidget` — used by 3 consumers: `material_group_filter_page.dart` ("Thuộc nhóm"), `widgets/material_group_form.dart` ("Thuộc nhóm" + "Trạng thái", shared Add/Edit), and `internal_product_filter_page.dart` ("Tính chất" + "Nhóm hàng"). Internal Product has no Add/Edit page yet, so no other dropdown surface exists to audit.

## 2. Root cause

`DropdownMenuWidget.build()`'s `menuChildren` wrapped the scrollable option list in:

```dart
SizedBox(
  width: constraints.maxWidth,
  height: 5 * 48.0,
  child: SingleChildScrollView(
    controller: scrollController,
    child: Column(mainAxisSize: MainAxisSize.min, children: [...]),
  ),
)
```

`height` was hardcoded to `5 * 48.0` (240px) — the intended 5-item scroll cap — regardless of `dataList.length`. A dropdown with only 1-2 options therefore still reserved the full 240px, rendering as empty space below the last `MenuItemButton`.

## 3. Fix

- **`dropdown_menu_widget.dart`** (shared widget, `build()`'s `menuChildren`) — changed the `SizedBox.height` computation from the fixed `5 * 48.0` to `(dataList.length < 5 ? dataList.length : 5) * 48.0`. This keeps the `48.0` per-row height and the existing 5-item/240px cap (beyond which the panel still scrolls via the unchanged `SingleChildScrollView` + `scrollController`) — it only shrinks the reserved height when `dataList.length < 5`. With `dataList` empty, the expression naturally evaluates to `0`, collapsing the panel with no special-case branch needed.

### Shared-Symbol Blast-Radius Gate

`grep -rln "DropdownMenuWidget(" lib/ui` confirmed exactly 3 consumers (plus the widget's own definition file):

- `lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart`
- `lib/ui/inventory_catalog/widgets/material_group_form.dart`
- `lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart`

The change touches only an internal layout calculation — no constructor parameter was added, removed, or defaulted differently, and the widget's public API (`DropdownMenuWidget(...)` signature) is unchanged. All 3 consumers are therefore safe by construction; no call-site edits were needed or made.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` | 1-line change: `SizedBox(height: 5 * 48.0)` → `SizedBox(height: (dataList.length < 5 ? dataList.length : 5) * 48.0)` |
| `mobile/gf-garage-app/test/ui/widgets/dropdown_menu/dropdown_menu_widget_test.dart` | Appended new `BUG-W03-097` test group, 4 widget-test cases — existing test groups untouched |

## 5. Regression / verification

- `dropdown_menu_widget_test.dart` new `BUG-W03-097` group (real widget tests, following the existing `host()`/`hostSelected()`/`hostEnabled()` harness pattern already in this file — opens the menu, then reads the `SizedBox` that is an ancestor of the rendered `SingleChildScrollView`):
  1. `dataList` of 1 item → panel `height == 48.0`.
  2. `dataList` of 2 items → panel `height == 96.0`.
  3. `dataList` of 5 items → panel `height == 240.0` (existing cap, unchanged).
  4. `dataList` of 8 items → panel `height == 240.0` (still capped, still scrolls — unchanged behavior beyond the cap).
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` → **OK, 0 anti-pattern hit**.
- Brace/paren balance verified manually (Python count script) on both touched files (1 lib + 1 test) — both balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain on PATH in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`; `fvm`/`flutter`/`dart` all resolve to "command not found"). The new test cases were cross-checked by hand against the post-fix source (`dataList.length < 5 ? dataList.length : 5) * 48.0` for 1/2/5/8 → 48.0/96.0/240.0/240.0) before being written.
- KG update: **skipped** — pure internal-rendering fix, no entity/event/permission schema change.

## 6. Non-goals / out of scope

- Did not touch any of the 3 `DropdownMenuWidget` call sites — the fix required no call-site changes since it is a pure internal-rendering change with no API/behavior-surface impact beyond the visual height.
- Did not change the `48.0` per-row height constant or the 5-item/240px scroll-cap threshold — only the reserved height below that cap now tracks `dataList.length`.
- Did not touch the `SingleChildScrollView`/`scrollController` wiring — scrolling for `dataList.length > 5` is unchanged (already covered by the existing `BUG-W03-080` regression group in the same test file).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — shared `dropdown_menu_widget.dart` option-panel `SizedBox.height` changed from hardcoded `5 * 48.0` to `(dataList.length < 5 ? dataList.length : 5) * 48.0`, so the panel auto-shrinks below the existing 5-item/240px cap instead of always reserving full height. Blast-Radius Gate confirmed 3 consumers, all safe by construction (pure internal-rendering change, no API/behavior change). 1 new regression test group (4 cases: 1/2/5/8 items). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
