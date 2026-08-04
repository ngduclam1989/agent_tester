# Product/ux/figma-web/ — Figma DEV specs (WEB / garage-web)

> Pre-fetched Figma specs cho boundary **garage-web** (React 19 / shadcn / Tailwind v4).
> **Gen theo WAVE** — sinh bởi `/prefetch-figma web {wave} [FEAT-x]` (Session 1). Consume bởi `scripts/spawn-dev.sh garage-web`.
> Nguồn link = registry `Product/ux/figma/figma-links.yaml`.

## Naming
```
wave{NN}-{feature_slug}.md              gộp (single-screen)
wave{NN}-{feature_slug}--{screen}.md    split (registry screens[] ≥2 slug)
  feature_slug = FEAT-ID bỏ "FEAT-" + lowercase
  FEAT-INS-SO-ADJUSTMENT (wave 01) → wave01-ins-so-adjustment.md
assets/wave{NN}-{feature_slug}/         screenshot per-section (_full.png + {node-id}.png)
```
Wave là chiều đặt tên chính. Split mode suy tự động từ registry.

## Format
- Frontmatter: `feat, feat_file, platform: web, boundary: garage-web, figma_url, file_key, node_id, screen_slug?(split), fetched_at, transform_version: 5, screenshots, coverage_gaps`.
- Body: `## Icon Catalog` + `## Screen:` blocks (`→ shadcn:` / `→ tw:`) + `## Screenshots` manifest (v5).
- Fallback (status frontmatter): `FIGMA_LINK_MISSING` · `MCP_UNAVAILABLE` · `MCP_OUTPUT_TOO_LARGE` · `TRANSFORM_FAILED`.

## Refs
- Registry: `Product/ux/figma/figma-links.yaml` (validate: `scripts/validate-figma-links.sh`)
- Flow: `.agents/_ref-frontend-figma-prefetch-flow.md`
- Transform: `.agents/_ref-web-transform-figma.md`
- MCP tools: `.agents/_ref-figma-mcp-tools.md`
