# BUGFIX — BUG-W03-063

> `ConfirmationDialog` (shared widget) drift so với Figma node `21254:52061` "Popup xác nhận": default message style sai token (SemiBold xám thay vì Caption/C5 đen), button radius 12→8, button padding dọc 16→12, action-bar bottom padding 16→24, `Colors.white` raw literal + dead ternary.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02
> Source: Figma audit trực tiếp (mobile dev) — node `21254:52061`, file `5YU4H3iY726P8KNxI9oCYF` · Related: BUG-W03-052

## 1. Summary

`lib/ui/widgets/dialogs/confirmation_dialog.dart` là popup xác nhận dùng chung toàn app. Live Figma (re-verified qua `get_design_context` 2026-07-02, đúng yêu cầu bug) chốt: message = **Caption/C5 Regular 14/20 `#262626`**; action bar **pt-16 / pb-24 / px-16**, top-radius 8, shadow `0 -4 12 rgba(0,0,0,0.06)`; 2 button **py-12 / px-16, radius 8**, label Inter Bold 16/24 (H4) — Huỷ `#262626`, Xác nhận trắng; overlay backdrop **opacity 0.7**. Code trước fix lệch 5 điểm (mục 3).

## 2. Root cause

Default style của shared widget drift khỏi design system rồi bị các consumer "style-conscious" che khuất: mọi call site quan tâm fidelity đã tự né default bằng `messageWidget` (HighlightText/RichText/Text đều dùng `textCaptionC5` hoặc tương đương w400/14) — chỉ các call site "mộc" (plain `message:`) còn render SemiBold xám sai. Đây là **locus (b) shared-contract defect** theo Shared-Symbol Blast-Radius Gate: default sai với mọi input; consumer đúng chỉ vì tự né. Geometry (radius 12 / padding 16 / action-bar 16/16) sai đồng nhất ở mọi consumer. `Colors.white` raw + ternary `isConfirmEnabled ? Colors.white : Colors.white` là dead code từ lúc viết.

## 3. Fix (chỉ 1 file: `lib/ui/widgets/dialogs/confirmation_dialog.dart`)

| # | Vị trí (pre-fix) | Trước | Sau | Figma evidence |
|---|---|---|---|---|
| 1 | line 157 default `messageStyle` | `textSubtitleS5.copyWith(color: textSecondary)` | `textCaptionC5.copyWith(color: textPrimary)` | node `21254:52186` Inter Regular 14/20 `#262626` (Caption/C5) |
| 2 | lines 225, 246 button shape | `BorderRadius.circular(12)` | `circular(8)` | node `I21254:52187;3:17921/17937` rounded-8; khớp `AppButtonSize.medium().borderRadius = 8` (`lib/ui/widgets/button/app_button.dart:287`) |
| 3 | lines 226, 247 button padding | `EdgeInsets.symmetric(vertical: 16)` | `vertical: 12` | py-12 trên cả 2 button |
| 4 | line 200 action-bar padding | `top: 16, bottom: 16` | `top: 16, bottom: 24` | node `21254:52187` pt-16 pb-24 asymmetric |
| 5 | lines 252-253 confirm label color | `isConfirmEnabled ? Colors.white : Colors.white` (raw + dead ternary) | `AppColors.textWhite` (token, `app_colors.dart:17`) | Figma text-white; không có disabled-color riêng trong Figma → giữ 1 giá trị |

KHÔNG đổi: Dialog radius 16, title `textHeadingH3`, reason-field block, `show()` signature (public API untouched), **KHÔNG thêm `barrierColor`** (xem §6).

## 4. Blast radius — Shared-Symbol Blast-Radius Gate (10 file / 20 invocation)

`grep -rn "ConfirmationDialog.show(" lib` (2026-07-02, post-fix re-run: **zero call-site file thay đổi**). Bug title ghi "11 call sites" — enumeration thực tế: **10 file consumer, 20 invocation expression** (một số file gọi nhiều lần / qua helper).

**Nhóm A — rely on default `messageStyle` (6 invocation, 5 file) → ĐỔI LOOK message (SemiBold xám → C5 Regular đen) — chủ đích của fix, QA visual re-check bắt buộc:**

| File | Invocation | Ghi chú spec |
|---|---|---|
| `material_group_confirm_delete_dialog.dart:21` | delete-group confirm (W03) | Spec `wave03-cat-grp-delete.md` §Text/Body-ConfirmMessage YÊU CẦU `textCaptionC5.copyWith(textPrimary)` — trước fix đang VI PHẠM spec, sau fix khớp |
| `employee_create_helper.dart:20` | cancel-create confirm | Không có spec figma-mobile riêng (chỉ wave01/02 insurance + wave03 catalog tồn tại) → không có spec mâu thuẫn |
| `employee_create_helper.dart:32` | edit-cancel confirm | nt |
| `service_order_creation_v3_page.dart:227` | resend-quotation confirm | nt |
| `service_order_detail_v3_page.dart:104` | confirm-order | nt |
| `customer_form.dart:274` | update-customer-name confirm | nt |

**Nhóm B — override qua `messageWidget` (7 invocation) → message KHÔNG đổi by-construction (param thắng default):** `employee_detail_helper.dart:31,60,260,314` (HighlightText, default style = `textCaptionC5`), `service_order_detail_v3_page.dart:113` (`textCaptionC5`), `:142` (RichText w400/14 tương đương C5), `complete_order_dialog.dart:9` (RichText `textCaptionC5`). ⇒ chính nhóm này là bằng chứng "default là outlier".

**Nhóm C — `contentWidget` (6 invocation) → body bypass hoàn toàn:** `booking_create_page.dart:196`, `booking_detail_page.dart:305` (helper dùng cho 4 flow :219/:254/:273/:291), `employee_create_helper.dart:64`, `employee_detail_helper.dart:279`, `service_order_detail_v3_page.dart:208`, `show_pop_up_supplier.dart:71` (helper dùng cho 4 wrapper add/edit/activate/deactivate supplier).

**Nhóm D — `reasonController` (1 invocation) → message ẩn:** `service_order_detail_v3_page.dart:186` (cancel-service với lý do).

**Geometry (fix #2 #3 #4 #5) áp GLOBAL cho cả 20 invocation** (button radius/padding, action-bar pb-24, confirm label token) — chấp nhận per bug disposition (design-system default correction), toàn bộ 10 file trên vào danh sách QA visual re-check.

## 5. Regression test

`test/ui/widgets/dialogs/confirmation_dialog_test.dart` (mới, group theo BUG-W03-063):

1. Default message style = `textCaptionC5` props (14/w400) + `AppColors.textPrimary` (fail-trước-fix).
2. `messageStyle` override vẫn thắng default (guard cho consumer tương lai truyền param).
3. `messageWidget` bypass default (Nhóm B không bị ảnh hưởng).
4. `contentWidget` thay body nhưng giữ action bar (Nhóm C).
5. Cả 2 button: shape radius 8 + padding `vertical: 12` (fail-trước-fix).
6. Action-bar Container padding `left/right 16, top 16, bottom 24` (fail-trước-fix).
7. Confirm label color = `AppColors.textWhite`.
8. Source-level guard: file không còn chuỗi `Colors.white` (chống tái phát raw literal).

**Golden test (alchemist) cho mọi consumer: DEFERRED** — không có Flutter toolchain trên máy này (DEBT-W01-MOBILE-BUILD-ENV; `which fvm/flutter/dart` trống) nên không sinh được golden baseline. Widget test structural ở trên pin đủ từng thuộc tính geometry/token thay thế. `fvm flutter analyze` + `fvm flutter test` verify **DEFERRED cho TEST_GROUP** trên máy có toolchain.

## 6. Residual risk / needs_review

1. **Barrier scrim 70% vs 54%**: Figma overlay `21254:52181` opacity 0.7; Flutter `showDialog` default `barrierColor` = `Colors.black54`. KHÔNG tự thêm `barrierColor` override — đổi sẽ ảnh hưởng nhất quán scrim với mọi dialog khác trong app → cần design-system decision (per bug disposition #6).
2. **Prefetch spec drift** (ngoài OWNED_PATHS, không tự sửa): `Product/ux/figma-mobile/wave03-cat-grp-delete.md` §AppButton/Huỷ + §AppButton/XácNhận ghi radius=4, `AppButtonSize.small` h=36, label `textSubtitleS5` 14/600, footer `EdgeInsets.all(16)` cho CÙNG node `21254:52061` — live Figma 2026-07-02 cho radius 8, py-12, label H4 16 Bold, pt-16/pb-24. Spec stale ở button instance con → cần re-prefetch/sửa spec (flag cho orchestrator; message/C5 section của spec thì ĐÚNG và khớp fix).
3. **Gate `check-mobile-canonical-primitives.py`**: 1 hit P2 pre-existing tại line 114 `setState` (listener của `reasonController`) — dialog là StatefulWidget thuần không có BLoC, hit là stylistic-drift heuristic có sẵn TRƯỚC fix; refactor sang BLoC = scope creep, không thuộc bug này. Không có hit mới do fix. (5 fix chính: 0 hit.)
4. **Action-bar shadow blur**: code `blurRadius: 10` vs Figma 12 (`0 -4 12 @6%`) — ngoài scope bug (không nằm trong 6 điểm disposition), ghi nhận để audit sau.
5. **Worktree dùng chung**: sau khi fix apply, một process ngoài (concurrent cycles) đã commit thay đổi vào `4f77ce55` cùng công việc của BUG-W03-059/060/061 — FIX agent này KHÔNG tự commit/push (đúng Forbidden Actions).

## 7. Verification

- [x] Live Figma re-verify node `21254:52061` (`get_design_context`) — khớp toàn bộ 5 fix + xác nhận spec prefetch stale ở button geometry.
- [x] Blast-radius gate: 20 invocation / 10 file enumerated + phân loại A/B/C/D trước khi sửa; nhóm rely-default không có Figma spec mâu thuẫn (spec duy nhất tồn tại — cat-grp-delete — yêu cầu đúng giá trị mới).
- [x] `python3 scripts/check-mobile-canonical-primitives.py --file …/confirmation_dialog.dart` — 0 hit mới (1 P2 pre-existing, xem §6.3).
- [x] Brace/paren balance OK (dialog + test).
- [x] Re-grep call sites post-fix: 0 call-site file changed; public API (`show()` params, constructor) untouched.
- [ ] `fvm flutter analyze` / `fvm flutter test` — **DEFERRED** (no Flutter toolchain; TEST_GROUP chạy trên máy có toolchain).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial BUGFIX doc — 5 Figma-fidelity corrections trên shared ConfirmationDialog, blast radius 10 file/20 invocation, regression test 8 case, golden + analyze/test deferred (toolchain). |
