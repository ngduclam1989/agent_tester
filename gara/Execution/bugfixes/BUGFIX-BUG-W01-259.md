# BUGFIX BUG-W01-259 — STL Detail "Khách hàng thanh toán" + "Tổng thanh toán" display 0đ

> **Status**: ESCALATED (Trigger #1 — cross-boundary evidence required).
> **Severity**: P1.
> **Authored by**: agent-fix-garage-web.
> **Related**: BUG-W01-257 (gf-sales-side insurance_amount/customer_amount pre-adjustment).

---

## 1. Failure mode

On STL Detail (e.g. `SET-20260611-00001`), the "Cần thanh toán" panel
rows "Khách hàng thanh toán" + "Tổng thanh toán" render as `0đ`. User
attests that the BE response contains non-zero values for these fields.

## 2. FE inventory (read-only review)

The display flows through one of two render paths depending on surface:

- **Surface B (STL Detail via `getSettlementByCode`)** → `cost-tab.tsx`
  pulls `detail.insuranceAdjustment.settlementBalance.{customerPayment,
  totalPayment}` (already projected by the BFF mapper into the legacy
  `InsuranceAdjustmentSnapshot` shape) and passes it to
  `<TotalServicePricePanel>` `balance` prop. Panel formats via
  `formatVnd(balance?.customerPayment ?? 0)`.
- **Surface A (SO Detail via `getServiceOrderByCode`)** → `allocation-totals-server.tsx`
  reads `data?.customerPayment` directly (Shape D flat root) and formats via
  `formatCurrencyVi(n(data?.customerPayment), "đ")`.

Both code paths correctly null-coalesce to `0` and would render `0đ` *only*
when the upstream value is `null`/`undefined`/`0`.

## 3. Why FE cannot resolve without cross-boundary evidence

Task notes (BUG-W01-259) mandate **"test-api capture network response làm bằng
chứng BE thực sự trả ≠ 0 trước khi FIX bắt đầu"**. The two possible root
causes diverge entirely outside the FE boundary:

1. **BE returns 0** → effect of BUG-W01-257 (gf-sales pre-adjustment
   computation); fix belongs to `agent-fix-gf-sales` /
   `agent-fix-gf-accounting`. FE display is correct.
2. **BE returns ≠ 0** → FE field-path drift between Surface A flat-root and
   Surface B nested wrapper (INTEG §4.3.7b.1). FE fix would re-align the
   reader.

Without `network` capture from `agent-test-api` against the live garage
graph (`getSettlementByCode` for `SET-20260611-00001`), neither branch can
be selected by FE alone — patching speculatively risks producing the wrong
fix and masking BUG-W01-257.

## 4. Escalation request

Re-spawn `agent-test-api` with a single-purpose probe: hit
`getSettlementByCode(code: "SET-20260611-00001")` against the dev BFF and
return the JSON for the `insurance.settlementBalance` object (and the
flat-root `customerPayment`/`totalPayment` if Shape D is in effect).

Once the response is captured, `agent-fix-garage-web` (or
`agent-fix-gf-sales` if BE = 0) can be re-spawned with the data evidence
needed to pick the correct fix branch.

## 5. Status

OPEN → ESCALATED (Trigger #1).
