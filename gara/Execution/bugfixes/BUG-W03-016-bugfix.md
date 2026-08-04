# BUGFIX — BUG-W03-016

> T6 FieldsList dùng raw `Divider()` không phải `SectionDivider` 6px (CR-20260701-01 P1#2 verify)
> Severity: **P1** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`MaterialGroupDetailPage`, `GroupListCard`, `InternalProductListCard` used raw `Divider()` (Material default height=16, thickness=0, or explicit `Divider(height: 1, color: AppColors.borderPrimary)`) instead of the canonical `SectionDivider` widget (6px filled bar, `lib/ui/inventory/widgets/section_divider.dart`) already established for inventory pages, per CR-20260701-01 P1#2.

`material_group_cannot_delete_dialog.dart` + `material_group_confirm_delete_dialog.dart` — verified, per BUG-W03-015 dialog shim collapse (both files now delegate to `AppDialog.show()` / `ConfirmationDialog.show()`, neither renders a raw `Divider` anymore). No action needed there.

## 2. Root cause

DEV cycle copied a generic Material `Divider` pattern instead of checking `lib/ui/inventory/widgets/` for the already-established canonical divider used by sibling inventory detail pages (`stock_detail_page.dart`, `receipt_detail_page.dart`, `delivery_detail_page.dart`) — a widget-catalog-first miss (R10).

## 3. Files changed

| File | Change |
|---|---|
| `lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | Import `ui/inventory/widgets/section_divider.dart`; `const Divider()` → `const SectionDivider()` between `_SummaryHeader` and the `StartInfoRow` list (matches bare-usage convention from `stock_detail_page.dart`). |
| `lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` | `const Divider(height: 1, color: AppColors.borderPrimary)` → `const SectionDivider()`. |
| `lib/ui/inventory_catalog/widgets/internal_product_list_card.dart` | Same replacement. |

Note on authorship: this fix landed via a concurrent `agent-fix-garage-mobile` session working the same bug list in parallel during this cycle (commit `52935e87 fix(inventory-catalog): SectionDivider fidelity + spacing tokens + RBAC guard (BUG-W03-016/017/020, partial)` in the `mobile/gf-garage-app` nested repo). This FIX cycle independently verified the change against `SectionDivider`'s actual implementation and the repo's existing bare-usage convention (`stock_detail_page.dart:70`) before confirming FIX_DONE.

## 4. Regression / verification

- `python3 scripts/check-mobile-canonical-primitives.py --file <each>` → 0 hits (post-fix) for all 3 files.
- Manual cross-check: `SectionDivider` renders a fixed 6px `Container(color: AppColors.bgPrimary)` — verified against widget source; no `verticalMargin` needed for bare usage (matches `stock_detail_page.dart` / `service_detail_page.dart` convention which surrounds it with no extra Gap).
- `fvm flutter analyze` / `fvm flutter test` / golden: **deferred** (`BLOCKER-W02-MOBILE-HARNESS-FLUTTER`).

## 5. Non-goals / out of scope

- Dialog files (`material_group_cannot_delete_dialog.dart`, `material_group_confirm_delete_dialog.dart`) — already collapsed to shim in BUG-W03-015, no raw Divider present, verified no action needed.

## 6. Follow-up

- TEST cycle: golden regression on `MaterialGroupDetailPage`, `GroupListCard`, `InternalProductListCard` once toolchain restored — confirm 6px divider bar renders per Figma.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile (+ concurrent session commit `52935e87`) | Fix — raw `Divider` → `SectionDivider` in 3 files; verified dialog files already clean (BUG-015 shim). |
