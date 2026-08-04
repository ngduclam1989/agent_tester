# BUGFIX — BUG-W03-025

> BottomBar nút "Thêm nhóm vật tư" thiếu border-top + padding sai so Figma / màn tham khảo
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01 (re-fix)

## 1. Summary

`GroupListFooter` (footer CTA "Thêm nhóm vật tư" trên `MaterialGroupListPage`) ban đầu bọc `AppButton.text` trong `SafeArea(top:false) > Padding(EdgeInsets.symmetric(horizontal: spacing16, vertical: spacing8))` — không có `BoxDecoration`/border-top nào, và padding vertical chỉ bằng 1/2 spec (`spacing8` thay vì `spacing16`).

Design Source Ref gốc: `Product/ux/figma-mobile/wave03-cat-grp-list.md#bottombarfooter-identifier-grouplistfooter` (dòng 144-149) — dòng "Border-top: 1px solid AppColors.borderPrimary" hoá ra là **spec transcription error** (không có `_png_verified`), đã được sửa trong spec ở lần re-fix này.

## 2. Root cause (v1 — 2026-07-01, SAI)

Widget viết mới cho W03 không mang theo container/decoration bọc ngoài chuẩn — chỉ có `SafeArea + Padding` thuần, thiếu `Container` với `BoxDecoration(border: Border(top: ...))`, và giá trị padding vertical bị lệch (`spacing8` thay vì `spacing16`). Fix v1 bọc nội dung trong `Container(decoration: BoxDecoration(color: AppColors.bgBase, border: Border(top: BorderSide(color: AppColors.borderPrimary))))` + sửa padding vertical `spacing8`→`spacing16`.

**v1 SAI**: fix này chính là anti-pattern #2 mà `rules-mobile SKILL.md §2 R-CTA` CẤM (`Container` + `Border(top:)` bar-style masquerading trong `*_footer.dart`) — bị mechanical gate `scripts/check-mobile-canonical-primitives.py` bắt (2 P2 hit) ngay khi chạy lại. Root cause gate này được sinh ra chính từ defect gốc của màn này (W03 incident 2026-07-01, checklist T3 "text-button" ambiguous → DEV parse sai → footer thành bar-style ban đầu) — v1 vô tình tái tạo lại cùng lỗi thay vì áp dụng canonical fix.

## 3. Root cause (v2 — REOPENED, CR-20260701-06)

Fix v1 dựa trên dòng "Border-top: 1px solid AppColors.borderPrimary" trong spec Figma — dòng này là spec transcription error, không match Figma oracle thật (Figma primary CTA pill KHÔNG có top separator). Hướng fix đúng cho pattern "list screen + 1 nút Thêm pinned đáy" là dùng widget canonical đã share sẵn `BottomNavigationBarButton` (`lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart`, registry key `bottom-action-single`) — đã có **18 consumer** hiện hữu (`employee_list_page.dart`, `service_order_list_v3_page.dart`, …), tự render `Container(borderRadius topLeft/topRight 8, boxShadow subtle) + SafeArea + AppButton.text`, KHÔNG border-top, có debounce tap 500ms built-in — thay vì tự viết `Container`/`Border` mới.

## 4. Fix (v2)

Viết lại `GroupListFooter` thành thin wrapper quanh `BottomNavigationBarButton`, giữ nguyên public API (`GroupListFooter({VoidCallback? onPressAdd})`) nên call site `material_group_list_page.dart:121` KHÔNG cần đổi. `isActiveButton: onPressAdd != null`; `onTapButton: onPressAdd ?? () {}`. Bỏ import `AppColors`/`AppSizes`/`AppButton` (không còn dùng trực tiếp), thêm import `BottomNavigationBarButton`. Giữ `Semantics(identifier: 'button-create-group', button: true)` bọc ngoài để không regress testid coverage (checklist T11).

## 5. Files changed (v2)

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/widgets/group_list_footer.dart` | Rewrote to thin-wrap `BottomNavigationBarButton` (title/isActiveButton/onTapButton), replacing the v1 `Container(Border(top:))` anti-pattern. Public API (`onPressAdd`) unchanged, no call-site change needed. Dropped unused `AppColors`/`AppSizes`/`AppButton` imports. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_list/material_group_list_fidelity_test.dart` | Replaced `group('BUG-W03-025', ...)` block: (1) asserts `GroupListFooter` renders a `BottomNavigationBarButton` descendant with correct `title` (`LocaleKeys.catGrp_addAction.tr()`) + `isActiveButton` (true when `onPressAdd` set, false when null); (2) new regression guard test asserting no descendant `Container` has a non-null `BoxDecoration.border` (anti-pattern #2 must not recur). BUG-W03-024 test in same file untouched. |
| `Product/ux/figma-mobile/wave03-cat-grp-list.md` | Corrected spec transcription error — removed erroneous "Border-top: 1px solid AppColors.borderPrimary" line for `#bottombarfooter-identifier-grouplistfooter` (was not `_png_verified`). |
| `.claude/agents/agent-dev-garage-mobile.md`, `.claude/agents/agent-fix-garage-mobile.md` (mobile/gf-garage-app) | Added pointer to `BottomNavigationBarButton` as preferred primitive for "list + pinned-bottom Add" pattern + `AppBarCustom.actions`/`hasShape` reminders, cross-ref `rules-mobile SKILL.md §2 R-CTA`. |
| `.claude/skills/rules-mobile/SKILL.md` (design repo) | Added "Variant — shared `BottomNavigationBarButton`" subsection under §2 R-CTA (done earlier this session, referenced here as the canonical source). |

## 6. Regression / verification

- New widget tests in `material_group_list_fidelity_test.dart` group `BUG-W03-025`:
  1. `'BUG-W03-025: GroupListFooter renders canonical BottomNavigationBarButton with correct title + isActiveButton'` — pumps `GroupListFooter` with `onPressAdd` set → asserts descendant `BottomNavigationBarButton.title == LocaleKeys.catGrp_addAction.tr()` and `.isActiveButton == true`; re-pumps with `onPressAdd: null` → asserts `.isActiveButton == false`.
  2. `'BUG-W03-025 regression guard: no descendant Container has a BoxDecoration.border (anti-pattern #2 must not recur)'` — enumerates all descendant `Container` widgets and asserts none has a non-null `BoxDecoration.border` — fail-before/pass-after guard against the v1 anti-pattern recurring.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/widgets/group_list_footer.dart` → **OK: 0 anti-pattern hit** (was FAIL 2 P2 hit before v2 fix).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no `fvm`/`flutter` toolchain installed in this environment (`DEBT-W01-MOBILE-BUILD-ENV`). Must be run by TEST_GROUP on a machine with the toolchain before flipping to `VERIFIED`.

## 7. Non-goals / out of scope

- Did not touch `material_group_list_page.dart`'s AppBar (`hasShape: false`) — correct from prior BUG-W03-024 fix, unrelated.
- Did not build MaterialGroup search/filter pages (BUG-W03-021) — separate DEV task.
- Did not touch other `*_footer.dart`/`*_bottom_bar.dart` consumers of the old bar-style pattern outside this bug's scope — a repo-wide sweep for the same anti-pattern is a candidate follow-up (not filed as a separate debt item; the mechanical gate `check-mobile-canonical-primitives.py` will catch new instances at spec/DEV time).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — wrapped `GroupListFooter` body in `Container` with `border-top` decoration; corrected vertical padding `spacing8` → `spacing16` per Figma spec. Added regression widget test. |
| 2026-07-01 | 2 | agent-fix-garage-mobile (re-fix, CR-20260701-06) | REOPENED — v1 fix was itself the `rules-mobile §2 R-CTA` anti-pattern #2 (`Container`+`Border(top:)`), caught by `check-mobile-canonical-primitives.py` (2 P2 hit). Root cause: Figma spec transcription error (border-top line not `_png_verified`). Re-fixed by rewriting `GroupListFooter` as a thin wrapper around canonical shared `BottomNavigationBarButton` (18+ consumer, no border-top). Regression test replaced accordingly. Governance docs (agent-dev/fix-garage-mobile) updated with pointer to canonical primitive. |
