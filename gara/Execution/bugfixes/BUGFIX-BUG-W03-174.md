# BUGFIX — BUG-W03-174

> Field "Phương pháp tính giá" (pricing method) trên màn Chi tiết sản phẩm (mobile) hiển thị trống thay vì default "Bình quân cuối kỳ" (BR-CAT-PROD-010), sai lệch parity với web Detail và với dữ liệu thật từ BE.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-06

## 1. Summary

`InternalProductDetailPage`'s `_GeneralInfoCard` hard-coded the "Phương pháp tính giá" row's value to the literal `'--'` — a placeholder added during the earlier `BUG-W03-053` cycle with an explicit comment noting the field "has no costing-method field yet (never fetched from BFF)". The BFF already returns `pricingMethod: "PWA"` correctly (confirmed against `Architecture/api/agg-garage-graph-graphql.md`'s `getInternalProduct` response example + `enum PricingMethod { PWA SI FIFO MA }`), and web Detail already renders it correctly from the same data — the gap was entirely on the mobile client's fetch/parse/bind path.

## 2. Root cause

Confirmed candidate **(A)** from `verify/BUG-W03-174.verify.md` §3.1 (query selection-set gap, same pattern-family as `BUG-W03-153`) — independently re-derived by reading the source directly (per `LL-MOB-018`, not trusting the bug report's claim verbatim):

- `getInternalProduct` (Q5, `lib/core/services/graphql/documents/inventory_catalog_document.dart`) never selected `pricingMethod` in its `data { ... }` block.
- `InternalProductDetail` (`lib/core/models/inventory_catalog/internal_product_models.dart`) had no `pricingMethod` field at all — even if the BFF sent it, there was nowhere to parse it into.
- With no model field to read, the UI row (added in `BUG-W03-053` alongside the other 3 `_GeneralInfoCard` attributes) could only render a static placeholder.

Candidate (B) (enum-mapper gap for code `"PWA"`) was ruled out — there was no enum/mapper at all prior to this fix, not merely a missing case.

## 3. Fix

Per the bug's explicit correction (2026-07-06): fetch/map the real value from the BE — do **not** hard-code a static Vietnamese string, since `BR-CAT-PROD-010` itself notes the field is "locked for now, reserved for future expansion" (a hard-coded string would silently go stale the moment the rule unlocks other values).

- **`lib/core/services/graphql/documents/inventory_catalog_document.dart`** — added `pricingMethod` to the `getInternalProduct` query's `data { ... }` selection set (right after `nature`, matching field order in the ground-truth contract doc).
- **`lib/core/models/inventory_catalog/internal_product_status.dart`** — added a new `PricingMethod` enum (`pwa`/`si`/`fifo`/`ma`), mirroring the existing `InternalProductStatus`/`InternalProductType` enums already in this file: `jsonValue` (wire codes `PWA`/`SI`/`FIFO`/`MA` per the R13 rename, `Architecture/data/gf-inventory-data-model.md` line ~441), `label` (Vietnamese display text per `BR-GF-INVENTORY-CATALOG.md`/`BR-CAT-PROD-010`: "Bình quân cuối kỳ"/"Đích danh"/"Nhập trước xuất trước"/"Bình quân tức thời"), and a case-insensitive `fromJson` returning `null` for missing/unrecognized codes (no crash).
- **`lib/core/models/inventory_catalog/internal_product_models.dart`** — added `pricingMethod` (`PricingMethod?`) to `InternalProductDetail`: constructor param, `fromJson` (`PricingMethod.fromJson(json['pricingMethod'])`), `toJson`, and `mock()` (set to `PricingMethod.pwa`, so the loading skeleton stays representative).
- **`lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart`** — `_GeneralInfoCard`'s costing-method row now binds `value: detail.pricingMethod?.label ?? '--'` instead of the hard-coded literal `'--'`; removed the now-obsolete `BUG-W03-053` "field not fetched yet" comment.
- **Scope note**: did *not* touch the `searchInternalProducts` (Q4, list) query or `InternalProductItem` model — the list card does not display this field per the current AC/UI, so adding it there would be out-of-scope expansion for this bug.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/core/services/graphql/documents/inventory_catalog_document.dart` | Added `pricingMethod` to `getInternalProduct` query selection set |
| `mobile/gf-garage-app/lib/core/models/inventory_catalog/internal_product_status.dart` | **New** `PricingMethod` enum (`pwa`/`si`/`fifo`/`ma`) with `jsonValue`/`label`/`fromJson` |
| `mobile/gf-garage-app/lib/core/models/inventory_catalog/internal_product_models.dart` | Added `pricingMethod` field to `InternalProductDetail` (ctor + `fromJson` + `toJson` + `mock()`) |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | Bound the costing-method row to `detail.pricingMethod?.label ?? '--'`; removed stale placeholder comment |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_174_test.dart` | **New** — regression test (see §5) |

## 5. Regression / verification

`internal_product_detail_bug_174_test.dart` (static-source + pure-Dart unit tests, following the same static-source-assertion convention as this page's `BUG-W03-053`/`BUG-W03-092` regression tests — no DI-mocked widget pump precedent for this page):

- GraphQL selection-set assertion: `getInternalProduct`'s query body (sliced from source) contains `pricingMethod`.
- `PricingMethod` enum: `fromJson` maps all 4 wire codes (`PWA`/`SI`/`FIFO`/`MA`) to the correct Vietnamese labels; case-insensitive parsing; `null`/unrecognized-code input returns `null` (no crash); `jsonValue` round-trips for every enum value.
- `InternalProductDetail.fromJson` — **data-render fix, fixture-based per Test Coverage Contract**: (1) BE-default fixture (`pricingMethod: "PWA"`) parses to `PricingMethod.pwa` / label "Bình quân cuối kỳ"; (2) field **vắng** (missing from the JSON map entirely) parses to `null`; (3) field present but **null** parses to `null`, no crash; (4) `toJson()` round-trips the wire code back out; (5) `mock()` carries a non-null `pricingMethod` (loading-skeleton parity).
- Page-source assertion: `_GeneralInfoCard` binds `value: detail.pricingMethod?.label ?? '--'` (not the old hard-coded literal `'--'`) — regression guard against reverting to the `BUG-W03-053`-era placeholder.
- `python3 scripts/check_graphql_sdl_fidelity.py`: still reports 14 pre-existing mismatches — confirmed via `git stash` that this failure exists identically **before** this fix (unrelated to this change; the script's hardcoded `GROUND_TRUTH` inline-fragment type names predate the `BUG-W03-056` postmortem already documented at the top of `inventory_catalog_document.dart`, which independently re-verified the current suffix-first `ApiResponse{DataType}` naming as correct against the live BFF source). This fix only added a scalar field to an existing, already-passing-in-spirit query — it did not touch any response-union type name. Flagged in `needs_review` rather than "fixed" here, since re-baselining the script's `GROUND_TRUTH` is out of scope for this bug.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain matching the repo's `^3.11.0` SDK constraint on this machine (`DEBT-W01-MOBILE-BUILD-ENV`; the only `flutter` binary present resolves to Dart 3.8.1, and `flutter pub get` fails version solving). All 4 touched files were manually re-read end-to-end for syntax/type correctness; new field/enum follows the exact structural pattern of the pre-existing `InternalProductStatus`/`InternalProductType` enums and their `InternalProductDetail` wiring.
- KG update: **skipped** — no new entity/route/cubit; `pricingMethod` is a new scalar field on an already-registered type (`InternalProductDetail`, `garage-mobile.knowledge-graph.yaml` §1 TYPES), not a new domain concept warranting a KG diff for this narrowly-scoped display bug.

## 6. Non-goals / out of scope

- Did not add `pricingMethod` to `searchInternalProducts` (Q4 list query) / `InternalProductItem` — not displayed on the list card per current AC; would be scope expansion.
- Did not re-baseline `scripts/check_graphql_sdl_fidelity.py`'s `GROUND_TRUTH` inline-fragment type names — pre-existing, unrelated drift (see §5); flagged in `needs_review` for a separate follow-up.
- Did not re-audit `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DETAIL.md` (flagged by the verify doc §3.3 as SAI/OUTDATED re: this field's existence) — explicitly called out by the verify doc as a separate, non-blocking follow-up, not part of this bug's fix scope.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-06 | 1 | agent-fix-garage-mobile | Fix — added `pricingMethod` to `getInternalProduct` GraphQL selection set; added `PricingMethod` enum + wired it through `InternalProductDetail`; bound the mobile Detail page's costing-method row to the real BE value instead of a hard-coded `'--'` literal. New regression test (11 assertions across query/enum/model/page-source). `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). KG update skipped (no entity/route/cubit change). |
