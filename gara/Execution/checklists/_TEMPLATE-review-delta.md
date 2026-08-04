---
type: execution
artifact_kind: review-checklist-delta
status: TEMPLATE
version: 2
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-07-08"
boundary: "<boundary>"
stack: "<backend|web|mobile>"
---

# Review Checklist — Delta · <boundary>

> Boundary-specific overlay. Compose sau base `_REVIEW-CHECKLIST-base-<stack>.md`.
> Chỉ liệt kê item RIÊNG của boundary (KG entities, ADR, gotchas) — KHÔNG lặp lại base.
> Đánh số tiếp nối base: `D1`, `D2`, … để tránh đụng `R*`.

## Delta items

<!--
SCOPE RULE (enforce khi author delta):
  - CHỈ item **boundary-specific** (KG entity riêng, ADR áp dụng cho boundary này,
    gotcha per-boundary trong `CLAUDE.md §7`, business rule đặc thù).
  - Item cross-stack / cross-boundary (boundary isolation, tenant filter, security header,
    backward-compat contract, code-comment-rules, figma-workflow-rules…) BELONG BASE,
    KHÔNG copy sang delta. Nếu policy mới cần cover ở cả boundary → bump base thay vì
    duplicate xuống delta (xem `README.md § Rule-change → Checklist review cascade policy`).
  - Vi phạm → drift script `scripts/check-review-checklist-drift.sh` không catch được
    (script chỉ theo dõi base `last_reviewed` vs source rule mtime, không quét delta).

FORMAT: kế thừa đánh số `D1`, `D2`, … (không dùng `R*` — đã reserved cho base).
-->

- [ ] D1 **<tên rule>**: <điều kiện kiểm tra, reference KG/ADR/gotcha cụ thể>
- [ ] D2 **<tên rule>**: <…>

## Nguồn

- KG: `Execution/knowledge-graphs/<boundary>.knowledge-graph.yaml`
- ADR liên quan: `Architecture/decisions/ADR-*.md`
- Gotchas: `CLAUDE.md §7`

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 2 | Delivery Authority | Thêm section `Delta items` header + comment SCOPE RULE (chỉ item boundary-specific — item cross-boundary belong base, cascade qua base bump theo `README.md § Rule-change → Checklist review cascade policy`). Bump 3-in-1 template. |
| YYYY-MM-DD | 1 | Delivery Authority | Initial delta. |
