# BUGFIX BUG-W01-269 — SO Edit/Detail "Phân bổ Bảo hiểm" panel always renders computed VND

> **Status**: RESOLVED.
> **Severity**: P1.
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-260 (STL Detail value+suffix display rule — opposite of SO panel).

---

## 1. Failure mode

On SO Edit + SO Detail, the panel `Tổng giá dịch vụ → Phân bổ Bảo hiểm`
rendered the raw entered value with `%` / `đ` suffix (e.g. `−5%`) rather
than the computed VND amount (e.g. `−5.500.000đ`). Per BR-EP §7.2, the SO
panel must always show the resolved VND allocation, regardless of the entry
mode of each adjustment field.

## 2. Root cause

`InsuranceAllocationSection` forwarded the RHF state as
`inputs={safeValue}` into `<TotalServicePricePanel>`. The panel's
`renderAllocationCell` branches on `display.mode === "PERCENT"` and returns
`${sign}${value}%` — correct for STL Detail (BUG-W01-260 value+suffix rule)
but wrong for the SO panel (computed VND rule).

## 3. Fix

`insurance-allocation-section.tsx` stops forwarding `inputs` to
`<TotalServicePricePanel>`. Without `inputs` (or `displayAdjustments`), the
panel falls back to its legacy `formatSignedAmount(amount, sign)` path —
which is the resolved VND amount fed by the realtime `useAllocationPreview`
hook. STL Detail keeps forwarding `inputs` from its own caller
(`insurance-settlement/components/detail/cost-tab.tsx`), so the STL behaviour
(value+suffix) is preserved.

## 4. Regression test

`insurance-allocation-section.regression.test.ts` describe
`BUG-W01-269 — InsuranceAllocationSection does not forward `inputs` to TotalServicePricePanel`
asserts the `panelProps` object literal does not contain an `inputs` field.

Pre-existing `total-service-price-panel.render.test.tsx` already covered both
behaviours:
- "falls back to computed VND `amount` when neither displays nor inputs are passed" — used by SO panel;
- "accepts the SO Edit RHF `InsuranceAdjustmentInput` via `inputs` prop" — still used by STL Detail.

## 5. Verification

```
cd frontend/gf-gms-web
npx vitest run   # 91/91 PASS
npx tsc -b       # exit 0
yarn build       # exit 0
```

## 6. Status

OPEN → RESOLVED.
