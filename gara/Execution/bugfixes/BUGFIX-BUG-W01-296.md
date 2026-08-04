# BUGFIX-BUG-W01-296 — STL Detail BH tab "Lịch sử thanh toán" parity 4-gap vs KH baseline

| Field | Value |
|---|---|
| Bug ID | BUG-W01-296 |
| Severity | P2 |
| Status | RESOLVED (pending TEST_GROUP / QA verify) |
| Wave | W01 (EP-INSURANCE-SETTLEMENT) |
| Feature(s) | FEAT-INS-STL-DETAIL |
| Business Rule(s) | BR-INS-STL-DET-007 (BH variant parity với KH baseline) |
| Boundary | garage-web (`frontend/gf-gms-web`) |
| Fix Agent | agent-fix-garage-web |
| Fix Commit | `PENDING_USER_COMMIT` |
| Fix Branch | `feature/ep-insurance-settlement-w01` |

## 1. Symptom

Trên STL Detail biến thể BH (`SET-20260616-00012`) tab "Lịch sử thanh toán",
render lệch baseline KH (`SET-20260616-00011`) ở 4 mặt:

1. Cột "Ngày" hiển thị raw ISO `2026-06-16T11:05:39.479829Z` thay vì
   formatted `dd/MM/yyyy HH:mm` (KH = `16/06/2026 17:42`).
2. Cột "Phương thức" hiển thị raw enum `CASH` thay vì localized `Tiền mặt`.
3. Thiếu summary block "Còn lại" + "Đã thanh toán" trên top tab — KH có.
4. Column structure khác: BH = `Ngày / Số tiền / Phương thức / Ghi chú /
   File đính kèm`, KH = `STT / Ngày thanh toán / Phương thức / Ghi chú /
   Số tiền`. Thiếu STT, label "Ngày" thiếu "thanh toán", thứ tự Số tiền
   lệch, extra col "File đính kèm".

Operational impact: kế toán đọc raw ISO + raw enum → khó nhận diện thanh toán;
thiếu summary "Còn lại" → khó theo dõi công nợ BH.

## 2. Root Cause

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/payment-history-tab.tsx`
là component riêng cho BH variant, KHÔNG reuse formatter / column structure
của KH baseline `features/settlement-voucher/components/detail/payment-history-tab.tsx`.

- Date cell: `{r.paidAt}` (L51) — raw bind không qua formatter.
- Method cell: `{r.paymentMethod}` (L53) — raw bind không qua label mapping.
- Header summary block KHÔNG tồn tại — KH có khối top sibling table.
- Column order legacy: `Ngày / Số tiền / Phương thức / Ghi chú / File đính kèm` —
  KH baseline đổi sang `STT / Ngày thanh toán / Phương thức / Ghi chú / Số tiền`.

BUG-W01-288 (RESOLVED 2026-06-16) chỉ fix data feed (mapper `mapPaymentRecord`
project `serviceOrder.payments[]` → `InsurancePaymentRecord`), KHÔNG sửa render layer.
296 = follow-up render layer của cùng FEAT.

Page parent `insurance-settlement-detail-page.tsx` (L147-159) đã derive
`paymentTotals.{paid, remaining}` để gate button "Thêm thanh toán" — sẵn input
cho summary block, chỉ cần passthrough.

## 3. Fix

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/payment-history-tab.tsx`
rewritten:

- **Date format** — import `formatDateTime` (`@/utils/date-time`) +
  `DateTimePattern` (`@/constants/date`); cell:
  ```tsx
  formatDateTime(r.paidAt, DateTimePattern.DATE_TIME)
  ```
  emits `dd/MM/yyyy HH:mm`.
- **Method label** — import `SETTLEMENT_PAYMENT_METHOD_LABELS`
  (`@/features/settlement-voucher/constants`) + `PaymentMethodEnum`
  (`@/interfaces/enum`); cell:
  ```tsx
  SETTLEMENT_PAYMENT_METHOD_LABELS[method as PaymentMethodEnum]
  ```
  emits "Tiền mặt" / "Thẻ tín dụng" / "Chuyển khoản" / "Ví MoMo" / "VNPay".
- **Summary block** — port từ KH L106-123: hai cột flex justify-end gap-16
  ("Còn lại" green semibold + "Đã thanh toán" semibold). Props mới
  `remainingAmount`, `paidAmount` (cả 2 optional default 0). i18n qua
  `useTranslation()` parity KH.
- **Column structure** — đổi sang `STT / Ngày thanh toán / Phương thức /
  Ghi chú / Số tiền`. Drop col "File đính kèm" (KH baseline không có; nếu
  feature attachment cần thêm, phải amend KH cùng để giữ parity).
- **Page passthrough** —
  `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx`
  wire `remainingAmount={paymentTotals.remaining}` +
  `paidAmount={paymentTotals.paid}` cho tab.

KHÔNG đổi data shape (`InsurancePaymentRecord` giữ nguyên). KHÔNG đụng
BFF / BE / SDL.

## 4. Blast Radius

- Route affected: `/insurance-settlement/:code` tab "Lịch sử thanh toán".
- Components touched: 2 file (`payment-history-tab.tsx`, parent page).
- Cross-boundary risk: none (FE-only render + label; data shape không đổi).
- Cross-FEAT impact: FEAT-PRINT-STL — nếu in chứng từ STL BH dùng cùng tab
  component path, sẽ in đúng format Việt Nam (positive side-effect). Vetted
  rằng print template không share component file này (print template ở
  `features/print/` riêng).
- KH baseline (`settlement-voucher/components/detail/payment-history-tab.tsx`)
  KHÔNG bị touch → không regress.

## 5. Regression Test

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/payment-history-tab.bug-296.test.ts`

6 source-pin specs (parity với pattern `grand-summary-create-gate.test.ts`
cho BUG-W01-300 — render-based test cần Apollo + i18n provider +
InsuranceSettlementDetailPage mock; formatter wiring là literal):

1. `imports formatDateTime + DateTimePattern.DATE_TIME (gap a)` — pin date format.
2. `imports SETTLEMENT_PAYMENT_METHOD_LABELS + PaymentMethodEnum (gap b)` — pin method label.
3. `renders summary block 'Còn lại' + 'Đã thanh toán' above the table (gap c)` — pin block presence.
4. `declares props remainingAmount + paidAmount on PaymentHistoryTabProps (gap c — typed)` — pin props.
5. `column order parity: STT / Ngày thanh toán / Phương thức / Ghi chú / Số tiền (gap d)` — pin header order + ban "File đính kèm".
6. `page passes paymentTotals.paid + paymentTotals.remaining into PaymentHistoryTab` — pin parent wiring.

## 6. Verification

```
cd frontend/gf-gms-web
npm test -- --run \
  src/features/insurance-settlement/components/detail/payment-history-tab.bug-296.test.ts
# → 6 passed

npm test -- --run src/features/insurance-settlement/components/detail/
# → 31 passed (cluster cost-tab.bug-299 + 5 existing detail suites still green)

npm run build  # → exit 0 (built in 16.30s)
npx eslint --max-warnings=0 \
  src/features/insurance-settlement/components/detail/payment-history-tab.tsx \
  src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx \
  src/features/insurance-settlement/components/detail/payment-history-tab.bug-296.test.ts
# → clean
```

## 7. Files Changed

- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/payment-history-tab.tsx` (rewrite — formatter wiring + summary block + column reorder).
- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx` (pass `remainingAmount` + `paidAmount` into PaymentHistoryTab — 4 lines).
- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/payment-history-tab.bug-296.test.ts` (new regression test, 6 specs).

## 8. Follow-ups (out of fix scope)

- **Spec amend (CR follow-up nhẹ)**: FEAT-INS-STL-DETAIL AC-9 hiện wording
  "tab Lịch sử thanh toán hiển thị danh sách payment đã ghi nhận" — nên
  amend explicit format: "(a) Date `dd/MM/yyyy HH:mm` Việt Nam locale;
  (b) PaymentMethod localized via `SETTLEMENT_PAYMENT_METHOD_LABELS`;
  (c) Column structure parity KH baseline `STT/Ngày thanh toán/Phương thức/Ghi chú/Số tiền`;
  (d) Top tab summary `Còn lại` + `Đã thanh toán`".
- **Cross-platform sibling BUG-W01-295 (mobile)** — RESOLVED 2026-06-17 đã fix
  empty list (data feed) nhưng không cùng surface area; mobile format parity
  cần riêng nếu QA mobile re-test thấy gap.
- **Component reuse refactor (deferred — phase sau)** — option B optimal long-term
  là import + reuse `settlement-voucher/components/detail/payment-history-tab.tsx`
  trực tiếp (single source-of-truth). Current fix dùng option A (apply formatter +
  port summary block + parity column) vì option B cần unify type
  `InsurancePaymentRecord` ↔ `ISettlementByCodePayment` schema. CR follow-up
  nếu BA/PO duyệt unify schema.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-17 | 1 | agent-fix-garage-web | Initial BUGFIX doc — 4-gap parity fix + regression test. |
