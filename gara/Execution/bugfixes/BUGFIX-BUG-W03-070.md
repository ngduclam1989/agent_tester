# BUGFIX — BUG-W03-070

> Group Detail (`MaterialGroupDetailPage`): Header→Divider→FieldsList column gap stayed at `Gap(12)` x2 after BUG-W03-061 explicitly left it out of scope — live Figma re-audit confirms it must be 20.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` still had `Gap(12)` flanking `SectionDivider` (before and after) inside `_buildBody`'s scroll `Column` (Header → 6px `SectionDivider` → FieldsList). BUG-W03-061's own audit (2026-07-02, same day) already noted this gap was 20 on live Figma but explicitly flagged it "ngoài scope 5 item của bug" and left it unfixed (see `BUGFIX-BUG-W03-061.md` §7 residual risk). User re-reported "vẫn còn lỗi" after that cycle; orchestrator re-verified directly against live Figma node `21254:51661` (file `5YU4H3iY726P8KNxI9oCYF`) via MCP `get_design_context` and confirmed the root Column (node `21254:51757`, Header → Divider → FieldsList) binds `gap-[20px]`.

## 2. Root cause

- BUG-W03-061's fix cycle correctly identified the drift (12 vs 20) during its own live-Figma audit but scoped it out because it was not one of the 5 originally reported items, and merely flagged it as residual for "Figma-audit sau quyết" — a deliberate scope decision, not a missed detection. This cycle closes that flagged residual now that the user reconfirmed the same symptom.
- No new investigation was needed: this fix cycle independently re-verified the same live Figma node via its own MCP `get_design_context` call (fresh fetch, node `21254:51661` → root Column `21254:51757` → `gap-[20px]`) before applying, per the FIX agent's oracle-first + live-Figma-wins discipline (rules-mobile §9.11 LL-MOB-011) rather than trusting the prior cycle's residual note as-is.

## 3. Fix

Target file: `material_group_detail_page.dart` only.

1. Changed `Gap(12), // figma binding scale 12 — no exact AppSizes match` (the Gap immediately before `const SectionDivider()`) to `Gap(20), // figma binding scale 20 — no exact AppSizes match`.
2. Changed the second `Gap(12), // figma binding scale 12 — no exact AppSizes match` (immediately after `const SectionDivider()`) to `Gap(20), // figma binding scale 20 — no exact AppSizes match`.
3. Both raw `Gap(20)` calls keep the established binding-scale justification comment convention (20 is outside the `AppSizes` scale `{4,8,16,32,52}`), matching the precedent the prior `Gap(12)` calls already used — so `check-mobile-canonical-primitives.py`'s P3 comment-allowlist still applies (0 hit before and after).

No other line in the page changed — the BUG-W03-061 restructuring (per-section horizontal padding, full-bleed divider, canonical footer, header `Row` cross-axis center) is untouched.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | 2x `Gap(12)` → `Gap(20)` (flanking `SectionDivider`), comment updated to cite scale 20. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_070_test.dart` | **New** — regression suite BUG-W03-070: (A) static source pins — exactly 2x `Gap(20)` present with the binding-comment convention, `Gap(12)` fully gone from the page; (B) render test — body-structure mirror fixture (same shape as BUG-W03-061's divider full-bleed fixture, extended with `Gap(20)` on both sides of `SectionDivider`) asserting the measured vertical gap is exactly 20.0px above and below the divider. |
| `Tracking/WAVE03/BUGS.md` | Row BUG-W03-070 Status `OPEN` → `FIX_DONE` + Notes appended with fix summary + regression test name + this doc's path. |

**Don't-touch respected**: no other file in `lib/` touched; no shared widget (`SectionDivider`, `BottomNavigationBarButton`) modified; no `git commit`/`push`.

## 5. Blast-radius verification

- `SectionDivider` itself unchanged — only the sibling `Gap` widgets' constant argument changed, so no shared-widget consumer impact (`SectionDivider` has other consumers across `lib/ui/inventory/**` and `lib/ui/inventory_catalog/**`, none of which are affected since its own source was not touched).
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` → **0 hit** (both `Gap(20)` instances carry the required binding-scale comment, matching the allowlisted P3 pattern).
- Brace/paren/bracket balance (python char-count): page 19/19 brace, 110/110 paren, 6/6 bracket (unchanged from BUG-W03-061's verified balance — this fix only changed 2 integer literals + their trailing comments, no structural change).

## 6. Regression / verification

- **Regression test new**: `material_group_detail_fidelity_bug_070_test.dart` — fail-before-fix / pass-after-fix by design: static pins fail against the pre-fix source (`Gap(12)` present, exactly 0 `Gap(20)` matches); render test's body-structure mirror fixture asserts the exact 20.0px gap on both sides of `SectionDivider` using the real `SectionDivider` widget + `package:gap/gap.dart`'s `Gap`, keyed `SizedBox` boxes standing in for the header/fields content sections.
- **Build/analyze/test DEFERRED**: no Flutter toolchain in this environment (`fvm`/`flutter`/`dart` not on PATH, no `.fvm/` — `DEBT-W01-MOBILE-BUILD-ENV`, same gap already tracked by every prior W03 mobile FIX cycle). TEST_GROUP on a machine with the toolchain should run:
  ```
  fvm flutter analyze lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart
  fvm flutter test test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_070_test.dart test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_061_test.dart
  ```
  (running BUG-061's suite alongside confirms this fix did not regress the earlier restructuring it sits next to).
- Golden (alchemist) vs oracle not attempted in this env (same DEBT) — substituted with the render-test's precise pixel-gap assertions (20.0 on both sides), consistent with the carve-out already used by BUG-W03-061's regression suite.

## 7. Residual risk / follow-up

- None identified specific to this fix — it closes the exact residual BUG-W03-061 §7 flagged, with no further sub-items outstanding on this page from that audit trail.
- General note (repeat of BUG-W03-061 §7, still open): `check-mobile-canonical-primitives.py`'s spacing heuristic only warns (P3, allow-with-comment) on raw `Gap(N)` outside the `AppSizes` scale — it does not itself know the *correct* Figma value, so a future drift back to an incorrect raw value with a plausible-looking comment would still pass the gate. Human/reviewer spot-check against live Figma remains the actual source of truth for the numeric value, same caveat already on record from the prior cycle.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial BUGFIX doc — root cause + fix + blast radius + regression + residual (live Figma re-verified via MCP, closes BUG-W03-061 §7 flagged residual). |
