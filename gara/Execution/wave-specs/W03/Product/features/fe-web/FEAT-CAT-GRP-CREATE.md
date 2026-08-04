---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-GRP-CREATE.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-CREATE"
source_feat_sha: "183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4"
generated_at: "2026-06-29T00:00:00Z"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-CAT-GRP-CREATE"]
consumes_bff_feats: ["FEAT-CAT-GRP-CREATE"]
i18n_keys: []
screens_touched:
  - "src/features/inventory-catalog/pages/MaterialGroupCreatePage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave03-cat-grp-create.md (node 14423:88837 — Create Form Default, per-frame 13501:136447)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: ""
  template_sha: "b196f9...8b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-CREATE.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-GRP-CREATE (FE Web): Thêm nhóm vật tư hàng hóa

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-CREATE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `src/features/inventory-catalog/pages/MaterialGroupCreatePage.tsx` |
| Cross-tier consume | BE: `FEAT-CAT-GRP-CREATE` \| BFF: `FEAT-CAT-GRP-CREATE` |

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-CREATE.md`](../../../../../Product/features/FEAT-CAT-GRP-CREATE.md) |
| Source version | v4 |
| Source SHA | `183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4` |
| Generated at | 2026-06-29T00:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần xây dựng cấu trúc phân loại vật tư hàng hóa phân cấp trước khi sử dụng danh mục mã sản phẩm nội bộ. Feature cho phép tạo mới một nhóm vật tư với mã định danh nội bộ, tên hiển thị, nhóm cha tùy chọn và mô tả. Nhóm vật tư sau khi tạo là điều kiện tiên quyết để gán mã SP nội bộ và là nền dữ liệu phân loại cho toàn bộ nghiệp vụ kho V2 (nhập/xuất/tồn/tính giá).

## 2. Trách nhiệm FE Web (garage-web)

- Render trang tạo nhóm VTHH dưới dạng **full-page route** (KHÔNG modal/drawer) — xem Figma `wave03-cat-grp-create.md` §8 Trap 4 + PNG `13501-136447.png`: Navbar + SubTabNav + SectionFooter đều visible, KHÔNG có backdrop overlay.
- Dẫn người dùng qua luồng: back-arrow + "Thêm nhóm vật tư hàng hóa" (h1) → nhập form 5 trường (mã, tên, nhóm cha, trạng thái, mô tả) → submit "Tạo" → navigate về list.
- Quản lý state UI tường minh: `idle → loading (submit) → success (navigate + toast) / error (inline field / toast)`.
- **Component reuse-first** (Priority `customs/` > `share/` > `ui/`): Scan registry. Không có customs/ match cho form catalog mới này — toàn bộ resolved tại Priority 2 (`share/`). Không cần build-new component nào ở layer shared.
- **Figma spec là visual SSOT**: layout, token, field composition theo `Product/ux/figma-web/wave03-cat-grp-create.md`. §2/§4/§5 cross-ref Figma section khi mô tả visual behavior.
- Gọi BFF mutation `createMaterialGroup` (V2-M1); load parent group options qua BFF query (NEED CONFIRMATION op name — xem §6.1 NC-1).
- RBAC render: chỉ hiển thị trang tạo và nút "Tạo" cho role được phép (NEED CONFIRMATION permission constant — xem NC-2).

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Navigation và khởi tạo trang

#### AC-1 → FE render full-page create route khi user điều hướng tới

- **Khi**: user bấm CTA "Thêm nhóm" từ trang danh sách nhóm VTHH (FEAT-CAT-GRP-LIST), navigate tới route create
- **FE phải**: mount `MaterialGroupCreatePage` — render Navbar + SubTabNav (tab "Nhóm vật tư hàng hóa" active) + PageHeader + FormSection + SectionFooter (xem Figma `13501-136447.png` toàn trang)
- **State transition**: idle — form khởi tạo với `status = ACTIVE` pre-filled (Figma §5 StatusField default `ACTIVE`), các trường khác empty
- **Component**: `MaterialGroupCreatePage` (NEW — `src/features/inventory-catalog/pages/MaterialGroupCreatePage.tsx`)
- **Ref**: Figma `wave03-cat-grp-create.md` §1 Layout DSL, PNG `13501-136447.png` L1-L20

#### AC-9 → FE navigate về list khi user huỷ bỏ

- **Khi**: user bấm "Huỷ bỏ" (outline button, Figma `13501-136447.png` L4 — "Huỷ bỏ" là outline variant bên trái "Tạo")
- **FE phải**: navigate về route danh sách nhóm VTHH mà không gọi API (NEED CONFIRMATION route path — NC-3)
- **State transition**: không có dirty-check confirm dialog — navigate ngay
- **Component**: `share/buttons/button` variant=`outline` label="Huỷ bỏ"
- **Ref**: Figma `wave03-cat-grp-create.md` §1 CancelButton, Figma §3 CancelButton state table

### Cluster B — Nhập liệu các trường form

#### AC-2 → FE render và validate field mã nhóm VTHH

- **Khi**: user nhập vào trường "Mã nhóm VTHH" (required, row 1 left — Figma `13501-136447.png` L8-9)
- **FE phải**: bind input với RHF field `code`; validate client-side: required + maxLength(50) + regex loại trừ ký tự `~!@#$%^&*`; hiển thị inline error ngay khi blur/onChange
- **State transition**: idle → error (regex fail) với message "Mã nhóm không được chứa ký tự đặc biệt" inline dưới field
- **Component**: `share/inputs/input` (Priority 2 — share/) — prop `name="code"` + `required` + `maxLength={50}` + `pattern={/^[^~!@#$%^&*]+$/}`
- **GraphQL op**: field map tới `createMaterialGroup` input `.code`
- **a11y**: `<label>` cho field + `aria-describedby` pointing tới error message span
- **Ref**: Figma `wave03-cat-grp-create.md` §5 CodeField; §2 token `ring-primary` (focus ring)

#### AC-3 → FE render và validate field tên nhóm VTHH

- **Khi**: user nhập vào trường "Tên nhóm VTHH" (required, row 1 right — Figma `13501-136447.png` L8-9)
- **FE phải**: bind với RHF field `name`; validate client-side: required; hiển thị inline error khi submit với field trống
- **State transition**: idle → error (required fail) inline dưới field
- **Component**: `share/inputs/input` (Priority 2 — share/) — prop `name="name"` + `required`
- **GraphQL op**: field map tới `createMaterialGroup` input `.name`
- **a11y**: `<label>` + `aria-describedby` error span
- **Ref**: Figma `wave03-cat-grp-create.md` §5 NameField; §8 Trap 5 — "Mã/Tên là 2 Input riêng biệt, KHÔNG combined"

#### AC-4 → FE render searchable select để chọn nhóm cha

- **Khi**: user mở dropdown "Thuộc nhóm" (optional, row 2 left — Figma `13501-136447.png` L11-12)
- **FE phải**: load danh sách nhóm cha từ BFF (NEED CONFIRMATION op name NC-1: `searchMaterialGroups` hay `getMaterialGroupsForSelect`); render options có search, paginated; cho phép clear selection (optional field)
- **State transition**: idle → loading (khi mở dropdown lần đầu) → options loaded; selected value hiển thị trong Select
- **Component**: `share/inputs/input-select` (Priority 2 — share/) — prop `name="parentId"` + `isLoading` + `hasMore` + `loadMore` + `canClear={true}` + `options` từ query
- **GraphQL op**: `searchMaterialGroups` query (NEED CONFIRMATION — NC-1) với input filter; pagination support
- **a11y**: `<label>` "Thuộc nhóm" (no asterisk, optional) + keyboard nav trong dropdown
- **Ref**: Figma `wave03-cat-grp-create.md` §5 ParentField; §1 ParentField icon_trailing `arrow-down-2` (chevron)

#### AC-5 → FE render enum select trạng thái với default ACTIVE

- **Khi**: trang mount (AC-1) hoặc user thay đổi chọn lựa "Trạng thái" (optional, row 2 right — Figma `13501-136447.png` L11-12)
- **FE phải**: pre-fill `status = "ACTIVE"` ("Đang hoạt động") khi form khởi tạo; render 2 option: ACTIVE / INACTIVE; bind với RHF field `status`
- **State transition**: default "Đang hoạt động" visible → user chọn → value update
- **Component**: `share/selects/select-label` (Priority 2 — share/) — prop `name="status"` + static options `[{value:"ACTIVE", label:"Đang hoạt động"}, {value:"INACTIVE", label:"Ngừng hoạt động"}]` + `defaultValue="ACTIVE"`
- **GraphQL op**: field map tới `createMaterialGroup` input `.status`
- **Ref**: Figma `wave03-cat-grp-create.md` §5 StatusField `default: "Đang hoạt động"`

#### AC-6 → FE render full-width textarea cho mô tả

- **Khi**: user nhập mô tả (optional, full-width dưới 2×2 grid — Figma `13501-136447.png` L14-17)
- **FE phải**: render Textarea full-width (`col_span: 2` hoặc đặt ngoài FieldGrid) — KHÔNG trong grid col-1 (xem Figma §8 Trap 3); validate client-side maxLength(255)
- **State transition**: idle → typing; inline error nếu vượt 255 ký tự
- **Component**: `share/textareas/textarea` (Priority 2 — share/) — prop `name="description"` + `maxLength={255}` + `rows={4}` + optional
- **GraphQL op**: field map tới `createMaterialGroup` input `.description`
- **Ref**: Figma `wave03-cat-grp-create.md` §5 DescriptionField full_width=true, rows=4; §6 DescriptionField col_span=full

### Cluster C — Submit và xử lý kết quả

#### AC-7 → FE hiển thị lỗi trùng mã từ BFF

- **Khi**: BFF `createMaterialGroup` trả `extensions.code = "ERR-INV-002"` (duplicate code)
- **FE phải**: render inline error message dưới field `code` (KHÔNG toast); set field error state; enable re-submit sau khi user sửa
- **State transition**: loading → error → idle (form editable lại)
- **Error display**: INLINE trên `code` field — message "Mã nhóm đã tồn tại trong hệ thống"
- **Ref**: §4.6 error code mapping ERR-INV-002; BFF extensions.code pattern

#### AC-8 → FE submit form và xử lý thành công

- **Khi**: user bấm "Tạo" (brand button, Figma `13501-136447.png` L4 — label "Tạo" KHÔNG phải "Lưu" per Figma §VV)
- **FE phải**: validate toàn bộ form client-side (zod schema) trước khi call; call `createMaterialGroup` mutation; khi success → navigate về list + show success toast
- **State transition**: idle → loading (button disabled, spinner) → success (navigate + toast) / error (inline hoặc toast per §4.6)
- **Component**: `share/buttons/button` (Priority 2 — share/) variant=`brand` label="Tạo" + `isLoading` prop; `share/toasts/toast` variant=`success`
- **GraphQL op**: `createMaterialGroup` (BFF V2-M1) input `{code, name, parentId?, status, description?}`
- **Ref**: Figma `wave03-cat-grp-create.md` §1 SubmitButton `disabled_when: "form.invalid"` + §VV claim "Submit button label is 'Tạo'"

#### AC-10 → FE gate route và action theo RBAC

- **Khi**: user truy cập route tạo nhóm VTHH
- **FE phải**: kiểm tra permission trước khi render trang (route guard); nếu unauthorized → redirect về list hoặc `/unauthorized`; KHÔNG render trang rồi ẩn/disable form
- **Permission**: NEED CONFIRMATION (NC-2) — permission constant chưa xác nhận từ Architecture Authority (xem BE decisions log W03)
- **Component**: Route guard trong `src/routes/...` (NEED CONFIRMATION route path NC-3) + `<Show when={hasPermission}>` pattern
- **Ref**: §4.4 RBAC render; `share/containers/show` (Priority 2 — share/)

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- **Bám Figma canonical** (`wave03-cat-grp-create.md` node `14423:88837`): layout, spacing, color token đều per Figma §1 Layout DSL + §2 Design Token Map.
- **FULL-PAGE route** — KHÔNG render `<Dialog>` overlay hay drawer (Figma §8 Trap 4: PNG `13501-136447.png` shows Navbar + SubTabNav + SectionFooter visible).
- **Field layout**: 2-col FieldGrid (code, name ở row 1; parent, status ở row 2); Textarea ở ngoài grid full-width — KHÔNG đặt Textarea trong col-1 (Figma §8 Trap 3).
- **Button labels**: "Huỷ bỏ" (outline) + "Tạo" (brand) — KHÔNG "Lưu" (Figma §VV verified).
- **2 Inputs riêng biệt** cho code + name — KHÔNG combined (Figma §8 Trap 5).
- Design tokens phải dùng đúng values: `bg-primary` (#0052ff) cho brand button, `ring-primary` cho focus ring, `text-foreground` (#18181b) cho label/title, `text-muted-foreground` (#71717a) cho placeholder, `bg-muted` cho hover state, `text-primary` cho active/primary text.

### 4.2 State machine + error handling

- State tường minh: `idle | loading | success | error`.
- Loading: SubmitButton `isLoading=true` + disabled; form fields không disable khi loading (chỉ button).
- Error mapping per §4.6: ERR-INV-001 / ERR-INV-002 → INLINE field error trên `code`; ERR-INV-016 → INLINE trên `description`; lỗi khác (network, 500) → TOAST error.
- KHÔNG silent fail — mọi BFF error phải reach UI.

### 4.3 i18n + a11y

- **KHÔNG dùng i18next — fixed VN labels inline** per PKG-W03-inventory-catalog G8 (tương tự pattern W02 PKG). `i18n_keys: []` frontmatter empty.
- Labels và placeholders hardcode tiếng Việt: "Mã nhóm VTHH", "Tên nhóm VTHH", "Thuộc nhóm", "Trạng thái", "Mô tả", "Thêm nhóm vật tư hàng hóa", "Huỷ bỏ", "Tạo", "Thông tin chung".
- a11y: mỗi field có `<label htmlFor>` + `aria-describedby` pointing tới error message; back-button có `aria-label="Quay lại danh sách"`; keyboard nav: Tab order theo layout (code → name → parent → status → description → Huỷ bỏ → Tạo); Enter submit; Escape không required (no modal).
- Semantic HTML: `<h1>` cho "Thêm nhóm vật tư hàng hóa"; `<h2>` cho "Thông tin chung"; `<form>` wrapper; `<button type="submit">` cho Tạo.

### 4.4 RBAC render + feature flag

- Route guard gating theo permission create material group (NEED CONFIRMATION NC-2 — permission constant từ Architecture Authority).
- Chỉ 2 persona: `garage-owner` và `accountant` (Critical Rule #6). KHÔNG add persona mới.
- Unauthorized: redirect (KHÔNG show disabled form).

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem `features/be/FEAT-CAT-GRP-CREATE.md §9`). FE chỉ UI hint:
  - `code` regex client-side (BR-CAT-GRP-001): loại trừ `~!@#$%^&*` — giảm server roundtrip.
  - `description` maxLength(255) client-side (BR-CAT-GRP-008): inline counter/error trước submit.
  - `status` default ACTIVE (BR-CAT-GRP-005): pre-fill khi form init.
  - SubmitButton disabled khi `form.isValid === false` (zod schema gate).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF `extensions.code`) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-001` | INLINE field error trên `code` | `share/inputs/input` FormMessage | AC-2 |
| `ERR-INV-002` | INLINE field error trên `code` | `share/inputs/input` FormMessage | AC-7 |
| `ERR-INV-016` | INLINE field error trên `description` | `share/textareas/textarea` FormMessage | AC-6 |
| network / HTTP 5xx | TOAST error | `share/toasts/toast` variant=error | AC-8 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `MaterialGroupCreatePage` | NEED CONFIRMATION NC-3 (vd `/catalog/material-groups/create`) | NEW | `14423:88837` (screen `13501:136447`) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-8, AC-9, AC-10 |

### 5.2 Components new/modified

> Author scanned registry `.claude/references/web-component-registry.yaml` §1 lookup theo priority `customs/` → `share/` → `ui/`. Không có customs/ component fit cho catalog create form — không có `customs/select/material-group-select` hay tương đương. Toàn bộ resolved tại Priority 2 (share/).

| Component | Path | Change type | Props (key) | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `MaterialGroupCreatePage` | `src/features/inventory-catalog/pages/MaterialGroupCreatePage.tsx` | NEW | — | form RHF + mutation state | **Feature-level NEW** — justification: entry point page mới cho feature slice inventory-catalog (không phải src/components/) | AC-1, AC-8, AC-9, AC-10 |
| `MaterialGroupCreateForm` | `src/features/inventory-catalog/components/material-group/MaterialGroupCreateForm.tsx` | NEW | `{ onSuccess, onCancel }` | RHF `useForm` local | **Feature-level NEW** — justification: form composition mới (5 fields + submit logic) cho domain material-group, không reuse form khác | AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8 |
| `share/inputs/input` (code field) | `src/components/share/inputs/input.tsx` | REUSE | `name="code"` `required` `maxLength={50}` `pattern={regex}` `label="Mã nhóm VTHH"` | — | **Priority 2 — share/** (FormField + Label + Input + FormMessage + trim-on-blur; no customs/ match) | AC-2 |
| `share/inputs/input` (name field) | `src/components/share/inputs/input.tsx` | REUSE | `name="name"` `required` `label="Tên nhóm VTHH"` | — | **Priority 2 — share/** | AC-3 |
| `share/inputs/input-select` (parent field) | `src/components/share/inputs/input-select.tsx` | REUSE | `name="parentId"` `label="Thuộc nhóm"` `isLoading` `hasMore` `loadMore` `canClear={true}` | loading options | **Priority 2 — share/** (searchable combo + paginated; no customs/select/material-group-select) | AC-4 |
| `share/selects/select-label` (status field) | `src/components/share/selects/select-label.tsx` | REUSE | `name="status"` `label="Trạng thái"` `defaultValue="ACTIVE"` static options | — | **Priority 2 — share/** (simple enum select + Label + RHF; no search needed) | AC-5 |
| `share/textareas/textarea` (description field) | `src/components/share/textareas/textarea.tsx` | REUSE | `name="description"` `label="Mô tả"` `maxLength={255}` `rows={4}` | — | **Priority 2 — share/** (FormField + Label + Textarea + FormMessage + trim-on-blur) | AC-6 |
| `share/buttons/button` (cancel) | `src/components/share/buttons/button.tsx` | REUSE | `variant="outline"` `onClick={onCancel}` label="Huỷ bỏ" | — | **Priority 2 — share/** | AC-9 |
| `share/buttons/button` (submit) | `src/components/share/buttons/button.tsx` | REUSE | `variant="brand"` `type="submit"` `isLoading` `disabled={!isValid}` label="Tạo" | loading | **Priority 2 — share/** | AC-8 |
| `share/containers/section` | `src/components/share/containers/section.tsx` | REUSE | title="Thông tin chung" | — | **Priority 2 — share/** (form section block với title — Figma §1 FormSection "Thông tin chung" h2) | AC-1 |
| `share/toasts/toast` | `src/components/share/toasts/toast.tsx` | REUSE | variant=success/error | — | **Priority 2 — share/** | AC-8 |

### 5.3 Design tokens & Figma refs

> Tokens PHẢI khớp bundle §G.Y "Design tokens referenced": `bg-muted`, `bg-primary`, `ring-primary`, `text-foreground`, `text-muted-foreground`, `text-primary`. Bổ sung từ Figma `wave03-cat-grp-create.md` §2 Design Token Map.

| Token | Tailwind class | Usage | AC ref |
|---|---|---|---|
| `bg-primary` | `bg-primary` (#0052ff) | "Tạo" brand button background (Figma §1 SubmitButton) | AC-8 |
| `ring-primary` | `ring-2 ring-primary` | Input/Textarea focus ring (Figma §3 state table) | AC-2, AC-3, AC-6 |
| `text-foreground` | `text-foreground` (#18181b) | H1, H2, field labels, input value (Figma §2) | AC-1, AC-2, AC-3 |
| `text-muted-foreground` | `text-muted-foreground` (#71717a) | Placeholder text (Figma §2) | AC-2, AC-3, AC-4, AC-6 |
| `bg-muted` | `bg-muted` | Cancel button hover, BackButton hover (Figma §3) | AC-9, AC-1 |
| `text-primary` | `text-primary` | Active/primary text accent (Figma §2) | (visual) |
| `text-destructive` | `text-destructive` (#ef4444) | Required asterisk (*) + inline error text (Figma §2) | AC-2, AC-3 |
| `border-input` | `border-input` (#e4e4e7) | Input/Select/Textarea/Outline button border (Figma §2) | AC-2, AC-3, AC-4, AC-5, AC-6 |

> **Figma source-of-truth**: xem `Product/ux/figma-web/wave03-cat-grp-create.md` §2 Design Token Map + screenshots `assets/wave03-cat-grp-create/13501-136447.png`.

---

## 6. Data integration (FE — consume BFF)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack key | AC ref | Notes |
|---|---|---|---|---|---|
| `createMaterialGroup` | mutation | `src/api/graphql/createMaterialGroup.graphql` | — | AC-8 | BFF V2-M1; input `{code, name, parentId?, status, description?}` |
| `searchMaterialGroups` | query | `src/api/graphql/searchMaterialGroups.graphql` | `['materialGroups', filters]` | AC-4 | **NEED CONFIRMATION (NC-1)**: op name chưa xác nhận từ BFF SDL — có thể là `getMaterialGroups`, `listMaterialGroups`, hoặc `searchMaterialGroups`. Dùng để load options cho parent select. |

> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (`features/bff/FEAT-CAT-GRP-CREATE.md`).

### 6.2 REST endpoints consumed direct (bypass BFF)

Không có — toàn bộ qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Form state | react-hook-form | local `useForm` + zod schema | — | AC-2..AC-6 |
| Mutation state | TanStack Mutation | `useMutation(createMaterialGroup)` | — | AC-8 |
| Parent options (server) | TanStack Query | `useQuery(searchMaterialGroups)` | `['materialGroups', 'select-options']` | AC-4 |
| Client nav | TanStack Router `useNavigate` | — | — | AC-8, AC-9 |

**Zod schema** (tham khảo — source của truth ở form file):

```typescript
const createMaterialGroupSchema = z.object({
  code: z.string().min(1, "Bắt buộc").max(50).regex(/^[^~!@#$%^&*]+$/, "Mã không được chứa ký tự đặc biệt"),
  name: z.string().min(1, "Bắt buộc"),
  parentId: z.string().uuid().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  description: z.string().max(255, "Mô tả không được vượt quá 255 ký tự").optional().nullable(),
})
```

### 6.4 Routing

| Route | Component | Guard | AC ref | Notes |
|---|---|---|---|---|
| NEED CONFIRMATION NC-3 (vd `/catalog/material-groups/create`) | `MaterialGroupCreatePage` | RBAC permission create (NC-2) | AC-1, AC-10 | Back-arrow → navigate về list route |

---

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (item #5 enforce). KHÔNG edit ngoài boundary này.

| Layer | Path glob | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-catalog/pages/` | `MaterialGroupCreatePage.tsx` | NEW | Route entry + form compose | ~60 | AC-1, AC-10 |
| `src/features/inventory-catalog/components/material-group/` | `MaterialGroupCreateForm.tsx` | NEW | RHF form + 5 fields | ~150 | AC-2..AC-8 |
| `src/features/inventory-catalog/hooks/` | `useCreateMaterialGroup.ts` | NEW | TanStack mutation wrapper | ~30 | AC-8 |
| `src/features/inventory-catalog/hooks/` | `useMaterialGroupOptions.ts` | NEW | TanStack query wrapper cho parent select | ~30 | AC-4 |
| `src/features/inventory-catalog/types/` | `materialGroup.types.ts` | NEW (hoặc ADDITIVE nếu đã có từ LIST) | TypeScript types | ~20 | — |
| `src/api/graphql/` | `createMaterialGroup.graphql` | NEW | persisted query | ~15 | AC-8 |
| `src/api/graphql/` | `searchMaterialGroups.graphql` | NEW (hoặc ADDITIVE) | persisted query | ~10 | AC-4 |
| `src/api/generated/` | `*.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/routes/` | route file tương ứng NC-3 | ADDITIVE | TanStack Router createRoute | ~20 | AC-1 |

---

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL + resolver stable — createMaterialGroup + searchMaterialGroups)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma wave03-cat-grp-create.md confirmed
    Exit: E2E smoke green (create group happy path)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Route setup + page skeleton | `src/routes/` + `pages/` | BFF S5 stable | Page render (no API) | BFF S5 |
| S6.2 | Form fields + zod schema + RHF | `components/material-group/` | S6.1 | Form validation green | S6.1 |
| S6.3 | BFF integration: mutation + parent query | `hooks/` + `.graphql` | BFF S5 SDL | createMaterialGroup call success | S6.2 |
| S6.4 | Error mapping + toast + navigate | form + router | S6.3 | Error display per §4.6 | S6.3 |
| S6.5 | RBAC guard | route + Show component | NC-2 confirmed | Auth gate working | NC-2 |

---

## 9. Business Rules to enforce (FE — UI hint secondary)

> BE là primary enforcer (xem `features/be/FEAT-CAT-GRP-CREATE.md §9`). FE chỉ UI hint.

| BR ID | Severity | UI behavior | Where | Touchpoint AC |
|---|---|---|---|---|
| `BR-CAT-GRP-001` | CORNERSTONE | Inline error regex client-side khi code chứa ký tự đặc biệt | `MaterialGroupCreateForm.tsx` code field | AC-2 |
| `BR-CAT-GRP-002` | CORNERSTONE | Inline error khi BFF trả ERR-INV-002 (duplicate code) | `MaterialGroupCreateForm.tsx` code field | AC-7 |
| `BR-CAT-GRP-005` | NORMAL | Pre-fill `status = ACTIVE` khi form init | `MaterialGroupCreateForm.tsx` zod default | AC-5 |
| `BR-CAT-GRP-006` | NORMAL | Select constrain options ACTIVE / INACTIVE (static enum) | `share/selects/select-label` options prop | AC-5 |
| `BR-CAT-GRP-008` | NORMAL | Inline error + maxLength(255) client-side cho description | `MaterialGroupCreateForm.tsx` description field | AC-6 |
| `BR-CAT-GRP-012` | CORNERSTONE | RBAC gate route create | Route guard + permission check | AC-10 |

---

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (page render) | test-ui | Route mount, Navbar + form visible, NOT modal overlay |
| AC-2 | UI (field validation — regex) | test-ui | Code field regex error inline + required |
| AC-3 | UI (field validation — required) | test-ui | Name field required inline |
| AC-4 | UI (async select) | test-ui | Parent select loads options, optional + clearable |
| AC-5 | UI (default value) | test-ui | Status pre-filled "Đang hoạt động" on mount |
| AC-6 | UI (textarea full-width + maxLength) | test-ui | Textarea NOT in grid col, maxLength(255) error |
| AC-7 | UI (server error inline) | test-ui | ERR-INV-002 → inline error on code field |
| AC-8 | UI (submit + navigate + toast) | test-ui + test-e2e | Mutation call, success navigate, toast success |
| AC-9 | UI (cancel navigate) | test-ui | Huỷ bỏ → navigate without API call |
| AC-10 | UI (RBAC) | test-ui + test-isolation | Unauthorized → redirect |
| (smoke) | E2E happy path | test-e2e | Playwright: create group, verify list updated |

---

## 11. i18n & a11y

### 11.1 i18n keys

KHÔNG dùng i18next — fixed VN labels per PKG-W03-inventory-catalog G8. `i18n_keys: []`.

Labels hardcode:
- Page title: "Thêm nhóm vật tư hàng hóa"
- Section title: "Thông tin chung"
- Fields: "Mã nhóm VTHH", "Tên nhóm VTHH", "Thuộc nhóm", "Trạng thái", "Mô tả"
- Buttons: "Huỷ bỏ", "Tạo"
- Status options: "Đang hoạt động" (ACTIVE), "Ngừng hoạt động" (INACTIVE)
- Error messages: "Bắt buộc", "Mã không được chứa ký tự đặc biệt", "Mô tả không được vượt quá 255 ký tự", "Mã nhóm đã tồn tại trong hệ thống"
- Toast success: "Tạo nhóm vật tư hàng hóa thành công"

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `<h1>` "Thêm nhóm vật tư hàng hóa"; `<h2>` "Thông tin chung" | Semantic heading hierarchy |
| AC-1 | BackButton `aria-label="Quay lại danh sách"` | Icon-only button |
| AC-2 | `<label htmlFor="code">` + `aria-describedby` error-id | `share/inputs/input` tự wrap |
| AC-3 | `<label htmlFor="name">` + `aria-describedby` error-id | `share/inputs/input` tự wrap |
| AC-4 | `<label htmlFor="parentId">` + keyboard nav trong combo | `share/inputs/input-select` |
| AC-5 | `<label htmlFor="status">` | `share/selects/select-label` tự wrap |
| AC-6 | `<label htmlFor="description">` + `aria-describedby` error-id | `share/textareas/textarea` tự wrap |
| AC-8 | Submit button `type="submit"` + `aria-busy` khi loading | Form Enter submit |
| AC-10 | Route redirect KHÔNG announce error — redirect silent | Screen reader sẽ announce new page |

---

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-CREATE.md` | DRAFT | BR primary enforcement (ERR-INV-001/002/016); migration `V20260624010000__create_material_group.sql` |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-CREATE.md` | DRAFT | GraphQL ops consumed (§6.1) — `createMaterialGroup` V2-M1 + `searchMaterialGroups` (NC-1) |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-CREATE.md` | DRAFT | Mirror feature; đọc-only |

**Source ID consistency**: `source_feat_sha` `183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4` phải identical với BE/BFF/Mobile files.

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-CREATE.md`](../../../../../Product/features/FEAT-CAT-GRP-CREATE.md) v4
- **Figma spec**: [`Product/ux/figma-web/wave03-cat-grp-create.md`](../../../../../Product/ux/figma-web/wave03-cat-grp-create.md) node `14423:88837`
- **Screenshots**: `Product/ux/figma-web/assets/wave03-cat-grp-create/13501-136447.png` (canonical visual)
- **Paired BE**: [`features/be/FEAT-CAT-GRP-CREATE.md`](../be/FEAT-CAT-GRP-CREATE.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-GRP-CREATE.md`](../bff/FEAT-CAT-GRP-CREATE.md)
- **Paired Mobile**: [`features/mobile/FEAT-CAT-GRP-CREATE.md`](../mobile/FEAT-CAT-GRP-CREATE.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **PKG**: [`work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: MaterialGroup adjacency-list schema design

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-GRP-CREATE` W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm FE Web (full-page route — KHÔNG modal per Figma §8 Trap 4 override), §3 FE behaviour map 10 AC-IDs, §4 visual fidelity + state + fixed VN labels (G8) + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific. i18n: fixed VN labels (no i18next, PKG-W03 G8). Component reuse: tất cả Priority 2 (share/) — no customs/ match. 3 NEED CONFIRMATION: NC-1 BFF query op name, NC-2 RBAC permission constant, NC-3 route path. |
