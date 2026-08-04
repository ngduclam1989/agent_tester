# BUGFIX-BUG-W01-301 — Legacy STL BH pre-wave01 backward-compat fallback

| Field | Value |
|---|---|
| Bug ID | BUG-W01-301 |
| Wave | W01 |
| Boundary | garage-web (`frontend/gf-gms-web`) |
| Severity | P2 |
| Status | RESOLVED 2026-06-17 — pending user commit |
| Commit SHA | `PENDING_USER_COMMIT` |
| FEAT / AC | FEAT-INS-STL-DETAIL / AC-6 |
| BR | BR-INS-STL-CRE-002 (snapshot allocation — wave01 NEW) |
| Fixed by | agent-fix-garage-web (Layer-1 FE backward-compat read fallback) |

## 1. Vấn đề

Pre-wave01 phiếu QT BH (vd `SET-20260505-00008`, tạo 2026-05-05) UI Detail/Edit
render `0đ` cho mọi panel "Tổng giá dịch vụ" (breakdown BH/KH × Dịch vụ/Phụ tùng/VAT/Cộng-sau-VAT)
+ section "Phân bổ Bảo hiểm" + "Bảo hiểm thanh toán" — MẶC DÙ BE response đầy đủ legacy aggregate:

```
insuranceAmount=5005000
customerAmount=2005000
finalAmount=7010000
totalServiceAmount=5500000
totalPartsAmount=1510000
```

User confirm scope: chỉ phiếu PRE-wave01 + `payerType=INSURANCE`; phiếu POST-wave01 OK.

## 2. Root cause

Wave01 reshape sang Shape-D canonical: settlement persist 16 field chuyên biệt
(`insurancePayment`, `customerPayment`, `totalPayment`, `serviceInsurance`,
`serviceCustomer`, `partsInsurance`, `partsCustomer`, `vatInsurance`,
`vatCustomer`, `totalAfterVatInsurance`, `totalAfterVatCustomer`, +
5 composite adjustment `discountMaterial`/`discountLabor`/`depreciation`/
`claimReduction`/`insuranceDeductible`).

Legacy phiếu pre-wave01 KHÔNG populate 16 field này (16/16 NULL trên BE), chỉ
giữ aggregate cũ:
- `SettlementByCodeData.{totalServiceAmount, totalPartsAmount, finalAmount}` (root)
- `SettlementByCodeData.serviceOrder.{insuranceAmount, customerAmount}` (nested SO)

FE wave01 (`hooks/use-insurance-settlement-detail.ts`):
1. GraphQL query KHÔNG select 5 legacy aggregate field → mapper không thấy data legacy.
2. `mapInsuranceSettlementDetail` đọc thẳng 16 Shape-D field → tất cả `null` cho phiếu legacy.
3. `cost-tab.tsx:58` gọi `mapFlatRootInsuranceAdjustment(detail)` → consumer
   helper `hasAnyInsuranceField` thấy 16 field null → return `undefined` →
   `<Show when={!!adjustment}>` ẩn panel.
4. Hoặc khi vài field null pass-through 0, panel render rỗng/0đ.

## 3. Fix strategy

Layer-1 FE-only fallback. KHÔNG đụng BFF/BE/Flyway/SDL (đã expose legacy field).

### File chạm

- `frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.ts`
- `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.bug-301-legacy.test.ts` (NEW, regression test)
- `Tracking/WAVE01/BUGS.md` (status OPEN → RESOLVED)

### Change 1 — GraphQL query expand selection set

Add 5 legacy aggregate field vào `GET_INSURANCE_SETTLEMENT_BY_CODE_QUERY`:
- Root settlement: `totalServiceAmount`, `totalPartsAmount`, `finalAmount`
- Nested `serviceOrder`: `insuranceAmount`, `customerAmount`

SDL coverage đã sẵn (`agg-garage-graph` schema `SettlementByCodeData` +
`ServiceOrderDetailV3Data`). Selection set thuần additive — không contract change.

### Change 2 — Raw types extend

- `IRawDetail` thêm 3 field root: `totalServiceAmount?: number | null`,
  `totalPartsAmount?: number | null`, `finalAmount?: number | null`.
- `IRawServiceOrder` thêm 2 field nested: `insuranceAmount?: number | null`,
  `customerAmount?: number | null`.

### Change 3 — Mapper legacy-fallback chain

Thêm helper `isLegacyPhieu(raw)` + `projectLegacyAggregateToShapeD(raw)`:

```ts
const isLegacyPhieu = (raw: IRawDetail): boolean => {
  const allNewNull = SHAPE_D_INSURANCE_KEYS.every((k) => raw[k] == null);
  if (!allNewNull) return false;
  const hasLegacyBalance =
    raw.finalAmount != null || raw.serviceOrder?.insuranceAmount != null;
  return hasLegacyBalance;
};
```

Khi `isLegacyPhieu` true, compute insurance ratio = `insuranceAmount / finalAmount`
và project sang 11 Shape-D scalar:
- `serviceInsurance = totalServiceAmount * ratio`
- `serviceCustomer = totalServiceAmount * (1 - ratio)`
- `partsInsurance = totalPartsAmount * ratio`
- `partsCustomer = totalPartsAmount * (1 - ratio)`
- `vatInsurance = vatCustomer = 0` (legacy KHÔNG track VAT split BH/KH)
- `totalAfterVatInsurance = serviceInsurance + partsInsurance`
- `totalAfterVatCustomer = serviceCustomer + partsCustomer`
- `insurancePayment = insuranceAmount`
- `customerPayment = customerAmount`
- `totalPayment = finalAmount`

Trong `mapInsuranceSettlementDetail` VM build, thay 11 dòng:
```ts
serviceInsurance: raw.serviceInsurance ?? null,
...
totalPayment: raw.totalPayment ?? null,
```
thành chain `raw.X ?? legacy?.X ?? null` — chỉ override khi NEW null AND
legacy fallback hợp lệ.

5 composite adjustment field (`discountMaterial`, `discountLabor`,
`depreciation`, `claimReduction`, `insuranceDeductible`) GIỮ NULL cho phiếu
legacy — `mapFlatRootInsuranceAdjustment` sẽ trả `adjustments` = `{0,0,0,0,0}`
(consumer `num(undefined?.amount) === 0`) → 5 row "Phân bổ Bảo hiểm" render `0đ`.
Per user-accepted Expected (e) — option "render 0đ (đúng)".

### Change 4 — `cost-tab.tsx` panel gate

KHÔNG sửa. Đã gate qua `<Show when={!!adjustment}>`. Sau fix, `adjustment` =
`{breakdownByPayer, adjustments={all 0}, settlementBalance}` (truthy) → panel
render đúng cho cả legacy + NEW phiếu.

### Change 5 — Regression test

`frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.bug-301-legacy.test.ts`
7 specs:
1. Legacy fixture → `insurancePayment = 5005000`, `customerPayment = 2005000`,
   `totalPayment = 7010000`.
2. Legacy fixture → `serviceInsurance ≈ totalServiceAmount * ratio` (insurance
   ratio compute).
3. Legacy fixture → 5 composite adjustment field giữ `null` (5 row Phân bổ
   render 0đ — accepted).
4. Post-wave01 fixture (Shape-D đầy đủ) → fallback KHÔNG fire, NEW value giữ
   nguyên (regression guard).
5. Mixed fixture (1 NEW field + legacy aggregate) → fallback SKIP toàn bộ (NEW
   wins guard rail).
6. GraphQL query string contains 5 legacy literal: `totalServiceAmount`,
   `totalPartsAmount`, `finalAmount`, `insuranceAmount`, `customerAmount`.
7. Source-pin `cost-tab.tsx`: `mapFlatRootInsuranceAdjustment(detail)` +
   `<Show when={!!adjustment}>` gate preserved.

## 4. Verification

| Check | Result |
|---|---|
| `yarn test --run cost-tab.bug-301-legacy.test.ts` | 7/7 pass |
| `yarn test --run insurance-settlement insurance-allocation` | 120/120 pass (22 files) |
| `yarn build` (tsc -b + vite build) | clean (build OK) |
| `yarn lint` insurance-settlement/insurance-allocation files | clean (no NEW lint errors trong file đã sửa; pre-existing repo-wide lint debt unrelated) |

## 5. Caveats / decisions locked-in

- **VAT split legacy = 0**: Legacy KHÔNG track VAT BH/KH split → render `0` cho
  2 row VAT trong panel "Chi tiết theo bên thanh toán". Acceptable per user
  scope (legacy phiếu chỉ track aggregate, không decompose VAT).
- **5 row "Phân bổ Bảo hiểm"**: Render `0đ` mỗi row (option (e) accepted —
  user nói "HOẶC render 0đ HOẶC ẨN hoàn toàn"). Chọn render 0đ vì cleaner —
  không cần modify shared `TotalServicePricePanel` component (avoid scope drift
  ra `insurance-allocation` feature).
- **Ratio = 0 edge case**: Nếu `finalAmount = 0` → ratio = 0, breakdown
  insurance = 0 (đúng — phiếu rỗng). Test mặc nhiên cover qua post-wave01 +
  mixed fixture.
- **Insurance ratio precision**: Floating-point — `5005000 / 7010000 ≈
  0.71398...`. Test dùng `toBeCloseTo(..., 2)` (precision 0.01đ) — acceptable
  cho VND display (round qua `formatVnd` ở render layer).
- **Mixed fixture guard rail (test #5)**: Strict NEW-wins — kể cả 1 NEW field
  ≠ null → fallback SKIP toàn bộ. Tránh inconsistent state (1 NEW + 10 legacy
  mix) đẩy ra UI confusing.

## 6. Follow-ups (KHÔNG trong scope FIX)

- Spec gap: AC-6 FEAT-INS-STL-DETAIL + BR-INS-STL-CRE-002 chưa explicit
  backward-compat strategy cho legacy phiếu — cần CR amend ghi rõ "legacy
  fallback chain qua FE mapper" + "VAT split = 0 cho legacy".
- Cross-platform: garage-mobile STL Detail có pattern này không (defer test
  mobile re-test legacy phiếu BH).
- Cross-FEAT FEAT-PRINT-STL: print template legacy nếu reuse cùng mapper sẽ
  hưởng fallback; cần test riêng nếu print path khác hook.

## 7. Related bugs

- **BUG-W01-279** REOPENED 2026-06-16 — settlement summary 5 fields THIẾU ở
  BE response (Root Cause C — backend persist gap); bug 301 = backward-compat
  read display follow-up cho phiếu legacy.
- **BUG-W01-289** OPEN — STL snapshot depreciation null (cùng pattern
  legacy/new field NULL).
- **BUG-W01-288** RESOLVED — STL BH tab Lịch sử thanh toán payment selection
  (cùng FEAT khác concern).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-17 | 1 | agent-fix-garage-web | Initial — Layer-1 FE backward-compat fallback (GraphQL expand + mapper legacy projection) + 7-spec regression test. |
