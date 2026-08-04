# BUGFIX — BUG-W03-061

> Group Detail (`MaterialGroupDetailPage`): tên nhóm sai token H3→H2, divider phải full-bleed, footer thiếu shadow+bo góc (đang `Border(top:)` phẳng), gap nút 12→8 — theo live Figma audit frame 21254:51661
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

`lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` lệch live Figma frame `21254:51661` (file `5YU4H3iY726P8KNxI9oCYF`, node audit `21555:24248`) ở 4 điểm P2 + 2 P3 bundled. Fix cycle này đã **re-verify trực tiếp live Figma qua MCP `get_design_context` (2026-07-02)** trước khi sửa (lesson FIX-036 — không tin evidence relay), xác nhận đủ 5 claim:

1. **Tên nhóm** (node `21254:51766`): Figma bind **Heading/H2** — Inter Bold 20px lh28 (styles block MCP ghi rõ `Heading/H2: size 20, lineHeight 28`) = `AppTextStyle.textHeadingH2` — code dùng `textHeadingH3` (18px). Spec prefetch `wave03-cat-grp-detail.md` cũng ghi nhầm 18px → live Figma thắng.
2. **SectionDivider** (Rectangle `21254:51763`): Figma full-bleed `w=375` trong khi các section nội dung `w=343` (inset 16 mỗi bên) — code đặt divider bên trong `SingleChildScrollView(padding: EdgeInsets.all(16))` nên bị inset 16 hai bên.
3. **Footer** (Action bar `21254:51680`): Figma `rounded-tl-8 rounded-tr-8` + shadow `0 -4 12 rgba(0,0,0,0.06)`, **KHÔNG** có border-top — code hand-roll `Container(height: 104, Border(top: 1px borderPrimary))` phẳng.
4. **Gap 2 nút Xoá/Sửa**: Figma `gap-[8px]` — code `SizedBox(width: 12)`.
5. **P3 bundled**: footer padding Figma `pt-16 pb-20` (code 12/12) — superseded bởi việc adopt shared widget (xem §3); header Row (node `21254:51758`) Figma `items-center` — code `crossAxisAlignment: start`.

## 2. Root cause

- **(1)(5)** Spec prefetch drift: `wave03-cat-grp-detail.md` mislabel heading 18px + header row `crossAxis=start` → DEV/FIX cycle trước bám spec thay vì live binding (cùng lớp LL-MOB-009 "đoán/chép token sai" — nhưng ở đây nguồn sai là spec doc, không phải screenshot-guess).
- **(2)** Layout gốc bọc toàn bộ scroll child trong `EdgeInsets.all(16)` — pattern tiện tay nhưng chặn mọi element full-bleed bên trong; Figma đặt inset per-section.
- **(3)(4)** `_DetailFooter` hand-roll `Container + Border(top:)` — đúng anti-pattern #2 của rules-mobile §2 R-CTA đã cấm (recurrence lần 3 sau BUG-W03-025 list footer + BUG-W03-035 filter footers). **Gate blind spot**: `check-mobile-canonical-primitives.py` P1-hit heuristic quét theo filename `*_footer.dart` / `*_bottom_bar.dart` — private class `_DetailFooter` nằm TRONG `*_page.dart` nên thoát gate (0 hit cả trước fix).

## 3. Fix

Target file duy nhất trong `lib/`: `material_group_detail_page.dart`. **KHÔNG** đụng `bottom_navigation_bar_button.dart` — orchestrator cho phép mở rộng `BottomActionButtonConfig` nếu thiếu secondary styling, nhưng kiểm tra thực tế cho thấy **widget đã hỗ trợ đầy đủ từ BUG-W03-039**: `isPrimary: false` → `AppButtonColor.custom(backgroundColor: AppColors.buttonBackgroundSecondary, contentColor: AppColors.textPrimary)` (đúng token footer cũ dùng), Row `spacing = 8.0` (đúng Figma gap 8), Container `rounded-top 8 + BoxShadow(Color(0x0F000000), blur 12, offset (0,-4))` = rgba(0,0,0,0.06) (đúng Figma shadow), KHÔNG border-top, SafeArea nội bộ. → adoption thuần, zero shared-widget change.

1. **Heading H2**: `detail.name` style `textHeadingH3` → `textHeadingH2` + comment cite live-Figma verification (orchestrator yêu cầu tường minh vì spec doc mislabel).
2. **Divider full-bleed**: `SingleChildScrollView` padding `all(16)` → `symmetric(vertical: 16)`; 2 khối nội dung (`_SummaryHeader`, cụm `StartInfoRow`) tự bọc `Padding(horizontal: spacing16)`; `SectionDivider` (width: double.infinity) đứng ngoài padding → bleed đủ viewport. Gap(12) quanh divider giữ nguyên (ngoài scope bug — xem §7 residual).
3. **Footer canonical**: `_DetailFooter` body thay bằng `BottomNavigationBarButton(buttons: [BottomActionButtonConfig(Xoá, isPrimary: false), BottomActionButtonConfig(Sửa)])`. Bỏ hand-rolled `SafeArea+Container(height 104, Border(top:), padding 16/12)+Row+SizedBox(12)`. Import `button/app_button.dart` → `bottom_navigation_bar_button/bottom_navigation_bar_button.dart`.
4. **Slot placement** (rules-mobile §2 R-CTA BẮT BUỘC): footer chuyển từ trailing child của `body: Column` sang `CustomScaffold.bottomNavigationBar:` (gate `detail == null ? null : _DetailFooter(...)` — giữ đúng hành vi cũ: footer chỉ hiện khi detail loaded; rationale no-role-gate của BUG-W03-044 giữ nguyên). `_buildBody` bỏ wrapper `Column/Expanded`.
5. **Header Row** `crossAxisAlignment: start` → `center` (live Figma `items-center`).
6. **Footer padding pt16/pb20**: superseded — shared widget dùng padding 16/16 + SafeArea nội bộ (canonical cho ~20 consumer); per orchestrator proviso "only if not superseded by adopting the shared widget's own padding" → không đổi shared widget.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | 5 fix trên: H2 token, per-section padding + full-bleed divider, footer → `BottomNavigationBarButton(buttons:)` qua `bottomNavigationBar:` slot, header Row center. Import swap `app_button` → `bottom_navigation_bar_button`. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_061_test.dart` | **New** — regression suite BUG-W03-061: (A) static source pins — H2 present/H3 gone, vertical-only scroll padding + per-section horizontal padding, footer delegates to canonical widget (no `Border(`/`BoxShadow(`/`SizedBox(width: 12)`/`height: 104` left), `bottomNavigationBar:` slot wiring, header Row center; (B) render tests — canonical footer 2-button (rounded-top 8 + shadow 0x0F000000 blur12 offset(0,-4), border null, gap đo được = 8.0, tap wiring độc lập); divider full-bleed mirror-fixture (SectionDivider width = 375 viewport, section width = 343). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_test.dart` | **Superseded pins updated** (mirror-fixture của BUG-W03-042 tự khai "kept in sync manually" với widget thật): fixture Row `crossAxis start → center` + expectation dòng tương ứng; fixture name Text `textHeadingH3 → textHeadingH2`; doc-comment ghi rõ BUG-W03-061 supersede theo live Figma. Toàn bộ assertion logic 042 còn lại (date format, caption, spaceBetween, no raw ISO) giữ nguyên và vẫn pass với source mới (verify bằng python static-pin sweep). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_secondary_button_token_test.dart` | **Superseded pin updated** (BUG-W03-033): entry `MaterialGroupDetailPage (Xoá)` trong targets loop yêu cầu literal `backgroundColor: AppColors.buttonBackgroundSecondary` trong page source — literal này giờ nằm trong shared widget (qua `isPrimary: false`). Thay bằng test riêng assert: page có `isPrimary: false` + không dùng `bgSecondary`; shared widget giữ đúng token `buttonBackgroundSecondary` (guard cùng bug-class, relocated — cùng cách BUG-W03-039 đã xử lý cho `internal_product_filter_fidelity_test.dart`). Add/Edit entries giữ nguyên (BUG-W03-062 sẽ xử lý sau). |
| `Tracking/WAVE03/BUGS.md` | Row BUG-W03-061 Status OPEN → IN_PROGRESS → RESOLVED + Notes prefix `[FIXED 2026-07-02 ...]`. |

**Don't-touch tôn trọng**: KHÔNG đụng edit/add pages (BUG-W03-062 scope), KHÔNG đụng `bottom_navigation_bar_button.dart`, KHÔNG fork footer widget mới, KHÔNG `git commit/push`.

## 5. Blast-radius verification (Shared-Symbol Gate)

- Shared widget **không bị sửa** → không cần re-verify 20+ consumer về behavior change. Gate chạy dạng adoption-check: `grep -rln "BottomNavigationBarButton(" lib/ui` **trước** = 24 file, **sau** = 25 file, diff đúng 1 dòng = `material_group_detail_page.dart` (consumer mới) — 0 consumer hiện hữu thay đổi.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` → **0 hit** (trước fix cũng 0 hit — xác nhận gate blind spot §2; sau fix 0 hit đúng bản chất).
- Brace/paren/bracket balance python char-count: page 19/19 brace, 110/110 paren, 6/6 bracket; test file balanced sau khi trừ 5 paren mở nằm trong string literal assertion.
- Static-pin sweep (python) xác nhận **mọi assertion của 4 test file hiện hữu tham chiếu page này** (BUG-W03-042/050/033 + regexes) vẫn pass với source mới.

## 6. Regression / verification

- **Regression test mới**: `material_group_detail_fidelity_bug_061_test.dart` — fail-trước-fix / pass-sau-fix theo thiết kế (static pins fail trên source cũ: H3 còn, `EdgeInsets.all(16)` còn, `Border(` còn, `SizedBox(width: 12)` còn, slot regex không match; render tests pin hành vi canonical footer + full-bleed divider bằng số đo cụ thể 8.0 / 375 / 343).
- **Build/analyze/test DEFERRED**: môi trường không có Flutter toolchain (`fvm`/`flutter`/`dart` đều absent — DEBT-W01-MOBILE-BUILD-ENV). TEST_GROUP chạy trên máy có toolchain: `fvm flutter analyze lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` + `fvm flutter test test/ui/inventory_catalog/material_group_detail/ test/ui/inventory_catalog/material_group_secondary_button_token_test.dart test/ui/widgets/bottom_navigation_bar_button/`.
- Golden (alchemist) vs oracle: không khả thi trong env này (cùng DEBT) — thay bằng widget-render assertions đo số cụ thể (gap 8.0, width 375/343, shadow tuple) per carve-out của mobile FIX agent.

## 7. Residual risk / follow-up

- **Gate blind spot** (cho Delivery Authority cân nhắc): `check-mobile-canonical-primitives.py` không quét bar-style `Container+Border(top:)` trong `*_page.dart` (chỉ `*_footer.dart`/`*_bottom_bar.dart`) — `_DetailFooter` thoát gate suốt 2 fix cycle. Đề xuất mở rộng heuristic quét private class `*Footer`/`*BottomBar` trong page files.
- **Gap quanh divider**: code `Gap(12)` × 2 — live Figma column gap của frame là 20 (node `21254:51757` `gap-[20px]`). Ngoài scope 5 item của bug này (không được liệt kê) → không sửa, flag để Figma-audit sau quyết (nếu sửa: 20 ngoài AppSizes scale, cần escalate như 12 hiện tại).
- **BUG-W03-062 coordination**: edit/add form footers dùng cùng nhận xét — vì `BottomActionButtonConfig` ĐÃ hỗ trợ secondary (`isPrimary: false`) sẵn, cycle 062 chỉ cần adoption y hệt (không cần chờ extension nào từ cycle này).
- Trang này giờ đồng nhất footer canonical với `material_group_filter` / `internal_product_filter` (BUG-W03-039) — giảm surface hand-rolled còn lại trong inventory_catalog xuống edit/add (062).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial BUGFIX doc — root cause + fix + blast radius + regression + residual (live Figma re-verified via MCP). |
