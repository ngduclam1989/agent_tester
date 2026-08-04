---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-{{FEAT-ID}}.md"
source_version: {{N}}
source: "gen-execution-spec"
source_feat_id: "FEAT-{{FEAT-ID}}"
source_feat_sha: "{{sha256-source}}"
generated_at: "{{ISO8601-UTC}}"
status: DRAFT
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W{{NN}}"
parent_epic: "EP-{{EPIC-ID}}"
parent_pkg: "PKG-W{{NN}}-{{slug}}"
experience: "{{experience-web}}"                       # vd "garage-web"
platform: web
modifies: []
change_type: "{{brownfield-enhancement | new-capability}}"
consumes_backend_feats: ["FEAT-{{FEAT-ID}}"]
consumes_bff_feats: []                                 # nếu has_bff_touchpoint=true → ["FEAT-{ID}"]
i18n_keys: []                                          # vd ["auth.login.title", "auth.login.error"] — bỏ trống nếu wave dùng fixed VN labels (no i18next)
screens_touched: []                                    # vd ["src/features/auth/LoginPage.tsx"]
figma_refs: []                                         # MUST list figma spec file paths từ bundle §G.Y (relative to repo root).
                                                       # Format: - "Product/ux/figma-web/wave{NN}-{slug}.md (node X:Y — short desc)"
                                                       # KHÔNG để empty hoặc [FIGMA-TBD] — exception: bundle §G.Y báo "FIGMA SPEC MISSING" + --skip-figma-check active → dùng "NEED CONFIRMATION" placeholder + wireframe fallback path.
authoring_inputs:
  pkg_ref: "PKG-W{{NN}}-{{slug}}"
  fanout_map_sha: "{{sha256-map-yaml}}"
  template_sha: "{{sha256-template}}"
reviewer_verdict: null
last_reviewed: "{{YYYY-MM-DD}}"
---

# FEAT-{{FEAT-ID}} (FE Web): {{Tiêu đề tiếng Việt}}

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-{{FEAT-ID}}` |
| Tier | **fe-web** |
| Experience | `{{experience-web}}` |
| Platform | web (React) |
| Parent Epic | [`EP-{{EPIC-ID}}`](../../epics/EP-{{EPIC-ID}}.md) |
| Wave | W{{NN}} |
| Status | DRAFT |
| Screens touched | {{screens_touched}} |
| Cross-tier consume | BE: {{consumes_backend_feats}} \| BFF: {{consumes_bff_feats}} |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-{{FEAT-ID}}` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-{{FEAT-ID}}.md`](../../../../../Product/features/FEAT-{{FEAT-ID}}.md) |
| Source version | v{{N}} |
| Source SHA | `{{sha256-source}}` |
| Generated at | {{ISO8601-UTC}} |

## 1. Mục đích nghiệp vụ

> 3-5 dòng — vì sao feature tồn tại, user outcome, vị trí trong business flow. **Identical cross-tier**. KHÔNG copy AC text, KHÔNG mô tả screen/component cụ thể.

{{Viết 3-5 dòng tiếng Việt — match nội dung §1 ở tier BE/BFF/Mobile}}

## 2. Trách nhiệm FE Web ({{experience-web}})

> 3-6 bullet ngắn — FE Web cần tạo trải nghiệm gì. Tier-specific (focus: màn hình, user flow, state UI, component, i18n, a11y, RBAC render). KHÔNG mô tả schema DB hay GraphQL SDL.

- {{Màn hình / modal / panel nào — entry point, scope, layout}}
- {{User flow chính — happy path step-by-step user perspective}}
- {{State machine UI: loading / empty / error / success / disabled}}
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): trước MỌI UI task, scan `customs/` → `share/` → `ui/` theo thứ tự ưu tiên. Reuse foundation từ layer cao nhất có component fit (bundle §G.X liệt kê inventory). Chỉ build-new khi cả 3 layer không match — entry phải có justification.
- **Figma spec là visual SSOT**: layout, color tokens, screen enumeration, screenshot manifest đều theo các figma spec files trong `figma_refs:` frontmatter (bundle §G.Y liệt kê). §2/§4/§5 references MUST cross-ref figma sections (vd "AC-3 grid 2 cột — xem figma spec §FileGrid"). KHÔNG suy luận visual từ AC/BR text đơn thuần.
- {{GraphQL op nào consume từ BFF — mutation/query/subscription}}
- {{RBAC render: feature flag, role gating, conditional visibility}}

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Mỗi source AC-ID → 1 FE behaviour statement. **Không copy text AC từ source** — viết lại theo góc nhìn FE: "FE phải render X / trigger Y / handle Z để user satisfy AC-N". Group theo screen / interaction.
>
> **Coverage gate** (reviewer item #1): mỗi source AC-ID phải xuất hiện ít nhất 1 lần ở §3 hoặc §4. AC nào FE không touch (chỉ BE state hoặc cross-boundary event) → khai báo explicit `→ N/A (xem be/ tier file)`.

### Cluster A — {{Tên màn hình hoặc interaction}}

#### AC-{{N}} → {{Tiêu đề FE behaviour}}

- **Khi**: {{user trigger — vd "click button X", "scroll Y", "modal open", "form submit"}}
- **FE phải**: {{action — render component, fetch op, update state, navigate, show toast/dialog}}
- **State transition**: {{idle → loading → success/error — kèm spinner/skeleton/toast}}
- **Component**: {{component path — reuse hoặc new}}
- **GraphQL op**: {{opName từ BFF — kèm input/output mapping}}
- **i18n keys**: {{label key dùng — kèm vi/en}}
- **a11y**: {{role/aria-label/keyboard nav requirement}}
- **Ref**: paired BFF FEAT §6.1 op `{{opName}}`, Figma node `{{node-id}}` (§5.3)

#### AC-{{M}} → {{Tiêu đề}}

...

### Cluster B — {{tên}}

...

#### AC-{{P}} → N/A

- Source AC này chỉ BE state ({{vd: persistence, BR enforce}}). FE không touch.

## 4. Ràng buộc & rule cần enforce

> MUST-NOT-VIOLATE list cho FE Web. Group: visual fidelity, state machine, i18n, a11y, RBAC, BR secondary.

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec files khai trong frontmatter `figma_refs:` (bundle §G.Y). KHÔNG re-invent layout / spacing / color.
- Design tokens lấy từ `tailwind.config.js` / `src/styles/tokens/**` / `src/index.css` — không hardcode hex/px. Tokens MUST khớp tokens detected ở bundle §G.Y "Design tokens referenced".
- Responsive: breakpoint theo Tailwind preset, mobile / tablet / desktop verify visual.
- Mỗi visual AC (vd "render grid 2 cột", "ô màu xanh/cam/đen", "card highlight") MUST cross-ref figma section (vd "xem figma spec §FileGrid" hoặc node-id).

### 4.2 State machine + error handling

- State transition tường minh: `idle | loading | success | error`. Mỗi state có UI tương ứng (spinner / skeleton / toast / inline error).
- Error → render theo `display mode` (TOAST / INLINE / EMPTY_STATE) theo error code mapping ở §4.5.
- KHÔNG silent fail — mọi error reach UI hoặc log (Sentry/equivalent).

### 4.3 i18n + a11y

- **i18n policy** (per-wave decision — verify với BA/PO trước khi author):
  - **Mặc định**: mọi label string qua i18n key (`src/i18n/{vi,en}.json`) — KHÔNG hardcode tiếng Việt inline.
  - **Override single-locale (VN only)**: nếu wave/feature explicit decision dùng fixed VN labels (vd PKG-W02 §2.2 v15) → hardcode VN labels inline, `i18n_keys: []` frontmatter empty. §4.3 phải khai báo explicit "KHÔNG dùng i18next — fixed VN labels per {decision-ref}".
- a11y: form field có `<label>` + `aria-describedby` cho error; button có `aria-label` nếu icon-only; keyboard nav (Tab order, Enter submit, Escape close modal).
- Semantic HTML — không dùng `<div>` cho clickable.

### 4.4 RBAC render + feature flag

- {{Feature flag gate — vd `insurance_settlement_enabled`}}
- Persona check: chỉ render action cho role được phép (accountant / garage-owner). KHÔNG show then disable.
- Tab/route gate: redirect nếu unauthorized.

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired be/FEAT-{{FEAT-ID}}.md §9). FE chỉ UI hint:
  - Inline validation: field-level rule trước khi submit.
  - Disable button khi precondition không đủ.
  - Toast/dialog khi server reject với error code.

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `{{err-code}}` | TOAST / INLINE / EMPTY_STATE | {{component path}} | AC-{{N}} |

---

## 5. Screen / Component breakdown (FE — primary content)

> Author tổng hợp từ Figma + UX flow + AC. Path glob ⊆ `frontend/gf-gms-web/**`.

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `{{ScreenName}}` | `/{{path}}/{{:id}}` | NEW | `{{figma-url}}#node-id=` | AC-3, AC-9 |
| `{{ExistingScreen}}` | `/{{existing-path}}` | MODIFY (add tab) | `{{figma-url}}#node-id=` | AC-11 |

### 5.2 Components new/modified

> **Reuse pattern column** MUST reference priority order `customs/` > `share/` > `ui/`. Author consult bundle §G.X Component Inventory để biết component có sẵn ở priority cao nhất. Build-new entry phải có justification rằng cả 3 layer không có component fit.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `{{DomainComponent}}` (W01 foundation) | `src/components/customs/{{DomainComponent}}.tsx` | REUSE | existing props | — | **Priority 1 — customs/** (domain-specific W01, KG registered) | AC-2 |
| `{{SharedComponent}}` (baseline) | `src/components/share/{{SharedComponent}}.tsx` | REUSE | `{ items, ... }` | — | **Priority 2 — share/** (cross-feature baseline) | AC-9 |
| `<Dialog>` (shadcn primitive) | `src/components/ui/dialog.tsx` | REUSE | shadcn props | — | **Priority 3 — ui/** (shadcn fallback — no customs/share match) | AC-14 |
| `{{NewSubComponent}}` (kebab-case) | `src/features/{{slice}}/components/{{sub}}/{{new-sub-component}}.tsx` | NEW | `{ data, onChange }` | local | **Build-new** — justification: no component fit at customs/share/ui after §G.X scan | AC-3 |

### 5.3 Design tokens & Figma refs

> Design tokens MUST khớp tokens detected ở bundle §G.Y "Design tokens referenced" (anti-hallucination guard — reviewer item #21 check). Figma refs reference figma spec file paths, không chỉ node-id.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `--color-error` | `tailwind.config.js` | error states (AC-3 inline error) | AC-3 |
| `spacing-md` | tokens | Card padding | (visual) |

> **Figma source-of-truth**: visual / micro-interaction / responsive đều theo Figma. Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `create{{Entity}}` | mutation | `src/api/graphql/{{op}}.graphql` | — | `{{Entity}}Fragment` | AC-15 |
| `get{{Entity}}ByCode` | query | `src/api/graphql/{{op}}.graphql` | `['{{entity}}', code]` | `{{Entity}}Fragment` | AC-9 |
| `{{entity}}Updated` | subscription | `src/api/graphql/{{op}}.graphql` | — | `{{Entity}}Fragment` | (live) |

> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #16 enforce).

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| GET | `/protected/v1/...` | server-side render | latency-critical | AC-{{X}} |

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state | TanStack Query | — | `['{{entity}}', filters]` | AC-9 |
| Client state | Zustand | `src/store/{{slice}}.ts` | `{{slice}}Store` | AC-3 |
| Form state | react-hook-form | local | — | AC-3 |
| Optimistic UI | TanStack mutation | `useMutation onMutate` | — | AC-15 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/{{path}}/{{:id}}` | `{{ScreenName}}` | `loader({ params }) => prefetch` | RBAC: `{{role}}` | AC-3 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/{{slice}}/components/` | `{{Component}}.tsx` | NEW | shadcn/ui base | ~250 | AC-3-AC-11 |
| `src/features/{{slice}}/hooks/` | `use{{Entity}}.ts` | NEW | TanStack wrapper | ~40 | AC-9 |
| `src/features/{{slice}}/types/` | `{{entity}}.types.ts` | NEW | TypeScript types | ~30 | — |
| `src/api/graphql/` | `{{op}}.graphql` | ADDITIVE | persisted query | ~20 | AC-15 |
| `src/api/generated/` | `{{op}}.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/i18n/{{lang}}/` | `{{slice}}.json` | ADDITIVE | i18next | ~40 | AC-3-AC-14 |
| `src/routes/` | `{{slice}}-routes.tsx` | MODIFY (add) | createBrowserRouter | ~15 | AC-3 |
| `tests/` | `tests/features/{{slice}}/{{Component}}.test.tsx` | NEW | Vitest + RTL | ~150 | AC-3-AC-11 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL + resolver stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed
    Exit: E2E happy path green (smoke)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | UI components + routing + state + i18n | features + routes + i18n | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ:
> - Client-side validation hint (UX feedback before submit)
> - RBAC-driven render (hide controls user không có quyền)
> - Error code → display mode mapping (TOAST / INLINE_*  / EMPTY_STATE)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-{{X}}-001` | CORNERSTONE | inline error hint trước submit | `components/{{Form}}.tsx::onChange` | AC-3 | BE final enforce |
| `BR-{{X}}-RBAC-001` | CORNERSTONE | hide button khi !canEdit | `components/{{Action}}Button.tsx` | AC-16 | conditional render |
| `BR-{{X}}-002` | NORMAL | toast warning khi value cao | `components/{{Field}}.tsx` | AC-12 | non-blocking |

> **Primary enforcement** = BE tier (`features/be/FEAT-{{FEAT-ID}}.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-0 | UI (negative — section ẩn) | test-ui | gate Create form |
| AC-1 | UI | test-ui | toggle "Bảo hiểm" |
| AC-3 | UI (form validation) | test-ui | inline error |
| AC-11 | UI (calculation display) | test-ui | 3 ô read-only |
| AC-14 | UI (negative validation) | test-ui | ERR-CMN-001-003 → INLINE_ERROR |
| AC-16 | UI (RBAC visibility) | test-ui + test-isolation | dual persona |
| (smoke) | E2E happy path | test-e2e | Playwright |

## 11. i18n & a11y

### 11.1 i18n keys

| Key | vi | en | AC ref |
|---|---|---|---|
| `{{slice}}.{{key}}.title` | "{{vi}}" | "{{en}}" | AC-3 |
| `{{slice}}.{{key}}.error` | "{{vi}}" | "{{en}}" | AC-14 |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-3 | Focus order: Input → Toggle → Submit | manual QA |
| AC-9 | Screen reader announce table row | aria-live |
| AC-11 | Color contrast WCAG AA cho read-only field | tokens |
| AC-14 | Error announce via aria-describedby | inline error link |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W{{NN}}/Product/features/be/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE}} | BR primary enforcement, contract source |
| BFF | `Execution/wave-specs/W{{NN}}/Product/features/bff/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE/N-A}} | GraphQL ops consumed (§6.1) |
| Mobile | `Execution/wave-specs/W{{NN}}/Product/features/mobile/FEAT-{{FEAT-ID}}.md` | {{DRAFT/ACTIVE/N-A}} | Mirror features khi share screen |

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/BFF/Mobile files.

## 13. References

- **Source**: [`Product/features/FEAT-{{FEAT-ID}}.md`](../../../../../Product/features/FEAT-{{FEAT-ID}}.md) v{{N}}
- **Paired BE**: [`features/be/FEAT-{{FEAT-ID}}.md`](../be/FEAT-{{FEAT-ID}}.md)
- **Paired BFF**: [`features/bff/FEAT-{{FEAT-ID}}.md`](../bff/FEAT-{{FEAT-ID}}.md) (nếu has_bff_touchpoint)
- **UX flow**: [`Product/ux/UX-FLOW-{{slug}}.md`](../../../../../Product/ux/UX-FLOW-{{slug}}.md)
- **HLD Web**: [`Architecture/hld/{{experience-web}}-HLD.md`](../../../../../Architecture/hld/{{experience-web}}-HLD.md)
- **Integration FE↔BFF**: [`Architecture/integrations/INTEG-FE-{{experience-web}}-*.md`](../../../../../Architecture/integrations/)
- **PKG**: [`PKG-W{{NN}}-{{slug}}.md`](../../../../work-packages/PKG-W{{NN}}-{{slug}}.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| {{YYYY-MM-DD}} | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-{{FEAT-ID}}` W{{NN}}. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map per AC-ID, §4 visual fidelity + state + i18n + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (screens/components/GraphQL consumed/state/cross-tier pair). Source FEAT chỉ audit. |
