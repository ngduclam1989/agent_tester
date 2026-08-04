# BUGFIX BUG-W01-254 — Khấu hao VT column rename + editable on SO Edit

> **Status**: RESOLVED.
> **Severity**: P2
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-255 (BFF mapper — supersedes by BUG-W01-261/262, out of scope).

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-254 (P2) — FEAT-INS-SO-ADJUSTMENT / AC-5, AC-8, BR-INS-SO-ADJ-005 |
| Symptom | The depreciation column on the SO Edit parts table was titled "Khấu hao" (wrong) and rendered the percent value as plain read-only text. Accountants could not enter / override the % per row, contradicting AC-5 cách b. |
| Reporter | QC-Manual (2026-06-12) |

## 2. Root cause

The column was authored under BUG-W01-033 as a read-only display sourced from the
API. BR-EP §7.1 (line 364) and BR-INS-SO-ADJ-005 require per-row edit + "Áp dụng
tất cả" header. The previous renderer was a static `<div>`:

```tsx
cell: ({ row }) => (
  <div className="mt-2 text-right text-sm text-foreground">
    {items?.[row.index]?.depreciationPercent ?? 0}%
  </div>
)
```

So the cell never wrote back through `inputNumberProps`, and the header label
was the pre-spec "Khấu hao".

## 3. Fix summary

Two minimal-scope edits inside the SO Edit form:

1. **Column** (`items-table-section.tsx`) — rename header to "Khấu hao VT" and
   replace the read-only `<div>` with an editable `<InputNumber min={0} max={100}
   suffix="%" placeholder="0 %" {...inputNumberProps(row.index, "depreciationPercent")}/>`.
   Widen the column from `w-24` to `w-32` so "Khấu hao VT" does not wrap.

2. **Submit** (`form/index.tsx internalSubmit`) — read `depreciationByLine` from
   `values.parts[i].depreciationPercent` (the new editable cell). Fall back to
   the existing `insuranceAllocation.depreciationByLine` entry per line ID so
   "Áp dụng tất cả" (which writes the cascade through that field) still wins
   when the row has no manual override. Drop the legacy `values.partsDepreciation`
   record reader — it was never wired to a UI surface.

3. **Schema** (`service-order/schemas/index.ts partBaseSchema.depreciationPercent`)
   — tighten the validation to `min(0).max(100)` and update the comment to
   point at BUG-W01-254.

The downstream `buildInsuranceAllocationRequest` (BUG-W01-210 helper) is
unchanged — it already maps `{lineId, percent}` entries to the BFF SDL.

## 4. Files touched

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/service-order/components/form/items-table-section.tsx` | Rename header, swap cell to editable `<InputNumber>`. |
| `frontend/gf-gms-web/src/features/service-order/components/form/index.tsx` | Submit reads `parts[].depreciationPercent`, falls back to `insuranceAllocation.depreciationByLine`. |
| `frontend/gf-gms-web/src/features/service-order/schemas/index.ts` | `depreciationPercent` validation tightened to `[0, 100]`. |
| `frontend/gf-gms-web/src/features/service-order/components/form/khau-hao-vt-column.test.ts` | NEW regression test — see §5. |

## 5. Regression test

`src/features/service-order/components/form/khau-hao-vt-column.test.ts` reads
the touched sources directly (the full RHF + Apollo + zustand mount path is too
heavy for jsdom) and pins three guards:

1. The parts-table column header is exactly `"Khấu hao VT"` and the legacy
   `"Khấu hao"` (without `VT`) label is gone.
2. The cell wrapper uses `<InputNumber>` with `inputNumberProps(row.index,
   "depreciationPercent")` and `min={0} max={100}`.
3. The submit helper reads from `values.parts[].depreciationPercent` and no
   longer references `values.partsDepreciation`.

All three assertions PASS via `npx vitest run khau-hao-vt-column.test.ts`.

## 6. Verification

```bash
cd frontend/gf-gms-web
npx vitest run                # 76/76 PASS
npm run build                 # tsc -b && vite build → exit 0
```

## 7. Residual / Follow-ups

- BUG-W01-255 was superseded by the BUG-W01-261/262 pair (BFF + gf-sales
  contract refactor — `parts[i].depreciationPercent` passthrough). Those are
  out of garage-web scope.
- "Áp dụng tất cả" still writes into `insuranceAllocation.depreciationByLine`
  for backwards compatibility. After BUG-W01-261/262 ship a future cleanup
  could mirror the cascade straight into `parts[i].depreciationPercent` and
  drop the helper field — tracked separately.

## 8. Status

OPEN → RESOLVED. Tracking row updated accordingly.
