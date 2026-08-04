# BUGFIX — BUG-W03-015

> Widget catalog bypass — 12 raw Material button + 2 raw Dialog thay vì AppButton/AppDialog (R10)
> Severity: **P1** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

FEAT-CAT-GRP-* + INT-PROD-* page tree (7 file) violated rules-mobile R10 (Widget Catalog First) by using raw Material `OutlinedButton` / `ElevatedButton` / `TextButton.icon` for footer/dialog CTA + raw `Dialog(...)` construction. Fix replaces every occurrence with canonical `AppButton.text/.custom` factories and delegates dialog composition to `AppDialog` + `ConfirmationDialog` catalog helpers (via thin static shim wrappers to preserve `MaterialGroupDeleteHandler` call sites).

Primary user-facing defect fixed: `group_list_footer.dart` — rewrote from raw `TextButton.icon(Icons.add, ...)` link-style with `Container(bg=bgBase) + Border(top:)` wrap to canonical R-CTA recipe `SafeArea + Padding + AppButton.text(medium, primary)` full-width blue pill per rules-mobile §2 R-CTA (v4) + Figma spec `wave03-cat-grp-list.md §157-159` (TEXT-ONLY, NO leading glyph).

## 2. Root cause

- **T3 checklist shorthand** "text-button" was ambiguous → DEV parsed as Material `TextButton.icon` link-style + `Icons.add` invent glyph + `Container(bg=bgBase)+Border(top:)` bar-style wrap, 100% divergent from Figma blue pill full-width text-only.
- **Widget catalog awareness gap** — DEV did not consult `lib/ui/widgets/button/app_button.dart` or `lib/ui/widgets/notify/app_dialog.dart` before authoring; violated R10.

## 3. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group/widgets/group_list_footer.dart` | Full rewrite → R-CTA canonical (`SafeArea + Padding + AppButton.text(medium, primary)`); removed `Container(bg=bgBase) + Border(top:)` wrap, `Icons.add` prefix, `AppTextStyle.textHeadingH4.copyWith(color:textActivePrimary)` link-style. Retained `Semantics(identifier: 'button-create-group')` test hook. Retained `LocaleKeys.catGrp_addAction.tr()` label (verified verbatim "Thêm nhóm vật tư" in `assets/localizations/vi.json:1098`). |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group/material_group_detail_page.dart` | `_DetailFooter` Xoá/Sửa: raw `OutlinedButton` + `ElevatedButton` → `AppButton.text(custom bg=bgSecondary)` + `AppButton.text(primary)`. Import `app_button.dart`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group/add_material_group_page.dart` | `_buildFooter` Huỷ/Tạo: raw `OutlinedButton` + `ElevatedButton` → `AppButton.text(custom secondary)` + `AppButton.text(primary)`; processing state → `AppButton.custom` với inline `CircularProgressIndicator(color: textWhite)`. Import `app_button.dart`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group/edit_material_group_page.dart` | Same pattern as add_material_group_page (Huỷ + Lưu). |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product/internal_product_filter_page.dart` | `bottomNavigationBar` Reset/Áp dụng: raw `OutlinedButton` + `ElevatedButton` → `AppButton.text(custom secondary)` + `AppButton.text(primary)`. Import `app_button.dart`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group/widgets/material_group_cannot_delete_dialog.dart` | Collapse from raw `Dialog(...)` widget → thin static `show()` shim delegating to `AppDialog(type: info, title, description, okText, dismissible).show()`. Public API `MaterialGroupCannotDeleteDialog.show(context, reason:)`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group/widgets/material_group_confirm_delete_dialog.dart` | Collapse from raw `Dialog(...)` widget → thin static `show()` shim delegating to `ConfirmationDialog.show(title, message, confirmLabel, cancelLabel, confirmButtonColor)`. Returns `Future<bool?>`. Public API `MaterialGroupConfirmDeleteDialog.show(context, groupName:)`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group/material_group_delete_handler.dart` | Adapt to new shim signatures — replaced `showDialog(builder: ...)` calls with `MaterialGroupConfirmDeleteDialog.show(...)` (returns bool) + `MaterialGroupCannotDeleteDialog.show(...)`. Comment references bug-fix rationale. |

## 4. Regression / verification

- `python3 scripts/check-mobile-canonical-primitives.py --file <each fixed file>` → P1/P2 clean 7/7 (footer / detail / add / edit / filter / cannot-dialog / confirm-dialog). Residual P3 hits are spacing literals tracked under **BUG-W03-017** (separate scope).
- `fvm flutter analyze` + `fvm flutter test` + golden regression: **deferred** — mobile toolchain unavailable in sandbox per `BLOCKER-W02-MOBILE-HARNESS-FLUTTER` debt. TEST cycle (agent-test-mobile-ui) responsible for widget + golden regression on next execution.
- LocaleKeys verify: `catGrp_addAction`, `common_delete`, `common_edit`, `common_create`, `common_save`, `common_cancelLong`, `common_reset`, `common_apply`, `catGrp_cannotDelete`, `common_close`, `common_confirm`, `common_cancel`, `catGrp_deleteConfirmBody`, `catGrp_cannotDeleteHasProducts`, `catGrp_cannotDeleteHintProducts`, `catGrp_cannotDeleteHasChildren`, `catGrp_cannotDeleteHintChildren` → all present in `assets/localizations/{vi,en}.json` (no key regeneration needed).

## 5. Non-goals / out of scope

- P3 spacing-literal hits (`EdgeInsets.symmetric(horizontal: 16, vertical: 12)`, `SizedBox(width: 12)`, raw `Container(height: 104)`) tracked under BUG-W03-017 — deferred to separate fix cycle.
- MaterialGroupForm raw `TextField` / `DropdownButtonFormField` (BUG-W03-019) — not in this fix cycle.
- Detail-page RBAC dual-persona guard (BUG-W03-020) — separate.

## 6. Follow-up

- TEST cycle: run `agent-test-mobile-ui` widget + golden after Flutter toolchain restored (`BLOCKER-W02-MOBILE-HARNESS-FLUTTER`) — verify:
  - `group_list_footer_test.dart` — R-CTA canonical (blue pill, TEXT-ONLY, no `Icons.add`, no `Container(bg=bgBase)+Border(top:)`).
  - `material_group_delete_handler_test.dart` — confirm/cannot-delete dialogs render via `AppDialog` / `ConfirmationDialog` shell, flows preserved.
  - Golden update per Figma reference PNG.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Initial fix — 7 raw-button replacements + 2 dialog shim collapses + footer R-CTA canonical rewrite. Regression deferred to TEST cycle. |
