---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-GRP-EDIT.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-EDIT"
source_feat_sha: "87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436"
source_feat_version: 4
generated_at: "2026-06-29T16:00:00+00:00"
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
consumes_backend_feats: ["FEAT-CAT-GRP-EDIT"]
consumes_bff_feats: ["FEAT-CAT-GRP-EDIT"]
i18n_keys: []
screens_touched:
  - "src/features/catalog/group/edit/EditGroupPage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave03-cat-grp-edit.md (node 14423:88839 — Edit Form Prefilled; screen node 13501:137679)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "b196f98b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-EDIT.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-GRP-EDIT (FE Web): Chỉnh sửa nhóm vật tư hàng hóa

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-EDIT` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `src/features/catalog/group/edit/EditGroupPage.tsx` |
| Cross-tier consume | BE: FEAT-CAT-GRP-EDIT \| BFF: FEAT-CAT-GRP-EDIT |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-EDIT.md`](../../../../../Product/features/FEAT-CAT-GRP-EDIT.md) |
| Source version | v4 |
| Source SHA | `87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436` |
| Generated at | 2026-06-29T16:00:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần cập nhật thông tin nhóm vật tư hàng hóa theo nhu cầu vận hành thực tế — đổi tên, chỉnh mô tả, thay đổi nhóm cha hoặc điều chỉnh trạng thái hoạt động. Tính năng này đảm bảo cây phân cấp nhóm vật tư luôn phản ánh đúng cấu trúc tổ chức hàng hóa của garage, phục vụ các nghiệp vụ kho V2 như nhập/xuất tồn và tính giá. FEAT-CAT-GRP-EDIT nằm trong luồng quản lý danh mục sau bước tạo mới (FEAT-CAT-GRP-CREATE) và trước khi xóa (FEAT-CAT-GRP-DELETE).

## 2. Trách nhiệm FE Web (garage-web)

- Render full-page edit form tại route `/catalog/material-group/:id/edit` — layout shell giống CREATE nhưng khác: h1 "Chỉnh sửa nhóm vật tư hàng hóa", submit button "Lưu", 5 field pre-filled từ BFF query `materialGroup`. Xem figma spec `wave03-cat-grp-edit.md` §Screen "Edit Form Prefilled" (node 13501:137679).
- User flow: vào từ list hoặc detail → page mount → fetch entity → `form.reset(groupData)` → user chỉnh sửa → nếu đổi Trạng thái sang INACTIVE: hiện confirm dialog cascade trước khi cho phép submit → gọi mutation `updateMaterialGroup` → navigate về list/detail.
- 5 field: Mã nhóm VTHH (Input read-only, BR-CAT-GRP-004), Tên nhóm VTHH (Input editable), Thuộc nhóm (Select dynamic), Trạng thái (Select ACTIVE/INACTIVE), Mô tả (Textarea ≤255 chars). Không có field "Ghi chú" (khác PROD-EDIT).
- State machine: `idle → loading-fetch → ready → submitting → success | error`. Mỗi state phải có UI tương ứng (skeleton loading, form ready, spinner submit, toast success/error).
- **Component reuse-first — priority `customs/ > share/ > ui/`**: bundle §G.X báo KG parse error; tác giả đã scan `.claude/references/web-component-registry.yaml` (CANONICAL per CLAUDE.md §2 item #12) — không có match ở `customs/` cho use-case form này; reuse `share/` layer (xem §5.2).
- Consume BFF: query `materialGroup(id)` để pre-fill (AC-1) + mutation `updateMaterialGroup(id, input)` để lưu (AC-7). Xem §6.1.
- RBAC: chỉ render button "Lưu" và form editable khi user có permission catalog-write. **NEED CONFIRMATION (NC-1)**: exact permission scope — garage-owner only hay cả accountant? (kế thừa NEED CONFIRMATION từ `be/FEAT-CAT-GRP-EDIT.md §4.2 AC-9`).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Mỗi source AC-ID → 1 FE behaviour statement. KHÔNG copy text AC từ source.

### Cluster A — Khởi tạo form và pre-fill

#### AC-1 → Fetch và pre-fill toàn bộ field khi page mount

- **Khi**: Route `/catalog/material-group/:id/edit` mount, `id` lấy từ URL params.
- **FE phải**: Gọi BFF query `materialGroup(id: $id)` → nhận `{ id, code, name, description, parentId, status }` → `form.reset(responseData)` để populate tất cả 5 field. Hiển thị skeleton trong lúc fetch.
- **State transition**: `idle → loading-fetch` (skeleton toàn form) `→ ready` (form populated) | `error` (nếu fetch fail → toast + nút retry).
- **Component**: `EditGroupPage.tsx` — mount trigger, skeleton fallback dùng `<Skeleton>` (shadcn/ui base).
- **GraphQL op**: `materialGroup` (query) — xem §6.1. File: `src/api/graphql/materialGroup.graphql`. TanStack key: `['materialGroup', id]`.
- **i18n keys**: Skeleton không cần label. Toast lỗi fetch: `"catalog.group.edit.fetchError"` — **NEED CONFIRMATION (NC-2)**: W03 dùng fixed VN labels hay i18next? Nếu fixed: text cứng "Không tải được thông tin nhóm vật tư".
- **a11y**: Form khi ready phải focus field đầu tiên có thể edit (Tên nhóm VTHH — vì Code là read-only).
- **Ref**: BE V2-3 `GET /api/v2/material-groups/{id}`, Figma `wave03-cat-grp-edit.md §5` (prefill_key mapping).

#### AC-2 → Render Mã nhóm VTHH ở trạng thái read-only

- **Khi**: Form ở trạng thái `ready` (sau fetch thành công AC-1).
- **FE phải**: Render CodeField với `readOnly: true` (prop `share/inputs/input`) + hiển thị helper text "Không được sửa mã nhóm sau khi tạo." bên dưới field. KHÔNG để user focus để type. Field vẫn có label "Mã nhóm VTHH" với red asterisk (required visual) nhưng value là non-editable.
- **State transition**: field ở `disabled/readonly` state xuyên suốt form lifecycle — không thay đổi.
- **Component**: `share/inputs/input` với prop `readOnly={true}` (Priority 2 — share/).
- **GraphQL op**: Không gọi thêm — value đã có từ AC-1 fetch.
- **Ref**: BR-CAT-GRP-004 (CORNERSTONE — BE enforce, FE enforce UI hint); Figma `wave03-cat-grp-edit.md §1` CodeField `read_only: true` + `_negative_coverage` (Figma PNG chưa update BR v3 — spec authority overrides PNG).

### Cluster B — Chỉnh sửa fields

#### AC-3 → Validate Tên nhóm VTHH và reflect changed state

- **Khi**: User thay đổi nội dung NameField.
- **FE phải**: Validate real-time: `name` không được blank (required). Nếu giá trị khác `defaultValues.name` → form `isDirty = true` → enable button "Lưu" (nếu trước đó disabled do `form.unchanged`). Inline error bên dưới field khi submit với name blank.
- **State transition**: `ready → ready(dirty)` khi user chỉnh; `ready(dirty) → submitting` khi submit.
- **Component**: `share/inputs/input` (Priority 2 — share/) — NameField; inline error: `<p className="text-destructive text-sm">`.
- **Ref**: Figma `wave03-cat-grp-edit.md §5` `name: required: true`; token `text-destructive` (§G.Y).

#### AC-4 → Chọn nhóm cha mới và hiển thị lỗi circular reference

- **Khi**: User chọn giá trị mới từ ParentField (Select "Thuộc nhóm").
- **FE phải**: Hiển thị Select với options dynamic từ BFF (danh sách nhóm VTHH của tenant — có thể reuse query list hoặc tree). Khi submit và BE trả `ERR-INV-003` (circular reference) → hiển thị toast error "Nhóm cha không hợp lệ: tạo thành vòng tròn trong cây phân cấp".
- **State transition**: `ready → submitting → error(ERR-INV-003)` → form giữ nguyên, user có thể chọn lại.
- **Component**: `share/inputs/input-select` (Priority 2 — share/) — ParentField; icon trailing `lucide-react ChevronDown` (per figma `wave03-cat-grp-edit.md §Icon Catalog` arrow-down-2).
- **GraphQL op**: Options list từ BFF (query materialGroup tree hoặc search — **NEED CONFIRMATION NC-3**: exact BFF op name cho parent group options list trong EDIT context).
- **a11y**: `aria-label="Thuộc nhóm"`.
- **Ref**: BR-CAT-GRP-009 (BE enforce primary); `ERR-INV-003` → TOAST display (§4.6); Figma node `13501:137679.L11-12`.

#### AC-5 → Đổi Trạng thái sang INACTIVE — hiện confirm dialog cascade

- **Khi**: User chọn "Ngừng hoạt động" (INACTIVE) từ StatusField (và giá trị trước đó là ACTIVE, hoặc nhóm có con).
- **FE phải**: Trước khi submit, nếu `newStatus === 'INACTIVE'` và (`previousStatus === 'ACTIVE'` hoặc nhóm có ít nhất 1 con theo dữ liệu đã fetch) → intercept submit → mở `alert-confirm` dialog với nội dung: "Đổi trạng thái sang 'Ngừng hoạt động' sẽ áp dụng cho tất cả nhóm con. Bạn có chắc muốn tiếp tục không?" — OK → proceed submit; Cancel → đóng dialog, giữ form hiện tại.
- **State transition**: `ready(dirty) → dialog-confirm-open → (user OK) → submitting` | `(user Cancel) → ready(dirty)`.
- **Component**: `share/dialogs/alert-confirm` (Priority 2 — share/) — cascade confirm dialog. StatusField: `share/inputs/input-select` (Priority 2 — share/).
- **Ref**: BR-CAT-GRP-007 (CORNERSTONE cascade — BE enforce primary; FE warn dialog = UX hint secondary); Figma `wave03-cat-grp-edit.md §3 State Table` ("SubmitButton disabled_when form.unchanged || form.invalid").

#### AC-6 → Validate và update Mô tả

- **Khi**: User nhập nội dung vào DescriptionField (Textarea).
- **FE phải**: Validate client-side: `description.length ≤ 255` — vượt → inline error bên dưới textarea + disable submit. Textarea full-width (col_span: 2), 4 rows, resize vertical. Giá trị null/empty cho phép (optional field).
- **State transition**: `ready → ready(dirty, invalid)` nếu vượt 255 chars → error hiển thị; `ready → ready(dirty, valid)` nếu trong giới hạn.
- **Component**: `share/textareas/textarea` (Priority 2 — share/) — DescriptionField.
- **Ref**: BR-CAT-GRP-012 (NORMAL, ≤255 chars → `ERR-INV-016` nếu BE reject); Figma `wave03-cat-grp-edit.md §5` `description: inputs[0].type: textarea, rows: 4`.

### Cluster C — Lưu và điều hướng

#### AC-7 → Gọi mutation updateMaterialGroup và xử lý kết quả

- **Khi**: User nhấn button "Lưu" (form valid + dirty + không dialog nào đang mở chờ confirm).
- **FE phải**: Collect form data: `{ name, description, parentId, status }` (KHÔNG include `code` — read-only). Gọi mutation `updateMaterialGroup(id: $id, input: $input)`. Trong lúc chờ: button "Lưu" hiển thị spinner + disabled, button "Huỷ bỏ" disabled. Khi success → toast "Lưu thành công" + navigate về list/detail. Khi error → parse error code → hiển thị theo §4.6.
- **State transition**: `ready(dirty) → submitting` (spinner) `→ success` (toast + redirect) | `error` (toast/inline error, form stays).
- **Component**: `share/buttons/button` (Priority 2 — share/) — SubmitButton variant `brand` label "Lưu"; loading state "Đang lưu..." (per Figma §3 State Table).
- **GraphQL op**: `updateMaterialGroup` mutation — xem §6.1. Input: `MaterialGroupUpdateInput { name, description, parentId, status }`.
- **Ref**: BE V2-5 `PUT /api/v2/material-groups/{id}`; Figma `wave03-cat-grp-edit.md §1` SubmitButton `disabled_when: form.unchanged || form.invalid`.

#### AC-8 → Huỷ bỏ chỉnh sửa và navigate về

- **Khi**: User nhấn button "Huỷ bỏ" (outline).
- **FE phải**: Navigate back — ưu tiên `history.back()` (router); nếu không có history → navigate tới list `/catalog/material-group`. KHÔNG cần confirm dialog nếu form dirty (per Figma — không có unsaved-changes guard). Form state discarded tự nhiên khi unmount.
- **State transition**: Navigate away — form unmount.
- **Component**: `share/buttons/button` (Priority 2 — share/) — CancelButton variant `outline` label "Huỷ bỏ".
- **Ref**: Figma `wave03-cat-grp-edit.md §1` CancelButton `variant: outline label: "Huỷ bỏ"`; `_negative_coverage` không có unsaved-changes dialog.

### Cluster D — Phân quyền

#### AC-9 → RBAC-driven render form editable

- **Khi**: Page mount; user identity đã có trong auth context.
- **FE phải**: Nếu user KHÔNG có permission catalog-write → render page ở read-only mode (tất cả fields disabled, button "Lưu" ẩn). **NEED CONFIRMATION (NC-1)**: exact permission code + role scope (garage-owner chắc chắn có; accountant còn cần xác nhận — kế thừa NC từ `be/FEAT-CAT-GRP-EDIT.md §4.2`).
- **State transition**: Permission gate xảy ra tại mount — không sau đó.
- **Component**: `EditGroupPage.tsx` — conditional render dựa trên auth context `hasPermission('CATALOG_MATERIAL_GROUP_WRITE')` (tên permission NEED CONFIRMATION).
- **Ref**: Critical Rule #6 (dual persona: garage-owner + accountant); BR-CAT-GRP-013 (phân quyền danh mục).

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave03-cat-grp-edit.md` (node 14423:88839) — xem screen node 13501:137679 "Edit Form Prefilled". KHÔNG re-invent layout/spacing/color.
- Design tokens MUST khớp §G.Y set: `bg-primary`, `text-foreground`, `text-muted-foreground`, `text-primary` (bundle §G.Y) + `bg-background`, `text-primary-foreground`, `border-input`, `text-destructive` (Figma spec §2). KHÔNG hardcode hex/px — dùng tokens.
- Layout: `PageContent` padding `y:24 x:32`, gap `24`; `FieldGrid` grid 2 cols gap 16; `DescriptionField` full-width (col_span: 2, per Figma `wave03-cat-grp-edit.md §6`).
- Header: back-arrow (lucide-react `ArrowLeft` size 20) + h1 `text-2xl font-semibold text-foreground` + outline Cancel + brand Submit (per Figma `wave03-cat-grp-edit.md §7 Visual Hierarchy Map`).
- KHÔNG render "Xóa" button trên header (per Figma `wave03-cat-grp-edit.md §1 _negative_coverage`).
- KHÔNG render status badge inline với h1 (chỉ có ở DETAIL screen — EDIT screen không có).

### 4.2 State machine + error handling

- State `idle → loading-fetch → ready → submitting → success | error` — tường minh; không skip state.
- `loading-fetch`: skeleton toàn form (không blank white).
- `submitting`: SubmitButton spinner + disabled; CancelButton disabled.
- `error`: parse error code từ BFF response → display mode (xem §4.6). KHÔNG silent fail.
- Form `isDirty` guard: SubmitButton disabled khi `!form.isDirty || !form.isValid` (per Figma `disabled_when: form.unchanged || form.invalid`).

### 4.3 i18n + a11y

- **i18n policy**: **NEED CONFIRMATION (NC-2)** — W03 chưa có quyết định explicit về fixed VN labels vs i18next. Tạm thời: dùng fixed VN labels inline (tương đồng với convention VN-focused product), frontmatter `i18n_keys: []`. Nếu BA/PO yêu cầu i18next: tạo `src/i18n/{vi,en}.json` key-set tại §11.1 và update frontmatter.
- a11y:
  - `CodeField`: `aria-readonly="true"` + `aria-describedby="code-helper"` (helper text "Không được sửa mã nhóm sau khi tạo.").
  - `NameField`, `ParentField`, `StatusField`, `DescriptionField`: mỗi field có `<label htmlFor="...">` + `aria-required` (nếu required).
  - Error inline: kết nối bằng `aria-describedby` trỏ tới error message `id`.
  - Button icons: `ArrowLeft` back-button phải có `aria-label="Quay lại"`.
  - Confirm dialog: focus trap khi mở; Escape close; Enter = OK button.
  - Keyboard nav: Tab order CodeField (unfocusable) → NameField → ParentField → StatusField → DescriptionField → CancelButton → SubmitButton.
  - Semantic HTML: `<form>` wrapping, `<h1>` cho page title, `<h2>` cho "Thông tin chung".

### 4.4 RBAC render + feature flag

- Permission check tại page mount: user phải có `CATALOG_MATERIAL_GROUP_WRITE` (NEED CONFIRMATION NC-1 tên permission + role scope).
- Nếu thiếu permission: tất cả field `disabled`, button "Lưu" ẩn (`display: none` — KHÔNG show then disable).
- Redirect unauthorized ở route guard nếu cần — không show form empty.
- Chỉ 2 persona: `garage-owner` và `accountant` (Critical Rule #6 — không tạo thêm actor).

### 4.5 Business rule secondary (UI hint)

- **BR-CAT-GRP-004** (CORNERSTONE): CodeField phải `readOnly={true}` — UI enforce; BE enforce primary.
- **BR-CAT-GRP-007** (CORNERSTONE): Confirm dialog trước submit khi INACTIVE — FE warn secondary; BE enforce cascade primary.
- **BR-CAT-GRP-009** (CORNERSTONE): FE không pre-validate circular reference (requires server knowledge of tree) — chỉ handle `ERR-INV-003` response → TOAST.
- **BR-CAT-GRP-012** (NORMAL): Client-side validation `description.length ≤ 255` trước submit — inline error.

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC | Message VN |
|---|---|---|---|---|
| `ERR-INV-003` | TOAST | toast (shadcn/ui) | AC-4 | "Nhóm cha không hợp lệ: tạo thành vòng tròn trong cây phân cấp" |
| `ERR-INV-016` | INLINE — dưới DescriptionField | inline `<p className="text-destructive">` | AC-6 | "Mô tả không được vượt quá 255 ký tự" |
| Standard `404` | TOAST | toast | AC-1 | "Không tìm thấy nhóm vật tư" |
| Standard `403` | TOAST | toast | AC-9 | "Bạn không có quyền chỉnh sửa" |
| Standard `400` (name blank) | INLINE — dưới NameField | inline `<p className="text-destructive">` | AC-3 | "Tên nhóm không được để trống" |

---

## 5. Screen / Component breakdown (FE — primary content)

> Author scanned `.claude/references/web-component-registry.yaml` (CANONICAL per CLAUDE.md §2 item #12) cho component lookup (bundle §G.X báo KG parse error — dùng registry thay). Priority: `customs/ > share/ > ui/`.

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `EditGroupPage` | `/catalog/material-group/:id/edit` | NEW | `13501:137679` | AC-1..AC-9 |

### 5.2 Components new/modified

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `EditGroupPage` | `src/features/catalog/group/edit/EditGroupPage.tsx` | NEW | `{ groupId: string }` | TanStack Query + form context | **Build-new** — justification: no page-level edit component at customs/share/ui after registry scan; page composition new for catalog-group domain | AC-1..AC-9 |
| `EditGroupForm` | `src/features/catalog/group/edit/EditGroupForm.tsx` | NEW | `{ defaultValues, onSubmit, onCancel }` | react-hook-form | **Build-new** — justification: no form composition component at customs/share/ui for group-edit specific field set (5 fields including read-only code + confirm-on-INACTIVE) | AC-2..AC-8 |
| `Button` (submit "Lưu") | `src/components/share/buttons/button.tsx` | REUSE | `variant="brand" disabled={!isDirty || !isValid} isLoading={submitting}` | — | **Priority 2 — share/** (lookup: `primary-button`) | AC-7 |
| `Button` (cancel "Huỷ bỏ") | `src/components/share/buttons/button.tsx` | REUSE | `variant="outline" onClick={handleCancel}` | — | **Priority 2 — share/** (lookup: `primary-button`) | AC-8 |
| `Input` (CodeField, read-only) | `src/components/share/inputs/input.tsx` | REUSE | `readOnly={true} value={group.code}` | — | **Priority 2 — share/** (lookup: `form-text-input`) | AC-2 |
| `Input` (NameField) | `src/components/share/inputs/input.tsx` | REUSE | `{...register('name')} required` | — | **Priority 2 — share/** (lookup: `form-text-input`) | AC-3 |
| `InputSelect` (ParentField) | `src/components/share/inputs/input-select.tsx` | REUSE | `{...register('parentId')} options={groupList}` | — | **Priority 2 — share/** (lookup: `form-combo-select`) | AC-4 |
| `InputSelect` (StatusField) | `src/components/share/inputs/input-select.tsx` | REUSE | `{...register('status')} options={STATUS_OPTIONS}` | — | **Priority 2 — share/** (lookup: `form-combo-select`) | AC-5 |
| `Textarea` (DescriptionField) | `src/components/share/textareas/textarea.tsx` | REUSE | `{...register('description')} rows={4}` | — | **Priority 2 — share/** (lookup: `form-textarea`) | AC-6 |
| `AlertConfirm` (cascade dialog) | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `open={showCascadeConfirm} onConfirm={submitForm} onCancel={closeDialog}` | controlled by local `useState` | **Priority 2 — share/** (lookup: `alert-confirm`) | AC-5 |

### 5.3 Design tokens & Figma refs

> Design tokens MUST khớp tokens detected ở bundle §G.Y "Design tokens referenced" (anti-hallucination guard).

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-primary` | tailwind.config.js | SubmitButton "Lưu" background (brand variant) | AC-7 |
| `text-foreground` | tailwind.config.js | h1 title, form values text | AC-1 |
| `text-muted-foreground` | tailwind.config.js | Placeholder text (DescriptionField, CodeField helper) | AC-2, AC-6 |
| `text-primary` | tailwind.config.js | Focus ring / brand accent on active select | AC-4, AC-5 |
| `bg-background` | tailwind.config.js | Page + form background | (visual) |
| `text-primary-foreground` | tailwind.config.js | SubmitButton label text (on bg-primary) | AC-7 |
| `border-input` | tailwind.config.js | Input/Textarea/Select border color | AC-2, AC-3, AC-4, AC-5, AC-6 |
| `text-destructive` | tailwind.config.js | Inline error messages; required asterisk | AC-3, AC-6 |

> **Figma source-of-truth**: `Product/ux/figma-web/wave03-cat-grp-edit.md` screen node 13501:137679. Layout, spacing, color đều theo Figma. KHÔNG re-invent visual từ AC text.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

> BFF tier spec (`bff/FEAT-CAT-GRP-EDIT.md`) PENDING — op names dưới đây theo note từ `be/FEAT-CAT-GRP-EDIT.md §6.4` và orchestrator brief. Verify với BFF spec khi available.

| Operation | Type | Query file | TanStack query key | AC ref |
|---|---|---|---|---|
| `materialGroup` | query | `src/api/graphql/materialGroup.graphql` | `['materialGroup', id]` | AC-1 |
| `updateMaterialGroup` | mutation | `src/api/graphql/updateMaterialGroup.graphql` | — | AC-7 |

**`materialGroup` query** (pre-fill form):
```graphql
query MaterialGroupDetail($id: ID!) {
  materialGroup(id: $id) {
    id
    code
    name
    description
    parentId
    status
  }
}
```

**`updateMaterialGroup` mutation** (save form):
```graphql
mutation UpdateMaterialGroup($id: ID!, $input: MaterialGroupUpdateInput!) {
  updateMaterialGroup(id: $id, input: $input) {
    ... on MaterialGroupDetailResponse {
      id
      code
      name
      description
      parentId
      status
    }
    ... on ErrorResponse {
      code
      message
    }
  }
}
```

> `MaterialGroupUpdateInput`: `{ name: String!, description: String, parentId: ID, status: MaterialGroupStatus }`. KHÔNG include `code` (read-only — BE enforce BR-CAT-GRP-004).

### 6.2 REST endpoints consumed direct (bypass BFF)

> Không có — tất cả calls đi qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (fetch) | TanStack Query | — | `['materialGroup', id]` | AC-1 |
| Server state (mutate) | TanStack Mutation | — | — | AC-7 |
| Form state | react-hook-form | `useForm<EditGroupFormValues>` | — | AC-2..AC-8 |
| Cascade confirm dialog | local `useState` | `showCascadeConfirm: boolean` | — | AC-5 |
| RBAC | auth context | existing auth context | — | AC-9 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/catalog/material-group/:id/edit` | `EditGroupPage` | prefetch `materialGroup(id)` | RBAC: catalog-write (NC-1) | AC-1, AC-9 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/catalog/group/edit/` | `EditGroupPage.tsx` | NEW | TanStack Query + react-hook-form | ~120 | AC-1..AC-9 |
| `src/features/catalog/group/edit/` | `EditGroupForm.tsx` | NEW | react-hook-form composition | ~150 | AC-2..AC-8 |
| `src/api/graphql/` | `materialGroup.graphql` | NEW (or REUSE if shared with DETAIL) | persisted query | ~15 | AC-1 |
| `src/api/graphql/` | `updateMaterialGroup.graphql` | NEW | mutation | ~20 | AC-7 |
| `src/api/generated/` | `materialGroup.generated.ts`, `updateMaterialGroup.generated.ts` | AUTO-GEN | graphql-codegen | — | — |
| `src/routes/` | catalog group routes | MODIFY (add edit route) | TanStack Router | ~10 | AC-1 |
| `tests/features/catalog/group/` | `EditGroupPage.test.tsx` | NEW | Vitest + RTL | ~150 | AC-2..AC-9 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL + resolver stable — updateMaterialGroup + materialGroup ops defined)

S6  UI wire (web) — FEAT-CAT-GRP-EDIT
    Entry: BFF S5 SDL stable + Figma wave03-cat-grp-edit.md DRAFT confirmed
    Exit: E2E happy path green (smoke: pre-fill → edit name → save → redirect)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Types + GraphQL files + codegen | `api/graphql` + `api/generated` | BFF SDL stable | Generated types compile | BFF S5 |
| S6.2 | `EditGroupPage` + TanStack Query fetch | `features/catalog/group/edit` | S6.1 | Prefill render test green | S6.1 |
| S6.3 | `EditGroupForm` + react-hook-form + validation | `features/catalog/group/edit` | S6.2 | Form unit test green (code read-only, name required, desc ≤255) | S6.2 |
| S6.4 | Status cascade confirm dialog + mutation | `features/catalog/group/edit` | S6.3 | Mutation test green; dialog test green | S6.3 |
| S6.5 | Routing + RBAC guard | `routes/` | S6.4 | Route accessible with auth; 403 guard OK | S6.4 |
| S6.6 | E2E smoke | `tests/e2e/` | S6.5 | Happy path green | S6.5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce BR primary. FE chỉ: client-side validation hint, RBAC-driven render, error code → display mapping.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-004` | CORNERSTONE | CodeField `readOnly={true}` + helper text | `EditGroupForm.tsx` | AC-2 | BE enforce primary (reject/ignore code field) |
| `BR-CAT-GRP-007` | CORNERSTONE | Confirm dialog trước submit khi `status === 'INACTIVE'` | `EditGroupForm.tsx` + `alert-confirm` | AC-5 | BE enforce cascade primary; FE warn UX secondary |
| `BR-CAT-GRP-009` | CORNERSTONE | Handle `ERR-INV-003` → TOAST (không pre-validate circular) | `EditGroupPage.tsx` mutation onError | AC-4 | BE enforce primary; FE display only |
| `BR-CAT-GRP-012` | NORMAL | Inline error khi `description.length > 255` | `EditGroupForm.tsx` DescriptionField validation | AC-6 | BE also returns `ERR-INV-016` as fallback |
| `BR-CAT-GRP-013` | NORMAL | RBAC gate render (permission catalog-write) | `EditGroupPage.tsx` auth guard | AC-9 | NEED CONFIRMATION NC-1 exact permission code |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-GRP-EDIT.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (fetch + prefill) | test-ui | Mount → mock `materialGroup` query → verify all 5 fields populated |
| AC-2 | UI (readonly) | test-ui | CodeField: `readOnly={true}`, user cannot type, helper text visible |
| AC-3 | UI (form validation) | test-ui | name blank → inline error; name valid → dirty + enable submit |
| AC-4 | UI (select + error) | test-ui | Simulate `ERR-INV-003` response → TOAST message; ParentField options loaded |
| AC-5 | UI (dialog + cascade) | test-ui | Set status INACTIVE → dialog opens; OK → submit; Cancel → stays on form |
| AC-6 | UI (validation) | test-ui | description > 255 chars → inline error + submit disabled |
| AC-7 | UI (mutation) | test-ui + E2E | Happy path: fill → submit → mock success → toast + redirect |
| AC-8 | UI (navigation) | test-ui | Cancel button → navigate back / to list |
| AC-9 | UI (RBAC) | test-ui + test-isolation | No permission → button "Lưu" absent; fields disabled |
| (smoke) | E2E happy path | test-e2e | Playwright: load edit form → change name → save → list shows updated name |

## 11. i18n & a11y

### 11.1 i18n keys

> **NEED CONFIRMATION (NC-2)**: W03 i18n policy chưa được xác nhận. Bảng dưới đây là key proposal phòng trường hợp chuyển sang i18next. Nếu xác nhận "fixed VN labels" → bỏ qua bảng này, dùng string literals inline.

| Key | vi | en | AC ref |
|---|---|---|---|
| `catalog.group.edit.title` | "Chỉnh sửa nhóm vật tư hàng hóa" | "Edit material group" | AC-1 |
| `catalog.group.edit.section.general` | "Thông tin chung" | "General information" | (visual) |
| `catalog.group.edit.field.code` | "Mã nhóm VTHH" | "Group code" | AC-2 |
| `catalog.group.edit.field.code.helper` | "Không được sửa mã nhóm sau khi tạo." | "Group code cannot be changed after creation." | AC-2 |
| `catalog.group.edit.field.name` | "Tên nhóm VTHH" | "Group name" | AC-3 |
| `catalog.group.edit.field.parent` | "Thuộc nhóm" | "Parent group" | AC-4 |
| `catalog.group.edit.field.status` | "Trạng thái" | "Status" | AC-5 |
| `catalog.group.edit.field.status.active` | "Đang hoạt động" | "Active" | AC-5 |
| `catalog.group.edit.field.status.inactive` | "Ngừng hoạt động" | "Inactive" | AC-5 |
| `catalog.group.edit.field.description` | "Mô tả" | "Description" | AC-6 |
| `catalog.group.edit.button.save` | "Lưu" | "Save" | AC-7 |
| `catalog.group.edit.button.saving` | "Đang lưu..." | "Saving..." | AC-7 |
| `catalog.group.edit.button.cancel` | "Huỷ bỏ" | "Cancel" | AC-8 |
| `catalog.group.edit.cascadeConfirm.title` | "Xác nhận đổi trạng thái" | "Confirm status change" | AC-5 |
| `catalog.group.edit.cascadeConfirm.message` | "Đổi trạng thái sang 'Ngừng hoạt động' sẽ áp dụng cho tất cả nhóm con. Bạn có chắc muốn tiếp tục không?" | "Changing status to 'Inactive' will apply to all child groups. Are you sure?" | AC-5 |
| `catalog.group.edit.error.fetchFail` | "Không tải được thông tin nhóm vật tư" | "Failed to load group information" | AC-1 |
| `catalog.group.edit.error.circular` | "Nhóm cha không hợp lệ: tạo thành vòng tròn trong cây phân cấp" | "Invalid parent group: would create circular reference" | AC-4 |
| `catalog.group.edit.success` | "Lưu thành công" | "Saved successfully" | AC-7 |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | Focus NameField sau khi form prefilled (skip CodeField vì readonly) | `useEffect` trigger focus sau `form.reset()` |
| AC-2 | `aria-readonly="true"` + `aria-describedby="code-field-helper"` trên CodeField | Helper text `id="code-field-helper"` |
| AC-3 | `aria-required="true"` + `aria-describedby` → error element khi invalid | Inline error có `role="alert"` |
| AC-4 | `aria-label="Thuộc nhóm"` trên ParentField Select | Chevron icon là decorative, `aria-hidden` |
| AC-5 | Focus trap trong cascade confirm dialog; Escape = Cancel; Enter = OK | `AlertConfirm` component đã handle qua shadcn/ui Dialog primitive |
| AC-6 | `aria-describedby` → inline error khi `description.length > 255` | Error element `role="alert"` |
| AC-7 | SubmitButton: `aria-busy="true"` khi submitting | Spinner state |
| AC-8 | CancelButton: `aria-label="Huỷ bỏ"` nếu text không đủ rõ | Text button — label đã rõ |
| AC-9 | Khi disabled mode: tất cả fields có `aria-disabled="true"` | Screen reader announces non-interactive state |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-EDIT.md` | DRAFT | BR primary enforcement (BR-CAT-GRP-004/007/009/012); V2-5 PUT + V2-3 GET |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-EDIT.md` | PENDING | GraphQL ops `materialGroup` query + `updateMaterialGroup` mutation — verify op names khi BFF spec available |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-EDIT.md` | PENDING | Mirror edit form features on Flutter Bloc |

**Source ID consistency** (item 18): `source_feat_sha` = `87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436` — identical với BE tier file.

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-EDIT.md`](../../../../../Product/features/FEAT-CAT-GRP-EDIT.md) v4
- **Paired BE**: [`features/be/FEAT-CAT-GRP-EDIT.md`](../be/FEAT-CAT-GRP-EDIT.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-GRP-EDIT.md`](../bff/FEAT-CAT-GRP-EDIT.md) (PENDING)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Figma web spec**: [`Product/ux/figma-web/wave03-cat-grp-edit.md`](../../../../../Product/ux/figma-web/wave03-cat-grp-edit.md) (node 14423:88839)
- **BR refs**: [`Product/business-rules/BR-GF-INVENTORY-CATALOG.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md) (BR-CAT-GRP-004/007/008/009/012/013)
- **ADR-017**: Additive aggregates — `material_group` adjacency-list, adjacency strategy
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml) (canonical UI lookup)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-GRP-EDIT` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical với BE tier), §2 trách nhiệm FE Web (garage-web), §3 FE behaviour map 9 ACs (AC-1 prefill, AC-2 code readonly, AC-3 name validate, AC-4 parent circular error, AC-5 INACTIVE cascade confirm, AC-6 desc ≤255, AC-7 mutation, AC-8 cancel nav, AC-9 RBAC), §4 visual fidelity + state + a11y + RBAC + BR secondary + error mapping, §5 screen/component (build-new 2 page/form + reuse 7 share/ components), §6 GraphQL ops materialGroup/updateMaterialGroup, §7 file map, §8 DAG S6, §9 BR secondary, §10 test scope, §11 i18n+a11y. 2 NEED CONFIRMATION: NC-1 permission scope, NC-2 i18n policy. Source FEAT chỉ audit. |
