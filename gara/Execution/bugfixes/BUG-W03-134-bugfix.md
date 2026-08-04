# BUGFIX BUG-W03-134 — ConversionUnitDialog reject main unit

**Bug**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-134` (P2 · `FEAT-CAT-PROD-CREATE + FEAT-CAT-PROD-EDIT`)
**Verify**: `Tracking/WAVE03/verify/BUG-W03-134.verify.md`
**Fixed by**: agent-fix-garage-web (Wave 03 batch 2)
**Status**: `FIX_DONE`

## Root cause

`ConversionUnitDialog` built its `existingCodes` `Set` only from
`existingUnits` (previously-added conversion rows). It did not include the
`mainUnitCode` from the product's General Info tab. `superRefine` therefore
allowed a conversion row whose unit code matched the product's main unit
(violating `BR-CAT-PROD-011` / `ERR-INV-014`).

## Fix

Files changed (3):

- `.../internal-product/components/ConversionUnitDialog.tsx`
  - New optional prop `mainUnitCode?: string`.
  - `existingCodes` now unions in `mainUnitCode` when present (dep tracked in
    `useMemo`).
- `.../internal-product/components/InternalProductFormTabs.tsx`
  - `useWatch` for `mainUnitCode`.
  - Threads `mainUnitCode` into `ConversionUnitDialog` prop (Create + Edit
    both go through this component).
- `.../internal-product/components/sections/ConversionUnitSection.tsx`
  - Accepts and forwards `mainUnitCode` to the same dialog (used by
    DetailPage, `readOnly` today but keeps parity for future editable use).
- `.../internal-product/components/InternalProductDetailPage.tsx`
  - Passes `data.mainUnitCode` into `ConversionUnitSection`.

## Regression scope

- Blast radius = 3 code sites + 1 detail page. Prop is optional, so no
  new dialog error is introduced when `mainUnitCode` is empty (e.g. Create
  flow before user picks main unit).
- Existing "conversion vs conversion" duplicate detection unchanged.

## Manual verify (QC)

- Create: pick main unit `m2` → open "Thêm ĐVT quy đổi" → picking `m2`
  triggers the `ERR-INV-014` inline error message from `resolveInventoryError`.
- Edit: same behavior on a persisted product.
- Without main unit selected: dialog behaves as before (no false rejection).

## Follow-ups

- BE defense-in-depth check remains an escalation item (`agent-fix-gf-inventory`
  to confirm the same rule server-side).
