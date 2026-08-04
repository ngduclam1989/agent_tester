---
type: execution
artifact_kind: review-checklist-delta
status: ACTIVE
version: 2
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-07-08"
boundary: "garage-web"
stack: "web"
---

# Review Checklist — Delta · garage-web

> Boundary-specific overlay. Compose sau base `_REVIEW-CHECKLIST-base-web.md`.
> Chỉ liệt kê item RIÊNG cho `garage-web` (KG entities, ADR, gotchas) — KHÔNG lặp lại base.
> Đánh số tiếp nối base: `D1`, `D2`, … để tránh đụng `R*`.

## Boundary-specific checklist

### Shared web-boundary rules (W-R1 → W-R9 skill `rules-web`)

- [ ] D1 **W-R1 Verbatim label** (skill `rules-web`): mọi label / button text / column header / modal title copy verbatim từ spec §1 `content:` / `label:`. Cross-ref R5a base — D1 nâng scope sang mọi text UI (không chỉ default clauses). Paraphrase = **P1**.
- [ ] D2 **W-R2 Hook reusability**: hook có business logic tái sử dụng cross-feature phải nằm `src/hooks/` hoặc `src/features/{f}/hooks/`; hook 1-time local giữ trong component. Cấm hook duplicate ≥2 feature — dedupe qua shared hook + prop.
- [ ] D3 **W-R3 Column order**: table column order mirror spec §1 hoặc §4 Component Prop Map (`columns:` array). Đảo column không lý do = **P2**.
- [ ] D4 **W-R4 Page vs Modal**: spec §0 root container `page` render full-route (TanStack Router route file); `modal` / `dialog` render trong parent component qua `Dialog` / `Sheet`. Confuse page ↔ modal (route file cho modal, embed page vào dialog) = **P1** container hierarchy fidelity.
- [ ] D5 **W-R5 Error code centralization**: error message / error code MỚI PHẢI thêm vào `.claude/references/error-code-registry` (hoặc `src/constants/errors/`) — cấm inline `throw new Error("mã lỗi tiếng Việt")` scatter. Cross-feature error dedupe qua registry.
- [ ] D6 **W-R6 Field component type reuse**: spec §5 field type (input-text, input-number, select, combobox, radio-group, checkbox, datepicker, textarea, upload) map cứng sang `share/inputs/*` tương ứng. Sai type (spec `combobox` mà DEV dùng `select` primitive) = **P1** shell drift + accessibility regression.
- [ ] D7 **W-R7 Container hierarchy fidelity**: spec §1 Layout DSL container tree PHẢI mirror JSX nesting order (parent → children direction/gap/padding preserve). Sibling section confuse với tab-wrap = **P1** (evidence: wave03-cat-prod-create InternalProductFormPage incident, `.agents/_ref-figma-mcp-tools.md`).
- [ ] D8 **W-R8 Mode-conditional structure**: spec `mode:` (create / edit / detail / preview) khác nhau thì render structure khác nhau (vd detail read-only, create có form). KHÔNG unify 1 component render tất cả mode qua `if (mode==='detail') hide X`; tách component hoặc dùng conditional structure explicit.
- [ ] D9 **W-R9 Image/file upload priority**: spec §5 field type `upload` (image / file / camera / excel-import) reuse `share/uploads/*` hoặc `share/inputs/upload-*` (tra registry §1 lookup key theo mimetype) — KHÔNG raw `<input type=file>` primitive; cấm bypass validation size/type. `use-pagination` / `file-upload` reusable hook check registry §2.

### KG-driven boundary items

- [ ] D10 **KG page-level design_refs integrity**: mọi page component sửa/tạo trong `src/routes/` hoặc `src/features/*/index.tsx` phải có entry tương ứng `knowledge-graph.yaml implementation.pages.{page_id}` với `design_refs.figma_spec_file` (khi UI work có spec) + `design_refs.figma_node` (node ID). Page mới không có entry = **P2**.
- [ ] D11 **Domain term consistency**: label VN trong UI copy dùng bảng map `knowledge-graph.yaml` `display_name` (khi entity ↔ VN term có mapping). Cấm 2 label khác nhau cho cùng 1 entity trong cùng feature.

### Route guard & flow discipline (wave-agnostic — cover CR-flag + import flow patterns)

- [ ] D12 **Feature-flag + route guard toggle discipline**: mọi route mới/sửa có flag gate (vd `Inventory:InventoryV2`, `SALES_V2`, …) phải verify cả 2 state:
  - **Flag ON**: sidebar menu item hiển thị + route accessible + component render đúng.
  - **Flag OFF**: sidebar menu item **ẩn hoàn toàn** (không disabled/greyed) + `beforeLoad` redirect `/` (hoặc landing khác spec ghi) + không có phantom link.
  - Guard pattern: TanStack Router `beforeLoad` đọc flag qua `src/lib/feature-flags/*` — KHÔNG inline `if (!flag) return <Navigate>` trong component body (double render + a11y announce sai). Miss verify 1 trong 2 state = **P2**; guard bằng conditional JSX thay vì `beforeLoad` = **P2** (bypassable qua direct URL nếu route tồn tại).
  - Test: cả 2 state phải có test case (Vitest với mock flag). Bỏ test 1 state = **P2**.
- [ ] D13 **Action-form flow discipline (upload / import / multi-step submit)**:
  - Flow upload → preview → confirm phải là **single-page state machine** (URL 1 route, state internal). Cấm màn kết quả trung gian ("X thành công / Y lỗi") trừ khi spec §1 explicit render (cite spec section).
  - Submit / Confirm button PHẢI **disabled** khi validation state không pass (vd `errorRows.length > 0` cho excel import, form invalid, required field trống). Enable button khi có error visible = **P1** (user confuse commit broken data).
  - Có error → inline warning ngay preview area ("Vui lòng sửa {N} dòng lỗi rồi tải lại tệp") + button "Tải file lỗi" (nếu spec có). Warning generic không nêu count = **P2**.
  - Empty state (0 dòng valid) → banner "0 dòng — không thể commit" + button "Xác nhận" disabled. Missing empty-state = **P2**.
  - Success → toast SUCCESS + `router.navigate` về list ngay lập tức (KHÔNG hiển thị "đang xử lý" static screen). Redirect chậm > 500ms sau toast = **P3**.
  - Atomic commit: 1 request cuối cùng chỉ fire khi mọi validation pass; retry sau fail giữ nguyên state form (không reset user upload). Reset state on error = **P2**.

## Nguồn

- KG: `Execution/knowledge-graphs/garage-web.knowledge-graph.yaml`
- Registry: `.claude/references/web-component-registry.yaml` (canonical UI lookup)
- Rules: `frontend/gf-gms-web/.claude/rules/{workflow,repo,figma-workflow,memory,output,code-comment}-rules.md`
- Shared skill: `rules-web` (W-R1..W-R9)
- Anti-pattern catalogs: `.agents/_ref-web-default-pattern-audit.md` (D-17 composite · D-18 layout · D-19 verbatim)
- ADR liên quan: `Architecture/decisions/ADR-*.md` (frontend-specific)
- Gotchas: `CLAUDE.md §7` (design repo) + `frontend/gf-gms-web/CLAUDE.md`

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 2 | Delivery Authority + main agent | Add D12 (Feature-flag + route guard toggle discipline — cover W04 `Inventory:InventoryV2` gate CR-20260707-02, wave-agnostic pattern) + D13 (Action-form flow discipline — cover W04 OB import single-page + CR-20260707-01 internal-products import rewrite, wave-agnostic pattern for upload/import/multi-step). Wording fix D9 path union `share/uploads/*` OR `share/inputs/upload-*` (match repo actual structure `share/uploads/excel-upload`). Trigger: W04 impl checklist coverage review 5 gaps identified — G1 (feature-flag) + G5 (route guard) merged vào D12; G3 (action-form flow) → D13. G2 (GraphQL cache policy) + G4 (test threshold) skip theo user decision. |
| 2026-07-08 | 1 | Delivery Authority + main agent | Initial delta — 11 items: (a) D1-D9 mirror shared web-boundary rules W-R1..W-R9 từ skill `rules-web` (previously không có R item catch); (b) D10 KG page-level design_refs integrity; (c) D11 domain term consistency via KG `display_name`. Trigger: base v2 refresh + finding missing W-R coverage trong review file report. |
