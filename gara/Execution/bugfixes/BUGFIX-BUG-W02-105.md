# BUGFIX BUG-W02-105 — STL-DETAIL KH-không-BH render sai variant (per-payer thay vì baseline "Tổng chi phí")

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual BA test (2026-06-26, web SIT SET-20260625-00003)
> Reporter: BA (anh Lương) via agent-test-orchestrator

## 1. Failure mode

Màn Chi tiết phiếu quyết toán (`/sua-chua-va-dich-vu/phieu-quyet-toan/SET-20260625-00003/chi-tiet`) cho voucher KH-không-BH (`settlementType=CUSTOMER`, `soHasInsurance=false`) đang render panel per-payer "Chi tiết theo bên thanh toán" với 4 dòng `Dịch vụ / Phụ tùng / VAT / Cộng sau VAT` đều 0đ + block "Cần thanh toán" trùng tổng.

Expect: render baseline "Tổng chi phí" W01 (3 dòng: Tổng thành tiền dịch vụ + Tổng thành tiền phụ tùng + Tổng thành tiền (Dịch vụ + Phụ tùng)) — tham chiếu voucher SET-20260612-00001.

## 2. Root cause

`src/features/settlement-voucher/components/detail/cost-tab.tsx:340-348` `panelMode` discriminator trả `"KH-1col-no-alloc"` cho nhánh `CUSTOMER + !soHasInsurance` (per CR-20260612-01 cũ). Per CR-20260624-01 (anhluong, 2026-06-24) — phiếu KH-không-BH PHẢI rơi về baseline "Tổng chi phí" (FEAT-STL-DETAIL AC-7), KHÔNG render variant rút gọn.

CR-20260624-01 reverse một phần CR-20260612-01 (frame 13548-92509). Trước đó BUG-W02-073 đã raise cùng issue và bị mark INVALID (chờ CR resolution). BUG-W02-105 = re-raise sau khi CR approved.

Commit `7c44ee3 feat(bugfix): implement type-aware total payment handling in InsuranceTotalPanel` chạm internals nhưng KHÔNG wire lại discriminator — nghi incomplete fix.

`file:line` evidence:

- `src/features/settlement-voucher/components/detail/cost-tab.tsx:347` (pre-fix) — `return data.soHasInsurance ? "KH-1col-with-alloc" : "KH-1col-no-alloc";`

## 3. Fix

### `src/features/settlement-voucher/components/detail/cost-tab.tsx`

Tách nhánh KH-không-BH ra `null` để cho `<Show when={!panelMode}>` (line 419-473) render baseline "Tổng chi phí":

```ts
const panelMode: TotalServicePricePanelMode | null = useMemo(() => {
  if (!data) return null;
  if (data.serviceOrder?.orderType !== OrderTypeEnum.SERVICE) return null;
  if (data.settlementType === ESettlementType.INSURANCE) {
    return "BH-1col";
  }
  if (data.settlementType !== ESettlementType.CUSTOMER) return null;
  if (!data.soHasInsurance) return null;
  return "KH-1col-with-alloc";
}, [data]);
```

Variant matrix sau fix:

| settlementType | soHasInsurance | panelMode | render |
|---|---|---|---|
| INSURANCE | true | `BH-1col` | per-payer BH-only panel |
| CUSTOMER | true | `KH-1col-with-alloc` | per-payer KH-only + 3-row alloc + 1-row balance |
| CUSTOMER | false | `null` | baseline "Tổng chi phí" (W01 3-row) |
| (other) | * | `null` | baseline |

`KH-1col-no-alloc` mode trong `TotalServicePricePanel` giữ nguyên (chưa drop) → STL-CREATE + future reuse vẫn hoạt động; chỉ STL-DETAIL không invoke variant này nữa.

## 4. Regression test

### `src/features/settlement-voucher/components/detail/cost-tab.bug-w02-105.test.tsx` (NEW)

4 assertions:

1. CUSTOMER + !soHasInsurance → `panel-total-price` testid NOT in document; "Tổng chi phí" + 2 dòng dịch vụ/phụ tùng IN document.
2. Baseline KHÔNG render VAT / Cộng sau VAT / Cần thanh toán / Chi tiết theo bên thanh toán rows.
3. CUSTOMER + soHasInsurance → `panel-stl-detail-kh-1col-with-alloc` testid IN document.
4. INSURANCE → `panel-stl-detail-bh-1col` testid IN document.

### `src/features/settlement-voucher/components/detail/cost-tab.insurance-tab-total.test.tsx`

Updated existing test "KH-1col-no-alloc (SO không BH): Tổng thanh toán = customerPayment" → renamed and updated assertions to match CR-20260624-01: assert baseline panel renders, per-payer panel NOT in document. Test này codify hành vi OLD CR-20260612-01 (giờ đã reverse) → cập nhật in-place để khớp source-of-truth hiện tại.

### STL-CREATE non-regression

`insurance-total-panel.bug-w02-082.test.tsx` (existing) giữ assertion STL-CREATE render dual-column 2-col panel (default mode prop). Fix này không chạm STL-CREATE entry point.

## 5. Blast radius

- **Same-FEAT scope (FEAT-INS-STL-DETAIL)**: Chỉ chạm AC-6 panel "Tổng giá dịch vụ" trên màn Chi tiết phiếu quyết toán KH-không-BH. AC-Chỉnh-sửa Edit screen dùng cùng cost-tab → fix tự động apply.
- **Cross-FEAT**: FEAT-INS-STL-CREATE shared `TotalServicePricePanel` component giữ nguyên — không drop `KH-1col-no-alloc` mode (vẫn export, vẫn typed) → no regress STL-CREATE.
- **Boundary consumers**: chỉ garage-web (frontend) — không cascade REST/Kafka/Temporal.
- **Data**: không mất dữ liệu (server tính `finalAmount`/`totalServiceAmount`/`totalPartsAmount` giữ nguyên; chỉ thay rendering).

## 6. Verify

```bash
cd frontend/gf-gms-web
yarn test --run src/features/settlement-voucher/components/detail/cost-tab.bug-w02-105.test.tsx src/features/settlement-voucher/components/detail/cost-tab.insurance-tab-total.test.tsx
yarn lint
yarn build
```

Verification deferred trong session này — pre-existing repo unmerged state (10 unrelated files conflict markers in `service-order/interfaces`, `settlement-voucher/interfaces`, etc.) block vitest collection. Fix code + tests written; cần TEST_GROUP run verify sau khi user resolve unmerged state.

## 7. Related

- BUG-W02-073 (INVALID) — same issue first raise, blocked by spec gap → CR-20260624-01 unblocked → re-raise as 105.
- BUG-W02-058 (cùng panel header wording).
- CR-20260624-01 — Business Authority approval reverse partial CR-20260612-01.
- CR-20260612-01 — original per-payer variant CR; now partially reversed for KH-no-BH.

## 8. Reopen + Re-fix log (REOPENED → RESOLVED)

> Status: REOPENED → RESOLVED (pass-2)
> Trigger: BA reject pass-1 sau khi verify SIT — pass-1 fix sai direction (rơi về tile "Tổng chi phí" 3-row legacy, KHÔNG phải anatomy KH-1col-no-alloc W01 baseline).
> Re-fixed by: agent-fix-garage-web (2026-06-26, pass-2)

### 8.1 Pass-1 mis-diagnosis

Pass-1 đọc bug title literal "phải render baseline 'Tổng chi phí' W01" → set `panelMode=null` cho CUSTOMER+!soHasInsurance → cost-tab.tsx render tile legacy 3-dòng (Tổng thành tiền dịch vụ / Tổng thành tiền phụ tùng / Tổng thành tiền) tại line 417-474.

Bug title viết theo cách BA describe expectation, KHÔNG match spec canonical wording. Spec `Product/ux/figma-web/wave02-ins-stl-detail.md`:

- Line 149-150 (variant matrix):
  ```yaml
  - id: panel_phieuQT_KH_no_BH
    condition: "settlement.payer === 'CUSTOMER' && relatedInsuranceSettlement == null"
    $ref: "wave01-ins-stl-detail.md::TotalServicePricePanel"   # giữ W01 baseline anatomy
  ```
- Line 176 (state table): `TotalServicePricePanel | baseline KH (no BH) | W01 baseline 1-col (Khách hàng) + 2-row balance`

"W01 baseline" trong context spec là **anatomy của `TotalServicePricePanel` mode `KH-1col-no-alloc`** (bảng 2 cột Khoản mục | Khách hàng thanh toán + KHÔNG Phân bổ BH + Cân thanh toán 1 dòng KH + Tổng), KHÔNG phải tile "Tổng chi phí" legacy.

Component `frontend/gf-gms-web/src/features/insurance-allocation/components/total-service-price-panel.tsx:46-52` đã expose mode `KH-1col-no-alloc` đúng anatomy spec.

### 8.2 Root cause thật của symptom "4 dòng 0đ"

Pass-1 KHÔNG diagnose nguồn data. Symptom "4 dòng Dịch vụ / Phụ tùng / VAT / Cộng sau VAT đều 0đ" xảy ra vì:

- Panel `KH-1col-no-alloc` mode RENDER ĐÚNG anatomy spec, nhưng
- Snapshot derivation trong `cost-tab.tsx:347-379` chỉ gọi `mapFlatRootInsuranceAdjustment(data)` — mapper return `breakdownByPayer.customer` từ insurance flat-root scalars (`serviceCustomer`, `partsCustomer`, `vatCustomer`, `totalAfterVatCustomer`)
- Backend gf-accounting/gf-sales chỉ guarantee populate các scalars này cho **insurance settlement** (`settlementType=INSURANCE` hoặc SO có insurance allocation). Với KH-no-BH (settlement KH cho SO không BH), scalars có thể NULL → mapper trả `customer: 0` cho cả 4 metric rows → panel hiển thị 4 dòng 0đ
- Cân thanh toán hiển thị 0đ tương tự vì `customerPayment` cũng có thể NULL cho KH-no-BH

Đây là **data wiring gap** (consumer-level snapshot derivation chưa handle KH-no-BH context), KHÔNG phải panel anatomy bug.

### 8.3 Re-fix direction

1. **Revert pass-1 discriminator** — `panelMode` cho CUSTOMER+!soHasInsurance trả `KH-1col-no-alloc` (đúng spec line 176) thay vì `null`:
   ```ts
   if (data.settlementType !== ESettlementType.CUSTOMER) return null;
   return data.soHasInsurance ? "KH-1col-with-alloc" : "KH-1col-no-alloc";
   ```
2. **Add fallback snapshot synthesis** trong `allocationSnapshot` `useMemo` cho mode `KH-1col-no-alloc`:
   - Ưu tiên insurance customer-side scalars nếu server populate
   - Fallback sang top-level summary scalars (`totalServiceAmount`, `totalPartsAmount`, `taxAmount`, `finalAmount`) khi insurance scalars vắng
   - `customerPayment` fallback sang `finalAmount`; `totalPayment` = `customerPayment` (single-payer view)
3. **Variant matrix sau re-fix**:

| settlementType | soHasInsurance | panelMode | render |
|---|---|---|---|
| INSURANCE | true | `BH-1col` | per-payer BH-only panel |
| CUSTOMER | true | `KH-1col-with-alloc` | per-payer KH-only + 3-row alloc + 1-row balance |
| CUSTOMER | false | `KH-1col-no-alloc` | per-payer KH-only + NO alloc + 1-row balance (W01 anatomy) |
| (other) | * | `null` | baseline "Chi tiết chi phí" tile (orderType!=SERVICE fallback) |

### 8.4 Re-fix changes

- `src/features/settlement-voucher/components/detail/cost-tab.tsx`
  - Discriminator: revert pass-1, return `KH-1col-no-alloc` cho CUSTOMER+!soHasInsurance.
  - `allocationSnapshot` useMemo: synthesize snapshot directly cho mode `KH-1col-no-alloc` (ưu tiên `serviceCustomer`/`partsCustomer`/`vatCustomer`/`totalAfterVatCustomer`/`customerPayment`/`totalPayment`, fallback sang top-level `totalServiceAmount`/`totalPartsAmount`/`taxAmount`/`finalAmount`). Mapper path còn lại nguyên cho BH-1col / KH-1col-with-alloc / 2-col.
  - `<Show when={!panelMode}>` tile legacy giữ nguyên (chỉ render khi orderType!=SERVICE — fallback).
- `src/features/settlement-voucher/components/detail/cost-tab.bug-w02-105.test.tsx` (rewrite)
  - 8 assertions theo 4 case parent spec: KH-no-BH render `KH-1col-no-alloc` panel + 4 dòng non-zero theo customer-side scalars + 1 dòng balance customer + KHÔNG section allocation + fallback từ top-level totals; KH-with-BH render `KH-1col-with-alloc`; INSURANCE render `BH-1col`; orderType!=SERVICE KHÔNG render panel.
- `src/features/settlement-voucher/components/detail/cost-tab.insurance-tab-total.test.tsx`
  - Revert assertion CUSTOMER+!soHasInsurance: assert `panel-stl-detail-kh-1col-no-alloc` rendered + Tổng thanh toán = customerPayment, thay vì assert baseline tile.

### 8.5 Verify

```bash
cd frontend/gf-gms-web
yarn test --run src/features/settlement-voucher/components/detail/cost-tab.bug-w02-105.test.tsx src/features/settlement-voucher/components/detail/cost-tab.insurance-tab-total.test.tsx src/features/settlement-voucher/components/detail/cost-tab.render.test.tsx
yarn lint
yarn build
```

### 8.6 Root cause category

`graphql-data-wiring-missing-kh-no-bh-path` — consumer-level snapshot derivation thiếu nhánh KH-no-BH (snapshot mapper guarantee server-authoritative chỉ cho insurance context). Re-fix synthesize tại consumer thay vì mở rộng shared mapper (giữ mapper invariant: server is authority on read).
