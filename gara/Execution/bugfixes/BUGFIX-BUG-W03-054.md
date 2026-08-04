# BUGFIX — BUG-W03-054

> Group List — nền màn hình sai màu (xám thay vì trắng), tên nhóm sai token nặng
> Severity: **P1** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User (mobile dev) cung cấp link Figma node `21235:29061` (file `5YU4H3iY726P8KNxI9oCYF`) cho một audit
trực tiếp qua MCP (không dựa vào spec đã prefetch), phát hiện 2 defect trên màn "Danh sách nhóm vật tư
hàng hoá":

1. **Nền màn hình sai màu** — `material_group_list_page.dart` set `CustomScaffold.backgroundColor:
   AppColors.bgSecondary` (`#f3f3f4`, xám), dựa theo comment cite BUG-W03-043. Figma root frame fill
   thực tế là `bg-base` (TRẮNG) — không có layer xám riêng phía sau card; độ sâu thị giác chỉ đến từ
   `drop-shadow` của mỗi `GroupListCard`.
2. **Tên nhóm sai token nặng** — `group_list_card.dart` style tên nhóm (vd "Bộ phanh đĩa điện tử") bằng
   `AppTextStyle.textHeadingH3` (Inter Bold 18px/lh26). Figma `ItemNameRow` là Inter SemiBold 13px/lh18
   — khớp chính xác `AppTextStyle.textSubtitleS6`, không phải `textHeadingH3` — lệch ~40% kích thước và
   sai độ đậm (Bold thay vì SemiBold).

## 2. Root cause

**(1) Nền sai màu** — BUG-W03-043 (2026-07-02, cùng ngày, cycle trước) đổi Scaffold background từ
`bgBase` sang `bgSecondary`, trích dẫn spec đã prefetch `wave03-cat-grp-list.md` dòng 44 ("bg=
`AppColors.bgSecondary` (light grey scroll bg behind white cards)"). Đây là một dòng narrative miêu tả
trong spec — KHÔNG có tag `_png_verified` riêng cho claim màu nền này (không giống các dòng Icon Catalog
trong cùng file luôn có `_png_source` trỏ ảnh cụ thể). BUGFIX doc của BUG-W03-043 cũng không tự verify
lại claim màu nền bằng ảnh — trọng tâm của fix đó là card radius/shadow (từ flat-row → elevated card),
màu nền Scaffold chỉ là một side-effect ăn theo dòng spec, không phải một claim được re-derive độc lập.
→ Đây là 1 lớp drift kinh điển: spec cũ có claim chưa pin ảnh → code follow theo spec → 2 cycle fix sau
nối tiếp nhau đều không đối chiếu lại nguồn ảnh gốc.

Live MCP fetch (`get_design_context` + `get_screenshot`) trên đúng node `21235:29061`/file
`5YU4H3iY726P8KNxI9oCYF` lần này cho kết quả dứt khoát: root frame
`bg-[var(--base/bg-base,white)]`, không có bất kỳ layer nền xám nào; ảnh screenshot xác nhận nền trắng
đồng nhất, độ tách bạch giữa các card đến từ `drop-shadow` (`0px 1px 10px rgba(156,156,156,0.08/0.1/0.2)`),
không phải từ khác biệt màu nền/card.

**(2) Token tên nhóm sai** — không có ghi chú lý do rõ ràng trong lịch sử code cho việc chọn
`textHeadingH3`; nhiều khả năng là suy đoán "tên nhóm là heading của card nên dùng token Heading" thay vì
đọc đúng binding Figma cho riêng node `ItemNameRow`. Live fetch xác nhận `ItemNameRow` = `font-semibold
text-[13px]`, và design-context trả về explicit style entry `Subtitle/S6: Font(Inter, SemiBold, 13,
lineHeight 18)` — khớp 1-1 với `AppTextStyle.textSubtitleS6` đã định nghĩa sẵn trong
`app_text_styles.dart` (`fontSize=13`, `fontWeight=fontWeightSemiBold(w600)`,
`height=textFontHeightMd=18/13`).

## 3. Fix

### 3.1 `material_group_list_page.dart` — Scaffold background

```dart
// Bad:
backgroundColor: AppColors.bgSecondary,

// Good — per live Figma re-fetch node 21235:29061, root frame = bg-base (white):
backgroundColor: AppColors.bgBase,
```

### 3.2 `group_list_card.dart` — group-name text style

```dart
// Bad:
style: AppTextStyle.textHeadingH3.copyWith(
  color: AppColors.textPrimary,
),

// Good — ItemNameRow binding = Inter SemiBold 13px/lh18:
style: AppTextStyle.textSubtitleS6.copyWith(
  color: AppColors.textPrimary,
),
```

## 4. Conflict disclosure — BUG-W03-043 superseded

This fix **supersedes** part of BUG-W03-043's earlier change (the Scaffold `backgroundColor:
AppColors.bgSecondary` line only — BUG-W03-043's card radius/shadow decoration change is untouched and
still correct). This is disclosed explicitly per this cycle's instructions, not a silent revert:
BUG-W03-043's own cited spec line had no independent `_png_verified` pin for the background-color claim,
and today's live re-fetch of the exact same node is the authoritative ground truth for this audit. No
other part of BUG-W03-043's fix (card `borderRadius`/`boxShadow`/`padding`, `ListWidget`
`padding`/`separatorHeight`) is affected — those remain correct against the same live re-fetch (cards do
have `rounded-[12px]` + `drop-shadow` in the fetched markup).

## 5. Shared-Symbol Blast-Radius Gate

`GroupListCard` is used by exactly 2 consumers — confirmed via `grep -rln "GroupListCard(" lib/ui`:

- `lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart` (in scope, owns the
  widget)
- `lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` (search results list)

The fix changes `GroupListCard`'s internal text style only (no public API change), so both consumers
benefit automatically with zero call-site changes required on either side. `material_group_search_page.dart`
itself was intentionally left untouched (out of this cycle's touched-files scope by design — the shared
widget fix already covers it).

The Scaffold `backgroundColor` change (Task 1) is local to `material_group_list_page.dart` only —
`material_group_search_page.dart` has its own separate `CustomScaffold` call (`backgroundColor:
AppColors.bgBase` already, unrelated/unaffected).

## 6. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart` | `CustomScaffold.backgroundColor`: `AppColors.bgSecondary` → `AppColors.bgBase` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` | Group-name `Text.style`: `AppTextStyle.textHeadingH3` → `AppTextStyle.textSubtitleS6` (kept `.copyWith(color: AppColors.textPrimary)`) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_list/material_group_list_background_color_test.dart` | New — regression test (widget contract + static source-string pin) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_list/group_list_card_name_style_test.dart` | New — regression test (fontSize/fontWeight/height/color assertions + explicit non-regression pin against the old 18px/Bold token) |

## 7. Regression / verification

- `python3 scripts/check-mobile-canonical-primitives.py --file <both touched lib files>` — **0 hit each**.
- Manual brace/paren/bracket balance check on all 4 touched/new files — balanced.
- 2 new regression test files:
  - `material_group_list_background_color_test.dart` — pumps `CustomScaffold(backgroundColor:
    AppColors.bgBase, ...)` and asserts the value passes through to `Scaffold.backgroundColor`
    (widget-contract level), plus a static `File().readAsStringSync()` source-string assertion pinning
    the real page file's `backgroundColor: AppColors.bgBase` line and asserting `AppColors.bgSecondary`
    is no longer present.
  - `group_list_card_name_style_test.dart` — pumps `GroupListCard(group: ...)` with the exact Figma
    sample text ("Bộ phanh đĩa điện tử") and asserts the rendered `Text.style` fontSize=13,
    fontWeight=w600, height matches `textSubtitleS6`, color=`AppColors.textPrimary`, plus explicit
    non-regression assertions that fontSize is NOT 18 and fontWeight is NOT bold.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/fvm toolchain in this sandbox
  (`DEBT-W01-MOBILE-BUILD-ENV`); brace/paren balance + canonical-primitives script + manual token
  cross-check against `app_text_styles.dart`/`app_colors.dart` verified instead.

## 8. Non-goals / out of scope

- Did NOT touch `material_group_search_page.dart` — it inherits the `GroupListCard` text-style fix
  automatically via the shared widget; its own Scaffold background was already correct
  (`AppColors.bgBase`) and unrelated to this bug.
- Did NOT touch `internal_product_list_page.dart` / `internal_product_list_card.dart` (PROD screens) —
  not in scope for this bug (GRP-list only per the filed row's Component column); no live-Figma evidence
  was gathered for PROD in this cycle.
- Did NOT revert or otherwise modify BUG-W03-043's card decoration change (`borderRadius`/`boxShadow`/
  `padding` on `GroupListCard`/`InternalProductListCard`, or the `ListWidget` `padding`/`separatorHeight`
  additions) — those remain correct against the same live re-fetch.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `material_group_list_page.dart` Scaffold `backgroundColor` `bgSecondary`→`bgBase` (supersedes part of BUG-W03-043 per live re-fetch of node 21235:29061); `group_list_card.dart` group-name text style `textHeadingH3`→`textSubtitleS6` (shared widget, benefits `material_group_search_page.dart` too). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
