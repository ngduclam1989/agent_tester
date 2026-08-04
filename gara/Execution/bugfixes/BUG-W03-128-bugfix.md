# BUGFIX BUG-W03-128 — Import result view sau commit

**Bug**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-128` (P2 · `FEAT-CAT-PROD-IMPORT`)
**Verify**: `Tracking/WAVE03/verify/BUG-W03-128.verify.md`
**Fixed by**: agent-fix-garage-web (Wave 03 batch 2)
**Status**: `FIX_DONE`

## Root cause

`ImportInternalProduct.onSuccess` navigated to `/internal-products` immediately
after `importInternalProducts` mutation resolved. AC-8 required a "Kết quả
import danh mục" view with 4 stats (Tổng dòng / Tạo mới / Bỏ qua - lỗi / Thời
gian) and a "Tải file lỗi" + "Đóng" pair. Users lost access to error-row
download after commit.

## Fix

`frontend/gf-gms-web/src/features/inventory-catalog/internal-product/components/import/index.tsx`

- Added `importResult` + `commitStartedAt` + `importDurationMs` local state.
- `useImportInternalProducts.onSuccess` now stores the mutation payload into
  `importResult` and records elapsed milliseconds; only falls back to redirect
  if the payload is empty (defensive).
- `onSubmit` sets `commitStartedAt = Date.now()` right before firing mutation.
- New early-return `if (importResult)` renders a result view inside the same
  `Container` (no new page/component — avoids FM-018): stats cards for `total`,
  `importedCount`, `failedCount`, and duration; a `"Tải file lỗi"` button
  (disabled when no error rows) invoking `handleDownloadWithErrors` scoped to
  the error rows only; a `"Đóng"` button that clears result state and
  navigates back to the list.

## Regression scope

- Same feature. No new shared component. Existing preview flow (`hasUploaded`
  path) unchanged.
- If BFF returns no `data` payload (edge), we still redirect — matches prior
  behavior.

## Follow-ups

- Figma pixel match for the result cards is deferred to QC visual review.
- Duration is client-side stopwatch (mutation start → success callback).
  Server-authoritative timing is not currently exposed by BFF.

## Retry 2026-07-03 (rule discipline cleanup)

Original run landed the working stat view but embedded rule violations. This retry
keeps the behavioural fix and reconciles discipline in the same file
(`frontend/gf-gms-web/src/features/inventory-catalog/internal-product/components/import/index.tsx`):

- Removed the 3-line `onSuccess` docblock that cited bug / AC IDs and paraphrased
  the code below it — a triple hit of comment-rules §1 (bug/ticket ID), §5
  (multi-paragraph docblock), and §6 (AC-ID design coupling). Also dropped the
  "Fallback:" line since the control-flow already tells that story.
- Stripped the two legacy `// AC-3b — …` markers on the empty-file and cap-500
  guards (comment-rules §1 + §6). Behaviour untouched — the toast titles already
  convey the guard intent.
- Extracted the 4 sibling stat cards on the result view into a local
  `stats: { label; value; valueClass? }[]` array declared right before the JSX
  return, then rendered via `.map()` keyed on `stat.label`, using `cn()` for the
  optional colour class. Complies with repo-rules §UI Repeated JSX → Array + Map
  (≥4 same-type siblings) — same shape the rule origin note describes for
  `InternalProductDetailPage` / `MaterialGroupDetailPage`.

Adjacent cleanup made in the same session to unblock the diff-scoped
comment-rules gate (touched only because the previous session left a working-tree
docblock committed against `HEAD`, so the wrapper's HEAD-anchored base picked it
up): condensed a 4-line docblock in
`src/components/share/navigates/auth-sync-manager.tsx` to a single WHY line
describing why hard reload is required on logout.

No behavioural or contract change beyond BUG-W03-128 scope. Regression coverage
still relies on the manual verify steps in `Tracking/WAVE03/verify/BUG-W03-128.verify.md`.
