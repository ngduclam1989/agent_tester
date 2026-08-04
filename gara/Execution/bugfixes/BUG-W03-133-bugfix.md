# BUGFIX BUG-W03-133 — Status ACTIVE→INACTIVE confirm dialog on Product Edit

**Bug**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-133` (P2 · `FEAT-CAT-PROD-EDIT`)
**Verify**: `Tracking/WAVE03/verify/BUG-W03-133.verify.md`
**Fixed by**: agent-fix-garage-web (Wave 03 batch 2)
**Status**: `FIX_DONE`

## Root cause

`InternalProductFormPage.onSubmit` fired the update mutation immediately with
no guard on `ACTIVE → INACTIVE` status transitions. FEAT required a confirm
dialog with wording `"Mã sẽ không dùng được cho phiếu mới. Bạn có chắc chắn?"`
before persisting.

## Fix

`frontend/gf-gms-web/src/features/inventory-catalog/internal-product/components/InternalProductFormPage.tsx`

- Introduced `pendingSubmitRef` (holds pending form data) and
  `inactiveConfirmOpen` state.
- Extracted `persistSubmit` as the actual mutation caller.
- `onSubmit` now checks: `isEdit && product.status === ACTIVE && data.status ===
  INACTIVE` → open AlertDialog and defer submit. Otherwise call `persistSubmit`.
- Added `AlertDialog` (shadcn) with:
  - Title `"Xác nhận"`.
  - Description verbatim per FEAT.
  - `Hủy` cancel button (closes dialog, drops pending payload).
  - `Đồng ý` action button (clears pending ref, closes dialog, invokes
    `persistSubmit`).

## Regression scope

- Only Edit + status transition ACTIVE→INACTIVE gated. Create flow and other
  edit paths (name/description/etc.) submit as before.
- INACTIVE→ACTIVE transition: no confirm dialog (matches FEAT wording — only
  ACTIVE→INACTIVE requires warning).

## Follow-ups

- Pattern parity with Group Edit cascade-confirm dialog remains at
  MaterialGroup layer; audit deferred.
