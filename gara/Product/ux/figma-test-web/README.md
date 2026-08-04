# Product/ux/figma-test-web/ — Figma oracle (WEB / garage-web)

> Design-conformance oracle cho `agent-test-ui` verify UI web khớp Figma (5 cấp).
> **Gen theo WAVE** — sinh bởi `/prefetch-figma-oracle web {wave} [FEAT-x]`. Consume bởi `scripts/spawn-test.sh ui garage-web`.
> Nguồn link = registry `Product/ux/figma/figma-links.yaml`.

## Naming
```
wave{NN}-{feature_slug}-oracle.md              gộp
wave{NN}-{feature_slug}--{screen}-oracle.md    split
assets/wave{NN}-{feature_slug}/             per-section screenshot (gộp)   — _full.png + {node-id}.png
assets/wave{NN}-{feature_slug}--{screen}/   per-section screenshot (split) — folder riêng mỗi screen (_full.png + {node-id}.png)
```

## Format
- Frontmatter: `feat, platform: web, boundary: garage-web, figma_url, file_key, node_id, screen_slug?(split), fetched_at, oracle_version, screenshots[]`.
- Body 5 cấp: Screen Inventory · Component Inventory · Variant & State · Text Content · Design Tokens.
- Fallback (status): `FIGMA_LINK_MISSING` · `MCP_UNAVAILABLE` · `MCP_OUTPUT_TOO_LARGE` · `TRANSFORM_FAILED`.

## Refs
- Flow: `.agents/_ref-test-figma-oracle-flow.md`
- Token vocabulary: `.agents/_ref-web-transform-figma.md §1.5`
- MCP tools: `.agents/_ref-figma-mcp-tools.md`
