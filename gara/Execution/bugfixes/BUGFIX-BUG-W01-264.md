# BUGFIX BUG-W01-264 — Allocation panel rows show wrong sign for 3 adjustments

> **Status**: ESCALATED (Trigger #1 — cross-boundary evidence required).
> **Severity**: P3 (cosmetic — does not affect compute per QC).
> **Authored by**: agent-fix-garage-web.

---

## 1. Failure mode

In the "Phân bổ Bảo hiểm" rows on STL Detail / SO Detail:
- CK Vật tư = `−` (correct)
- CK CDV = `−` (correct)
- Khấu hao VT = `−` (expected `+`)
- Giảm trừ bồi thường = `−` (expected `+`)
- Khấu trừ BH = `−` (expected `+`)

Per BR-EP §7.1 table the last three should be `+` (transferred to customer).

## 2. FE inventory (read-only review)

- **STL Detail** uses `<TotalServicePricePanel>` which reads sign from the
  constant `ALLOCATION_SIGNS` in `insurance-allocation/constants/index.ts`.
  The constant is correct: `claimReduction: "+"`, `depreciation: "+"`,
  `insuranceDeductible: "+"`.
- **SO Detail** uses `<AllocationTotalsServer>` which reads
  `row.sign` from the server response (`data?.depreciation.sign`,
  `data?.claimReduction.sign`, `data?.insuranceDeductible.sign`).

If the bug is observed on **STL Detail**, the FE constant is already
correct and the displayed value is something other than the constant —
which would mean a different panel render path entirely. Reviewing
`<TotalServicePricePanel>` confirms no other source of `sign` beyond the
constant.

If the bug is observed on **SO Detail**, the FE renders whatever the BFF
returns; the wrong sign is a BE/BFF mapper bug.

## 3. Why FE cannot resolve without cross-boundary evidence

The task notes require network capture: `data.{depreciation,
claimReduction, insuranceDeductible}.sign` from `getSettlementByCode` (or
`getServiceOrderByCode`). FE side cannot do this without live request
access.

## 4. Escalation request

Re-spawn `agent-test-api` to capture the `sign` field per adjustment from
the BFF. If `sign='-'` is returned for the three rows, escalate to
`agent-fix-gf-sales` (or to the BFF mapper owner if drift is at the
graph-aggregator layer).

## 5. Status

OPEN → ESCALATED (Trigger #1).
