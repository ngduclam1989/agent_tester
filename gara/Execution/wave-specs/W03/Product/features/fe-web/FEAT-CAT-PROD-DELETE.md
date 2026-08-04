---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-PROD-DELETE.md"
source_version: 2
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-DELETE"
source_feat_sha: "dccb7a05a1f14d3eac063775d25e624a1a4f42cfc1b7cc180ea43fe039c32246"
generated_at: "2026-06-29T15:00:00+00:00"
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
change_type: "brownfield-enhancement"
consumes_backend_feats: ["FEAT-CAT-PROD-DELETE"]
consumes_bff_feats: ["FEAT-CAT-PROD-DELETE"]
i18n_keys:
  - "catalog.product.delete.confirm.title"
  - "catalog.product.delete.confirm.message"
  - "catalog.product.delete.confirm.button.confirm"
  - "catalog.product.delete.confirm.button.cancel"
  - "catalog.product.delete.blocked.title"
  - "catalog.product.delete.blocked.message"
  - "catalog.product.delete.blocked.button.close"
  - "catalog.product.delete.success"
  # NEED CONFIRMATION: W03 PKG section bị truncate trong bundle — chưa xác nhận W03 có override "fixed VN labels" hay không. Default = standard i18n. BA/PO confirm trước impl.
screens_touched:
  - "src/features/catalog/pages/InternalProductCatalogPage.tsx"  # NEED CONFIRMATION — exact path từ FEAT-CAT-PROD-LIST/DETAIL spec
figma_refs:
  - "Product/ux/figma-web/wave03-cat-prod-delete.md (node 14322:176694 — Confirm Delete Dialog 14329:254641 + Cannot Delete Dialog 14329:254743)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: ""
  template_sha: "b196f98b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-DELETE.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-DELETE (FE Web): Xóa mã sản phẩm nội bộ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-DELETE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | InternalProductCatalogPage (tab "Mã sản phẩm nội bộ") |
| Cross-tier consume | BE: `FEAT-CAT-PROD-DELETE` \| BFF: `FEAT-CAT-PROD-DELETE` |

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-DELETE.md`](../../../../../Product/features/FEAT-CAT-PROD-DELETE.md) |
| Source version | v2 |
| Source SHA | `dccb7a05a1f14d3eac063775d25e624a1a4f42cfc1b7cc180ea43fe039c32246` |
| Generated at | 2026-06-29T15:00:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần loại bỏ các mã sản phẩm nội bộ không còn dùng để danh mục vật tư không bị thừa và gây nhầm lẫn trong nghiệp vụ kho. Hệ thống bảo vệ tính toàn vẹn bằng cách từ chối xóa bất kỳ mã nào đã phát sinh giao dịch nhập kho, xuất kho, hoặc có tồn kho — chỉ xóa được khi mã thực sự chưa được dùng trong vận hành. Feature này là thao tác hủy bỏ trong luồng quản lý danh mục catalog V2 của wave W03.

---

## 2. Trách nhiệm FE Web (garage-web)

- Hiển thị nút "Xóa" trong trang danh sách / chi tiết mã SP nội bộ — chỉ render khi user có quyền (AC-5, RBAC gate).
- Khi user click nút xóa → mở **Confirm Delete Dialog** (Figma node 14329:254641, xem `wave03-cat-prod-delete.md §Confirm Delete Dialog`) để thu xác nhận trước khi thực thi.
- Khi user xác nhận → call BFF mutation `deleteInternalProduct`, quản lý trạng thái loading/success/error trên dialog button.
- Xử lý ERR-INV-008 từ BFF → đóng Confirm Delete Dialog, mở **Cannot Delete Dialog** (Figma node 14329:254743, xem `wave03-cat-prod-delete.md §Cannot Delete Dialog`) hiển thị "Không xóa được mã SP đã có giao dịch".
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: sau khi scan `.claude/references/web-component-registry.yaml` theo thứ tự priority, không tìm thấy customs/ match cho confirm/alert dialog — dùng Priority 2 `share/dialogs/alert-confirm` và `share/dialogs/alert-dialog`.
- **Figma spec là visual SSOT**: layout, button color tokens, dialog sizing đều theo `wave03-cat-prod-delete.md`. Không re-invent từ AC text.

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Author đã scan `.claude/references/web-component-registry.yaml` cho §G.X — no customs/ match cho delete confirmation / alert dialog. Priority 2 share/ là highest-priority match.

### Cluster A — Delete trigger + Confirm dialog

#### AC-1 → FE render nút xóa và mở Confirm Delete Dialog

- **Khi**: user click nút "Xóa" gắn với một mã SP nội bộ cụ thể (trong row action của InternalProductCatalogPage hoặc action header của detail page).
- **FE phải**: mở `ConfirmDeleteDialog` (wrapper around `share/dialogs/alert-confirm`) với tiêu đề và nội dung xác nhận. Dialog mở dạng modal overlay — KHÔNG navigate route mới.
- **State transition**: list/detail `idle` → dialog `open`; nút xóa không bị disable trong quá trình dialog mở.
- **Component**: `src/features/catalog/components/internal-product/ConfirmDeleteDialog.tsx` (NEW — wrap `share/dialogs/alert-confirm`)
- **GraphQL op**: chưa gọi ở bước này.
- **i18n keys**: `catalog.product.delete.confirm.title` (vi: "Xóa mã SP nội bộ"), `catalog.product.delete.confirm.message` (vi: "Bạn có chắc chắn muốn xóa mã SP này không?")
- **a11y**: dialog element có `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` trỏ tiêu đề dialog; focus lock trong dialog khi mở.
- **Ref**: Figma node `14329:254641` (`wave03-cat-prod-delete.md §Confirm Delete Dialog`).

#### AC-2 → FE thực hiện xóa khi user xác nhận

- **Khi**: user click nút "Xác nhận xóa" trong ConfirmDeleteDialog.
- **FE phải**: call BFF mutation `deleteInternalProduct({ id })`, chuyển button sang loading state; khi mutation resolve thành công → đóng dialog, invalidate TanStack query key `['internal-products', filters]`, hiển thị toast thành công.
- **State transition**: `open` → button `loading` → `success`: dialog đóng, list refresh; error path xem AC-4.
- **Component**: `ConfirmDeleteDialog.tsx` — button "Xác nhận xóa" dùng `share/buttons/button` với `variant="destructive"` (`bg-destructive` token, Figma §Confirm Delete Dialog).
- **GraphQL op**: `deleteInternalProduct` mutation (BFF V2-M6); input `{ id: String! }`.
- **i18n keys**: `catalog.product.delete.confirm.button.confirm` (vi: "Xác nhận xóa"), `catalog.product.delete.success` (vi: "Xóa mã SP thành công") — toast.
- **a11y**: button loading state có `aria-busy="true"` + `aria-label` cập nhật thành "Đang xóa...".
- **Ref**: paired BFF FEAT §6.1 op `deleteInternalProduct`.

#### AC-3 → FE đóng Confirm Delete Dialog khi user hủy

- **Khi**: user click nút "Hủy", nhấn Escape, hoặc click overlay bên ngoài dialog.
- **FE phải**: đóng ConfirmDeleteDialog, KHÔNG call BFF `deleteInternalProduct`, trả về trạng thái list/detail như trước khi mở dialog.
- **State transition**: `open` → `closed`; không side effect nào — query không bị invalidate.
- **Component**: `ConfirmDeleteDialog.tsx` — nút "Hủy" dùng `share/buttons/button` với `variant="outline"` (`bg-muted` token, Figma §Confirm Delete Dialog).
- **GraphQL op**: không gọi.
- **i18n keys**: `catalog.product.delete.confirm.button.cancel` (vi: "Hủy").
- **a11y**: Escape key close phải hoạt động; focus trả về element đã trigger dialog.
- **Ref**: Figma node `14329:254641`.

### Cluster B — Block delete dialog (ERR-INV-008)

#### AC-4 → FE hiển thị Cannot Delete Dialog khi mã SP đã có giao dịch

- **Khi**: mutation `deleteInternalProduct` trả về ERR-INV-008 từ BFF.
- **FE phải**: đóng ConfirmDeleteDialog (nếu đang mở), mở `CannotDeleteDialog` (wrapper around `share/dialogs/alert-dialog`) hiển thị thông báo "Không xóa được mã SP đã có giao dịch".
- **State transition**: `loading` → `error`: ConfirmDeleteDialog đóng → CannotDeleteDialog mở.
- **Component**: `src/features/catalog/components/internal-product/CannotDeleteDialog.tsx` (NEW — wrap `share/dialogs/alert-dialog`).
- **GraphQL op**: xử lý error từ `deleteInternalProduct` response (ERR-INV-008 error code check).
- **i18n keys**: `catalog.product.delete.blocked.title` (vi: "Không thể xóa"), `catalog.product.delete.blocked.message` (vi: "Mã SP nội bộ đã phát sinh giao dịch, không thể xóa"), `catalog.product.delete.blocked.button.close` (vi: "Đóng").
- **a11y**: `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` tiêu đề; focus vào nút "Đóng" khi dialog mở.
- **Ref**: Figma node `14329:254743` (`wave03-cat-prod-delete.md §Cannot Delete Dialog`); token `bg-primary` cho nút "Đóng".

### Cluster C — RBAC render gate

#### AC-5 → FE ẩn nút xóa khi user không có quyền

- **Khi**: user hiện tại không có quyền xóa mã SP nội bộ (BR-CAT-PROD-016 — NEED CONFIRMATION: exact permission constant từ KG gf-inventory §permissions; xem decision log W03).
- **FE phải**: KHÔNG render nút "Xóa" — conditional render (`Show` component / inline conditional), KHÔNG show-then-disable.
- **State transition**: N/A — button không tồn tại trên DOM khi thiếu quyền.
- **Component**: nút xóa trong `InternalProductCatalogPage.tsx` và/hoặc detail page header — wrapped bởi RBAC guard.
- **GraphQL op**: quyền đọc từ auth context (user permissions array từ JWT/session).
- **i18n keys**: không cần (element ẩn).
- **a11y**: không aria-disabled — element không render, không tồn tại trong DOM.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám theo `Product/ux/figma-web/wave03-cat-prod-delete.md` cho layout, spacing, button sizing của 2 dialogs.
- Design tokens PHẢI dùng đúng 6 tokens từ §G.Y: `bg-destructive` (Confirm button), `bg-muted` (Cancel button), `bg-primary` (Close button CannotDeleteDialog), `text-foreground` (dialog title + body), `text-muted-foreground` (helper text), `text-primary` (accent). KHÔNG hardcode hex/px.
- Figma node `14329:254641` = Confirm Delete Dialog; `14329:254743` = Cannot Delete Dialog — hai screen riêng biệt, KHÔNG merge thành 1 component state.
- Cả 2 dialog không có icon (bundle §G.Y: "no icons in dialogs — text + button only").

### 4.2 State machine + error handling

- State tường minh: `idle | dialog-open | loading | success | error-blocked`.
- Khi mutation đang loading: nút "Xác nhận xóa" disabled + spinner; nút "Hủy" disabled để tránh double-action.
- KHÔNG silent fail — ERR-INV-008 → CannotDeleteDialog; các error code khác → toast error generic.
- Sau success: danh sách phải reflect deletion ngay (invalidate query, không manual splice).

### 4.3 i18n + a11y

- **i18n policy**: standard i18n (i18next) — keys liệt kê trong frontmatter `i18n_keys`. KHÔNG hardcode tiếng Việt inline.
  - **NEED CONFIRMATION**: W03 PKG bundle bị truncate — nếu W03 có override "fixed VN labels" như W02, author-dev cần điều chỉnh `i18n_keys` → empty + hardcode inline.
- a11y: dialog có `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`; focus lock khi open; Escape close; focus restore sau close.
- Không dùng `<div>` cho button/interactive element. Semantic HTML.

### 4.4 RBAC render + feature flag

- **RBAC**: chỉ render nút "Xóa" cho user có quyền `DELETE_INTERNAL_PRODUCT` (NEED CONFIRMATION — tên constant từ KG §permissions, xem decision log W03 FEAT-CAT-PROD-DELETE BE).
- **Persona**: theo Critical Rule #6 — chỉ `garage-owner` và `accountant`. Pattern delete catalog thường chỉ `garage-owner` (xem decisions log GRP-DELETE) — NEED CONFIRMATION từ BR-CAT-PROD-016.
- Không có feature flag riêng cho delete — gate qua RBAC permission check.

### 4.5 Business rule secondary (UI hint)

- BR-CAT-PROD-016 primary nằm ở BE (xem `features/be/FEAT-CAT-PROD-DELETE.md §9`). FE chỉ enforce thứ cấp:
  - Không render delete action khi thiếu quyền (RBAC conditional render).
  - Hiển thị CannotDeleteDialog khi server trả ERR-INV-008 (display mode: DIALOG, không TOAST).

### 4.6 Error code mapping

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-008` | DIALOG (CannotDeleteDialog) | `CannotDeleteDialog.tsx` (`share/dialogs/alert-dialog`) | AC-4 |
| `ERR_UNKNOWN` / other | TOAST error | `share/toasts/toast` | AC-2 |

---

## 5. Screen / Component breakdown

> §G.X: bundle báo "KG parse error" — author đã scan `.claude/references/web-component-registry.yaml` (canonical source per CLAUDE.md §2 #12) thay thế cho filesystem scan. Registry v3 last reviewed 2026-06-22.

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `InternalProductCatalogPage` | NEED CONFIRMATION (xem FEAT-CAT-PROD-LIST fe-web spec) | MODIFY (add delete action + dialogs) | parent screen — xem FEAT-CAT-PROD-LIST | AC-1, AC-5 |
| `ConfirmDeleteDialog` (modal overlay) | — (no route) | NEW | `14329:254641` | AC-1, AC-2, AC-3 |
| `CannotDeleteDialog` (modal overlay) | — (no route) | NEW | `14329:254743` | AC-4 |

### 5.2 Components new/modified

> §G.X scan: no customs/ dialog component match; `share/dialogs/alert-confirm` + `share/dialogs/alert-dialog` = highest-priority match (Priority 2 — share).

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `ConfirmDeleteDialog` | `src/features/catalog/components/internal-product/ConfirmDeleteDialog.tsx` | NEW | `{ open, onConfirm, onCancel, isLoading }` | hoisted to parent | **Build-new (thin wrapper)** — justification: no customs/ or share/ wrap exists for domain-scoped delete confirm; wraps `share/dialogs/alert-confirm` (Priority 2) | AC-1, AC-2, AC-3 |
| `CannotDeleteDialog` | `src/features/catalog/components/internal-product/CannotDeleteDialog.tsx` | NEW | `{ open, onClose }` | hoisted to parent | **Build-new (thin wrapper)** — justification: no customs/ or share/ wrap exists for domain-scoped block alert; wraps `share/dialogs/alert-dialog` (Priority 2) | AC-4 |
| `alert-confirm` (shadcn share) | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `{ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, isLoading }` | — | **Priority 2 — share/** (confirm dialog pattern, highest match after §G.X scan) | AC-1, AC-2, AC-3 |
| `alert-dialog` (shadcn share) | `src/components/share/dialogs/alert-dialog.tsx` | REUSE | `{ open, title, message, closeLabel, onClose }` | — | **Priority 2 — share/** (alert dialog pattern, highest match after §G.X scan) | AC-4 |
| `button` (share) | `src/components/share/buttons/button.tsx` | REUSE | `variant="destructive" \| "outline" \| "default"` | — | **Priority 2 — share/** | AC-2, AC-3, AC-4 |
| `toast` (share) | `src/components/share/toasts/toast.tsx` | REUSE | standard | — | **Priority 2 — share/** | AC-2 |
| `InternalProductCatalogPage` | `src/features/catalog/pages/InternalProductCatalogPage.tsx` | MODIFY (add delete btn + dialog state) | existing + `deleteTarget: string \| null` state | local (dialog open/close state) | MODIFY existing page | AC-1, AC-5 |

### 5.3 Design tokens & Figma refs

> Tokens khớp với §G.Y "Design tokens referenced" (6 tokens). KHÔNG thêm token ngoài danh sách này.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-destructive` | `tailwind.config.js` | "Xác nhận xóa" button background (Confirm Delete Dialog) | AC-2 |
| `bg-muted` | `tailwind.config.js` | "Hủy" button background (Confirm Delete Dialog) | AC-3 |
| `bg-primary` | `tailwind.config.js` | "Đóng" button background (Cannot Delete Dialog) | AC-4 |
| `text-foreground` | `tailwind.config.js` | Dialog title + body text (cả 2 dialogs) | AC-1, AC-4 |
| `text-muted-foreground` | `tailwind.config.js` | Helper / secondary text trong dialog body | AC-1, AC-4 |
| `text-primary` | `tailwind.config.js` | Accent / emphasis text nếu có | (visual) |

> **Figma SSOT**: `wave03-cat-prod-delete.md` node `14322:176694`. Không có icon trong 2 dialogs (text + button only).

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `deleteInternalProduct` | mutation | `src/api/graphql/deleteInternalProduct.graphql` | — (invalidates `['internal-products']`) | — | AC-2, AC-4 |

> Op `deleteInternalProduct` = BFF V2-M6. Phải tồn tại trong paired BFF FEAT §6.1 (reviewer item #16).

### 6.2 REST endpoints consumed direct

_(không có — FE không bypass BFF cho feature này)_

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (list refresh) | TanStack Query | — | `['internal-products', filters]` | AC-2 |
| Dialog open/target state | React local state | `InternalProductCatalogPage` local | `deleteTarget: string \| null` | AC-1, AC-3 |
| Mutation loading | TanStack mutation | `useMutation` | — | AC-2 |

### 6.4 Routing

_(không có route mới — delete là modal overlay trên trang hiện tại)_

## 7. File/module impact map

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/catalog/components/internal-product/` | `ConfirmDeleteDialog.tsx` | NEW | wrap share/dialogs/alert-confirm | ~60 | AC-1,2,3 |
| `src/features/catalog/components/internal-product/` | `CannotDeleteDialog.tsx` | NEW | wrap share/dialogs/alert-dialog | ~40 | AC-4 |
| `src/features/catalog/pages/` | `InternalProductCatalogPage.tsx` | MODIFY (add delete btn + dialog state) | existing page | ~30 delta | AC-1, AC-5 |
| `src/api/graphql/` | `deleteInternalProduct.graphql` | NEW | persisted mutation | ~10 | AC-2 |
| `src/api/generated/` | `deleteInternalProduct.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/i18n/vi/` | `catalog.json` (additive keys) | ADDITIVE | i18next | ~10 keys | AC-1–4 |
| `src/i18n/en/` | `catalog.json` (additive keys) | ADDITIVE | i18next | ~10 keys | AC-1–4 |
| `tests/features/catalog/` | `ConfirmDeleteDialog.test.tsx` | NEW | Vitest + RTL | ~80 | AC-1,2,3 |
| `tests/features/catalog/` | `CannotDeleteDialog.test.tsx` | NEW | Vitest + RTL | ~50 | AC-4 |
| `tests/features/catalog/` | `InternalProductCatalogPage.delete.test.tsx` | NEW | Vitest + RTL | ~60 | AC-5 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL stable — deleteInternalProduct mutation registered)

S6  UI wire (web — delete dialogs)
    Entry: BFF S5 SDL stable + Figma wave03-cat-prod-delete.md confirmed
    Exit: E2E happy path green (delete + ERR-INV-008 block path)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | ConfirmDeleteDialog + CannotDeleteDialog + delete button + i18n keys + GraphQL op | features + i18n + graphql | BFF S5 stable | Unit test green + E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

| BR ID | Severity | UI behavior | Where | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-016` | CORNERSTONE | ẩn nút "Xóa" khi user không có quyền | `InternalProductCatalogPage.tsx` (conditional render) | AC-5 | BE là primary enforce; FE conditional render — KHÔNG show-then-disable |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-PROD-DELETE.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (dialog open) | test-ui | Click nút xóa → ConfirmDeleteDialog mở |
| AC-2 | UI (mutation + success) | test-ui | Mock mutation success → dialog close + toast |
| AC-3 | UI (cancel) | test-ui | Click Hủy / Escape → dialog close, no mutation call |
| AC-4 | UI (ERR-INV-008 → CannotDeleteDialog) | test-ui | Mock mutation ERR-INV-008 → CannotDeleteDialog render |
| AC-5 | UI (RBAC visibility) | test-ui | User thiếu quyền → nút "Xóa" không tồn tại trên DOM |
| (smoke) | E2E happy path | test-e2e | Playwright: delete flow + ERR-INV-008 block path |

## 11. i18n & a11y

### 11.1 i18n keys

> **NEED CONFIRMATION**: Nếu W03 PKG có override "fixed VN labels" (như W02), toàn bộ bảng dưới đây thay bằng hardcode VN inline — BA/PO confirm trước impl.

| Key | vi | en | AC ref |
|---|---|---|---|
| `catalog.product.delete.confirm.title` | "Xóa mã SP nội bộ" | "Delete internal product" | AC-1 |
| `catalog.product.delete.confirm.message` | "Bạn có chắc chắn muốn xóa mã SP này không? Thao tác không thể hoàn tác." | "Are you sure you want to delete this product? This action cannot be undone." | AC-1 |
| `catalog.product.delete.confirm.button.confirm` | "Xác nhận xóa" | "Confirm delete" | AC-2 |
| `catalog.product.delete.confirm.button.cancel` | "Hủy" | "Cancel" | AC-3 |
| `catalog.product.delete.blocked.title` | "Không thể xóa" | "Cannot delete" | AC-4 |
| `catalog.product.delete.blocked.message` | "Mã SP nội bộ đã phát sinh giao dịch, không thể xóa." | "This internal product has existing transactions and cannot be deleted." | AC-4 |
| `catalog.product.delete.blocked.button.close` | "Đóng" | "Close" | AC-4 |
| `catalog.product.delete.success` | "Xóa mã SP thành công" | "Product deleted successfully" | AC-2 |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` trỏ tiêu đề dialog; focus lock khi open | `ConfirmDeleteDialog` |
| AC-2 | Button loading: `aria-busy="true"`, `aria-label="Đang xóa..."` khi isLoading | prevent double-submit |
| AC-3 | Escape key close; focus restore về trigger element sau close | keyboard nav |
| AC-4 | `role="alertdialog"`, focus vào nút "Đóng" khi CannotDeleteDialog open | `CannotDeleteDialog` |
| AC-5 | Button không tồn tại trong DOM — không dùng `aria-hidden` hay `disabled` | conditional render |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-DELETE.md` | DRAFT | Primary RBAC + BR-CAT-PROD-016 enforce; cascade delete metadata; ERR-INV-008 source |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-DELETE.md` | DRAFT | `deleteInternalProduct` mutation V2-M6; `DeleteResponse` type (NEED CONFIRMATION reuse vs define — xem decision log) |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DELETE.md` | DRAFT | Mirror delete flow trên mobile — spec riêng |

**Source ID consistency** (item #18): `source_feat_sha = dccb7a05a1f14d3eac063775d25e624a1a4f42cfc1b7cc180ae43fe039c32246` phải identical với BE/BFF/Mobile files.

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-DELETE.md`](../../../../../Product/features/FEAT-CAT-PROD-DELETE.md) v2
- **Paired BE**: [`features/be/FEAT-CAT-PROD-DELETE.md`](../be/FEAT-CAT-PROD-DELETE.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-PROD-DELETE.md`](../bff/FEAT-CAT-PROD-DELETE.md)
- **Paired Mobile**: [`features/mobile/FEAT-CAT-PROD-DELETE.md`](../mobile/FEAT-CAT-PROD-DELETE.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Figma spec**: [`Product/ux/figma-web/wave03-cat-prod-delete.md`](../../../../../Product/ux/figma-web/wave03-cat-prod-delete.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **Web component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../../.claude/references/web-component-registry.yaml) (§G.X canonical scan source)
- **ADR-017**: Additive aggregates — InternalProduct entity trong gf-inventory

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-PROD-DELETE` W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map 5 ACs, §4 visual fidelity + state + i18n + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (dialogs/components/GraphQL/state). §G.X scan từ web-component-registry.yaml — Priority 2 share/ là highest match cho delete dialogs. 2 NEED CONFIRMATION items: i18n policy override + RBAC permission constant. |
