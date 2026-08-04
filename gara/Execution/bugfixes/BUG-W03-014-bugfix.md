# BUGFIX — BUG-W03-014

> KG `garage-mobile.knowledge-graph.yaml` chưa update — Rule #15 (3-in-1) + PKG-W03 §5 gate
> Severity: **P1** · Boundary: `garage-mobile` (+ KG YAML) · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` was missing domain-level metadata for W03 Inventory Catalog: no `types:` entries for `MaterialGroup`/`InternalProduct`/`MaterialGroupStatus`/`InternalProductStatus`, no GraphQL ops registered in `§6 API INTEGRATION`, no domain glossary terms, no permission-matrix action. Additionally, the metadata `version:` field was still `11` even though the 2026-06-30 change_log entry text explicitly claimed "Bump version 11->12" — the field was never actually incremented, an unfulfilled Rule #9/#15 3-in-1 violation carried over from the prior cycle.

Note: `§2 PAGES` (8 routes + cubit refs) was **already** present from the 2026-06-30 append cycle — verified via grep before editing to avoid duplicate append (per brief's explicit "don't clobber, build on top" instruction).

## 2. Root cause

- Prior DEV/FIX cycles (2026-06-30) appended pages/routes/cubits to `implementation.pages` but never touched `implementation.types`, `implementation.api.{queries,mutations}`, `implementation.domain_glossary`, or `implementation.permission_matrix` for the new domain.
- The version bump described in change_log text was written before the actual `metadata.version:` field edit, and the field edit was dropped/forgotten — classic 3-in-1 (version + last_reviewed + Change Log as one atomic unit) violation caught by REVIEW.
- `last_reviewed` field has never existed anywhere in this KG file's schema (verified via full-file grep) — added it now per Critical Rule #9.

## 3. Files changed

| File | Change |
|---|---|
| `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` | (1) `metadata.version: 11 → 13` (completes missed 11→12 bump + new 12→13 for this fix) + added `metadata.last_reviewed: "2026-07-01"` (new field). (2) `implementation.types` — added `MaterialGroup`, `InternalProduct`, `MaterialGroupStatus`, `InternalProductStatus` (source + fields + `dart_ref` pointer to actual model files, verified against `lib/core/models/inventory_catalog/*.dart`). (3) `implementation.api.queries` — added `searchMaterialGroups`, `getMaterialGroup`, `searchInternalProducts`, `getInternalProduct` (verbatim op names cross-checked against `InventoryCatalogRepository` `gql(InventoryCatalogDocument.*)` calls). (4) `implementation.api.mutations` — added `createMaterialGroup`, `updateMaterialGroup`, `deleteMaterialGroup`. (5) `implementation.domain_glossary` — added 3 VN terms (Nhóm vật tư hàng hoá / Mã sản phẩm nội bộ / Inventory Hub). (6) `implementation.permission_matrix` — added `manage-inventory-catalog: [garage-owner, accountant]`. (7) `change_log` — appended new entry documenting this fix. |

## 4. Regression / verification

- YAML parse check (`python3 -c "import yaml; yaml.safe_load(...)"`) → valid, no syntax errors.
- Verified `implementation.types` keys = `['MaterialGroup', 'InternalProduct', 'MaterialGroupStatus', 'InternalProductStatus']`.
- Verified `api.queries`/`api.mutations` tail contains the 7 new ops with exact names matching `mobile/gf-garage-app/lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` (no invented op names).
- Verified `permission_matrix['manage-inventory-catalog']` present.
- `change_log` list length 16 (was 15) — 1 new entry appended, none removed/rewritten (no clobber of the staged 2026-06-30 entries confirmed via `git diff --cached` review before editing).

## 5. Non-goals / out of scope

- Did **not** touch ARCHITECTURE-owned top-level `entities:` / `business_rules:` / `permissions:` sections — those require CR MAJOR + Architecture Authority approval per file's OWNERSHIP MODEL header; MaterialGroup/InternalProduct are implementation-level domain types, not client-generic architecture value-objects like `SessionState`.
- Did not re-derive or duplicate the `pages:` section (already complete from 2026-06-30 cycle).
- `MaterialGroupDeleteCubit` not added as a standalone `pages:` entry — it's a dialog/handler cubit (no dedicated route), not a page; out of scope for the page-routes section.

## 6. Follow-up

- None — KG update is self-contained (design-artifact only, no downstream code dependency).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Initial fix — completed unfulfilled version bump (11→12) + new 12→13 bump for entities/API-ops/glossary/permission-matrix registration. YAML validated. |
