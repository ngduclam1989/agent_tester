# BUGFIX — BUG-W03-135

> [Export sản phẩm] Export vượt 1.000 dòng KHÔNG bị chặn — backend trả `success:true` + `downloadUrl` thật; FE đã sẵn sàng nhận `ERR-INV-045` nhưng không bao giờ nhận được.
> Severity: **P2** · Feature: `FEAT-CAT-PROD-EXPORT` · Boundary: `agg-garage-graph` (BFF) · Status: **RESOLVED** · Date: 2026-07-03

## 1. Summary

Q7 `exportInternalProducts` resolver (module `src/graphql/modules/gf-inventory/catalog-v2/`) issued a `downloadUrl` immediately without any row-count precheck; the row-count enforcement was assumed to live at backend `V2-22` (per `BR-CAT-PROD-024` / `ERR-INV-045`). In the current build gf-inventory does not enforce the cap, so seeding 1050 ACTIVE products and clicking "Xuất file" produced a working `.xlsx` download — the FE guardrail (`ExportButton.tsx` listening for `ERR-INV-045`) was never triggered. Fix adds BFF defense-in-depth: probe `searchInternalProducts` with `size=1` first, and throw canonical `ERR-INV-045` when `totalElements > 1000`, mirroring the existing M14/M15 import cap pattern (`INTERNAL_PRODUCT_IMPORT_MAX_ROWS = 500`) and Q2 tree cap (`MATERIAL_GROUP_TREE_MAX_NODES = 1000`).

## 2. Root cause

The comment on `export-proxy.ts:14` stated "Backend hard-caps at 1000 rows (ERR-INV-045) — BFF passes through", so no BFF-side guard existed. Since the reverse-proxy only reacts on `upstream.status >= 400` from `V2-22` `postStream`, and V2-22 currently returns a valid file for any row count, both the resolver AND the proxy silently completed the flow. Result: `Q7 → downloadUrl → 200 xlsx binary` with 1050 rows exported.

## 3. Fix

Add BFF defense-in-depth 1000-row cap at the Q7 resolver, checked BEFORE token issuance:

1. New constant `INTERNAL_PRODUCT_EXPORT_MAX_ROWS = 1000` alongside the existing tree/import caps.
2. Before `issueExportToken()`, call `catalogV2Service.searchInternalProducts({ ...safeFilter, page: 0, size: 1 }, context)` — `size: 1` avoids pulling any rows into memory, just reads `pageInfo.totalElements`.
3. When `totalElements > 1000`, throw `bffError("ERR-INV-045", ...)` — status 400 (already mapped in `error-code-map.ts` `ERR_INV_HTTP_STATUS`), pass-through code so FE `INV_045` dialog renders unchanged. Details payload `{ total, max }` for observability + FE dialog copy hydration.
4. Filter used for the count probe is the same sanitised subset (`keyword` / `status` / `nature` / `materialGroupId`) — R15 discipline preserved even on the probe.

Also: updated the header comment in `export-proxy.ts` to reflect that the cap now lives at the resolver (backend still forwarded verbatim as second defense line, but no longer relied on).

## 4. Files changed

| File | Change |
|---|---|
| `bffs/agg-garage-graph/src/graphql/modules/gf-inventory/catalog-v2/catalog-v2.resolver.ts` | Added constant `INTERNAL_PRODUCT_EXPORT_MAX_ROWS = 1000`. Inserted row-count probe + `ERR-INV-045` throw in `exportHandlers.exportInternalProducts` before token issuance. |
| `bffs/agg-garage-graph/src/graphql/modules/gf-inventory/catalog-v2/export-proxy.ts` | Updated header comment — cap now enforced at Q7 resolver; proxy still forwards backend errors verbatim. No behavior change. |
| `bffs/agg-garage-graph/src/graphql/modules/gf-inventory/catalog-v2/catalog-v2.regression.ts` | Existing `scExportTokenRoundtrip` scenario updated to stub `searchInternalProducts` (totalElements=42) so the resolver reaches token issuance. New scenario `scExportRowCap` covers 3 cases: overflow (1050 → ERR-INV-045 + details.total/max + no token issued + probe filter sanitised), boundary (exactly 1000 → success), sub-cap (500 → success). Wired into `main()`. |

## 5. Regression / verification

- `npm run build` — pass (TypeScript strict, no new errors).
- `npm run test:catalog-v2-contract` — **all 8 scenarios pass**, including the new `[9] BUG-W03-135 — Q7 export defense cap` scenario (11 new assertions):
  - `exportInternalProducts throws ApiClientError when totalElements > 1000` ✓
  - `export cap error code = ERR-INV-045` ✓
  - `export cap HTTP status = 400` ✓
  - `details.total = 1050` ✓
  - `details.max = 1000` ✓
  - `count probe forwards keyword` / `status` / `size=1` / `strips sort` ✓ ✓ ✓ ✓
  - `no export token issued when export exceeds cap` ✓
  - `boundary — exactly 1000 rows issues a downloadUrl` ✓
  - `sub-cap — 500 rows issues a downloadUrl` ✓
- `npx eslint src/graphql/modules/gf-inventory/catalog-v2/` — clean (0 errors). `npm run lint` at repo root prints many pre-existing errors on `dist/**` (`.js` compiled output) — unrelated to this fix, ignore-list drift in `eslint.config.js`.

## 6. Non-goals / out of scope

- Backend `gf-inventory` V2-22 hard-cap — belongs to `agent-fix-gf-inventory`. Not touched here (Rule #1 boundary isolation). BFF cap is defense-in-depth; when backend fix lands, the two enforcement points remain compatible (same code + status). Recommend follow-up bug on gf-inventory for the missing backend enforcement, tracked separately.
- FE dialog wording / `ExportButton.tsx` — already correct per verify §2.3 ("FE đã sẵn sàng xử lý đúng `ERR-INV-045`"). No FE change required.
- Extending the pattern to other exports (SO / quotation) — verify §6 blast-radius note; future waves.

## 7. Blast radius

- FEAT-CAT-PROD-EXPORT only. No other resolver / endpoint / schema touched.
- No breaking change: contract shape (`InternalProductExportFileUrlResponse` union with `ErrorResponse`) unchanged; new error surface (`ERR-INV-045` union branch) is already declared and consumed by FE.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-03 | 1 | agent-fix-agg-garage-graph | Initial fix — BFF defense-in-depth 1000-row cap on Q7 `exportInternalProducts`. Regression test added (11 assertions). Build + catalog-v2 contract test pass. |
