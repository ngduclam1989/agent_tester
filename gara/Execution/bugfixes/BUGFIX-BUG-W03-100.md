# BUGFIX — BUG-W03-100

> Search-box placeholder "Tìm kiếm" hint color wrong — `textQuaternary` (#b8babf) thay vì Figma #71717a
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User (mobile dev) báo cáo qua link Figma review (node `21252:48381`, file `5YU4H3iY726P8KNxI9oCYF`):
"có vẻ như font chữ và màu chữ đang sai thì phải?" cho placeholder "Tìm kiếm" ở search bar. Orchestrator
fetch live Figma node xác nhận placeholder render `font-['Inter:Regular'] font-normal text-[14px]
leading-[20px] text-[color:var(--base/muted-foreground,#71717a)]` — **FONT đúng** (Inter Regular 14/lh20
khớp `AppTextStyle.textCaptionC5`), **chỉ MÀU sai**. Cả 2 màn search (`MaterialGroupSearchPage`,
`InternalProductSearchPage`) đều bị.

## 2. Root cause

`AppTextField` (`lib/ui/widgets/text_field/app_text_field.dart:351`) có default:

```dart
hintStyle: widget.hintStyle ?? AppTextStyle.textCaptionC5.copyWith(color: AppColors.textQuaternary),
```

`AppColors.textQuaternary = NeutralColor.s300 = #b8babf` (xám nhạt). Cả `material_group_search_page.dart`
và `internal_product_search_page.dart` gọi `AppTextField(...)` cho ô search mà **không truyền
`hintStyle:` tường minh** → rơi về default trên → sai màu so với Figma `#71717a`.

## 3. Fix

**Deviation từ plan ban đầu của bug row** (đáng chú ý — ghi lại rõ): row's Notes đề xuất thêm token mới
`AppColors.textMuted = NeutralColor.s550;` vào `app_colors.dart` (claim "chưa có alias `AppColors.*`
semantic tương ứng"). Trước khi áp dụng, audit lại `app_colors.dart` và phát hiện claim đó **sai** — file
đã có sẵn:

```dart
static const Color textMutedForeground = Color(0xFF71717A);   // app_colors.dart:32
static const Color baseMutedForeground = NeutralColor.s550;   // app_colors.dart:60 (cùng giá trị hex)
```

`textMutedForeground` là exact-hex match với Figma `#71717a`, và **đã là token canonical** cho đúng vai
trò "muted-foreground" này — dùng ở 10 call site khác trong app (`dossier_form_field.dart`,
`dossier_clause_list.dart`, `file_upload_widget.dart`, `dossier_quotation_sheet_page.dart`,
`dossier_settlement_sheet_page.dart`, `lib/ui/widgets/file_item_widget.dart`).

Quyết định: **KHÔNG** thêm `AppColors.textMuted` — sẽ tạo alias thứ 3 trỏ cùng 1 hex (`#71717A`) bên
cạnh `textMutedForeground` + `baseMutedForeground` sẵn có, vi phạm DRY/token-reuse discipline
(`rules-mobile SKILL.md §1` — "Resolution: theo `_ref-mobile-transform-figma.md §1.5` 4-bậc — variable
name → exact hex → near-miss `≈` → raw `Color(0xFF…)`" — ở đây bậc "exact hex" đã có token sẵn, không
cần bậc raw/mint-new). `app_colors.dart` **không đổi** trong fix này.

Thay vào đó, truyền tường minh `hintStyle:` tại 2 call site:

```dart
// Bad — không truyền hintStyle, rơi về default textQuaternary (#b8babf):
AppTextField(
  ...
  textStyle: AppTextStyle.textCaptionC5.copyWith(color: AppColors.textPrimary),
  textFieldHeight: 40,
  ...
)

// Good — hintStyle tường minh, đúng Figma #71717a:
AppTextField(
  ...
  textStyle: AppTextStyle.textCaptionC5.copyWith(color: AppColors.textPrimary),
  hintStyle: AppTextStyle.textCaptionC5.copyWith(color: AppColors.textMutedForeground),
  textFieldHeight: 40,
  ...
)
```

Widget default của `AppTextField` (`AppColors.textQuaternary`) **giữ nguyên** — widget dùng khắp app,
default có thể đúng cho context khác, chỉ override per-consumer ở 2 màn search này
(Shared-Symbol Blast-Radius Gate — call-site override, không đổi shared default).

**Concurrent-edit note**: tại thời điểm fix, 1 FIX cycle song song khác (BUG-W03-101, AppBar
`toolbarHeight`) đã land thay đổi riêng vào cùng 2 file này (thêm `toolbarHeight: 52` vào
`AppBarCustom(...)`). Đã re-read cả 2 file ngay trước mỗi `Edit` call để tránh stale-content overwrite;
diff của fix này (`hintStyle:`) và diff của BUG-W03-101 (`toolbarHeight:`) coexist sạch, không đè lên
nhau.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | Thêm `hintStyle: AppTextStyle.textCaptionC5.copyWith(color: AppColors.textMutedForeground)` vào `AppTextField(...)` call |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | Thêm `hintStyle: AppTextStyle.textCaptionC5.copyWith(color: AppColors.textMutedForeground)` vào `AppTextField(...)` call |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_hint_color_bug_100_test.dart` | **New** — 3 test: unit test giá trị token, widget test `AppTextField.hintStyle`, source-string assertion |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_hint_color_bug_100_test.dart` | **New** — mirror test cho màn PROD search |

`mobile/gf-garage-app/lib/core/common/styles/app_colors.dart` **KHÔNG đổi** (xem §3 — token đã có sẵn,
không cần thêm mới).

## 5. Regression / verification

- 2 test file mới (`material_group_search_hint_color_bug_100_test.dart`,
  `internal_product_search_hint_color_bug_100_test.dart`), mỗi file 3 assertion:
  1. Unit test: `AppColors.textMutedForeground == Color(0xFF71717A)` và phân biệt với
     `AppColors.textQuaternary` (không trùng giá trị).
  2. Widget test: pump `AppTextField` với đúng param như page thật, assert
     `field.hintStyle == AppTextStyle.textCaptionC5.copyWith(color: AppColors.textMutedForeground)` và
     `field.hintStyle?.color == Color(0xFF71717A)`.
  3. Source-string assertion (`File(path).readAsStringSync()` convention, theo pattern
     `material_group_secondary_button_token_test.dart`/`toast_canonical_bug_055_test.dart`): pin literal
     `hintStyle: AppTextStyle.textCaptionC5\n                    .copyWith(color:
     AppColors.textMutedForeground),` trong page thật.
- `python3 scripts/check-mobile-canonical-primitives.py --file <mỗi file lib đã sửa>` → **OK: 0
  anti-pattern hit** cho cả 2 file.
- Brace/paren/bracket balance verify thủ công (Python đếm `{`/`}`, `(`/`)`, `[`/`]`) trên cả 4 file
  (2 lib + 2 test) → cân bằng, không lệch.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain
  trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). `AppColors.textMutedForeground`,
  `AppTextStyle.textCaptionC5` đã verify tồn tại thật + đúng giá trị qua `Read` trực tiếp
  `app_colors.dart:32` và `app_text_styles.dart:324`.

## 6. Non-goals / out of scope

- KHÔNG thêm token mới `AppColors.textMuted` vào `app_colors.dart` — xem §3 deviation rationale.
- KHÔNG đổi default `hintStyle` của `AppTextField` (`app_text_field.dart:351`) — widget dùng chung khắp
  app, default `textQuaternary` có thể đúng cho context khác ngoài 2 màn search này.
- KHÔNG đụng `toolbarHeight`/AppBar height — thuộc BUG-W03-101 (fix song song, đã land vào cùng 2 file
  trước khi fix này bắt đầu, không touch bởi fix này).
- KHÔNG audit toàn app tìm thêm `AppTextField` khác thiếu `hintStyle:` ngoài 2 màn search này — ngoài
  phạm vi bug row.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `hintStyle:` tường minh với `AppColors.textMutedForeground` tại 2 call site `AppTextField` (search box GRP + PROD). Deviated từ plan ban đầu (không thêm `AppColors.textMuted` — token đã có sẵn `textMutedForeground`, tránh duplicate alias). 2 regression test mới. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
