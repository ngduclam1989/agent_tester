# Product/ux/figma/ — Figma Link Registry (single source of truth)

> `figma-links.yaml` = nguồn DUY NHẤT mà `/prefetch-figma` & `/prefetch-figma-oracle` đọc để resolve
> Figma URL + node-id. **Gen theo WAVE**: registry keyed theo wave, mỗi FEAT có sub-block `web:`/`mobile:`.

## File
- `figma-links.yaml` — registry (schema mô tả trong header file).
- Validate: `bash scripts/validate-figma-links.sh`.

## Schema (tóm tắt)
```yaml
waves:
  "01":
    FEAT-XXX:
      feat_file: Product/features/FEAT-XXX.md
      feature_slug: xxx            # optional; default = FEAT-ID bỏ "FEAT-" + lowercase
      web:    { file_key, wireframe?, screens: [ {slug|null, node_id "X:Y", url, maps[]} ] }
      mobile: { file_key, wireframe?, screens: [ ... ] }
```
- `screens` 1 entry `slug:null` → gộp `wave{NN}-{slug}.md`; ≥2 slug → split `wave{NN}-{slug}--{screen}.md`.
- `node_id` dạng dấu hai chấm (MCP trả empty nếu hyphen).
- CẤM mix-mode trong 1 FEAT+platform (validate chặn).

## Quan hệ với FEAT spec
- `Product/features/FEAT-*.md §UI/UX Reference` do **Business Authority** maintain; có thể vẫn liệt kê Figma link
  nhưng prefetch **KHÔNG** đọc từ đó — registry là canonical (tránh drift).

## Output (sinh bởi prefetch)
- DEV: `Product/ux/figma-{web,mobile}/wave{NN}-{slug}[--{screen}].md` + `assets/wave{NN}-{slug}/`
- Oracle: `Product/ux/figma-test-{web,mobile}/wave{NN}-{slug}[--{screen}]-oracle.md` + assets

## Refs
- Flow: `.agents/_ref-frontend-figma-prefetch-flow.md` · Oracle: `.agents/_ref-test-figma-oracle-flow.md`
- Transform: `.agents/_ref-{web,mobile}-transform-figma.md` · MCP: `.agents/_ref-figma-mcp-tools.md`
