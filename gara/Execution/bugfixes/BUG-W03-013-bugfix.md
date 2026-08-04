# BUGFIX — BUG-W03-013

> Path drift 7 pages collapsed 2 folders vs canonical per-page subfolders (CR-20260701-01 P1#1)
> Severity: **P1** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

7 new W03 pages (`MaterialGroupList/Detail/Add/Edit` + `InternalProductList/Detail/Search/Filter`) were originally placed under 2 collapsed folders (`lib/ui/inventory_catalog/material_group/`, `lib/ui/inventory_catalog/internal_product/`) instead of canonical per-page subfolders, deviating from repo convention (e.g. `lib/ui/booking/`, `lib/ui/service_order/`).

**Correction to initial FIX-cycle assessment**: this fix cycle initially drafted a DEFERRED recommendation (citing CR-20260701-01 risk-acceptance + rename blast-radius) before discovering, mid-session, that the rename had **already been completed and committed** in the `mobile/gf-garage-app` nested repo (commit `490fbade` — `refactor(inventory-catalog): split collapsed folders into canonical per-page structure (BUG-W03-013)`, co-authored by a Claude agent session). The DEFERRED draft is superseded by this FIX_DONE record.

## 2. Actual fix (verified, already applied)

Commit `490fbade` restructured:
- `material_group/` → `material_group_{list,add,edit,detail,delete}/`
- `internal_product/` → `internal_product_{list,detail,search,filter}/`
- Cross-page shared widgets (`material_group_form.dart` used by add+edit; `internal_product_list_card.dart` used by list+search) moved to `inventory_catalog/widgets/` per existing repo convention (`lib/ui/inventory/widgets/`, `lib/ui/supplier/widgets/`).
- Extended scope to `internal_product_search/` + `internal_product_filter/` beyond the 2 folders literally named in the original bug report, since those pages existed as collapsed siblings and the canonical-per-page goal (LL-MOB-010) applies equally.
- All cross-file imports updated; `router.dart` unaffected (uses generated `router.gr.dart`, regenerated at build time — class names unchanged, only source folder moved).

## 3. Files changed (this FIX cycle's contribution)

None new — the structural rename itself was already committed (`490fbade`) prior to/during this session by a concurrent agent run. This FIX cycle's contribution is **verification only**:

| Check | Result |
|---|---|
| Stale old-path imports (`grep "inventory_catalog/material_group/\|inventory_catalog/internal_product/"`) | 0 hits — clean, no dangling references to collapsed folders |
| New canonical structure present | Confirmed via `find lib/ui/inventory_catalog -type f` — 9 per-page subfolders (`material_group_{list,add,edit,detail,delete}`, `internal_product_{list,detail,search,filter}`, `hub/`, `widgets/`) |
| Router unaffected | Confirmed — `router.dart` references typed route classes (`MaterialGroupListRoute.page` etc.) generated from `@RoutePage()` annotations; unaffected by folder relocation |

## 4. Regression / verification

- Static import-integrity check (grep) → clean, 0 stale references.
- `fvm flutter analyze` / `fvm dart run build_runner build` → **deferred**, toolchain unavailable in this sandbox (`BLOCKER-W02-MOBILE-HARNESS-FLUTTER`). Recommend TEST cycle regenerate `router.gr.dart` + run full analyze once toolchain restored, since a folder-move can occasionally surface part-file (`.g.dart`) regeneration needs even when source imports are clean.

## 5. Non-goals / out of scope

- No further path changes needed — canonical structure now matches repo convention.

## 6. Follow-up

- TEST cycle: run `fvm flutter analyze` + `fvm dart run build_runner build -d` once toolchain available to confirm zero regressions from the rename (freeform verification, since sandbox cannot compile).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 2 | agent-fix-garage-mobile | **Correction**: discovered mid-session that the rename was already completed + committed (`490fbade`, concurrent agent session) — superseded the v1 DEFERRED recommendation. Re-verified: 0 stale imports, canonical structure confirmed, router unaffected. Status corrected OPEN-path→FIX_DONE. |
| 2026-07-01 | 1 | agent-fix-garage-mobile | (Superseded) Initial recommendation: DEFERRED citing CR-20260701-01 risk-acceptance — based on stale read of working tree before the concurrent rename commit landed. |
