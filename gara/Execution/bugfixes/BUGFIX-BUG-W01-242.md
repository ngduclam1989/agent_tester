# BUGFIX BUG-W01-242 — `data-testid` backfill (RESOLVED)

> **Status**: RESOLVED.
> **Re-routed**: agent-fix-garage-web (ESCALATED feature-scope) → agent-dev-garage-web via CR-1781160847 MINOR APPROVED (2026-06-11).
> **Authored by**: agent-dev-garage-web.
> **Version**: 2 · **Last reviewed**: 2026-06-11.

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-242 (P2) |
| Symptom | 53 BLOCKED Playwright TCs in `Execution/automated-test-cases/TC-W01-PLATFORM-UI.md` could not locate UI elements because production build of `frontend/gf-gms-web/**` did not emit the `[data-testid="…"]` selectors referenced by TC steps. |
| Reporter | agent-test-ui (TEST_EXECUTION Run 1, 2026-06-11) |
| Scope cap (CR-1781160847) | testability-only — NO behavior, NO new feature, NO new component, NO contract change, NO style/copy edits |

## 2. Root cause

Testability gap. The insurance allocation and settlement detail components were authored before the `TC-W01-PLATFORM-UI.md` selector inventory was finalized. Six legacy testids (`ck-material`, `ck-labor`, `depreciation`, `claim-reduction`, `insurance-deductible`, `apply-all-depreciation`) used an internal naming convention; the canonical TC inventory expects the Vietnamese-token family (`field-ck-vt`, `field-ck-cdv`, `field-khau-hao-header`, `field-giam-tru`, `field-khau-tru`, `btn-apply-all-khau-hao`). Other elements (panel sub-sections, balance values, can-tt rows, STL header/tabs/buttons, info-blocks, empty states) had no testid at all.

This is not a behavior bug — production users see no change. It is a contract gap between the QA test inventory and the production DOM. Per `agent-fix-garage-web` Forbidden Actions (no feature work), the FIX agent correctly escalated; CR-1781160847 re-routed the work to DEV with a scope cap = data-testid backfill only.

## 3. Fix summary

Added ~73 `data-testid` attributes across **15 files** under `frontend/gf-gms-web/src/**`. Testability-only — no behavior change, no new components, no new state, no new prop API beyond optional testid-passthrough.

### 3.1 Files touched (15)

| # | File | Testids added (sample) |
|---|---|---|
| 1 | `src/features/insurance-allocation/components/insurance-allocation-section.tsx` | `section-ins-adjustment` |
| 2 | `src/features/insurance-allocation/components/adjustment-fields.tsx` | `section-heading`, `badge-bh`, `label-ck-vt`, `field-ck-vt`, `field-ck-cdv`, `field-khau-hao-header`, `field-giam-tru`, `field-khau-tru`, `unit-ck-vt`, `unit-ck-cdv`, `unit-khau-hao`, `unit-giam-tru`, `unit-khau-tru`, `error-ck-vt`, `error-ck-cdv`, `error-khau-hao`, `error-giam-tru`, `error-khau-tru`, `btn-apply-all-khau-hao` |
| 3 | `src/features/insurance-allocation/components/total-service-price-panel.tsx` | `panel-total-price`, `panel-section-chi-tiet-theo-ben`, `panel-section-phan-bo-bh`, `panel-section-allocation-bh`, `panel-section-can-thanh-toan`, `panel-section-balance`, `table-chi-tiet-theo-ben`, `row-cong-sau-vat-bh`, `balance-bh`, `balance-kh`, `can-tt-heading`, `can-tt-bh`, `can-tt-bh-value`, `can-tt-kh`, `can-tt-kh-value`, `can-tt-tong`, `can-tt-tong-value`, `warning-bh-am`, `phan-bo-ck-vt-sign`, `phan-bo-ck-cdv-sign`, `phan-bo-giam-tru-sign`, `phan-bo-khau-hao-sign`, `phan-bo-khau-tru-sign` |
| 4 | `src/features/insurance-allocation/components/allocation-totals-server.tsx` | optional `idPrefix` prop; with `stl-` prefix surfaces `stl-panel-total-price`, `stl-panel-section-*`, `stl-can-tt-*`, `stl-cong-sau-vat-bh`, `stl-cong-sau-vat-kh`, `stl-phan-bo-*-sign`, `stl-warning-bh-am`. Default empty prefix preserves SO Detail testids (`panel-section-*`, `can-tt-*`, `row-cong-sau-vat-bh`). |
| 5 | `src/features/insurance-allocation/components/insurance-allocation-recap.tsx` | `detail-ck-vt-value`, `detail-ck-cdv-value`, `detail-khau-hao-value`, `detail-giam-tru-value`, `detail-khau-tru-value` |
| 6 | `src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx` | `stl-detail-header`, `stl-heading`, `btn-chinh-sua`, `btn-in-ho-so`, `btn-tao-ho-so-bh`, `panel-loading`, `panel-error-state`, `tab-bar`, `tab-bang-chi-phi`, `tab-chung-tu`, `tab-ho-so-da-xuat`, `tab-lich-su-tt`, `tab-panel-chung-tu`, `tab-panel-ho-so`, `tab-panel-lich-su` |
| 7 | `src/features/insurance-settlement/components/detail/settlement-info.tsx` | `info-block-qt`, `info-block-kh` |
| 8 | `src/features/insurance-settlement/components/detail/payment-history-tab.tsx` | `empty-state-lich-su` |
| 9 | `src/features/insurance-settlement/components/detail/placeholder-tab.tsx` | optional `testId` prop; `empty-state-ho-so` passed from caller |
| 10 | `src/features/insurance-settlement/components/detail/cost-tab.tsx` | `col-ben-thanh-toan` (per row) |
| 11 | `src/features/insurance-settlement/components/detail/insurance-cost-tab.tsx` | wires `idPrefix="stl-"` into `<AllocationTotalsServer>` |
| 12 | `src/features/service-order/components/edit/index.tsx` | `btn-save` / `btn-save-loading` on SO Edit action |
| 13 | `src/features/service-order/components/edit/retail-sale-edit.tsx` | `btn-save` / `btn-save-loading` on retail-sale SO Edit action |
| 14 | `src/components/share/toasts/toast.tsx` | `toast-success` / `toast-warning` / `toast-error` / `toast-info` on global sonner wrapper |
| 15 | `src/features/insurance-allocation/components/adjustment-fields.render.test.tsx` | rename 6 testid assertions to match the new canonical names |

### 3.2 Renamed legacy testids (6)

| Legacy | New (TC canonical) | Reason |
|---|---|---|
| `ck-material` | `field-ck-vt` | TC step `fill('[data-testid="field-ck-vt"]', '5000000')` |
| `ck-labor` | `field-ck-cdv` | TC step `field-ck-cdv` |
| `depreciation` | `field-khau-hao-header` | TC step `field-khau-hao-header` |
| `claim-reduction` | `field-giam-tru` | TC step `field-giam-tru` |
| `insurance-deductible` | `field-khau-tru` | TC step `field-khau-tru` |
| `apply-all-depreciation` | `btn-apply-all-khau-hao` | TC step `btn-apply-all-khau-hao` |

The test file `adjustment-fields.render.test.tsx` was updated in lock-step to keep regression coverage on these mount points (FM-018 reuse-gate pin + BUG-W01-226 input-not-dead pin + BUG-W01-227 button-width pin). Test verdicts unchanged: 10/10 assertions still pass — the assertions still verify the same DOM anchors and CSS contracts; only the testid string is updated to the new canonical name.

### 3.3 Optional props added (testability-only, additive, default-preserving)

| Component | Prop | Purpose |
|---|---|---|
| `AllocationTotalsServer` | `idPrefix?: string` (default `""`) | Empty preserves SO Detail testids; `stl-` surfaces STL Detail testids. No behavior change. |
| `PlaceholderTab` | `testId?: string` | Optional wrapper testid for empty-state recognition. |
| `FieldError` (insurance-allocation) | `testId?: string` | Error inline testid (`error-ck-vt`, etc.). Also added `role="alert"` for TC-AUTO-064 a11y assertion (no visual change). |
| `FieldWrapper` (insurance-allocation) | `labelTestId?: string` | Label testid (`label-ck-vt`). |
| `RecapValueDisplay` (insurance-allocation) | `testId?: string` | SO Detail recap value testids (`detail-ck-vt-value`, etc.). |
| `BreakdownRow` (insurance-allocation) | `rowTestId?: string` | Row testid for `row-cong-sau-vat-bh`. |

All are optional and default to undefined — existing callers keep current behavior.

## 4. Verification

```bash
cd frontend/gf-gms-web
npm run build   # tsc -b && vite build → PASS (✓ built in 17.70s)
npm run lint    # eslint . → no new errors/warnings on touched files
npm test        # vitest run → 48 tests pass (11 test files)
```

Lint snapshot: 56 errors / 74 warnings repo-wide — all pre-existing, none touch the 15 modified files (verified via `grep -E "insurance-allocation|insurance-settlement|service-order/components/(edit|detail|form)|share/toasts"` over lint output → 0 hits).

Test snapshot:
- `src/features/insurance-allocation/components/adjustment-fields.render.test.tsx` (10 tests) — renamed assertions, all pass.
- `src/features/insurance-allocation/components/cost-tab.render.test.tsx`, `insurance-allocation-slot.render.test.tsx`, `use-update-insurance-allocation.test.ts`, `use-insurance-settlement-detail.test.ts` and 6 other test files — unchanged, all pass.

## 5. Follow-ups (unfulfilled testids)

The following testids in the TC inventory were not addable within the scope cap. Each is documented in `needs_review[]` for orchestrator triage:

| Testid | Reason | TC refs |
|---|---|---|
| `dialog-unsaved` | The unsaved-changes guard dialog is not implemented in `garage-web` — would require route-leave guard + new dialog component (behavior-change-required). | TC-AUTO-058 |
| `pagination` | The STL `cost-tab.tsx` renders all rows without pagination — would require adding pagination UI + state (behavior-change-required). | TC-AUTO-088 |
| `btn-cancel-phieu` | Per AC-11 (chốt 2026-06-08) STL Detail has no cancel action; element intentionally absent. TC-AUTO-091 already asserts `count===0`, so will pass naturally. No code change needed; flagged for visibility only. | TC-AUTO-091 |

3 colour-only assertions in TC-AUTO-044/045 (`phan-bo-ck-vt-sign` / `phan-bo-giam-tru-sign` colour=red/green) are testable now that the testids are surfaced — the existing `text-foreground-success` / `text-destructive` Tailwind classes resolve to the expected RGB values per the design tokens.

## 6. Re-test plan

agent-test-ui re-runs the 53 BLOCKED Playwright TCs against the updated build (`TC-W01-PLATFORM-UI.md` rows currently marked `BLOCKED — BUG-W01-242 (OPEN)`). Expected outcome:

- ~50 BLOCKED → PASS / FAIL verdict (DEV agent does not flip Status — TEST_GROUP owns the verdict).
- ~3 BLOCKED → remain BLOCKED with note updated to point at `needs_review` (dialog-unsaved, pagination, btn-cancel-phieu).

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-11 | 1 | agent-fix-garage-web | Initial ESCALATED note (feature-scope-not-bug) — recommended re-route to agent-dev-garage-web. |
| 2026-06-11 | 2 | agent-dev-garage-web | Rewrote to RESOLVED form post CR-1781160847. Added 73 `data-testid` across 15 files; renamed 6 legacy testids to TC canonical names; updated regression test assertions; logged 3 unfulfilled testids in `needs_review`. Build + lint + vitest pass. |
