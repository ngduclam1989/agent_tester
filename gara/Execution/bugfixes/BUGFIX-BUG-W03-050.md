# BUGFIX — BUG-W03-050

> "Mô tả" row bị center thay vì start (lệch khi giá trị nhiều dòng) + list card KHÔNG có maxLines/overflow cho Mô tả → card giãn cao vô hạn theo độ dài text
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

Shared widget `StartInfoRow` (`lib/ui/inventory/widgets/start_info_row.dart`) renders a `label: value` row and defaults `crossAxisAlignment: CrossAxisAlignment.center`. Both "Mô tả" call sites in the Inventory Catalog domain — `GroupListCard` (`material_group_list/widgets/group_list_card.dart`) and `MaterialGroupDetailPage` (`material_group_detail/material_group_detail_page.dart`) — omitted this param, so a single-line label next to a multi-line description value was vertically centered against the whole value block instead of aligned to its first line. Additionally, `GroupListCard`'s description `Text` had no `maxLines`/`overflow`, so a long, multi-sentence description rendered in full and grew the card to unbounded height, breaking the list layout (per user report + `reports/screens/inventory/material-group/mg-list.png`).

## 2. Root cause

Both call sites were written without passing `crossAxisAlignment: CrossAxisAlignment.start`, which the same shared widget's other consumers (`delivery_info_section.dart:74,76`) already correctly pass for multi-line-capable fields — the catalog domain simply omitted it. Separately, `StartInfoRow` never exposed a way to cap the rendered value's line count, so nothing in `GroupListCard` bounded the description's height; Figma `wave03-cat-grp-list.md` §GroupListCard (line ~100) explicitly notes "multi-line possible, ~2 lines" for the list-card context, implying a 2-line cap that was never implemented. `InternalProductListCard` (PROD) has no "Mô tả" field, so the maxLines/overflow half of this bug is GRP-only.

## 3. Fix

**(a) Alignment** — pass `crossAxisAlignment: CrossAxisAlignment.start` explicitly at both "Mô tả" call sites. `StartInfoRow`'s own default (`center`) is left untouched — the widget has 8 total consumers and some fields elsewhere may intentionally rely on `center` for guaranteed single-line values.

**(b) Line cap (list-card only)** — added two new optional passthrough params to `StartInfoRow`:

```dart
// lib/ui/inventory/widgets/start_info_row.dart
class StartInfoRow extends StatelessWidget {
  const StartInfoRow({
    super.key,
    required this.label,
    this.value,
    this.crossAxisAlignment = CrossAxisAlignment.center,
    this.contentWidget,
    this.maxLines,     // NEW — default null = unbounded (unchanged for existing consumers)
    this.overflow,     // NEW
  });

  final int? maxLines;
  final TextOverflow? overflow;
  ...

  // build():
  child: contentWidget ?? Text(
    value ?? '--',
    maxLines: maxLines,
    overflow: overflow,
    style: const TextStyle(...),
  ),
}
```

`maxLines`/`overflow` only apply to the widget's own default `Text` (when `contentWidget` is null) — consumers that pass a custom `contentWidget` control their own `Text` directly and are unaffected. Default `null` means unbounded rendering, identical to pre-fix behavior for every consumer that doesn't pass these params.

`group_list_card.dart`'s "Mô tả" call site wires the cap:

```dart
StartInfoRow(
  label: LocaleKeys.common_description.tr(),
  value: group.description,
  crossAxisAlignment: CrossAxisAlignment.start,
  maxLines: 2,
  overflow: TextOverflow.ellipsis,
),
```

`material_group_detail_page.dart`'s "Mô tả" call site only gets the alignment fix (no `maxLines`) — detail page must show the full description text, uncapped:

```dart
StartInfoRow(
    label: LocaleKeys.common_description.tr(),
    value: detail.description ?? '—',
    crossAxisAlignment: CrossAxisAlignment.start),
```

## 4. Shared-Symbol Blast-Radius Gate

`StartInfoRow` is a shared widget (per FIX-025 lesson). `grep -rln "StartInfoRow(" lib` confirms exactly 8 consumers:

| Consumer | Passes new params? | Impact |
|---|---|---|
| `stock_history_section.dart` | No | Unaffected — `maxLines`/`overflow` default `null`, identical render. |
| `service_info_section.dart` | No | Unaffected. |
| `delivery_info_section.dart` | No (already passes `crossAxisAlignment: start` for 2 fields, unaffected by new params) | Unaffected. |
| `receipt_info_section.dart` | No | Unaffected. |
| `internal_product_detail_page.dart` | No | Unaffected. |
| `material_group_detail_page.dart` | **Yes** (`crossAxisAlignment` only, this bug) | In-scope — intentional fix. |
| `group_list_card.dart` | **Yes** (`crossAxisAlignment` + `maxLines` + `overflow`, this bug) | In-scope — intentional fix. |
| `start_info_row.dart` (widget itself) | n/a | Declaration site. |

6/8 consumers outside this bug's scope pass none of the changed/new params — 0 behavior change confirmed.

## 5. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory/widgets/start_info_row.dart` | Added optional `maxLines`/`overflow` constructor params (default `null`), passthrough to the default `Text` when `contentWidget` is null. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` | "Mô tả" `StartInfoRow`: added `crossAxisAlignment: CrossAxisAlignment.start`, `maxLines: 2`, `overflow: TextOverflow.ellipsis`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | "Mô tả" `StartInfoRow`: added `crossAxisAlignment: CrossAxisAlignment.start` only (no line cap — full description must render). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_list/group_list_card_description_test.dart` | **NEW** — widget tests for `StartInfoRow` param defaults/passthrough + `GroupListCard` "Mô tả" row fidelity. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_description_alignment_test.dart` | **NEW** — static-source-assertion regression for the detail page call site (page requires DI/cubit mocking with no widget-pump precedent, per `material_group_detail_fidelity_test.dart` header note). |

## 6. Regression / verification

- `group_list_card_description_test.dart`:
  - `StartInfoRow` defaults to `CrossAxisAlignment.center` + `maxLines`/`overflow` null when not passed (baseline, unchanged behavior).
  - `StartInfoRow` honors `crossAxisAlignment.start` and `maxLines`/`overflow` when explicitly passed.
  - `GroupListCard` with a long, multi-sentence description renders its "Mô tả" `StartInfoRow` with `crossAxisAlignment: start`, `maxLines: 2`, `overflow: TextOverflow.ellipsis` (checked both on the `StartInfoRow` widget instance and the underlying `Text`).
  - `GroupListCard` with no description does not render a "Mô tả" row at all (only "Thuộc nhóm cha").
- `material_group_detail_description_alignment_test.dart`:
  - Static regex assertion that the "Mô tả" `StartInfoRow` call site in `material_group_detail_page.dart` contains `crossAxisAlignment: CrossAxisAlignment.start`.
  - Static regex assertion that the same call site does **not** contain a `maxLines:` parameter (detail page must show the full description).
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` (run from design-repo root) → **OK: 0 anti-pattern hit** for all 5 touched/created files.
- Brace/paren/bracket balance verified via a character-count script for all touched/created files (informational — regex string literals containing escaped parens in the new test file produce an expected raw-count mismatch that is not a real syntax issue, confirmed by manual read).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/fvm toolchain in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`). TEST_GROUP must re-run on a machine with the correct toolchain (Flutter 3.41/Dart 3.11) before flipping to `VERIFIED`.

## 7. Non-goals / out of scope

- `StartInfoRow`'s default `crossAxisAlignment` (`center`) is unchanged — only the 2 in-scope call sites were updated.
- No other consumer of `StartInfoRow` was touched.
- `InternalProductListCard` (PROD) has no "Mô tả" field — not in scope for the maxLines/overflow half of this bug.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `crossAxisAlignment: CrossAxisAlignment.start` added at both "Mô tả" call sites (list card + detail page); opt-in `maxLines`/`overflow` passthrough added to `StartInfoRow` (default null, 0 regression for other 7 consumers), wired to a 2-line ellipsis cap only on the list card. 2 new regression test files (widget test + static-source-assertion). `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). |
