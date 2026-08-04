# BUGFIX BUG-W01-266 — FE realtime cap AMOUNT-mode adjustments ≤ post-VAT base

> **Status**: RESOLVED.
> **Severity**: P2.
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: VLD-INS-SO-004.

---

## 1. Failure mode

SO Edit "Phân bổ quyết toán bảo hiểm" inputs (CK Vật tư / CK CDV / Giảm trừ
bồi thường) in `mode=AMOUNT` accepted any positive number. Users could enter
999.999.999 even though the post-VAT BH base was, say, 168.000.000. The
server rejects this with `INS_ADJ_AMOUNT_EXCEEDS_BASE` (gf-sales-api §3bis.1)
— FE was missing the corresponding client-side cap.

## 2. Root cause

`AdjustmentFields` passed the raw `v ?? 0` straight back into the allocation
input on each keystroke; no clamp logic was wired against the post-VAT
breakdown known to the section composite.

## 3. Fix

1. `adjustment-fields.tsx`:
   - new `clampAdjustmentAmount(next, mode, base)` helper that returns the
     base when `mode === "AMOUNT" && next > base` (PERCENT and missing base
     fall through unchanged);
   - new `postVatBase?: number` prop;
   - the three AMOUNT-eligible inputs (`discountMaterial`, `discountLabor`,
     `claimReduction`) route their onChange through the clamp.
   - `depreciation` (PERCENT only) + `insuranceDeductible` (no defined base
     per BR-EP §7.1) are intentionally excluded.
2. `insurance-allocation-section.tsx` forwards `postVatBase={safeBreakdown.totalAfterVat?.bh ?? 0}`.

## 4. Regression test

`adjustment-fields.cap-amount.test.ts` — source-level guard that:
- the `postVatBase` prop is declared;
- `clampAdjustmentAmount` exists with the AMOUNT + `> base` branch;
- the clamp wraps at least 3 onChange call sites.

## 5. Verification

```
cd frontend/gf-gms-web
npx vitest run   # 91/91 PASS
npx tsc -b       # exit 0
yarn build       # exit 0
```

## 6. Residual / follow-up

- Inline error message ("Số tiền CK Vật tư không thể lớn hơn {base}") not yet
  surfaced — the realtime cap silently clips. Follow-up: add a transient
  `FieldError` showing the message when the user attempts to exceed.
- BE still owns the authoritative VLD-INS-SO-004 — Case-B escalation (BE
  accepts > base) remains a separate cross-boundary bug if observed.

## 7. Status

OPEN → RESOLVED.
