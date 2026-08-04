# BUGFIX BUG-W03-123 — Empty state wording variant on MaterialGroupListPage

**Bug**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-123` (P3 · `FEAT-CAT-GRP-LIST`)
**Verify**: `Tracking/WAVE03/verify/BUG-W03-123.verify.md`
**Fixed by**: agent-fix-garage-web (Wave 03 batch 2)
**Status**: `FIX_DONE`

## Root cause

`MaterialGroupListPage` passed no `description` prop to `TablePagination`, so
the shared `NoData` empty-state defaulted to `"Không có dữ liệu"` in both the
"tenant has zero groups" case (EC-1) and the "search/filter with no matches"
case (EC-4). AC required distinct wording.

## Fix

`frontend/gf-gms-web/src/features/inventory-catalog/material-group/components/MaterialGroupListPage.tsx`

- Compute `hasSearchOrCustomFilter` from `filterHook.filter`:
  - true when `input` (search keyword) is non-empty, or
  - status filter differs from the default `MaterialGroupStatus.ACTIVE`, or
  - `parentId` filter is set.
- Pick `emptyStateWording`:
  - `"Không tìm thấy kết quả phù hợp"` (EC-4) when `hasSearchOrCustomFilter`.
  - `"Không có dữ liệu"` (EC-1) otherwise.
- Pass through `<TablePagination description={emptyStateWording} />` — prop
  spreads to underlying `Table` component (already supports `description`).

## Regression scope

- Same page only. `TablePagination` API unchanged; other callers still default
  to `"Không có dữ liệu"`.

## Manual verify (QC)

Per verify.md §4:

1. Login tenant rỗng → List → EC-1 wording.
2. Search `XYZ999` → EC-4 wording.
3. Filter status=INACTIVE with no matches → EC-4 wording.
4. Default view (status=ACTIVE, no keyword) → EC-1 wording.
