# BUGFIX BUG-W01-288 — STL Detail BH variant tab "Lịch sử thanh toán" rỗng

> **Status**: RESOLVED.
> **Severity**: P1.
> **Boundary**: garage-web (frontend).
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: FEAT-INS-STL-DETAIL AC-9, BR-INS-STL-DET-007 (BH parity với KH
> baseline), BUG-W01-282 (sibling — enable button "Thêm thanh toán" BH
> variant header; round-trip half).

---

## 1. Failure mode

Trên STL Detail BH variant:

- B1. User bấm "Thêm thanh toán" (button đã enable post BUG-W01-282) → ghi
  payment thành công (toast ✓).
- B2. Click tab "Lịch sử thanh toán".
- B3. Reload page → quay lại tab.

Quan sát: Tab "Lịch sử thanh toán" RỖNG (`PaymentHistoryTab` nhận
`records=[]`) cả trước và sau reload. Network response `getSettlementByCode`
cho BH variant không có field `serviceOrder.payments`. Variant KH baseline
working bình thường. Accountant không thấy lịch sử thu BH dù đã record
thành công → reconcile blind.

## 2. Root cause

FE insurance settlement query select sai kênh data:

- BFF mapper `debtPanel.paymentHistory` (`gf-accounting/settlements/
  insurance.mapper.ts:360`) còn return `[]` placeholder cho phase aggregator
  sau — không phải kênh production hiện tại.
- Kênh production single source-of-truth =
  `ServiceOrderDetailV3Data.payments[]` (gf-sales SO master). Customer
  variant query đã select khối này (`settlement-voucher/hooks/
  use-get-settlement-by-code.ts:146-156`).
- FE insurance query (`insurance-settlement/hooks/
  use-insurance-settlement-detail.ts`) `serviceOrder` block chỉ chứa
  `items/parts/vehicleResponse` — thiếu `payments {...}`.
- Mapper `paymentHistory: raw.debtPanel?.paymentHistory ?? []` → luôn `[]`.

Sibling BUG-W01-282 đã enable button "Thêm thanh toán" trên BH variant
nhưng round-trip không đóng: recorded payment vào gf-sales SO nhưng FE BH
variant không query về để hiển thị.

## 3. Fix — FE-only (Layer 1)

### 3.1 Query thêm `payments {...}` block

```graphql
serviceOrder {
  /* ...existing items/parts/vehicleResponse... */
  payments {
    id amount paymentMethod referenceNumber notes
    paidAt paidBy paymentStatus settlementCode
  }
}
```

Mirror customer baseline `use-get-settlement-by-code.ts:146-156`.

### 3.2 Interface extend

```ts
interface IRawPayment {
  id?: number | string | null;
  amount?: number | null;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  paidBy?: string | null;
  paymentStatus?: string | null;
  settlementCode?: string | null;
}

interface IRawServiceOrder {
  /* ...existing fields... */
  payments?: IRawPayment[] | null;
}
```

### 3.3 Mapper

```ts
const mapPaymentRecord = (raw: IRawPayment): InsurancePaymentRecord => ({
  id: String(raw.id ?? ""),
  paidAt: raw.paidAt ?? "",
  amount: raw.amount ?? 0,
  paymentMethod: raw.paymentMethod ?? "",
  notes: raw.notes ?? undefined,
});

// In mapInsuranceSettlementDetail:
paymentHistory: (() => {
  const fromSo = (so?.payments ?? [])
    .filter((p) => !p.settlementCode || p.settlementCode === raw.code)
    .map(mapPaymentRecord);
  if (fromSo.length > 0) return fromSo;
  return raw.debtPanel?.paymentHistory ?? [];
})(),
```

Filter `settlementCode === raw.code` để loại payment thuộc settlement KH
khác cùng SO (case 1 SO có 2 phiếu QT pair KH + BH). Payment thiếu
`settlementCode` (forward-compat) vẫn giữ. Fallback `debtPanel.paymentHistory`
khi BFF aggregator phase sau enable.

`InsurancePaymentRecord` không có `attachmentUrl` từ SDL (PaymentV3 SDL
không expose) → omit; có thể enrich qua aggregator kênh sau.

## 4. Blast radius

- **Inbound**: `<PaymentHistoryTab records={detail.paymentHistory} />` tab
  render (`insurance-settlement-detail-page.tsx:245`).
- **Outbound**: agg-garage-graph query `getSettlementByCode` — selection
  set thêm sub-block dưới `serviceOrder.payments` (BFF SDL đã expose). No
  BFF/BE change required.
- **Read-only consumer** — không cascade ra mutation hoặc cache invalidate
  ngoài tab này.

## 5. Regression test

`insurance-settlement/hooks/use-insurance-settlement-detail.payments.test.ts`
(6 specs):

1. Query selection includes `serviceOrder.payments` block (parity với KH
   baseline).
2. Mapper projects `serviceOrder.payments` → `paymentHistory` view-model
   với field map đúng.
3. Filters payment thuộc settlement KH khác cùng SO (case 1 SO 2 settlement).
4. Keeps payment với settlementCode null/missing (forward-compat).
5. Fallback to `debtPanel.paymentHistory` khi `serviceOrder.payments` rỗng.
6. Empty paymentHistory khi cả 2 nguồn rỗng.

Existing test `use-insurance-settlement-detail.test.ts` continues passing —
fixture không có `serviceOrder.payments` → fallback path hoạt động.

## 6. Files changed

- `frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.ts`
- `frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.payments.test.ts` (NEW)

## 7. Verification

- `npx vitest run src/features/insurance-settlement/` — all pass.
- `npx tsc -b` — clean.
- `npm run build` — pass.

## 8. Follow-up

CR amend AC-9 (`FEAT-INS-STL-DETAIL`) để explicit data source policy:
"W01: nguồn `serviceOrder.payments[]` filter `settlementCode === stl.code`
per parity KH baseline; phase sau migrate sang `debtPanel.paymentHistory`
khi BFF mapper enable aggregator kênh dedicated".
