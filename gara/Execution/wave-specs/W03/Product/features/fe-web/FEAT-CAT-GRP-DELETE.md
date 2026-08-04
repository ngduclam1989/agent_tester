---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-GRP-DELETE.md"
source_version: 2
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-DELETE"
source_feat_sha: "c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277"
generated_at: "2026-06-29T14:36:41+00:00"
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
consumes_backend_feats: ["FEAT-CAT-GRP-DELETE"]
consumes_bff_feats: ["FEAT-CAT-GRP-DELETE"]
i18n_keys:
  - "materialGroup.delete.confirmTitle"
  - "materialGroup.delete.confirmMessage"
  - "materialGroup.delete.confirmButton"
  - "materialGroup.delete.cancelButton"
  - "materialGroup.delete.successToast"
  - "materialGroup.delete.errorHasProducts"
  - "materialGroup.delete.errorHasChildren"
  - "materialGroup.delete.errorNotFound"
  - "materialGroup.delete.errorForbidden"
screens_touched:
  - "src/features/inventory/catalog/material-group/MaterialGroupListPage.tsx"    # NEED CONFIRMATION — path chờ xác nhận từ FEAT-CAT-GRP-LIST FE spec
figma_refs:
  - "Product/ux/figma-web/wave03-cat-grp-delete.md (node 14423:88840 — Delete Confirmation Dialog section; canonical dialog overlay node 13501:138001)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "b196f98b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-DELETE.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-GRP-DELETE (FE Web): Xóa nhóm vật tư hàng hóa

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DELETE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | MaterialGroupListPage (MODIFY) |
| Cross-tier consume | BE: FEAT-CAT-GRP-DELETE \| BFF: FEAT-CAT-GRP-DELETE |

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-DELETE.md`](../../../../../Product/features/FEAT-CAT-GRP-DELETE.md) |
| Source version | v2 |
| Source SHA | `c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Tính năng cho phép chủ garage xóa vĩnh viễn một nhóm vật tư hàng hóa không còn dùng khỏi danh mục phân cấp. Để bảo vệ tính toàn vẹn dữ liệu, hệ thống tự động ngăn xóa nhóm khi còn nhóm con hoặc khi đã có mã sản phẩm nội bộ được gắn vào nhóm đó. Đây là mắt xích hoàn thiện vòng đời CRUD nhóm vật tư, đảm bảo danh mục luôn gọn gàng và nhất quán trước khi các nghiệp vụ nhập/xuất kho V2 vận hành trên nền dữ liệu này.

## 2. Trách nhiệm FE Web (garage-web)

- Render delete action trigger (icon button / menu item) trên mỗi dòng danh sách nhóm vật tư; hiển thị chỉ khi role = `garage-owner` (AC-6 RBAC).
- Khi user click delete: mở `AlertConfirm` dialog theo Figma spec `wave03-cat-grp-delete.md` node 13501:138001 (dialog overlay 441×182) — 2 nút "Xóa" (destructive `bg-destructive`) và "Hủy" (`bg-muted`).
- Khi user xác nhận: gọi GraphQL mutation `deleteMaterialGroup(id: ID!)` từ BFF; state loading trên confirm button; khi thành công đóng dialog + invalidate TanStack query `['material-groups']`.
- Khi user hủy (nút "Hủy" hoặc ESC): đóng dialog, KHÔNG phát request, state trở idle.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: Author đã scan `.claude/references/web-component-registry.yaml` thủ công (§G.X báo "KG parse error"). Không có component domain-specific ở `customs/` layer phù hợp confirm-delete dialog. Highest match: `share/dialogs/alert-confirm` (Priority 2) cho dialog; `share/toasts/toast` (Priority 2) cho error display.
- Khi BFF trả `ERR-INV-004` hoặc `ERR-INV-005`: đóng dialog và hiển thị toast lỗi giải thích nguyên nhân chặn xóa.
- **Figma spec là visual SSOT**: layout, tokens, button placement theo `wave03-cat-grp-delete.md` node 13501:138001. Bỏ qua container node 14423:88840 (có hidden stale layers theo CR-20260629-01).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage gate: 6/6 AC-ID từ bundle §C — tất cả xuất hiện trong §3 hoặc §4.

### Cluster A — Confirm Dialog

#### AC-1 → Mở popup xác nhận trước khi tiến hành xóa

- **Khi**: user click nút xóa trên dòng nhóm vật tư trong danh sách (hoặc detail screen nếu có)
- **FE phải**: mở `AlertConfirm` dialog với title xác nhận và 2 action button; dialog render theo Figma spec `wave03-cat-grp-delete.md` node 13501:138001 (dialog overlay, text-foreground title, text-muted-foreground body)
- **State transition**: `idle → dialog-open`
- **Component**: `src/components/share/dialogs/alert-confirm.tsx` — REUSE Priority 2 — share/ (alias: confirm-dialog; registry entry `alert-confirm`)
- **GraphQL op**: không (chỉ mở dialog client-side)
- **i18n keys**: `materialGroup.delete.confirmTitle` (vi: "Xác nhận xóa nhóm vật tư"), `materialGroup.delete.confirmMessage` (vi: "Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn tác.")
- **a11y**: dialog trap focus khi open; `role="alertdialog"`; `aria-labelledby` trỏ title; Escape key close; confirm button nhận initial focus
- **Ref**: Figma `wave03-cat-grp-delete.md` node 13501:138001 (§5.3)

#### AC-3 → Hủy xóa — đóng dialog không phát request

- **Khi**: user click "Hủy" (nút `bg-muted`) hoặc nhấn ESC trong confirm dialog
- **FE phải**: đóng dialog, trả state về `idle`, KHÔNG gọi bất kỳ GraphQL mutation nào
- **State transition**: `dialog-open → idle`
- **Component**: cancel callback của `share/dialogs/alert-confirm.tsx`
- **i18n keys**: `materialGroup.delete.cancelButton` (vi: "Hủy")
- **a11y**: focus return về nút delete trigger gốc sau khi dialog close (focus restoration)
- **Ref**: Figma `wave03-cat-grp-delete.md` node 13501:138001 — nút "Hủy" token `bg-muted` + `text-primary`

### Cluster B — Delete Execution & Error Handling

#### AC-2 → Gọi mutation xóa và xử lý response thành công

- **Khi**: user click "Xóa" (nút `bg-destructive`) trong confirm dialog (AC-1 đã open)
- **FE phải**: (1) set confirm button `loading=true` + `aria-busy`; (2) gọi mutation `deleteMaterialGroup(id: $groupId)`; (3) khi success → đóng dialog, invalidate TanStack query `['material-groups']`, hiển thị toast success
- **State transition**: `dialog-open → loading → success (idle + list refresh)` / `error (toast + idle)`
- **Component**: `share/dialogs/alert-confirm.tsx` confirm callback; `useMutation` TanStack; `share/toasts/toast.tsx` success notification
- **GraphQL op**: `deleteMaterialGroup(id: ID!)` — `src/api/graphql/deleteMaterialGroup.graphql`; output mapping xem BFF `features/bff/FEAT-CAT-GRP-DELETE.md §6.1`
- **i18n keys**: `materialGroup.delete.confirmButton` (vi: "Xóa"), `materialGroup.delete.successToast` (vi: "Đã xóa nhóm vật tư thành công")
- **Ref**: BFF `FEAT-CAT-GRP-DELETE §6.1` op `deleteMaterialGroup`; Figma node 13501:138001 confirm button `bg-destructive`

#### AC-4 → Hiển thị lỗi khi nhóm còn mã sản phẩm nội bộ gắn vào

- **Khi**: mutation `deleteMaterialGroup` trả `ErrorResponse` với code `ERR-INV-004` (BFF propagate từ BE HTTP 409)
- **FE phải**: đóng dialog, hiển thị toast lỗi mode TOAST (error variant)
- **State transition**: `loading → error (toast) → idle`
- **Component**: `src/components/share/toasts/toast.tsx` — REUSE Priority 2 — share/ (alias: toast-message)
- **i18n keys**: `materialGroup.delete.errorHasProducts` (vi: "Không thể xóa — nhóm đang có mã sản phẩm nội bộ gắn vào")
- **Ref**: BR-CAT-GRP-010 secondary (§9); BE spec §4.4 `ERR-INV-004`

#### AC-5 → Hiển thị lỗi khi nhóm còn nhóm con

- **Khi**: mutation trả `ErrorResponse` với code `ERR-INV-005` (BFF propagate từ BE HTTP 409)
- **FE phải**: đóng dialog, hiển thị toast lỗi mode TOAST (error variant)
- **State transition**: `loading → error (toast) → idle`
- **Component**: `src/components/share/toasts/toast.tsx` — REUSE Priority 2 — share/
- **i18n keys**: `materialGroup.delete.errorHasChildren` (vi: "Không thể xóa — nhóm còn nhóm con chưa xóa")
- **Ref**: BR-CAT-GRP-011 secondary (§9); BE spec §4.4 `ERR-INV-005`

### Cluster C — RBAC Render

#### AC-6 → Ẩn nút xóa với role accountant

- **Khi**: user có role `accountant` xem danh sách nhóm vật tư
- **FE phải**: KHÔNG render delete action button/menu item — không show-then-disable (per §4.4 RBAC)
- **State transition**: render-time RBAC check → conditional render (không render = không có DOM node)
- **Component**: delete action button wrapper với role guard từ auth context

> **NEED CONFIRMATION (1/5)**: Source FEAT AC-6 chỉ ghi "Phân quyền xóa" không list explicit role(s). FE spec kế thừa suy luận từ BE spec (be/FEAT-CAT-GRP-DELETE.md §3 AC-6 NEED CONFIRMATION 1/5): chỉ `garage-owner` thấy nút xóa; `accountant` không thấy. Business Authority cần confirm nếu `accountant` cũng có quyền xóa nhóm vật tư.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- **Canonical dialog node**: 13501:138001 trong `wave03-cat-grp-delete.md` — dialog overlay 441×182, text + 2 buttons. Đây là UI canonical duy nhất.
- **Bỏ qua**: container node 14423:88840 có hidden layers "Phiếu nhập kho" (stale, CR-20260629-01). Dev KHÔNG render content từ hidden layers này.
- Design tokens PHẢI khớp §G.Y: `bg-destructive` (confirm/delete button), `bg-muted` (cancel button background), `text-foreground` (dialog title), `text-muted-foreground` (dialog body text), `text-primary` (cancel button text label).
- KHÔNG hardcode hex/px — dùng Tailwind token classes (`bg-destructive`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-primary`).
- Responsive: dialog là overlay modal, không phụ thuộc breakpoint — verify center-alignment trên mobile / tablet / desktop.

### 4.2 State machine + error handling

- State tường minh: `idle | dialog-open | loading | success | error`.
- `loading`: confirm button disabled + spinner/aria-busy; cancel button vẫn active.
- `success`: đóng dialog → list refresh (TanStack invalidate) → toast success.
- `error`: đóng dialog → toast error với message cụ thể per error code.
- KHÔNG silent fail: mọi GraphQL error reach UI qua toast hoặc log.

### 4.3 i18n + a11y

- Default i18n policy (không có W03 fixed-VN-labels override trong bundle): mọi label qua `src/i18n/{vi,en}.json` với key prefix `materialGroup.delete.*`.
- a11y dialog: `role="alertdialog"`, `aria-labelledby`, focus trap trong dialog, ESC close, focus restoration sau close.
- Buttons: có `aria-label` nếu icon-only trigger; confirm button có `aria-busy` khi loading.
- Semantic: dialog content dùng `<h2>` cho title, `<p>` cho message — không dùng `<div>` clickable.

### 4.4 RBAC render

- Chỉ render delete trigger khi `role === 'garage-owner'`.
- `accountant`: không render nút xóa (KHÔNG show-then-disable per RBAC rule).
- Tab/route guard: không áp dụng ở feature này — delete là action trong screen nhóm vật tư đã có guard tại route level.

### 4.5 Business rule secondary (UI hint)

- BR-CAT-GRP-010 (BE primary): FE chỉ map ERR-INV-004 → toast "Không thể xóa — nhóm đang có mã sản phẩm nội bộ gắn vào".
- BR-CAT-GRP-011 (BE primary): FE chỉ map ERR-INV-005 → toast "Không thể xóa — nhóm còn nhóm con chưa xóa".
- Không có client-side pre-validation trước khi gọi mutation (server là single source of truth cho guard checks).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | HTTP nguồn | Display mode | Component | Source AC |
|---|---|---|---|---|
| `ERR-INV-004` | 409 | TOAST error | `share/toasts/toast` | AC-4 |
| `ERR-INV-005` | 409 | TOAST error | `share/toasts/toast` | AC-5 |
| `ERR-CMN-403` | 403 | TOAST error | `share/toasts/toast` | AC-6 |
| `404` (not found) | 404 | TOAST error | `share/toasts/toast` | AC-2 |

---

## 5. Screen / Component breakdown (FE — primary content)

> Path glob ⊆ `frontend/gf-gms-web/**`.

### 5.1 Screens touched

> **NEED CONFIRMATION (2/5)**: Route path cho material group list screen chưa được xác nhận trong bundle. Đường dẫn dưới đây theo convention inventory catalog W03; xác nhận từ FEAT-CAT-GRP-LIST FE Web spec trước khi impl.

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `MaterialGroupListPage` | `/inventory/catalog` (tab: Nhóm vật tư) | MODIFY (add delete trigger + dialog) | 13501:138001 (`wave03-cat-grp-delete.md`) | AC-1, AC-2, AC-3, AC-6 |

### 5.2 Components new/modified

> §G.X: "KG parse error: `knowledge-graph.yaml`". Author đã scan `.claude/references/web-component-registry.yaml` thủ công theo registry §1 lookup. Không có `customs/` layer component nào phù hợp delete-confirm dialog hoặc toast notification cho material group. Highest matching layer = Priority 2 — `share/`.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `AlertConfirm` | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `{ open, title, message, onConfirm, onCancel, loading }` | controlled by parent | **Priority 2 — share/** (alias: confirm-dialog; no customs/ match after §G.X scan) | AC-1, AC-2, AC-3 |
| `Toast` | `src/components/share/toasts/toast.tsx` | REUSE | `{ message, variant: 'error' | 'success' }` | — | **Priority 2 — share/** (alias: toast-message; no customs/ match) | AC-2, AC-4, AC-5 |
| `Button` | `src/components/share/buttons/button.tsx` | REUSE | `{ variant: 'destructive' | 'outline', size, loading }` | — | **Priority 2 — share/** (buttons inside AlertConfirm) | AC-2, AC-3 |
| `MaterialGroupDeleteTrigger` | `src/features/inventory/catalog/material-group/components/MaterialGroupDeleteTrigger.tsx` | NEW | `{ groupId, groupName, onDeleted }` | `{ dialogOpen, loading }` | **Build-new** — justification: domain-specific delete action trigger với RBAC guard + mutation orchestration; không có component fit ở customs/share/ui sau §G.X scan | AC-1, AC-2, AC-3, AC-6 |

### 5.3 Design tokens & Figma refs

> Tokens khớp §G.Y "Design tokens referenced" (5 tokens). KHÔNG dùng token nào ngoài danh sách này cho dialog UI (anti-hallucination guard).

| Token | Tailwind class | Usage | Figma ref | AC ref |
|---|---|---|---|---|
| `bg-destructive` | `bg-destructive` | Confirm/Xóa button background | node 13501:138001 confirm button | AC-2 |
| `bg-muted` | `bg-muted` | Cancel/Hủy button background | node 13501:138001 cancel button | AC-3 |
| `text-foreground` | `text-foreground` | Dialog title text | node 13501:138001 title | AC-1 |
| `text-muted-foreground` | `text-muted-foreground` | Dialog body/message text | node 13501:138001 body | AC-1 |
| `text-primary` | `text-primary` | Cancel button label text | node 13501:138001 cancel label | AC-3 |

> **Figma source-of-truth**: `wave03-cat-grp-delete.md` node 13501:138001 (dialog 441×182). Container node 14423:88840 có hidden stale layers — bỏ qua hoàn toàn.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack key invalidate | Fragments | AC ref |
|---|---|---|---|---|---|
| `deleteMaterialGroup` | mutation | `src/api/graphql/deleteMaterialGroup.graphql` | `['material-groups']` (invalidate list after success) | — | AC-2, AC-4, AC-5 |

> Mutation `deleteMaterialGroup` phải tồn tại ở BFF `features/bff/FEAT-CAT-GRP-DELETE.md §6.1` (reviewer item #16 enforce). Bundle §G.1 GraphQL ops extract bị lẫn data từ campaign module (likely KG parse artifact) — xác nhận SDL tại BFF spec trước khi codegen.

### 6.2 REST endpoints consumed direct

Không có (toàn bộ qua BFF GraphQL).

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (list) | TanStack Query | — | `['material-groups']` | AC-2 (invalidate) |
| Client state (dialog) | local component state | `MaterialGroupDeleteTrigger` | `dialogOpen, loading` | AC-1, AC-2, AC-3 |
| Mutation | TanStack mutation | `useMutation` | — | AC-2 |

### 6.4 Routing

Không có route mới — delete là in-place action trong screen nhóm vật tư hiện có. Không navigate sau xóa thành công (list refresh tại chỗ).

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory/catalog/material-group/components/` | `MaterialGroupDeleteTrigger.tsx` | NEW | custom trigger + RBAC guard | ~60 | AC-1, AC-2, AC-3, AC-6 |
| `src/api/graphql/` | `deleteMaterialGroup.graphql` | NEW | persisted mutation | ~15 | AC-2 |
| `src/api/generated/` | `deleteMaterialGroup.generated.ts` | AUTO-GEN | codegen từ SDL | — | — |
| `src/i18n/vi/` | `materialGroup.json` (additive) | ADDITIVE | i18next key block | ~10 | AC-1–AC-6 |
| `src/i18n/en/` | `materialGroup.json` (additive) | ADDITIVE | i18next key block | ~10 | AC-1–AC-6 |
| `src/features/inventory/catalog/material-group/` | `MaterialGroupListPage.tsx` (MODIFY) | MODIFY | integrate `MaterialGroupDeleteTrigger` + RBAC | ~15 delta | AC-1, AC-6 |
| `tests/features/inventory/catalog/material-group/` | `MaterialGroupDeleteTrigger.test.tsx` | NEW | Vitest + RTL | ~100 | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL stable, deleteMaterialGroup mutation exposed)

S6  UI delete flow
    Entry: BFF S5 SDL stable + Figma wave03-cat-grp-delete.md confirmed
    Exit: E2E smoke happy path green (delete empty group)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6a | GraphQL mutation file + codegen | `src/api/graphql/` | BFF S5 SDL stable | `deleteMaterialGroup.generated.ts` compile | BFF S5 |
| S6b | `MaterialGroupDeleteTrigger` component (dialog + mutation + RBAC) | `features/inventory/.../components/` | S6a | Unit test ≥8 green | S6a |
| S6c | Integrate trigger vào `MaterialGroupListPage` | `features/inventory/...` | S6b | Screen render test pass | S6b |
| S6d | i18n keys vi/en | `src/i18n/` | S6b | i18n bundle load correct | S6b |
| S6e | E2E smoke (happy path delete empty group) | `tests/e2e/` | S6c + S6d + local stack | Playwright smoke green | S6c, S6d |

## 9. Business Rules to enforce (FE — UI hint secondary)

> BE tier là SSOT cho BR enforcement (be/FEAT-CAT-GRP-DELETE.md §9). FE chỉ secondary error display.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-010` | CORNERSTONE | Toast error "Nhóm đang có mã sản phẩm nội bộ..." khi `ERR-INV-004` | `MaterialGroupDeleteTrigger.tsx` onError handler | AC-4 | BE primary enforce |
| `BR-CAT-GRP-011` | CORNERSTONE | Toast error "Nhóm còn nhóm con..." khi `ERR-INV-005` | `MaterialGroupDeleteTrigger.tsx` onError handler | AC-5 | BE primary enforce |
| RBAC (garage-owner only) | CORNERSTONE | Ẩn delete trigger khi role ≠ `garage-owner` | `MaterialGroupDeleteTrigger.tsx` render guard | AC-6 | Conditional render, không disable |

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (dialog open) | test-ui | Click delete trigger → `AlertConfirm` dialog visible |
| AC-2 | UI (mutation + success) | test-ui + test-e2e | Confirm → list refresh; E2E smoke: delete empty group |
| AC-3 | UI (cancel) | test-ui | Click Hủy/ESC → dialog close, no request fired |
| AC-4 | UI (error toast) | test-ui | Mock `ERR-INV-004` → toast message visible |
| AC-5 | UI (error toast) | test-ui | Mock `ERR-INV-005` → toast message visible |
| AC-6 | UI (RBAC visibility) | test-ui + test-isolation | accountant token → delete trigger not in DOM; garage-owner → visible |
| (smoke) | E2E happy path | test-e2e | Playwright: login as garage-owner, delete empty group, verify list update |

## 11. i18n & a11y

### 11.1 i18n keys

| Key | vi | en | AC ref |
|---|---|---|---|
| `materialGroup.delete.confirmTitle` | "Xác nhận xóa nhóm vật tư" | "Confirm delete material group" | AC-1 |
| `materialGroup.delete.confirmMessage` | "Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn tác." | "Are you sure you want to delete this group? This action cannot be undone." | AC-1 |
| `materialGroup.delete.confirmButton` | "Xóa" | "Delete" | AC-2 |
| `materialGroup.delete.cancelButton` | "Hủy" | "Cancel" | AC-3 |
| `materialGroup.delete.successToast` | "Đã xóa nhóm vật tư thành công" | "Material group deleted successfully" | AC-2 |
| `materialGroup.delete.errorHasProducts` | "Không thể xóa — nhóm đang có mã sản phẩm nội bộ gắn vào" | "Cannot delete — group has linked internal products" | AC-4 |
| `materialGroup.delete.errorHasChildren` | "Không thể xóa — nhóm còn nhóm con chưa xóa" | "Cannot delete — group has child groups" | AC-5 |
| `materialGroup.delete.errorNotFound` | "Nhóm vật tư không tồn tại hoặc đã bị xóa" | "Material group not found or already deleted" | AC-2 |
| `materialGroup.delete.errorForbidden` | "Bạn không có quyền thực hiện thao tác này" | "You do not have permission to perform this action" | AC-6 |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `role="alertdialog"` + `aria-labelledby` trỏ title; focus trap trong dialog; ESC close | Keyboard-nav first: Tab navigate giữa 2 button |
| AC-2 | Confirm button `aria-busy="true"` + `disabled` khi loading | Screen reader announce trạng thái loading |
| AC-3 | Focus restoration về delete trigger sau khi dialog close | `useRef` trigger element, `focus()` on dialog unmount |
| AC-6 | Delete trigger không render → không có DOM element → không cần aria-hidden | Conditional render (không render ≠ aria-hidden=true) |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-DELETE.md` | DRAFT | BR primary enforcement; error codes ERR-INV-004/005; endpoint `DELETE /api/v2/material-groups/{id}` |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-DELETE.md` | PENDING | GraphQL mutation `deleteMaterialGroup(id: ID!)` wrap BE endpoint; propagate ERR-INV-004/005 extension |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-DELETE.md` | PENDING | Flutter confirm dialog (AC-1/AC-3) + SnackBar error (AC-4/AC-5) — mirror feature |

**Source ID consistency** (item 18): `source_feat_sha = c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277` — identical với BE/BFF/Mobile files.

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-DELETE.md`](../../../../../Product/features/FEAT-CAT-GRP-DELETE.md) v2
- **Paired BE**: [`features/be/FEAT-CAT-GRP-DELETE.md`](../be/FEAT-CAT-GRP-DELETE.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-GRP-DELETE.md`](../bff/FEAT-CAT-GRP-DELETE.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Figma spec**: [`Product/ux/figma-web/wave03-cat-grp-delete.md`](../../../../../Product/ux/figma-web/wave03-cat-grp-delete.md) — node 13501:138001 canonical dialog
- **BR refs**: [`Product/business-rules/BR-GF-INVENTORY-CATALOG.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md) — BR-CAT-GRP-010/011
- **Web component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml) — §G.X manual scan source
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2 V2-6
- **ADR-017**: Additive aggregate — `material_group` entity gf-inventory

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-GRP-DELETE` W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (byte-equal từ be/ tier DRAFT), §2 trách nhiệm FE Web, §3 FE behaviour map 6 AC (AC-1/3 confirm/cancel dialog; AC-2/4/5 mutation + error toast; AC-6 RBAC ẩn trigger), §4 visual fidelity Figma node 13501:138001 + stale node warning + design tokens (5 tokens §G.Y), §5 components Priority 2 share/ (alert-confirm + toast) + 1 build-new trigger, §6 GraphQL op deleteMaterialGroup, §7-§11 FE-specific. 2 NEED CONFIRMATION markers. §G.X scanned manually (KG parse error). |
