# BUGFIX BUG-W01-263 — SO Edit "Áp dụng tất cả" depreciation propagates to per-part column

> **Status**: RESOLVED.
> **Severity**: P2.
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-261 / BUG-W01-262 (contract refactor `parts[i].depreciationPercent`).

---

## 1. Failure mode

Click "Áp dụng tất cả" updated only the header default scalar
(`depreciationDefault.percent`) and the legacy `depreciationByLine[]` array
inside the allocation input. The parts grid binds the per-row "Khấu hao VT"
column against `parts[i].depreciationPercent` (BUG-W01-261/262 refactor), so
no row picked up the value.

## 2. Root cause

`InsuranceAllocationSection.handleApplyDepreciationToAll` only called the
allocation `onChange` (deprecated `depreciationByLine` path). The component
did not expose any way for the form host to translate the apply-all click
into RHF `setValue("parts.{i}.depreciationPercent", percent)` calls.

## 3. Fix

1. `InsuranceAllocationSection` adds an optional callback prop
   `onApplyDepreciationPercentToParts?: (percent: number, insuranceLineIds: string[]) => void`.
   The Apply-All handler now invokes the callback with the resolved percent +
   the list of insurance-payer line ids before (optionally) dispatching the
   legacy `depreciationByLine` update for backward compatibility.
2. `ServiceOrderForm` (`features/service-order/components/form/index.tsx`)
   provides the callback. For every RHF `parts[i]` whose synthetic line id
   appears in `insuranceLineIds`, it calls
   `setValue("parts.{i}.depreciationPercent", percent, { shouldDirty: true, shouldTouch: true })`.

The synthetic line id format (`part.id ?? "idx-{index}"`) is identical to the
one used when building `insuranceParts` from RHF state, so the lookup matches
both saved and freshly-added rows.

## 4. Regression test

`insurance-allocation-section.regression.test.ts` — guards:
- prop `onApplyDepreciationPercentToParts` is declared;
- Apply-All handler invokes the callback with `(percent, insuranceLineIds)`.

## 5. Verification

```
cd frontend/gf-gms-web
npx vitest run   # 91/91 PASS
npx tsc -b       # exit 0
yarn build       # exit 0
```

## 6. Status

OPEN → RESOLVED.
