---
feat: FEAT-CAT-PROD-CREATE
feat_file: Product/features/FEAT-CAT-PROD-CREATE.md
platform: mobile
boundary: garage-mobile
status: FIGMA_LINK_MISSING
fallback: Product/ux/UX-FLOW-INVENTORY-CATALOG.md
checked_at: 2026-06-29T08:55:00+07:00
transform_version: 7
---
## Status: FIGMA_LINK_MISSING
Reason: registry `Product/ux/figma/figma-links.yaml` waves["03"].FEAT-CAT-PROD-CREATE không khai sub-block `mobile:` — feature out-of-scope cho garage-mobile trong W03 (per CR-1782373204 2026-06-25: mobile Mã SP nội bộ = view-only; Create/Delete/Edit/Import là web-only).

Fallback: `Product/ux/UX-FLOW-INVENTORY-CATALOG.md` (behavior spec) + `Product/features/FEAT-CAT-PROD-CREATE.md` §3 AC.

> Nếu W04+ scope mở rộng cho mobile create mã SP nội bộ → bổ sung FEAT §UI/UX Reference mobile URL + re-run `/prefetch-figma mobile {wave}`.
