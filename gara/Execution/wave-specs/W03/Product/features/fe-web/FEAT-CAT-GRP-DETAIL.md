---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-GRP-DETAIL.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-DETAIL"
source_feat_sha: "d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2"
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
change_type: "new-capability"
consumes_backend_feats: ["FEAT-CAT-GRP-DETAIL"]
consumes_bff_feats: ["FEAT-CAT-GRP-DETAIL"]
i18n_keys: []
screens_touched:
  - "src/features/catalog/material-group/MaterialGroupDetailPage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave03-cat-grp-detail.md (node 14423:88838 — Detail Read-only screen, 1440×1024)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "b196f98b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-DETAIL.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
coverage_gaps:
  - "NEED CONFIRMATION (BA): Field 'Mô tả' được liệt kê trong source FEAT AC-2 nhưng KHÔNG xuất hiện trên PNG Figma (13501-137145.png). Spec này bám PNG: chỉ render 8 fields. BA cần xác nhận Mô tả bỏ khỏi DETAIL hay cần thêm row thứ 3."
  - "NEED CONFIRMATION (BA): Mã nhóm VTHH render màu text-primary (blue link). Navigation target chưa rõ — có thể là no-op style hoặc copy-to-clipboard. BA xác nhận hành vi click trước khi DEV impl."
---

# FEAT-CAT-GRP-DETAIL (FE Web): Xem chi tiết nhóm vật tư hàng hóa

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DETAIL` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `src/features/catalog/material-group/MaterialGroupDetailPage.tsx` |
| Cross-tier consume | BE: FEAT-CAT-GRP-DETAIL \| BFF: FEAT-CAT-GRP-DETAIL |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-DETAIL` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-DETAIL.md`](../../../../../Product/features/FEAT-CAT-GRP-DETAIL.md) |
| Source version | v4 |
| Source SHA | `d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2` |
| Generated at | 2026-06-29T15:00:00+00:00 |

## 1. Mục đích nghiệp vụ

Feature cung cấp khả năng tra cứu toàn bộ thông tin của một nhóm vật tư hàng hóa (MaterialGroup) trong danh mục kho, bao gồm thông tin mô tả, trạng thái, cấu trúc phân cấp, và lịch sử tạo/cập nhật (audit trail). Chủ garage và kế toán cần thấy đầy đủ nội dung nhóm trước khi quyết định chỉnh sửa hoặc xóa, giảm rủi ro thao tác nhầm. Feature này là điểm đọc trung tâm trong luồng CRUD nhóm VTHH của EP-INVENTORY-CATALOG, phục vụ nền dữ liệu vật tư chuẩn hóa cho toàn bộ nghiệp vụ kho V2 downstream.

## 2. Trách nhiệm FE Web (garage-web)

- **Màn hình**: `MaterialGroupDetailPage` — full-page read-only. Entry từ list page (row click hoặc row action "Xem chi tiết"). Route: `/inventory/catalog/material-group/:id`.
- **User flow**: Mở trang → FE gọi BFF query `getMaterialGroup(id)` → render header (back + h1 + status badge inline + "Chỉnh sửa" button) + section "Thông tin chung" (4-col × 2-row info grid, 8 fields) → user đọc thông tin → chọn "Chỉnh sửa" hoặc bấm back.
- **State machine UI**: `loading` (skeleton grid) → `success` (render 8 fields) → `error` (toast + empty state) → không có `empty` state (ID always resolves hoặc 404).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: scan §G.X registry trước mọi UI task. Với màn detail read-only: `share/containers/section` (section-block), `share/displays/description-item` (label-value-row), `share/buttons/button` (outline "Chỉnh sửa"), `share/badges/badge-status` (inline status pill), `share/containers/show` (conditional render RBAC "Chỉnh sửa"). KHÔNG có customs/ match cho pattern detail read-only này.
- **Figma spec là visual SSOT**: layout, color tokens, field order đều theo `Product/ux/figma-web/wave03-cat-grp-detail.md` (node `14423:88838`). Bám PNG `13501-137145.png` — 8 fields đúng theo PNG, KHÔNG tự thêm "Mô tả" (coverage_gap — xem frontmatter).
- **GraphQL op consume**: query `getMaterialGroup` từ BFF FEAT-CAT-GRP-DETAIL §6.1.
- **RBAC render**: "Chỉnh sửa" button chỉ render cho `garage-owner`; ẩn với `accountant`. Dùng `share/containers/show` gate.

## 3. Hành vi cần triển khai (FE Web behaviour map)

> i18n policy: KHÔNG dùng i18next — fixed VN labels inline (wave W03 single-locale VN per PKG-W03 §2.2).

### Cluster A — Mở màn và tải dữ liệu

#### AC-1 → FE render trang chi tiết và fetch data khi vào route

- **Khi**: user navigate tới `/inventory/catalog/material-group/:id` (từ row click hoặc URL trực tiếp).
- **FE phải**: mount `MaterialGroupDetailPage`, extract `id` từ route params, dispatch TanStack Query `useGetMaterialGroup({ id })` → gọi BFF query `getMaterialGroup`.
- **State transition**: `idle → loading` (render skeleton 4-col × 2-row) → `success` (render data) hoặc `error` (toast "Không tải được thông tin nhóm VTHH").
- **Component**: `MaterialGroupDetailPage` (NEW) + `share/loadings/loading` skeleton trong loading state.
- **GraphQL op**: `getMaterialGroup(id: ID!)` — xem §6.1.
- **i18n keys**: KHÔNG dùng i18next — fixed VN labels.
- **a11y**: page title `<h1>Chi tiết nhóm vật tư hàng hóa</h1>` announce ngay khi mount; skeleton có `aria-busy="true"`.
- **Ref**: Figma node `13501:137145` (screen Detail Read-only, `Product/ux/figma-web/wave03-cat-grp-detail.md §Screen: Detail Read-only`).

#### AC-2 → FE render 8 fields đúng thứ tự và layout Figma

- **Khi**: query AC-1 thành công, response có data.
- **FE phải**: render section "Thông tin chung" gồm 2 info row, mỗi row 4 cột dạng `InfoItem` (label trên, value dưới):
  - **Row 1**: "Mã nhóm VTHH" (value = `group.code`, render `text-primary` blue — NEED CONFIRMATION click action) · "Tên nhóm VTHH" (value = `group.name`) · "Thuộc nhóm" (value = `group.parentName ?? "—"`) · "Nhóm vật tư/hàng hóa" (value = `group.categoryLabel` — NEED CONFIRMATION field mapping).
  - **Row 2**: "Ngày tạo" · "Người tạo" · "Ngày sửa" · "Người sửa" (audit fields — AC-3).
- **Layout**: `grid grid-cols-4 gap-2` per row, plain stack KHÔNG dùng Card wrapper (Figma §8 Anti-Pattern Trap 4).
- **Component**: `share/displays/description-item` (label-value-row, Priority 2 — share/) cho mỗi InfoItem cell.
- **Design tokens**: `text-muted-foreground` cho label, `text-foreground` cho value, `text-primary` cho "Mã nhóm VTHH" value — xem Figma `wave03-cat-grp-detail.md §2 Design Token Map`.
- **a11y**: mỗi label render dưới dạng `<dt>`, value render dưới dạng `<dd>` trong `<dl>` grid.
- **Ref**: Figma `13501-137145.png L8-12` (4-col × 2-row); §5 Field Composition Schema.

#### AC-3 → FE hiển thị đầy đủ 4 audit fields (BR-CAT-CMN-002 secondary)

- **Khi**: query AC-1 thành công.
- **FE phải**: map 4 audit fields từ BFF response vào Row 2: `createdAt` (format `dd/MM/yyyy HH:mm`), `createdBy` (display name), `updatedAt` (format `dd/MM/yyyy HH:mm`), `updatedBy` (display name). Hiển thị "—" nếu null (defensive).
- **Component**: `share/displays/description-item` — tái dùng cùng pattern Row 1.
- **a11y**: label/value semantic như AC-2.
- **Ref**: BE tier `be/FEAT-CAT-GRP-DETAIL.md §3 AC-3`; Figma `13501-137145.png L11`.

### Cluster B — Navigation actions

#### AC-4 → FE navigate sang màn chỉnh sửa khi bấm "Chỉnh sửa"

- **Khi**: user bấm button outline "Chỉnh sửa" ở header.
- **FE phải**: navigate tới `/inventory/catalog/material-group/:id/edit` (route `FEAT-CAT-GRP-EDIT`). Truyền `id` qua route param; KHÔNG cần state pre-load (EDIT page tự fetch).
- **Component**: `share/buttons/button` (variant=`outline`, icon_leading=`edit-2` lucide-react size 16) — RBAC gated bởi AC-6.
- **GraphQL op**: KHÔNG cần — navigate only.
- **i18n keys**: label cố định "Chỉnh sửa".
- **a11y**: `aria-label="Chỉnh sửa nhóm vật tư hàng hóa"` trên button (icon-leading cần context).
- **Ref**: Figma `13501-137145.png L4` — outline button "Chỉnh sửa" + pencil icon; `Product/ux/figma-web/wave03-cat-grp-detail.md §1 Layout DSL EditButton`.

#### AC-5 → FE navigate về danh sách khi bấm back-arrow

- **Khi**: user bấm icon back-arrow (`arrow-left` lucide-react) ở header trái.
- **FE phải**: `router.back()` hoặc navigate tới `/inventory/catalog?tab=material-group` (list page, tab Nhóm VTHH). Ưu tiên `router.back()` để giữ filter state; fallback navigate nếu history empty.
- **Component**: `share/buttons/button` (variant=`ghost`, size=`icon`, icon=`arrow-left`).
- **a11y**: `aria-label="Quay lại danh sách nhóm vật tư hàng hóa"`.
- **Ref**: Figma `13501-137145.png L4` — back-arrow icon left of h1; `Product/ux/figma-web/wave03-cat-grp-detail.md §1 Layout DSL BackButton`.

### Cluster C — Phân quyền và platform

#### AC-6 → FE ẩn "Chỉnh sửa" button với accountant

- **Khi**: user role = `accountant`.
- **FE phải**: KHÔNG render button "Chỉnh sửa" (ẩn hoàn toàn, KHÔNG disable). Dùng `share/containers/show` gate check role từ auth context.
- **Component**: `share/containers/show` (conditional-render, Priority 2 — share/).
- **State transition**: N/A (render decision tại mount dựa vào auth context).
- **Ref**: BR-CAT-GRP-006 (xem BE tier §9); RBAC policy: `garage-owner` = full CRUD, `accountant` = read-only.

#### AC-7 → N/A (platform scope — web đầy đủ)

- AC-7 xác nhận feature có trên cả web + mobile. FE Web không cần impl thêm gì cho AC này. Xem `mobile/FEAT-CAT-GRP-DETAIL.md` cho mobile scope.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave03-cat-grp-detail.md` (node `14423:88838`) là SSOT tuyệt đối. PNG `13501-137145.png` là canonical ground-truth.
- Layout: `4-col × 2-row` info grid — KHÔNG 3 row (Mô tả absent per PNG — coverage_gap BA confirm).
- Status badge inline với h1 (KHÔNG tách row/section) — xem Figma §8 Anti-Pattern Trap 7.
- KHÔNG dùng Card wrapper quanh info grid — plain stack, bg-background — xem Figma §8 Anti-Pattern Trap 4.
- Design tokens PHẢI khớp `wave03-cat-grp-detail.md §2 Design Token Map`: `bg-background-success` + `text-foreground-success` cho badge ACTIVE; `bg-muted` + `text-muted-foreground` cho badge INACTIVE; `text-primary` cho "Mã nhóm VTHH" value link.
- "Nhóm vật tư/hàng hóa" label phải giữ nguyên dấu gạch chéo (`/`) và dấu hóa — KHÔNG tự đổi thành "Nhóm vật tư hàng hóa" (Figma `§1 Layout DSL CategoryInfo._png_verified`).

### 4.2 State machine + error handling

- 3 state tường minh: `loading` (skeleton 4-col × 2-row), `success` (render data), `error` (TOAST + empty state).
- 404 từ BFF (group không tồn tại hoặc sai tenant) → TOAST "Không tìm thấy nhóm vật tư hàng hóa" + redirect về list.
- Network error → TOAST "Không tải được dữ liệu, vui lòng thử lại".
- KHÔNG silent fail.

### 4.3 i18n + a11y

- KHÔNG dùng i18next — fixed VN labels inline (`i18n_keys: []`) per wave W03 single-locale policy.
- `<h1>`: "Chi tiết nhóm vật tư hàng hóa" (verbatim từ Figma `13501-137145.png L4`).
- `<h2>`: "Thông tin chung" (verbatim từ Figma `13501-137145.png L6`).
- InfoItem labels cố định VN per Figma (xem §5 Field Composition Schema).
- a11y: back-button và edit-button có `aria-label` đầy đủ (xem AC-5, AC-4). InfoItem dùng `<dl>/<dt>/<dd>` semantic. Skeleton có `aria-busy="true"`. Color contrast WCAG AA cho `text-muted-foreground` (label) và `text-foreground` (value).

### 4.4 RBAC render + feature flag

- `garage-owner`: thấy đầy đủ bao gồm "Chỉnh sửa" button.
- `accountant`: thấy toàn bộ thông tin read-only; "Chỉnh sửa" button bị ẩn (KHÔNG disabled — KHÔNG show then hide).
- Không có feature flag riêng cho DETAIL; gate theo catalog tab access.

### 4.5 Business rule secondary (UI hint)

- BR-CAT-CMN-002: 4 audit fields PHẢI có mặt; FE render "—" nếu server trả null (defensive fallback, không ẩn label).
- BR-CAT-GRP-006: RBAC read — FE enforce tại render layer (AC-6 ẩn "Chỉnh sửa" với accountant).
- BR primary (validation, status enforce) nằm BE — xem `be/FEAT-CAT-GRP-DETAIL.md §9`.

### 4.6 Error code mapping

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `GMS.gf-inventory.MATERIAL_GROUP_READ.03` (404) | TOAST + redirect list | `share/toasts/toast` | AC-1 |
| Network / generic 5xx | TOAST | `share/toasts/toast` | AC-1 |

---

## 5. Screen / Component breakdown

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `MaterialGroupDetailPage` | `/inventory/catalog/material-group/:id` | NEW | `14423:88838` (detail screen `13501:137145`) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 |

### 5.2 Components new/modified

> §G.X: KG parse error — author scan filesystem registry (`web-component-registry.yaml`) manually. Kết quả: không có customs/ component match pattern "read-only detail info grid". Nearest match: `share/displays/description-item` (Priority 2).

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `MaterialGroupDetailPage` | `src/features/catalog/material-group/MaterialGroupDetailPage.tsx` | NEW | `{ id: string }` từ route | TanStack Query | **Build-new** — justification: page-level container cho catalog group detail; no fit at customs/share/ui after §G.X scan (domain-new, W03 entry) | AC-1 |
| `Button` (back ghost) | `src/components/share/buttons/button.tsx` | REUSE | `variant="ghost" size="icon" aria-label="..."` | — | **Priority 2 — share/** (cross-feature baseline) | AC-5 |
| `Button` (edit outline) | `src/components/share/buttons/button.tsx` | REUSE | `variant="outline" icon_leading="edit-2"` | — | **Priority 2 — share/** (cross-feature baseline) | AC-4 |
| `BadgeStatus` (inline status) | `src/components/share/badges/badge-status.tsx` | REUSE | `status` enum, variant map ACTIVE/INACTIVE | — | **Priority 2 — share/** — override token `bg-background-success text-foreground-success rounded-full` per Figma §4 | AC-1 |
| `Section` (thông tin chung) | `src/components/share/containers/section.tsx` | REUSE | `title="Thông tin chung"` | — | **Priority 2 — share/** (form-section, panel-section) | AC-2 |
| `Show` (RBAC gate) | `src/components/share/containers/show.tsx` | REUSE | `when={isGarageOwner}` | — | **Priority 2 — share/** (conditional-render) | AC-6 |
| `DescriptionItem` (InfoItem cell) | `src/components/share/displays/description-item.tsx` | REUSE | `label: string, value: ReactNode` | — | **Priority 2 — share/** (label-value-row, info-row) | AC-2, AC-3 |
| `Loading` (skeleton) | `src/components/share/loadings/loading.tsx` | REUSE | loading screen | — | **Priority 2 — share/** | AC-1 |

### 5.3 Design tokens & Figma refs

> Tokens khớp `wave03-cat-grp-detail.md §2 Design Token Map` (anti-hallucination guard — reviewer item #21).

| Token | Tailwind class | Usage | AC ref |
|---|---|---|---|
| `bg-background-success` | `bg-background-success` | Status badge ACTIVE background | AC-1 |
| `text-foreground-success` | `text-foreground-success` | Status badge ACTIVE text | AC-1 |
| `bg-muted` | `bg-muted` | Status badge INACTIVE background | AC-1 |
| `text-muted-foreground` | `text-muted-foreground` | InfoItem label text | AC-2, AC-3 |
| `text-foreground` | `text-foreground` | InfoItem value text (default), h1, h2 | AC-2, AC-3 |
| `text-primary` | `text-primary` | "Mã nhóm VTHH" value link color | AC-2 |

> **Figma source-of-truth**: `Product/ux/figma-web/wave03-cat-grp-detail.md` (node `14423:88838`). Không re-invent layout / spacing / color.

## 6. Data integration

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `getMaterialGroup` | query | `src/api/graphql/getMaterialGroup.graphql` | `['materialGroup', id]` | `MaterialGroupDetailFragment` | AC-1, AC-2, AC-3 |

> Op phải tồn tại ở paired BFF FEAT-CAT-GRP-DETAIL §6.1 (reviewer item #16 enforce).

**Input**:
```graphql
query getMaterialGroup($id: ID!) {
  getMaterialGroup(id: $id) {
    ... on MaterialGroupApiResponse {
      success code message
      data {
        id code name description status
        parentId parentCode parentName
        createdAt createdBy updatedAt updatedBy
      }
    }
    ... on ErrorResponse {
      id code message statusCode
    }
  }
}
```

> Field `categoryLabel` (4th column "Nhóm vật tư/hàng hóa") — NEED CONFIRMATION: field này không rõ trong KG schema `material_group`. Có thể là computed từ `level` enum hoặc top-level group label. BA/BFF team xác nhận trước DEV impl.

### 6.2 REST endpoints consumed direct

Không có — FE chỉ consume qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state | TanStack Query | — | `['materialGroup', id]` | AC-1 |
| Client state | — | — | — | — |
| Form state | — | — | — | read-only screen |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/catalog/material-group/:id` | `MaterialGroupDetailPage` | prefetch `getMaterialGroup(id)` | Auth required; catalog tab access | AC-1, AC-6 |

## 7. File/module impact map (FE Web)

> Path glob ⊆ `frontend/gf-gms-web/**` (boundary isolation rule #1).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/catalog/material-group/` | `MaterialGroupDetailPage.tsx` | NEW | TanStack Query + share components | ~120 | AC-1–AC-6 |
| `src/features/catalog/material-group/hooks/` | `useGetMaterialGroup.ts` | NEW | TanStack Query wrapper | ~30 | AC-1 |
| `src/features/catalog/material-group/types/` | `material-group.types.ts` | ADDITIVE | TypeScript types | ~20 | — |
| `src/api/graphql/` | `getMaterialGroup.graphql` | NEW | persisted query | ~20 | AC-1 |
| `src/api/generated/` | `getMaterialGroup.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/routes/` | catalog routes | MODIFY (add route) | TanStack Router | ~10 | AC-1 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL + getMaterialGroup resolver stable)

S6  UI wire (web) — MaterialGroupDetailPage
    Entry: BFF S5 SDL stable + Figma wave03-cat-grp-detail.md confirmed
    Exit: E2E happy path green (smoke)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Route + Page + query hook + InfoGrid + RBAC gate | features + routes | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-CMN-002` | CORNERSTONE | Render "—" nếu audit field null (defensive) | `MaterialGroupDetailPage.tsx` | AC-3 | BE final enforce |
| `BR-CAT-GRP-006` | CORNERSTONE | Ẩn "Chỉnh sửa" với accountant (KHÔNG disable) | `MaterialGroupDetailPage.tsx` (via `Show`) | AC-6 | conditional render |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-GRP-DETAIL.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (loading → success → error) | test-ui | skeleton → data; 404 → toast + redirect |
| AC-2 | UI (field render order + tokens) | test-ui | 4-col × 2-row; text-primary cho Mã; KHÔNG có "Mô tả" (coverage_gap) |
| AC-3 | UI (audit fields) | test-ui | 4 audit fields present; format dd/MM/yyyy HH:mm |
| AC-4 | UI (navigate to edit) | test-ui | click "Chỉnh sửa" → route change |
| AC-5 | UI (back navigation) | test-ui | click back-arrow → list page |
| AC-6 | UI (RBAC visibility) | test-ui + test-isolation | garage-owner: thấy button; accountant: không thấy |
| AC-7 | N/A | — | platform scope, xem mobile tier |
| (smoke) | E2E happy path | test-e2e | Playwright: load detail → verify 8 fields → navigate edit |

## 11. i18n & a11y

### 11.1 i18n keys

KHÔNG dùng i18next — fixed VN labels inline per wave W03 single-locale policy. `i18n_keys: []`.

Labels cố định (không cần key file):
- Page title: "Chi tiết nhóm vật tư hàng hóa"
- Section: "Thông tin chung"
- Field labels: "Mã nhóm VTHH", "Tên nhóm VTHH", "Thuộc nhóm", "Nhóm vật tư/hàng hóa", "Ngày tạo", "Người tạo", "Ngày sửa", "Người sửa"
- Button: "Chỉnh sửa"
- Status badge: "Đang hoạt động" / "Ngừng hoạt động"

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `<h1>Chi tiết nhóm vật tư hàng hóa</h1>` + skeleton `aria-busy="true"` | announce on mount |
| AC-2 | InfoItem grid dùng `<dl>/<dt>/<dd>` semantic | WCAG AA color contrast |
| AC-3 | Audit row dùng cùng `<dl>/<dt>/<dd>` pattern | — |
| AC-4 | "Chỉnh sửa" button: `aria-label="Chỉnh sửa nhóm vật tư hàng hóa"` | icon-leading cần context |
| AC-5 | Back button: `aria-label="Quay lại danh sách nhóm vật tư hàng hóa"` | icon-only |
| AC-6 | KHÔNG dùng `aria-hidden` để ẩn — conditional render hoàn toàn | KHÔNG show + disable |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-DETAIL.md` | DRAFT | BR primary enforcement, `GET /api/v2/material-groups/{id}` contract |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-DETAIL.md` | N/A (pending) | GraphQL query `getMaterialGroup` — FE block DEV S6 cho đến khi BFF S5 SDL stable |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-DETAIL.md` | DRAFT (expected) | Mirror read-only detail screen; AC-7 |

**Source ID consistency** (item 18): `source_feat_sha` = `d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2` — identical với BE tier file.

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-DETAIL.md`](../../../../../Product/features/FEAT-CAT-GRP-DETAIL.md) v4
- **Paired BE**: [`features/be/FEAT-CAT-GRP-DETAIL.md`](../be/FEAT-CAT-GRP-DETAIL.md)
- **Paired BFF**: `features/bff/FEAT-CAT-GRP-DETAIL.md` (pending)
- **Figma spec**: [`Product/ux/figma-web/wave03-cat-grp-detail.md`](../../../../../Product/ux/figma-web/wave03-cat-grp-detail.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **PKG**: [`Execution/wave-specs/W03/work-packages/PKG-W03-inventory-catalog.md`](../../work-packages/PKG-W03-inventory-catalog.md)
- **Web component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **ADR-017**: [`Architecture/decisions/ADR-017.md`](../../../../../Architecture/decisions/ADR-017.md) (catalog-v2 schema: `material_group` entity)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-GRP-DETAIL` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier với BE), §2 trách nhiệm FE Web, §3 FE behaviour map 7 ACs (AC-7 N/A platform scope), §4 visual fidelity + state + i18n VN fixed + a11y + RBAC + BR secondary, §5 screen/components (8 share/ reuse, 1 build-new page), §6 getMaterialGroup query consumed. 2 NEED CONFIRMATION markers (categoryLabel field + code link click action). |
