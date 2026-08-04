# BUGFIX BUG-W01-282 — STL Detail BH variant thiếu button "Thêm thanh toán"

> **Status**: RESOLVED.
> **Severity**: P1.
> **Boundary**: garage-web (frontend).
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BR-INS-STL-DET-007 (BH-only features), CR-20260612-01 (panel split chưa cover button header), `SettlementVoucherDetail` (KH variant baseline).

---

## 1. Failure mode

`InsuranceSettlementDetailPage` (BH variant) render view-mode header chỉ với
`Chỉnh sửa` + `In toàn bộ hồ sơ`. Button `Thêm thanh toán` (có trên KH
variant `SettlementVoucherDetail` qua `RecordServiceOrderPaymentByCode`)
hoàn toàn vắng mặt → accountant không thể ghi nhận thanh toán từ DN BH
qua UI, phải lách qua KH variant hoặc gọi mutation trực tiếp.

Backend mutation `recordServiceOrderPaymentByCode` (baseline production)
đã hỗ trợ cả 2 `payerType` — vấn đề thuần FE.

## 2. Root cause

`InsuranceSettlementDetailPage` (`src/features/insurance-settlement/
components/detail/insurance-settlement-detail-page.tsx`) trước fix chỉ
render 2 action `Chỉnh sửa` + `In toàn bộ hồ sơ` trong `viewActions`,
không mount `AddPaymentModal` và không gọi `useAddSettlementPayment` hook.
Design Figma BH variant (W01) thiếu button → FE follow strictly. Spec
`FEAT-INS-STL-DETAIL §7` ghi "payment đã baseline production" nhưng
không explicit AC cho button trên BH variant.

## 3. Fix

3 file thay đổi:

1. **`src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx`**:
   - Mount `<AddPaymentModal>` (reuse từ `settlement-voucher/components/modals/add-payment-modal`).
   - Bind `useAddSettlementPayment` hook (cùng wrapper KH variant dùng).
   - Compute `paymentTotals` từ `detail.insurancePayment` (receivable) +
     `detail.paymentHistory` (paid) — derive `remaining` + `canAddPayment = paid < receivable`.
   - Append button vào `viewActions` khi `canAddPayment` (parity KH variant
     `SettlementVoucherDetail.headerActions:271-274`).
2. **`src/features/insurance-settlement/constants/index.ts`**:
   - Extend `ACTION_LABELS.addPayment = "Thêm thanh toán"` — extract literal
     khỏi JSX cho i18n + test stability (giữ pattern với `edit` / `printAll`
     / `createDossier` đã có).
3. **`src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.shell.test.tsx`**:
   - Add `vi.mock` cho `use-add-settlement-payment` để existing shell tests
     không bể khi page import hook mới.

## 4. Regression test

**NEW** `src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.payment.test.tsx`
(3 specs):

- `hiển thị button 'Thêm thanh toán' khi BH variant còn dư nợ (paid < receivable)` — mock
  `detail.insurancePayment=2.000.000`, `paymentHistory=[]` → button visible.
- `ẩn button 'Thêm thanh toán' khi BH variant đã thu đủ` — `insurancePayment=1.500.000`,
  `paymentHistory=[{amount: 1.500.000}]` → button hidden.
- `ẩn button 'Thêm thanh toán' khi phiếu BH đã hủy (parity KH variant)` —
  `settlementStatus="CANCEL"` → `viewActions=[]`, button hidden.

## 5. Blast radius

- Affected boundary: garage-web ONLY.
- No public API / GraphQL schema change — reuse existing
  `recordServiceOrderPaymentByCode` mutation (production baseline).
- No KG entity / event / permission change.
- Risk: minimal. KH variant path không đổi. BH variant gains new path
  identical to KH semantics.

## 6. Spec gap (CR follow-up)

`FEAT-INS-STL-DETAIL §7 Out of Scope` cần CR cập nhật:

- AC-9 add: "header button 'Thêm thanh toán' hiện trên CẢ 2 variant KH + BH
  khi `paid < finalAmount` (BR-INS-STL-DET-payment-parity)".
- Figma BH variant cập nhật vẽ button.

Hiện code mirror KH variant semantics ngầm — CR canonicalize.

## 7. Verification

- `npm run build` → exit 0.
- `npx eslint <changed files>` → no errors (pre-existing lint errors trong
  unrelated files only).
- `npx vitest run insurance-settlement-detail-page.payment.test.tsx
  insurance-settlement-detail-page.shell.test.tsx` → all pass (12 tests).
- Full test suite: 121/122 pass (1 pre-existing failure trong
  `depreciation-persist.test.ts:57` NOT related to this fix).

## 8. Memory decision

`no-write` — Fix straightforward (parity với existing KH variant pattern);
no new lesson. Existing patterns + memory entries (parity với
`SettlementVoucherDetail`) sufficient.
