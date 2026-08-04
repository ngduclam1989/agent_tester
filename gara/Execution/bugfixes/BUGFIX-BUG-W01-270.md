# BUGFIX BUG-W01-270 — STL Detail "Bảng chi phí" cell renderer sai + footer Tổng thiếu SUM 2 cột

> **Status**: RESOLVED.
> **Severity**: P2.
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-260 (Phân bổ BH panel — different display rule, no copy), BUG-W01-269 (SO Edit/Detail panel — khác section).

---

## 1. Failure mode

Tại STL Detail (vd `SET-20260612-00002`) tab "Bảng chi phí", cả 2 bảng
"Dịch vụ thực hiện" + "Phụ tùng sử dụng":

- Cột "Chiết khấu" luôn hiển thị "0đ" — không switch theo mode (PERCENT
  hiển thị "{value}%", AMOUNT hiển thị formatVND, empty hiển thị "0đ").
- Cột "Thuế" hiển thị `taxAmount` VND (vd "184.000đ") thay vì rate %
  (vd "10%").
- Footer Tổng chỉ render cột Thành tiền; 2 cột Chiết khấu + Thuế trống.

Expected (per spec ảnh 2 BA 2026-06-12): Service row 1 "Bảo dưỡng chuyên sâu"
CK="5%" Thuế="10%" Thành tiền="10.450.000đ"; row 2 "Thay dầu xe" CK="10.000đ"
Thuế="8%" Thành tiền="1.058.400đ"; footer Tổng CK="520.000đ" Thuế="1.028.400đ"
Thành tiền="11.508.400đ".

## 2. Root cause

`src/features/insurance-settlement/components/detail/cost-tab.tsx`:

- Service + Parts rows render cells trực tiếp `formatVnd(item.discountAmount ?? 0)`
  (không switch mode) và `formatVnd(item.taxAmount ?? 0)` (VND thay vì rate %).
- Footer dùng helper `TotalRow colSpan={8/10}` collapse các cột → cell
  Chiết khấu + Thuế bị nuốt vào colSpan.
- `InsuranceSettlementLineItem` interface chỉ có `discountAmount`/`taxAmount` —
  thiếu `discountPercent`/`taxPercent`. GraphQL query chưa request 2 field này.

## 3. Fix

1. **Interface** (`insurance-settlement/interfaces/index.ts`): bổ sung
   `discountPercent?: number` + `taxPercent?: number` trên `InsuranceSettlementLineItem`
   kèm JSDoc giải thích mode-resolved rule.
2. **GraphQL query** (`use-insurance-settlement-detail.ts`): request thêm
   `discountPercent` + `taxPercent` cho cả `items` (services) và `parts` (Surface B).
3. **Raw types** (`IRawLineItemService` + `IRawLineItemPart`): bổ sung 2 field tương ứng.
4. **Mappers** (`mapServiceLine` + `mapPartLine`): pass `num(item.discountPercent)`
   + `num(item.taxPercent)` xuống view-model.
5. **`cost-tab.tsx` cell renderer**:
   - `renderDiscountCell(item)` — switch: `discountPercent` → "{v}%", else
     `discountAmount` → `formatVnd(discountAmount)`, else → "0đ".
   - `renderTaxCell(item)` — `${item.taxPercent ?? 0}%`.
6. **Footer**: viết explicit `<ServiceFooterRow>` + `<PartsFooterRow>`
   render đủ cells với `sumDiscount` (mode-aware aggregator: PERCENT → rate × subtotal,
   AMOUNT → cộng `discountAmount`), `sumTax` (Σ `taxAmount` VND), `sumFinal`
   (Σ `finalAmount` VND). Service: 9 cột; Parts: 11 cột (giữ Khấu hao VT cell trống
   theo rule BUG-W01-267/268 — % per-row, không SUM).

## 4. Regression test

`src/features/insurance-settlement/components/detail/cost-tab.render.test.tsx`
describe "BUG-W01-270" gồm 3 specs:

- `renders chiết khấu PERCENT → '{v}%', AMOUNT → formatVND, empty → '0đ'` —
  test data 2 rows mix PERCENT 5% + AMOUNT 10.000.
- `renders thuế as taxPercent rate, NOT taxAmount VND` — assert text contains
  "10%" và "8%".
- `renders explicit footer Tổng row SUM 3 cột` — assert `[data-testid="ft-discount"]`,
  `[data-testid="ft-tax"]`, `[data-testid="ft-final"]` đều render đúng SUM.

Test data sử dụng BUG-W01-270.verify.md §1 Preconditions (expected screenshot).

## 5. Blast radius

- Touched 4 files trong feature `insurance-settlement`:
  `interfaces/index.ts`, `hooks/use-insurance-settlement-detail.ts`,
  `components/detail/cost-tab.tsx`, `components/detail/cost-tab.render.test.tsx`.
- Server-side: agg GraphQL `getSettlementByCode` đã expose `discountPercent`/`taxPercent`
  (xem `use-get-settlement-by-code.ts` lines 110-113, 134-136). No backend change.
- Pattern mirror `settlement-voucher/components/detail/cost-tab.tsx` (good reference
  using same fields, established UX).

## 6. Verification

- `npm run build` → exit 0.
- Lint touched files → clean.
- Render tests blocked bởi pre-existing jsdom infra issue
  (`html-encoding-sniffer` ESM require) — tests viết đầy đủ, sẽ chạy sau khi
  infra fixed (BUG-VERIFY-MECHANISM-V2 backlog).
