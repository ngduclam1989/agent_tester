# BUGFIX BUG-W02-012 — Phase A testid coverage (panel-allocation-2col, row-alloc-*, panel-can-thanh-toan, warning-err-ins-003)

> Wave: W02 · Severity: P1 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: N/A (REVIEW finding) — blocks `/test-exec` per CR-1781160847
> Reporter: agent-review-garage-web

## 1. Failure mode

`grep -rE "panel-allocation-2col|row-alloc-(ck-vat-tu|ck-cong-dv|giam-tru|khau-hao|khau-tru)|panel-can-thanh-toan|warning-err-ins-003" frontend/gf-gms-web/src/` → 0 match. PKG-W02 §3.C.4: missing testid trên interactive component = REVIEW FAIL không merge + block `/test-exec`. W01 component dùng convention legacy (`panel-section-can-thanh-toan`, `panel-section-allocation-bh`, `warning-bh-am`) — không match W02 matrix §3.C.1.

## 2. Root cause

W02 cluster matrix §3.C.1 đặt testid mới cho Phase A 2-col reflow (`panel-allocation-2col`), 5 allocation rows (`row-alloc-{slug}`), payment panel (`panel-can-thanh-toan`), insurance negative warning (`warning-err-ins-003`). DEV cycle 1 không add — chỉ giữ W01 testids.

PKG-W02 §3.C.1 "Cross-feature reuse rule": panel dùng chung 4 màn nên KHÔNG đặt testid mới khi tái dụng — **PARENT scope locator** phân biệt context. Implication: add W02 testids ADDITIVELY song song với W01 testids để TC dùng convention W02 mà KHÔNG break TC W01.

## 3. Fix

`frontend/gf-gms-web/src/features/insurance-allocation/components/total-service-price-panel.tsx`:

- Add sr-only `<span data-testid="panel-allocation-2col" />` trong section AC-10 (alongside existing `panel-section-allocation-bh` alias).
- Add sr-only `<span data-testid="panel-can-thanh-toan" />` trong section AC-11 (alongside existing `panel-section-balance` alias).
- Add row-level `data-testid={rowTestId}` ở `<tr>` allocation rows; map qua `ROW_ALLOC_TESTID_BY_KEY`:
  - `discountMaterial → row-alloc-ck-vat-tu`
  - `discountLabor → row-alloc-ck-cong-dv`
  - `claimReduction → row-alloc-giam-tru`
  - `depreciation → row-alloc-khau-hao`
  - `insuranceDeductible → row-alloc-khau-tru`
- Add sr-only `<span data-testid="warning-err-ins-003" />` nested trong `warning-bh-am` block (renders only when `bhPaymentNegative=true` — matches `ERR-INS-003` semantic).

KHÔNG remove W01 testids (`panel-section-*`, `warning-bh-am`) → preserve W01 TC back-compat.

## 4. Regression test

`total-service-price-panel.bug-w02-012.test.tsx`:

- Assert `panel-allocation-2col` rendered.
- Assert `panel-can-thanh-toan` rendered.
- Assert 5 `row-alloc-*` testids rendered.
- Assert `warning-err-ins-003` rendered ONLY when `bhPaymentNegative=true`.
- Assert W01 alias testids preserved (back-compat).

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-allocation/components/total-service-price-panel.tsx`
- `frontend/gf-gms-web/src/features/insurance-allocation/components/total-service-price-panel.bug-w02-012.test.tsx` (NEW)

## 6. Status update

BUG-W02-012: OPEN → RESOLVED (verify pending L2 + testid coverage probe rerun).
