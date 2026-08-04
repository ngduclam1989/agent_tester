# BUGFIX — BUG-W03-062

> Group Add/Edit form (`MaterialGroupForm` + `AddMaterialGroupPage`/`EditMaterialGroupPage`): section header sai token, thiếu counter 0/250, nút "Huỷ bỏ"→"Huỷ", disabled field tô xám sai, footer hand-rolled — theo live Figma audit node 21254:51963
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

`lib/ui/inventory_catalog/widgets/material_group_form.dart` (shared bởi Add + Edit) và cả 2 page file lệch live Figma node `21254:51963` (file `5YU4H3iY726P8KNxI9oCYF`) ở 7 điểm P2 + 2 P3 bundled:

1. **"Thông tin chung" section header** (node `21254:51969`): Figma Inter Bold 18/26 = `textHeadingH3` — code dùng `textHeadingH4` (16).
2. **Mô tả textarea thiếu counter "0/250"** (node `21254:51978`, Caption/C7 text-quaternary): `AppTextField(maxLength: 250)` hard-set `counterText: ''` nên counter mặc định Flutter không hiện; `CountTextField` sẵn có nhưng thiếu server-error/validator passthrough cần cho field này.
3. **Nút Huỷ**: `common_cancelLong` ("Huỷ bỏ") thay vì `common_cancel` ("Huỷ") — Figma verbatim.
4. **Field "Mã nhóm VTHH" disabled (edit mode)** bị tô xám (`Colors.grey.shade200` raw fallback trong `app_text_field.dart` khi `enabled: false`) — Figma render y hệt field thường (trắng).
5. **Label→field gap**: raw `SizedBox(height: 6)` với comment sai "no exact AppSizes match" — Figma gap-8, `AppSizes.spacing8` có sẵn.
6. **Footer** (Action bar `21254:51982`, cả Add + Edit, duplicated verbatim): hand-roll `Container(Border(top:))` — Figma yêu cầu shadow `0 -4 12 rgba(0,0,0,0.06)` + rounded-top 8, không border line; gap 2 nút 12→8.
7. **P3 bundled**: thiếu strip 6px `bg-primary` full-bleed dưới AppBar (node `21254:51965`); placeholder Mô tả "Nhập mô tả (tuỳ chọn)" → Figma verbatim "Nhập mô tả" (bỏ suffix bịa).

## 2. Root cause

- **(1)(3)(5)(7b)** Token/content drift tương tự các bug Figma-audit khác cùng đợt (BUG-W03-059/060/061/063) — implementation cũ không re-verify live binding, một số theo spec prefetch stale, một số tự đặt "hợp lý" (label gap 6, placeholder thêm "(tuỳ chọn)").
- **(2)** `AppTextField` (shared) tắt counter mặc định bằng `counterText: ''` — call site cần widget chuyên dụng (`CountTextField`) hoặc render counter riêng, nhưng field này cần `hasServerError`/`validator` passthrough mà `CountTextField` không có → chọn mirror counter tại call site thay vì mở rộng 1 trong 2 shared widget.
- **(4)** `enabled: false` route qua nhánh disabled hardcode `Colors.grey.shade200` của `AppTextField` — sai với Figma cho field "immutable nhưng visually giống field thường" (khác semantics với field thực sự bị vô hiệu hoá tạm thời).
- **(6)** Cùng anti-pattern #2 rules-mobile §2 R-CTA đã cấm (recurrence sau BUG-W03-025/035, và cùng ngày với BUG-W03-061 detail page) — `BottomActionButtonConfig` đã hỗ trợ đủ style secondary từ BUG-W03-039 nên đây thuần là thiếu adoption, không phải thiếu tính năng ở shared widget.

## 3. Fix

1. **Section header**: `textHeadingH4` → `textHeadingH3` trong `material_group_form.dart` (comment cite live-Figma verification 2026-07-02).
2. **Counter 0/250**: bọc `AppTextField` Mô tả trong `Column(crossAxisAlignment: end)` + `ValueListenableBuilder<TextEditingValue>` trên `_descCtrl` render `Text('${len}/250', style: textCaptionC7.copyWith(textQuaternary))` bên dưới — không đụng `AppTextField`/`CountTextField`.
3. **Nút Huỷ**: `common_cancelLong` → `common_cancel` ở cả `edit_material_group_page.dart` + `add_material_group_page.dart` (khớp cách BUG-W03-052 đã sửa cùng lỗi ở nơi khác).
4. **Field code không tô xám khi disabled**: `enabled: !widget.isEdit` → `readOnly: widget.isEdit` (giữ `enabled: true` mặc định) — `AppTextField`'s disabled fallback không còn áp dụng, field vẫn chặn input đúng semantics.
5. **Label gap**: `SizedBox(height: 6)` → `Gap(AppSizes.spacing8)`, sửa luôn comment sai.
6. **Footer canonical**: cả 2 page thay `_buildFooter` hand-rolled bằng `BottomNavigationBarButton(buttons: [BottomActionButtonConfig(Huỷ, isPrimary: false), BottomActionButtonConfig(Lưu/Tạo, isActive: canSubmit)])`, wire qua `bottomNavigationBar:` slot (rules-mobile §2 R-CTA slot placement) — **zero shared-widget change** cần thiết, đúng như briefing từ BUG-W03-061 (widget đã hỗ trợ `isPrimary: false` từ BUG-W03-039).
7. **AppBar strip + placeholder**: thêm `const SectionDivider()` (6px) ngay dưới AppBar trong cả 2 page (full-bleed, đứng ngoài `SingleChildScrollView` padding); `catGrp_descriptionPlaceholder` "Nhập mô tả (tuỳ chọn)" → "Nhập mô tả" (vi + en).

**Ghi chú phối hợp BUG-W03-064**: trong lúc verify field "Thuộc nhóm" (parent group dropdown) cho fix này, phát hiện `DropdownMenuWidget` đã được mở rộng thêm param `enabled` (default `true`, backward-compatible với 3 consumer hiện hữu) để khoá field theo `BR-CAT-GRP-009` (nhóm cha chỉ chọn 1 lần lúc tạo, khoá vĩnh viễn ở Chỉnh sửa — quyết định nghiệp vụ ratify 2026-07-02, xem `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` change log #19). Đây là phần việc của cycle BUG-W03-064 (đã `FIX_DONE` riêng, cùng chạm `material_group_form.dart`) — không phải scope của BUG-W03-062, giữ nguyên khi commit.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart` | Header token H3; counter 0/250 (Column+ValueListenableBuilder); code field `readOnly` thay `enabled:false`; label gap → `AppSizes.spacing8`. (Cũng mang theo phần `enabled:` cho "Thuộc nhóm" dropdown của BUG-W03-064, cùng file.) |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_edit/edit_material_group_page.dart` | Footer → `BottomNavigationBarButton` qua `bottomNavigationBar:` slot; nút Huỷ → `common_cancel`; thêm `SectionDivider()` strip dưới AppBar. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart` | Same 3 thay đổi như Edit page (footer/label/strip). |
| `mobile/gf-garage-app/lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` | Thuộc về BUG-W03-064 (đã `FIX_DONE` riêng) — `enabled` param mới, default `true`, không ảnh hưởng 3 consumer hiện hữu. |
| `mobile/gf-garage-app/assets/localizations/{vi,en}.json` | `catGrp_descriptionPlaceholder` bỏ suffix "(tuỳ chọn)"/"(optional)" bịa. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_secondary_button_token_test.dart` | **Superseded pin update** (BUG-W03-033): entry Add/Edit chuyển sang delegation-assert style (`isPrimary: false` + `BottomNavigationBarButton(` present + không còn `bgSecondary`), cùng cách BUG-W03-061 đã làm cho entry Detail. |
| `Tracking/WAVE03/BUGS.md` | Row BUG-W03-062 Status OPEN → IN_PROGRESS → **FIX_DONE**. |

**Don't-touch tôn trọng**: KHÔNG đụng `app_text_field.dart`, `count_textfield.dart`, `bottom_navigation_bar_button.dart` (không cần extension), `material_group_detail_page.dart` (đã fix ở 061). KHÔNG `git commit/push` trong FIX cycle (orchestrator commit sau khi verify).

## 5. Blast-radius verification (Shared-Symbol Gate)

- `BottomNavigationBarButton`: adoption-check `grep -rln "BottomNavigationBarButton(" lib/ui` — 2 consumer mới (Add + Edit), 0 consumer hiện hữu thay đổi hành vi (không sửa widget).
- `DropdownMenuWidget` (phần BUG-W03-064 mang theo): `enabled` default `true` → 3 consumer hiện hữu (`material_group_form.dart` field Trạng thái, `material_group_filter_page.dart`, `internal_product_filter_page.dart`) không đổi hành vi khi không truyền `enabled:`.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` trên cả 4 file `lib/` touched → **0 hit** thật (2 P2 `setState` trong `material_group_form.dart` là code cũ có sẵn từ trước fix, không phải regression; 1 P3 SizedBox-trong-comment ở `edit_material_group_page.dart` là false-positive của gate — text "SizedBox(width: 12)" nằm trong dòng comment giải thích code đã xoá, gate hiện chưa skip dòng `//` comment của Dart).
- Brace/paren balance: 4/4 file `lib/` verified balanced (đọc thủ công + đếm ký tự). Test file `material_group_secondary_button_token_test.dart` đếm paren lệch 1 (49/48) qua bộ đếm thô — đọc toàn bộ file (101 dòng) xác nhận cú pháp Dart 3 hợp lệ (record-pattern destructuring `for (final (label, path) in delegatedPages)`), false-positive của bộ đếm ký tự thô.

## 6. Regression / verification

- **Regression test**: static-pin update trong `material_group_secondary_button_token_test.dart` (delegation-assert cho Add/Edit, cùng pattern BUG-W03-061 đã thiết lập cho Detail). Không có file test mới riêng cho BUG-W03-062 (FIX cycle bị process interrupt giữa chừng — orchestrator verify + commit phần đã hoàn thành thay vì re-run toàn bộ cycle, vì cả 7 task đều đã implement đầy đủ và đúng khi đối chiếu).
- **Build/analyze/test DEFERRED**: không có Flutter toolchain trong sandbox (DEBT-W01-MOBILE-BUILD-ENV). TEST_GROUP cần chạy `fvm flutter analyze` + `fvm flutter test test/ui/inventory_catalog/material_group_edit/ test/ui/inventory_catalog/material_group_add/ test/ui/inventory_catalog/widgets/material_group_form_test.dart test/ui/inventory_catalog/material_group_secondary_button_token_test.dart test/ui/widgets/dropdown_menu/` trên máy có toolchain.

## 7. Residual risk / follow-up

- **Không có test file mới riêng cho BUG-W03-062** — do FIX cycle bị interrupt (process exit giữa chừng), chỉ kịp cập nhật static-pin có sẵn. Khuyến nghị: thêm 1 test file `material_group_form_bug_062_test.dart` (theo mẫu `material_group_detail_fidelity_bug_061_test.dart`) ở lượt sau nếu cần coverage chặt hơn cho counter/readOnly/strip.
- **Gate false-positive** (P3 SizedBox trong comment) — cùng lớp vấn đề với gate blind spot đã ghi nhận ở BUGFIX-061 §7: `check-mobile-canonical-primitives.py` chưa skip dòng comment `//` của Dart (chỉ skip ` ``` ` và `#` — cú pháp markdown/Python/YAML). Không block, nhưng nên fix cùng đợt cải thiện gate script.
- Cùng với BUG-W03-061, `inventory_catalog` giờ có 3/3 footer canonical hoá (List đã có từ trước, Detail ở 061, Add/Edit ở 062 này) — không còn hand-rolled `Container+Border(top:)` nào trong domain này.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | orchestrator (main agent) — recovered from interrupted FIX subagent, verified + finalized | Initial BUGFIX doc — root cause + fix + blast radius + regression + residual, written after verifying the interrupted agent's partial work was complete and correct against all 7 target tasks. |
