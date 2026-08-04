# BUGFIX — BUG-W03-039

> `BottomNavigationBarButton` chỉ support 1 nút — mở rộng multi-button (như `booking/widgets/bottom_actions.dart`) để filter footer tái sử dụng, bỏ SafeArea thừa
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

`BottomNavigationBarButton` (`lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart`, canonical `bottom-action-single`) chỉ nhận `title` + `onTapButton` (1 nút). `material_group_filter_page.dart` + `internal_product_filter_page.dart` (fix trước đó BUG-W03-035) vì vậy phải tự bọc `SafeArea(top: false, child: Container(decoration: BoxDecoration(borderRadius+boxShadow)))` để render footer Reset/Áp dụng 2 nút — duplicate logic đã có sẵn trong widget chung. User (mobile dev) yêu cầu mở rộng widget chung để nhận N nút (theo pattern `_buildButtonRow` của `booking/widgets/bottom_actions.dart`) rồi refactor 2 filter page dùng lại, xoá `SafeArea` thừa (widget đã tự tính `bottom = MediaQuery.of(context).padding.bottom` nội bộ).

## 2. Root cause

`BottomNavigationBarButton` được thiết kế ban đầu chỉ cho use case "list + 1 nút Thêm pinned đáy" (18-20 consumer). Khi FEAT-CAT-GRP/PROD filter cần 2-nút footer (Reset/Áp dụng), không có API multi-button trên widget chung → BUG-W03-035 fix cycle phải hand-roll `SafeArea+Container+Row` riêng trong từng filter page thay vì mở rộng widget dùng chung, dẫn tới duplicate decoration logic (rounded-top corner + shadow) đã tồn tại y hệt trong `BottomNavigationBarButton`.

## 3. Fix

**Blast-radius check (Shared-Symbol Gate)** — trước khi sửa, liệt kê đủ consumer của `BottomNavigationBarButton(`:

```bash
grep -rln "BottomNavigationBarButton(" lib/ui | grep -v "bottom_navigation_bar_button.dart"
```

→ 20 consumer hiện hữu (khớp danh sách bug report), tất cả chỉ truyền `title:`/`onTapButton:`/`isActiveButton:`/`isBoxShadow:` (không truyền `buttons:`, `message:`, `delayTimeInMillisecond:`). Locus = **(a) call-site defect / extension** theo gate: widget hiện tại đúng cho single-button use case, filter page cần biến thể khác → thêm **param opt-in mới** `buttons: List<BottomActionButtonConfig>?`, default `null` = hành vi hiện tại 100% không đổi. Không đổi default/hành vi của 20 consumer hiện hữu.

**Widget extension** (`bottom_navigation_bar_button.dart`):
- New class `BottomActionButtonConfig({title, onTap, isActive = true, isPrimary = true})`.
- `BottomNavigationBarButton.buttons` — `List<BottomActionButtonConfig>?`, optional, default `null`.
- `title`/`onTapButton` chuyển từ `required` → nullable (`assert(buttons != null || (title != null && onTapButton != null))` — vẫn bắt buộc phải cung cấp 1 trong 2 chế độ ở compile-time/runtime-assert, không đổi API contract cho consumer cũ vì consumer cũ luôn truyền cả 2).
- Khi `buttons == null` → render đúng như code cũ (chỉ đổi tên biến nội bộ `_handleTap()` → `_handleTapAt(0, ...)` để tái dùng debounce logic chung cho cả 2 nhánh — hành vi/output không đổi).
- Khi `buttons != null` → `_buildButtonRow()` (port từ `booking/widgets/bottom_actions.dart._buildButtonRow`): 1 nút → `Expanded` full-width; 2 nút → đo `TextPainter` width mỗi nút (dùng `AppButtonSize.medium().titleTextStyle` + `.padding.horizontal` thật thay vì hằng số đoán trong bản gốc) so với `availableWidth` (đo qua `LayoutBuilder`, không phải `MediaQuery.size.width` trừ hằng số) để quyết 50/50 (`Expanded` cả 2) / lệch (`Expanded` + `IntrinsicWidth`) / cả 2 đều quá dài (chia flex theo tỉ lệ min-width); 3+ nút → fallback `isPrimary` → `Expanded`, else `IntrinsicWidth`.
- Debounce (500ms default, chống double-tap) generalize từ 1 biến `_lastTapTime` sang `Map<int, int> _lastTapTimeByIndex` — mỗi nút trong `buttons:` debounce độc lập theo index, không lẫn giữa 2 nút.
- Container decoration (rounded-top-corner 8 + shadow `Color(0x0F000000) blur=12 offset=(0,-4)`) **không đổi** — dùng chung cho cả 2 nhánh single/multi.
- Màu nút trong `_buildButton`: `isPrimary: true` (default) → `AppButtonColor.primary()`; `isPrimary: false` → `AppButtonColor.custom(backgroundColor: AppColors.buttonBackgroundSecondary, contentColor: AppColors.textPrimary)` — khớp chính xác màu Reset/Áp dụng mà 2 filter page đã hand-roll trước đó (không đổi UI fidelity).

**Filter page refactor** (`material_group_filter_page.dart`, `internal_product_filter_page.dart`):
- `bottomNavigationBar: SafeArea(top: false, child: Container(decoration: BoxDecoration(...), child: Row([...AppButton.text...])))` → `bottomNavigationBar: BottomNavigationBarButton(buttons: [BottomActionButtonConfig(title: reset, onTap: cubit.reset, isPrimary: false), BottomActionButtonConfig(title: apply, onTap: ...)])`.
- **Không** bọc thêm `SafeArea` ngoài — widget đã tự `SafeArea` nội bộ (tính `bottom` qua `MediaQuery.of(context).padding.bottom`), tránh double-pad.
- Không đổi cubit method calls — chỉ wire `cubit.reset`/`Navigator.of(context).pop(...)` y hệt trước.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart` | Add `BottomActionButtonConfig` class + `buttons:` optional param + `_buildButtonRow`/`_buildButton`/`_measureTextWidth`/`_measureButtonMinWidth` (ported from `booking/widgets/bottom_actions.dart`) + generalize debounce sang per-index map. Legacy single-button path (`buttons == null`) unchanged behavior. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart` | Refactor `bottomNavigationBar:` từ hand-rolled `SafeArea+Container+Row` sang `BottomNavigationBarButton(buttons: [...])`. Import đổi `button/app_button.dart` → `bottom_navigation_bar_button/bottom_navigation_bar_button.dart`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | Same refactor. |
| `mobile/gf-garage-app/test/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button_test.dart` | **New** — widget test suite: (Group 1) pin legacy single-button path unchanged (renders 1 `AppButton`, debounce, disabled-when-inactive, decoration); (Group 2) new multi-button path (2-button independent tap wiring, `isPrimary` color contract, asymmetric long/short title sizing `Expanded`/`IntrinsicWidth`, 3+-button fallback, per-button `isActive`, decoration parity with legacy path). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_footer_fidelity_test.dart` | Updated the BUG-W03-035 source-scan `test()` — the rounded-corner/shadow decoration literal moved out of the page source into the shared widget, so the old assertions (`source.contains('BorderRadius.only(')` / `'boxShadow: ['`) no longer apply to this file; kept the "no flat `Border(top:)`" assertion (still relevant) and added a new BUG-W03-039 `test()` asserting the page now delegates to `BottomNavigationBarButton(buttons: [...])` with no extra `SafeArea` wrap. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_footer_fidelity_test.dart` | Same update as above (PROD sibling). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_fidelity_test.dart` | Updated the BUG-W03-031 source-scan `test()` — `backgroundColor: AppColors.buttonBackgroundSecondary` literal no longer lives in the page source (now inside the shared widget, driven by `isPrimary: false`); assertion updated to check the page opts out via `isPrimary: false` instead, with the color-token contract itself re-verified directly against `BottomNavigationBarButton` in the new `bottom_navigation_bar_button_test.dart`. |

## 5. Blast-radius verification (Shared-Symbol Gate — mandatory, >1 consumer)

- Re-ran `grep -rln "BottomNavigationBarButton(" lib/ui | grep -v "bottom_navigation_bar_button.dart"` post-fix → 22 files: the original 20 consumers **unchanged**, plus the 2 filter pages intentionally refactored in this cycle (now genuine consumers instead of hand-rolled duplicates).
- Spot-checked 5 of the 20 untouched consumers (`login_page.dart`, `employee_list_page.dart`, `service_order_list_v3_page.dart`, `group_list_footer.dart`, `vehicle_management_filter_page.dart`) — all pass only `title`/`onTapButton`/`isActiveButton`/`isBoxShadow`, none reference `buttons:` — all remain valid against the new signature (parameters unchanged, `title`/`onTapButton` widened from `required` to nullable-but-still-supplied, so no call-site edits needed).
- `python3 scripts/check-mobile-canonical-primitives.py --file <file>` → **0 hits** on all 3 touched files (widget + 2 filter pages).
- Brace/paren balance manually verified on all touched files (Python char-count cross-check + visual read).

## 6. Regression / verification

- New `bottom_navigation_bar_button_test.dart` (11 test cases) directly pins the shared widget's contract in isolation (Test Coverage Contract "Shared widget → golden mọi consumer" spirit — golden/alchemist unavailable in this environment, DEBT-W01-MOBILE-BUILD-ENV, so covered via `flutter_test` widget assertions instead, per the mobile FIX agent's DEFERRED-toolchain carve-out that still requires a written regression test).
- Updated 3 pre-existing source-scan tests whose literal-string assertions were tied to the now-superseded hand-rolled decoration (see §4) — this is a direct, necessary consequence of the requested refactor (the decoration moved from the page into the shared widget), not a weakening of the original regression intent; each updated assertion still guards the same original invariant (no flat `Border(top:)`, correct reset/apply color contract) via the new architecture.
- `python3 scripts/check-mobile-canonical-primitives.py` → OK on all 3 touched `lib/` files.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no `fvm`/`flutter`/`dart` toolchain in this environment (`DEBT-W01-MOBILE-BUILD-ENV`). Manually verified: all APIs referenced (`AppButtonSize.medium().titleTextStyle`, `.padding.horizontal`, `AppButtonColor.primary()/.custom(...)`, `LayoutBuilder`, `IntrinsicWidth`, `Row(spacing:...)`) already exist and are used elsewhere in this same codebase (`bottom_actions.dart` already uses `Row(spacing:...)` + `IntrinsicWidth` on this Flutter/Dart SDK version). Brace/paren balance verified manually on every touched file. TEST_GROUP must re-run `flutter analyze`/`flutter test` on a machine with the toolchain before flipping to `VERIFIED`.

## 7. Non-goals / out of scope

- Did **not** touch `material_group_filter_cubit.dart` / `internal_product_filter_cubit.dart` — concurrent FIX cycle (BUG-W03-037/038) actively working those exact 2 files (lazy-load + state round-trip). Verified via `git diff` that my changes to `material_group_filter_page.dart`/`internal_product_filter_page.dart` are isolated to the `bottomNavigationBar:` composition + import line — no overlap with the other cycle's `initState()`/preload edits already present in the working tree on the same 2 page files.
- Did **not** touch any of the other 20 pre-existing consumers of `BottomNavigationBarButton` — the extension is opt-in-only (`buttons` param default `null`), so none required edits.
- Did **not** touch `internal_product_list_page.dart` / `*_search_page.dart` / `dropdown_menu_widget.dart` — those belong to concurrent BUG-W03-040/041 cycles, already present as uncommitted diffs in the working tree before this cycle started.
- Legacy domain-forked `BottomActions` widgets (`booking/`, `supplier/`, `settlement/`) were **not** touched or migrated — per `rules-mobile SKILL.md §2 R-CTA`, they are legacy and out of this bug's scope; only their `_buildButtonRow` sizing *algorithm* was ported (read-only reference) into the shared `BottomNavigationBarButton`.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — extended `BottomNavigationBarButton` with opt-in `buttons: List<BottomActionButtonConfig>?` multi-button support (ported sizing algorithm from `booking/widgets/bottom_actions.dart`), legacy single-button path unchanged (Shared-Symbol Gate locus (a), 20 pre-existing consumers verified unaffected). Refactored `material_group_filter_page.dart` + `internal_product_filter_page.dart` to reuse the shared widget instead of hand-rolled `SafeArea+Container` footer, removing the redundant outer `SafeArea`. New widget test suite (11 cases) + updated 3 pre-existing source-scan tests whose assertions were tied to the now-relocated decoration literals. `flutter analyze`/`flutter test` DEFERRED (no toolchain, DEBT-W01-MOBILE-BUILD-ENV). |
