# BUGFIX BUG-W01-287 — SO Detail panel "Phân bổ Bảo hiểm" đảo thứ tự 2 dòng

> **Status**: RESOLVED.
> **Severity**: P4 (cosmetic layout — không ảnh hưởng business calc).
> **Boundary**: garage-web (frontend).
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: FEAT-INS-SO-ADJUSTMENT AC-10, BR-INS-SO-ADJ-001, figma
> canonical `Product/ux/figma-web/wave01-ins-so-adjustment--detail.md`
> L184-188.

---

## 1. Failure mode

Trên SO Detail BH (vd `PDV-20260615-01091`), panel "Tổng giá dịch vụ" →
section "Phân bổ Bảo hiểm" (Nhóm C, AC-10) hiển thị 5 dòng theo thứ tự:

1. CK liên kết BH — Vật tư (− xanh)
2. CK liên kết BH — Công dịch vụ (− xanh)
3. **Khấu hao vật tư / thay mới (+ đỏ)**  ← lệch
4. **Giảm trừ bồi thường (+ đỏ)**           ← lệch
5. Khấu trừ BH (+ đỏ)

Figma canonical:

1. CK liên kết BH — Vật tư
2. CK liên kết BH — Công dịch vụ
3. **Giảm trừ bồi thường**
4. **Khấu hao vật tư / thay mới**
5. Khấu trừ BH

→ Row 3 và Row 4 swap so với figma. P4 cosmetic — dấu ±/màu và giá trị
vẫn đúng, chỉ thứ tự hiển thị sai.

## 2. Root cause

`adjustments` array trong `insurance-allocation/components/
allocation-totals-server.tsx` (variant server-data dùng bởi SO Detail qua
`service-order/components/detail/index.tsx:264 <AllocationTotalsServer
data={data} />`) hardcode thứ tự sai:

```ts
const adjustments = [
  { key: "discountMaterial", ... },
  { key: "discountLabor", ... },
  { key: "depreciation", ... },          // ← canonical figma row 4
  { key: "claimReduction", ... },        // ← canonical figma row 3
  { key: "insuranceDeductible", ... },
];
```

Sibling variant `total-service-price-panel.tsx` (preview-mode dùng bởi
SO Edit) đã có thứ tự đúng — không touch.

## 3. Fix

Swap row 3 ↔ row 4 trong `adjustments` array:

```ts
const adjustments = [
  { key: "discountMaterial", ... },
  { key: "discountLabor", ... },
  { key: "claimReduction", ... },        // ← figma row 3
  { key: "depreciation", ... },          // ← figma row 4
  { key: "insuranceDeductible", ... },
];
```

Comment trong code mô tả figma canonical order để future maintainers không
swap lại.

## 4. Blast radius

- **Inbound**: SO Detail page (`service-order/components/detail/index.tsx`)
  + STL Detail tab "Chi phí" (cả 2 surfaces dùng cùng component này).
- **Outbound**: none — pure display.
- **Sign + color** không đổi (`ALLOCATION_SIGNS` constant + `signColorClass`
  helper key bằng `row.key`, không phụ thuộc array index).

## 5. Regression test

`insurance-allocation/components/allocation-totals-server.order.test.tsx`
(2 specs):

1. Renders rows in figma order: `discountMaterial → discountLabor →
   claimReduction → depreciation → insuranceDeductible`.
2. `claimReduction` row precedes `depreciation` row in DOM (compareDocumentPosition).

Existing tests `allocation-totals-server.render.test.tsx` continue passing
(sign + color + zero-state assertions không phụ thuộc thứ tự).

## 6. Files changed

- `frontend/gf-gms-web/src/features/insurance-allocation/components/allocation-totals-server.tsx`
- `frontend/gf-gms-web/src/features/insurance-allocation/components/allocation-totals-server.order.test.tsx` (NEW)

## 7. Verification

- `npx vitest run src/features/insurance-allocation/components/allocation-totals-server.*.test.tsx`
  — 6/6 pass (4 existing + 2 new).
- `npx tsc -b` — clean.

## 8. Follow-up

Mobile parity check: `BUG-W01-275` cùng screen scope — kiểm tra
garage-mobile SO Detail có BH có cùng pattern không; nếu có log riêng
bug khác cho mobile parity.
