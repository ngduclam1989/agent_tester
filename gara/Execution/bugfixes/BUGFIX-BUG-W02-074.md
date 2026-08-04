# BUGFIX BUG-W02-074 — "Tổng thanh toán" panel STL-DETAIL bind nhầm "Cộng sau VAT" thay vì payment

> Wave: W02 · Severity: P1 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual QC BA (2026-06-24, SET-20260624-00005)
> Reporter: BA via agent-test-orchestrator

## 1. Failure mode

Trên `InsuranceSettlementDetailPage` (route `/settlement-voucher/:code`) panel "Tổng giá dịch vụ" → khối "Cần thanh toán", dòng **"Tổng thanh toán"** (ô đen highlight) bind nhầm vào field `totalPayment` (= `insurancePayment + customerPayment` = `Cộng sau VAT` trước phân bổ) thay vì payment-theo-bên:

- Phiếu BH (`payerType=INSURANCE`, panel mode `BH-1col`) → phải = `insurancePayment` (sau "Phân bổ BH").
- Phiếu KH (`payerType=CUSTOMER`, panel mode `KH-1col-*`) → phải = `customerPayment`.

Repro SET-20260624-00005: "Tổng thanh toán" hiển thị **47.319.125đ** (= Cộng sau VAT) thay vì **42.587.212đ** (= Bảo hiểm thanh toán). Ô xanh "Bảo hiểm thanh toán" render đúng từ `insurancePayment` → giá trị đúng đã có client-side, chỉ ô đen copy nhầm nguồn.

## 2. Root cause

`<TotalServicePricePanel>` render dòng "Tổng thanh toán" từ `balance.totalPayment` cho mọi mode. Với 1-col modes (`BH-1col`, `KH-1col-with-alloc`, `KH-1col-no-alloc`), `totalPayment` (= subtotal combined) khác với số tiền bên đang hiển thị → headline lệch.

`<CostTab>` (file `src/features/insurance-settlement/components/detail/cost-tab.tsx`) đã có precedent: prior fix project `totalPayment = insurancePayment` chỉ cho `BH-1col`. Branch KH chưa được project → defect.

## 3. Fix

### `src/features/insurance-settlement/components/detail/cost-tab.tsx`

Extract `projectDisplayBalance(balance, mode)` helper: với `BH-1col` mirror `insurancePayment`, với `KH-1col-with-alloc` hoặc `KH-1col-no-alloc` mirror `customerPayment`, với `2-col` giữ combined `totalPayment` (vì 2-col hiển thị cả 2 cột payer).

### `src/features/settlement-voucher/components/detail/cost-tab.tsx`

Mở rộng logic `allocationSnapshot` (memo) tương tự: với `BH-1col` project `totalPayment = insurancePayment`, với `KH-1col-with-alloc | KH-1col-no-alloc` project `totalPayment = customerPayment`. Inline comment giải thích semantic 1-col vs 2-col (WHY note, không reference bug ID).

## 4. Regression test

### `src/features/insurance-settlement/components/detail/cost-tab.bug-w02-074.test.tsx` (NEW)

3 assertions:

- BH-1col: `"Tổng thanh toán" = insurancePayment 42.587.212đ`, không = 47.319.125đ.
- KH-1col-with-alloc: `"Tổng thanh toán" = customerPayment`, không = combined.
- KH-1col-no-alloc: `"Tổng thanh toán" = customerPayment` khi `soHasInsurance=false`.

### `src/features/settlement-voucher/components/detail/cost-tab.insurance-tab-total.test.tsx` (EXTEND)

Thêm `buildCustomerResponse` + 3 case CUSTOMER settlement: KH-with-alloc shows `customerPayment 830k` (not combined 1.130k), KH-no-alloc shows `customerPayment`.

## 5. Files changed

- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.tsx` (extract `projectDisplayBalance`)
- `frontend/gf-gms-web/src/features/settlement-voucher/components/detail/cost-tab.tsx` (project balance cho KH 1-col modes)
- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.bug-w02-074.test.tsx` (NEW)
- `frontend/gf-gms-web/src/features/settlement-voucher/components/detail/cost-tab.insurance-tab-total.test.tsx` (extend)

## 6. Status update

BUG-W02-074: OPEN → RESOLVED (verify pending L2 — Playwright UI re-run TC-R06 + TC-R05 + new TC-STL-DET-TOTAL).
