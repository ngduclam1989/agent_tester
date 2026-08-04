# BUGFIX BUG-W01-260 — STL Detail "Phân bổ Bảo hiểm" rows by mode (% vs đ)

> **Status**: RESOLVED.
> **Severity**: P2
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-252 / BUG-W01-253 (compute base — Surface A/B value drift).

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-260 (P2) — FEAT-INS-STL-DETAIL / BR-EP §7.1 (mode), INTEG §4.3.7b |
| Symptom | "Phân bổ Bảo hiểm" panel cells (CK Vật tư / CK Công DV / Giảm trừ / Khấu hao / Khấu trừ BH) all rendered as "0đ" on STL Detail — never switched suffix by mode. |
| Reporter | QC-Manual (2026-06-12) |

## 2. Root cause

`<TotalServicePricePanel>` always formatted the **computed VND `amount`** for
each AC-10 row via `formatSignedAmount`. The user-entered `mode` / `value`
returned by the BFF on Surface B (`getSettlementByCode`) was dropped on the way
through the mapper, so the panel had no way to know which suffix to render.

Per BA chốt 2026-06-12 the display rule is:

* **PERCENT** → `{sign}{value}%`
* **AMOUNT**  → `{sign}{formatVnd(value)}`
* **empty / null `value`** → `0%` (or `0đ` for AMOUNT-only slots)

The server-computed `amount` is still authoritative for the "Cân thanh toán"
balance — it stays as the fallback when no `mode/value` info is supplied.

## 3. Fix summary

Three coordinated changes inside the `insurance-allocation` + `insurance-settlement` features only:

1. **Types** — `interfaces/index.ts` introduces `AllocationDisplay` /
   `AllocationDisplays` so the panel can receive `{mode, value, amount}` per row.
2. **Panel** — `components/total-service-price-panel.tsx` accepts an optional
   `displayAdjustments` prop **and** an `inputs` prop (either an
   `InsuranceAdjustmentInput` from SO Edit RHF or the `AllocationInputsDisplay`
   projection). The renderer normalises whichever is supplied to a single
   `AllocationDisplays` map, then applies the BA-chốt suffix rule. Empty / null
   `value` falls back to `0%` (or `0đ` for AMOUNT-only slots). When neither prop
   is provided the panel keeps the legacy `formatSignedAmount(amount, sign)`
   path so older callers stay green.
3. **Wiring**:
   - SO Edit (`insurance-allocation-section.tsx`) forwards the RHF `safeValue`
     as `inputs` — the panel now renders the same raw `mode/value` the user
     typed in.
   - STL Detail (`use-insurance-settlement-detail.ts`) projects the raw
     `IInsuranceSettlement` adjustments to `AllocationInputsDisplay` via a new
     `mapAdjustmentInputs` helper and stores it on the view model as
     `detail.adjustmentInputs`. `cost-tab.tsx` passes it through as the panel
     `inputs`.

The AC-9 "Chi tiết theo bên thanh toán" table and the AC-11 "Cần thanh toán"
balance values are unchanged.

## 4. Files touched

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/insurance-allocation/interfaces/index.ts` | Add `AllocationDisplay` + `AllocationDisplays` types. |
| `frontend/gf-gms-web/src/features/insurance-allocation/components/total-service-price-panel.tsx` | Add `displayAdjustments` + `inputs` props, mode-aware `renderAllocationCell`, `inputToDisplays` normaliser. Export `AllocationInputsDisplay`. |
| `frontend/gf-gms-web/src/features/insurance-allocation/components/insurance-allocation-section.tsx` | Forward `safeValue` as `inputs` to the panel. |
| `frontend/gf-gms-web/src/features/insurance-allocation/index.ts` | Re-export the new types. |
| `frontend/gf-gms-web/src/features/insurance-settlement/interfaces/index.ts` | Add `adjustmentInputs?: AllocationInputsDisplay` on `InsuranceSettlementDetail`. |
| `frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.ts` | `mapAdjustmentInputs` helper + populate `detail.adjustmentInputs`. |
| `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.tsx` | Pass `inputs={detail.adjustmentInputs ?? null}` to `<TotalServicePricePanel>`. |
| `frontend/gf-gms-web/src/features/insurance-allocation/components/total-service-price-panel.render.test.tsx` | NEW regression test — see §5. |

## 5. Regression test

`src/features/insurance-allocation/components/total-service-price-panel.render.test.tsx`
covers four behaviours:

1. PERCENT slots render as `{sign}{value}%`; AMOUNT slots as
   `{sign}{formatVnd(value)}` (with the BR-EP §7.1 worked example numbers).
2. Empty / null `value` renders `0%` (or `0đ` for AMOUNT-only slots).
3. The panel accepts an `InsuranceAdjustmentInput` (RHF) via the `inputs` prop
   and produces the same mode-aware suffix output.
4. When neither `displayAdjustments` nor `inputs` is provided, the panel falls
   back to the legacy signed-VND format so older callers stay green.

All four assertions PASS via `npx vitest run total-service-price-panel.render.test.tsx`.

## 6. Verification

```bash
cd frontend/gf-gms-web
npx vitest run                # 76/76 PASS
npm run build                 # tsc -b && vite build → exit 0
```

## 7. Residual / Follow-ups

- BUG-W01-252 / BUG-W01-253 (compute base — server / client) are the upstream
  fixes that ensure the value the panel renders is also numerically correct.
  This bug only addresses the display rule.
- The `displayAdjustments` + `inputs` props on the panel are additive and
  optional — older callers (server-side render of computed amounts) continue
  to work without code changes.

## 8. Status

OPEN → RESOLVED. Tracking row updated accordingly.
