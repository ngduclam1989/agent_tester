---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-PROD-DETAIL.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-DETAIL"
source_feat_sha: "1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d"
source_feat_version: 10
generated_at: "2026-06-29T15:00:00Z"
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
consumes_backend_feats: ["FEAT-CAT-PROD-DETAIL"]
consumes_bff_feats: ["FEAT-CAT-PROD-DETAIL"]
i18n_keys: []
screens_touched:
  - "src/features/inventory-catalog/pages/InternalProductDetailPage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave03-cat-prod-detail.md (node 14146:87538 — detail read-only, canonical frame 13492:57582)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: ""
  template_sha: "b196f9...8b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-DETAIL.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-DETAIL (FE Web): Màn hình chi tiết mã sản phẩm nội bộ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-DETAIL` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `src/features/inventory-catalog/pages/InternalProductDetailPage.tsx` |
| Cross-tier consume | BE: `FEAT-CAT-PROD-DETAIL` \| BFF: `FEAT-CAT-PROD-DETAIL` |

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-DETAIL.md`](../../../../../Product/features/FEAT-CAT-PROD-DETAIL.md) |
| Source version | v10 |
| Source SHA | `1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d` |
| Generated at | 2026-06-29T15:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu đầy đủ thông tin một mã sản phẩm nội bộ — thông tin chung, đơn vị tính quy đổi, SKU được gắn, và tệp đính kèm — để nắm bản chất vật tư và cập nhật mapping ngay trên màn hình chi tiết mà không phải vào form sửa riêng. Feature này là điểm tra cứu trung tâm trong luồng quản lý danh mục mã SP nội bộ V2, hỗ trợ nền dữ liệu vật tư phục vụ tính tồn và báo cáo toàn hệ thống Garage.

## 2. Trách nhiệm FE Web (garage-web)

- Render màn hình chi tiết đọc-chỉ (full-page) cho mã sản phẩm nội bộ, entry từ list page tab "Mã sản phẩm nội bộ"; route `NEED CONFIRMATION — xem §6.4`.
- Hiển thị section "Thông tin sản phẩm" (h2 verbatim — KHÔNG "Thông tin chung" vì đó là label của CREATE/EDIT) gồm image thumbnail 96×96 + 12 trường dạng grid 4-cột × 3-hàng + audit footer — bám figma spec `wave03-cat-prod-detail.md` node 13492:57582.
- Render 3 tab read-only (ĐVT quy đổi / Mã SKU / Đính kèm file); default active "ĐVT quy đổi"; bảng ĐVT chỉ 3 cột (STT / ĐVT / Tỷ lệ quy đổi) — KHÔNG có cột Thao tác trong detail view.
- Quản lý state UI: loading (skeleton) → success (data rendered) → error (toast/empty); tab empty → `share/emptys/no-data`.
- **Component reuse-first (`customs/` > `share/` > `ui/`)**: dùng `share/displays/description-item`, `share/containers/section`, `share/files/files-preview`, `share/containers/show`, `share/tables/table-normal`, `share/dialogs/dialog`, `share/tabs/tab-buttons` — xem §5.2.
- **Figma là SSOT visual**: layout, tokens, label verbatim theo `Product/ux/figma-web/wave03-cat-prod-detail.md` (node 14146:87538). Mọi visual AC PHẢI cross-ref figma section cụ thể.
- Consume BFF query `getInternalProduct` (V2-Q5) để load toàn bộ `skuMappings[]` + `conversionUnits[]` + `attachments[]` + display names đã enrich.

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Khởi tạo màn hình

#### AC-1 → Route load + skeleton state

- **Khi**: user navigate tới route detail (từ list page hoặc deep-link), TanStack Router resolve `:id` param.
- **FE phải**: trigger `useQuery` `getInternalProduct({ id })` khi mount; render skeleton overlay trong khi loading.
- **State transition**: idle → loading (skeleton `InternalProductDetailPage`) → success / error.
- **Component**: `InternalProductDetailPage` (NEW — `src/features/inventory-catalog/pages/InternalProductDetailPage.tsx`)
- **GraphQL op**: `getInternalProduct` query — input `{ id: UUID }`.
- **Ref**: figma `wave03-cat-prod-detail.md` frame 13492:57582.

#### AC-2 → Render thông tin chung 12 trường + image

- **Khi**: query success, `data.internalProduct` populated.
- **FE phải**: render section "Thông tin sản phẩm" (h2) + image 96×96 dưới label "Hình ảnh" + InfoRow1/2/3 theo grid 4-cột:
  - Row 1: Mã sản phẩm nội bộ (render `text-primary` blue — figma L11) / Tên sản phẩm / Tính chất / Nhóm vật tư/hàng hóa.
  - Row 2: ĐVT chính / Thương hiệu / Xuất xứ / Phương pháp tính giá.
  - Row 3: Thông số kỹ thuật / Quy cách sản phẩm / Mô tả / Ghi chú (`NEED CONFIRMATION — xem §4 Note-4`).
- **Component**: `share/containers/section` (section wrapper) + `share/displays/description-item` (mỗi InfoItem label+value) + `share/images/image-preview` (thumbnail 96×96).
- **i18n**: `NEED CONFIRMATION — W03 i18n policy` (xem §4.3).
- **a11y**: InfoItem label `text-muted-foreground` / value `text-foreground`; semantic structure label+value pair; screen reader announce.
- **Ref**: figma `13492-57582.png` L6-L15, §InfoSection DSL, §VV claim 2 (section title) + claim 3 (12 fields) + claim 6 (code `text-primary`).

#### AC-3 → Audit footer

- **Khi**: query success.
- **FE phải**: render AuditFooter (grid 4-cột) — Ngày tạo / Người tạo / Ngày sửa / Người sửa từ `createdAt`, `createdBy`, `updatedAt`, `updatedBy`.
- **Component**: `share/displays/description-item` × 4.
- **Ref**: figma `13492-57582.png` L29, §AuditFooter DSL.

### Cluster B — Tabs dữ liệu liên quan

#### AC-4 → TabsSection 3 tab read-only

- **Khi**: page load success.
- **FE phải**: render `share/tabs/tab-buttons` với labels verbatim "ĐVT quy đổi" / "Mã SKU" / "Đính kèm file"; default active = "ĐVT quy đổi". Tab switch = local client state.
- **Component**: `share/tabs/tab-buttons` (Priority 2 — share/).
- **a11y**: `role="tablist"` + `role="tab"` + `role="tabpanel"` + keyboard Arrow nav.
- **Ref**: figma `13492-57582.png` L19, §TabsSection DSL (_children_count=3).

#### AC-5 → Tab ĐVT quy đổi — danh sách + khởi tạo thêm

- **Khi**: user active tab "ĐVT quy đổi".
- **FE phải**: render `ConversionUnitReadonlyTable` — 3 cột ONLY (STT / ĐVT / Tỷ lệ quy đổi), KHÔNG cột Thao tác (figma §VV claim 5 confirmed); data từ `conversionUnits[]`. Empty → `share/emptys/no-data`. Button "Thêm ĐVT quy đổi" ở header (AC-10) mở `AddConversionUnitDialog`.
- **Component**: `share/tables/table-normal` (Priority 2 — share/) + `share/containers/show` + `AddConversionUnitDialog` (NEW).
- **GraphQL op (dialog submit)**: `NEED CONFIRMATION — mutation op name pending BFF spec §6.1`.
- **Ref**: figma `13492-57582.png` L21-26, §ConversionUnitReadonlyTable DSL (read_only=true, _children_count=3).

#### AC-6 → Tab Mã SKU — danh sách + gắn SKU

- **Khi**: user chuyển sang tab "Mã SKU".
- **FE phải**: render `SkuMappingReadonlyTable` (read-only) từ `skuMappings[]` — cột gợi ý: STT / Mã SKU / Tên sản phẩm. Empty → `share/emptys/no-data`. Button "Gắn SKU" ở header (AC-10) mở `AssignSkuDialog`.
- **Component**: `share/tables/table-normal` (Priority 2 — share/) + `share/dialogs/dialog` (AssignSkuDialog shell) + `share/containers/show`.
- **GraphQL op (dialog submit)**: `NEED CONFIRMATION — mutation op name pending BFF spec §6.1`.
- **a11y**: table column headers `scope="col"`.
- **Ref**: figma Tab "Mã SKU" (4 non-primary variants — layout từ AC text; bám tên cột tiếng Việt verbatim).

#### AC-7 → Bỏ gắn SKU

`NEED CONFIRMATION` — Trigger point của "Bỏ gắn SKU" trong detail view chưa rõ từ figma primary frame (13492:57582 chỉ spec ĐVT tab; Mã SKU tab không trong primary spec). FE tạm đề xuất: row-level action trong `SkuMappingReadonlyTable` (nút xóa per row). Nếu BA confirm → FE render `share/dialogs/alert-confirm` trước khi gọi mutation remove + invalidate TanStack Query `['internal-product', id]`. Nếu move sang Edit flow → AC-7 = N/A tại detail page. BA/Architecture Authority cần confirm trước impl.

#### AC-8 → Tab Đính kèm file

- **Khi**: user chuyển sang tab "Đính kèm file".
- **FE phải**: dùng `share/files/files-preview` với `attachments[]` (file_name, file_url, file_size, mime_type) — read-only, KHÔNG render upload input tại detail view. File download: compose URL = env domain config + `fileUrl` (ADR-016: `fileUrl` là relative path / object key, KHÔNG có scheme). Empty → `share/emptys/no-data`.
- **Component**: `share/files/files-preview` (Priority 2 — share/).
- **Ref**: ADR-016 §Access pattern.

### Cluster C — Nút hành động header

#### AC-10 → 3 outline buttons (Chỉnh sửa / Gắn SKU / Thêm ĐVT quy đổi)

- **Khi**: page load success.
- **FE phải**: render 3 `share/buttons/button` variant=`outline` với icon leading từ lucide-react:
  - "Chỉnh sửa" — icon `edit-2` → navigate tới FEAT-CAT-PROD-EDIT route (figma L4 §EditButton).
  - "Gắn SKU" — icon `add` → `setAssignSkuOpen(true)` (figma L4 §AssignSkuButton).
  - "Thêm ĐVT quy đổi" — icon `add` → `setAddUnitOpen(true)` (figma L4 §AddUnitButton).
- **State**: button hover background = `bg-muted` (figma §3 DETAIL-specific token).
- **Component**: `share/buttons/button` variant=outline × 3 (Priority 2 — share/).
- **Ref**: figma `13492-57582.png` L4, §PageActionGroup DSL (_children_count=3), §Icon Catalog.

### Cluster D — Phân quyền

#### AC-11 → RBAC render buttons

`NEED CONFIRMATION` — Bundle không cung cấp explicit RBAC mapping cho action buttons tại detail view. FE đề xuất: hiện toàn bộ 3 buttons cho cả `garage-owner` + `accountant` (dual persona per Critical Rule #6). Nếu BA confirm role restriction (vd chỉ `garage-owner` được gắn SKU) → FE dùng `share/containers/show` gate per-button (KHÔNG CSS hide). Chờ BA confirm.

### Cluster E — Mobile scope

#### AC-12 → N/A (FE-Web)

AC-12 mô tả phạm vi read-only của `garage-mobile` platform. FE-Web không touch. Xem `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DETAIL.md`.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave03-cat-prod-detail.md` (node 14146:87538, frame 13492:57582 — §VV verified 2026-06-29T04:25Z).
- Section title PHẢI verbatim "Thông tin sản phẩm" (h2) — KHÔNG "Thông tin chung" (figma §VV claim 2, §_negative_coverage).
- Header PHẢI có đúng 3 outline buttons — KHÔNG 1 như GRP-DETAIL (figma §_negative_coverage claim 1).
- Image "Hình ảnh" render RIÊNG phía trên info grid, KHÔNG inline trong grid (figma §_negative_coverage claim 4).
- Tab ĐVT: CHỈ 3 cột (STT/ĐVT/Tỷ lệ quy đổi); KHÔNG cột Thao tác (figma §VV claim 5).
- Mã code field: `text-primary` blue — KHÔNG `text-foreground` (figma §VV claim 6, L11).
- Status badge: `bg-background-success` / `text-foreground-success` pill "Đang hoạt động" (figma §StatusBadgeInline DSL).
- Label text: `text-muted-foreground`; value text: `text-foreground` (figma §InfoItem DSL).
- KHÔNG wrap InfoSection trong card-chrome (figma §8 Trap — info grid plain stack, no card wrapper).
- Design tokens §5.3 PHẢI khớp 6 tokens detected §G.Y (anti-hallucination guard).

### 4.2 State machine + error handling

- State: `idle | loading | success | error`.
- loading → skeleton overlay toàn trang.
- error (fetch) → TOAST + retry option.
- Tab empty → `share/emptys/no-data` per tab (độc lập).
- Modal submit error → INLINE (form field) hoặc TOAST per §4.6.
- KHÔNG silent fail.

### 4.3 i18n + a11y

- `NEED CONFIRMATION` — W03 i18n policy chưa declared. Verify BA/PO trước impl: nếu fixed VN labels (pattern W02) → hardcode inline, `i18n_keys: []`; nếu i18next → keys `src/i18n/{vi,en}.json` theo §11.1.
- a11y: back button `aria-label="Quay lại"`; icon-only buttons có `aria-label`; tab group keyboard Arrow nav; table column headers `scope="col"`; modal focus trap + Escape close.
- Semantic HTML: h1 page title, h2 section title; InfoItem label/value có readable pairing.

### 4.4 RBAC render

- `NEED CONFIRMATION` — xem AC-11 §3 Cluster D.
- Default: render 3 buttons cho cả `garage-owner` + `accountant`.
- Unauthorized route → redirect tới list (403 from BFF).
- Hidden controls dùng `<Show when={...}>` — KHÔNG CSS hide (WCAG 2.1).

### 4.5 Business rule secondary (UI hint)

- **BR-CAT-PROD-012** (ĐVT immutable khi có giao dịch): nếu AC-7 confirm remove tại detail — disable/hide row action + toast BFF reject. BE primary enforce.
- **BR-CAT-PROD-013** (1 SKU ≤ 1 mã nội bộ): `AssignSkuDialog` render toast `ERR-INV-015` khi BFF reject. BE primary enforce.
- **BR-CAT-PROD-015** (≤5 tệp/product): tab "Đính kèm file" read-only display only; upload = Edit flow scope.
- **BR-CAT-CMN-001** (audit trail): AuditFooter PHẢI hiển thị đầy đủ 4 audit fields từ response. BE persist.

**Note-4 — Coverage gap (Ghi chú field)**: `NEED CONFIRMATION` — figma §VV "Ghi chú" hiển thị text dạng system message "ĐVT chính không được sửa vì mã đã phát sinh giao dịch." (figma §_negative_coverage ghi "Ghi chú visible"). Cần BA confirm: (a) user-entered `notes` field → render InfoItem bình thường; (b) system-generated conditional message → FE cần kiểm tra `mainUnitLocked` flag từ BFF và render system text. Spec hiện tại render `notes` field từ response; conditional logic pending confirm.

### 4.6 Error code mapping

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-015` | TOAST | `share/toasts/toast` | AC-6 (SKU đã thuộc mã khác) |
| `ERR-INV-013` | INLINE | `AddConversionUnitDialog` field conversionRate | AC-5 (rate ≤ 0) |
| `ERR-INV-047` | INLINE | `AddConversionUnitDialog` field conversionRate | AC-5 (scale > 6 chữ số) |
| `ERR-INV-014` | TOAST | `share/toasts/toast` | AC-5 (ĐVT duplicate) |
| Network / generic | TOAST | `share/toasts/toast` | AC-1 (fetch fail) |

---

## 5. Screen / Component breakdown

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `InternalProductDetailPage` | `/inventory/catalog/internal-products/:id` (`NEED CONFIRMATION`) | NEW | `13492:57582` | AC-1..AC-11 |

### 5.2 Components new/modified

> §G.X: KG parse error — author scanned `src/components/{customs,share,ui}/` via registry `.claude/references/web-component-registry.yaml`. No `customs/` match for any need below (no domain-specific inventory component exists in registry). All reuse at **Priority 2 — share/**. Build-new entries have justification.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `description-item` | `src/components/share/displays/description-item.tsx` | REUSE | `{ label, value }` | — | **Priority 2 — share/** (registry `description-item` — label-value pair cho detail view; InfoItem anatomy) | AC-2, AC-3 |
| `section` | `src/components/share/containers/section.tsx` | REUSE | `{ title, children }` | — | **Priority 2 — share/** (registry `section-block` — section với title; "Thông tin sản phẩm" wrapper) | AC-2 |
| `show` | `src/components/share/containers/show.tsx` | REUSE | `{ when }` | — | **Priority 2 — share/** (registry `conditional-render` — preferred over `&&`/ternary per anti-pattern ap-conditional-render-without-show) | AC-5, AC-6, AC-8, AC-11 |
| `files-preview` | `src/components/share/files/files-preview.tsx` | REUSE | `{ files }` | — | **Priority 2 — share/** (registry `files-preview` — attachment list read-only; Tab Đính kèm file) | AC-8 |
| `table-normal` | `src/components/share/tables/table-normal.tsx` | REUSE | `{ columns, data }` | — | **Priority 2 — share/** (registry `table-normal` — simple read-only table; ĐVT 3-col + SKU tab) | AC-5, AC-6 |
| `button` | `src/components/share/buttons/button.tsx` | REUSE | `{ variant: "outline", size }` | — | **Priority 2 — share/** (registry `primary-button` — outline variant; 3 header action buttons) | AC-10 |
| `dialog` | `src/components/share/dialogs/dialog.tsx` | REUSE | `{ open, onOpenChange }` | — | **Priority 2 — share/** (registry `dialog-modal` — modal shell; AssignSkuDialog + AddConversionUnitDialog) | AC-5, AC-6 |
| `alert-confirm` | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `{ open, onConfirm, onCancel }` | — | **Priority 2 — share/** (registry `alert-confirm` — confirm dialog; pending AC-7 confirm) | AC-7 |
| `badge-status` | `src/components/share/badges/badge-status.tsx` | REUSE | `{ status: "ACTIVE" }` | — | **Priority 2 — share/** (registry `badge-status` — status pill; ACTIVE = `bg-background-success` per figma §StatusBadgeInline) | AC-2 |
| `no-data` | `src/components/share/emptys/no-data.tsx` | REUSE | `{}` | — | **Priority 2 — share/** (registry `no-data` — empty state; each tab empty case) | AC-5, AC-6, AC-8 |
| `tab-buttons` | `src/components/share/tabs/tab-buttons.tsx` | REUSE | `{ tabs, active, onChange }` | local | **Priority 2 — share/** (registry `tab-buttons` — 3-tab group ĐVT/SKU/Attachment) | AC-4 |
| `image-preview` | `src/components/share/images/image-preview.tsx` | REUSE | `{ src, width: 96, height: 96 }` | — | **Priority 2 — share/** (registry `image-preview` — product thumbnail 96×96 với lightbox; figma §ImageSubsection) | AC-2 |
| `InternalProductDetailPage` | `src/features/inventory-catalog/pages/InternalProductDetailPage.tsx` | NEW | `{ id: string }` route param | fetch + dialog open state | **Build-new** — justification: page-level route component cho inventory-catalog; no customs/share/ui page template covers full detail layout; after registry scan no fit at any layer | AC-1..AC-11 |
| `AssignSkuDialog` | `src/features/inventory-catalog/components/product-detail/AssignSkuDialog.tsx` | NEW | `{ open, onOpenChange, internalProductId }` | form + search state | **Build-new** — justification: domain-specific SKU search + assign flow; no customs/ entry for inventory SKU mapping; uses `share/dialogs/dialog` shell + `share/tables/table-normal` internally | AC-6 |
| `AddConversionUnitDialog` | `src/features/inventory-catalog/components/product-detail/AddConversionUnitDialog.tsx` | NEW | `{ open, onOpenChange, internalProductId }` | form state | **Build-new** — justification: domain-specific conversion unit input (uomCode + conversionRate ≤6 decimal); no customs/ fit; uses `share/dialogs/dialog` + `share/inputs/input-number` + `share/inputs/input-select` internally | AC-5 |

### 5.3 Design tokens & Figma refs

> Tokens match §G.Y "Design tokens referenced" — 6 tokens (anti-hallucination guard; reviewer item #21).

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-background-success` | `tailwind.config.js` / tokens | ACTIVE status badge background (figma §StatusBadgeInline) | AC-2 |
| `bg-muted` | tokens | Outline button hover state (figma §3 DETAIL-specific) | AC-10 |
| `text-foreground` | tokens | InfoItem value text màu mặc định (figma §InfoItem DSL) | AC-2, AC-3 |
| `text-foreground-success` | tokens | ACTIVE status badge text (figma §StatusBadgeInline) | AC-2 |
| `text-muted-foreground` | tokens | InfoItem label text color (figma §InfoItem DSL L2) | AC-2, AC-3 |
| `text-primary` | tokens | Mã code field value màu BLUE link (figma §VV claim 6, L11 §CodeInfo) | AC-2 |

> Figma source-of-truth: `Product/ux/figma-web/wave03-cat-prod-detail.md` node 14146:87538, frame 13492:57582.

---

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `getInternalProduct` | query | `src/api/graphql/getInternalProduct.graphql` | `['internal-product', id]` | `InternalProductDetailFragment` | AC-1..AC-8 |
| `assignInternalProductSku` | mutation | `src/api/graphql/assignInternalProductSku.graphql` | — | — | AC-6 (`NEED CONFIRMATION — op name pending BFF spec`) |
| `addInternalProductConversionUnit` | mutation | `src/api/graphql/addInternalProductConversionUnit.graphql` | — | — | AC-5 (`NEED CONFIRMATION — op name pending BFF spec`) |
| `removeInternalProductSku` | mutation | `src/api/graphql/removeInternalProductSku.graphql` | — | — | AC-7 (`NEED CONFIRMATION — op name + AC-7 trigger pending BA confirm`) |

> Tất cả op phải tồn tại ở paired BFF FEAT §6.1 trước khi FE impl (reviewer item #16).

### 6.2 REST endpoints consumed direct

N/A — tất cả thông qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (detail data) | TanStack Query | — | `['internal-product', id]` | AC-1..AC-8 |
| Active tab | React local state | `InternalProductDetailPage` | `activeTab` | AC-4 |
| AssignSku dialog open | React local state | `InternalProductDetailPage` | `assignSkuOpen` | AC-6, AC-10 |
| AddUnit dialog open | React local state | `InternalProductDetailPage` | `addUnitOpen` | AC-5, AC-10 |
| Modal form state | react-hook-form | local per dialog | — | AC-5, AC-6 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/catalog/internal-products/:id` (`NEED CONFIRMATION`) | `InternalProductDetailPage` | prefetch `getInternalProduct(id)` | auth: `garage-owner` \| `accountant` | AC-1 |

---

## 7. File/module impact map (FE Web)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| Page | `src/features/inventory-catalog/pages/InternalProductDetailPage.tsx` | NEW | — | ~180 | AC-1..AC-11 |
| Component | `src/features/inventory-catalog/components/product-detail/AssignSkuDialog.tsx` | NEW | share/dialogs/dialog + table-normal | ~120 | AC-6 |
| Component | `src/features/inventory-catalog/components/product-detail/AddConversionUnitDialog.tsx` | NEW | share/dialogs/dialog + input-number + input-select | ~90 | AC-5 |
| GraphQL | `src/api/graphql/getInternalProduct.graphql` | NEW | persisted query | ~30 | AC-1..AC-8 |
| GraphQL | `src/api/graphql/assignInternalProductSku.graphql` | NEW | mutation | ~15 | AC-6 |
| GraphQL | `src/api/graphql/addInternalProductConversionUnit.graphql` | NEW | mutation | ~15 | AC-5 |
| GraphQL | `src/api/graphql/removeInternalProductSku.graphql` | NEW | mutation | ~12 | AC-7 |
| Generated | `src/api/generated/getInternalProduct.generated.ts` | AUTO-GEN | codegen | — | — |
| i18n | `src/i18n/vi/inventory-catalog.json` | ADDITIVE | i18next (`NEED CONFIRMATION policy`) | ~40 | AC-2..AC-8 |
| Routes | `src/routes/inventory-catalog-routes.tsx` | MODIFY (add route) | TanStack Router | ~10 | AC-1 |
| Tests | `src/features/inventory-catalog/pages/InternalProductDetailPage.test.tsx` | NEW | Vitest + RTL | ~160 | AC-1..AC-11 |

---

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL + getInternalProduct resolver + mutation ops stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (wave03-cat-prod-detail.md ACTIVE)
    Exit:  E2E happy path green (smoke — detail load + tab switch + AssignSku modal open)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | `InternalProductDetailPage` + 3 tab panels + `AssignSkuDialog` + `AddConversionUnitDialog` + routing + TanStack state | features + routes | BFF S5 stable | E2E smoke green | BFF S5 |

---

## 9. Business Rules to enforce (FE — UI hint secondary)

> Primary enforcement = BE tier (`features/be/FEAT-CAT-PROD-DETAIL.md §9`).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-012` | CORNERSTONE | Disable/hide remove action cho ĐVT khi immutable (pending AC-7 confirm); toast BFF reject | `InternalProductDetailPage.tsx` + `SkuMappingReadonlyTable` | AC-7 | BE final enforce |
| `BR-CAT-PROD-013` | CORNERSTONE | `AssignSkuDialog`: toast `ERR-INV-015` khi SKU đã thuộc mã khác | `AssignSkuDialog.tsx` | AC-6 | BE final enforce |
| `BR-CAT-PROD-015` | NORMAL | Tab "Đính kèm file" read-only display; KHÔNG render upload input tại detail | `InternalProductDetailPage.tsx` | AC-8 | Upload = Edit flow |
| `BR-CAT-CMN-001` | NORMAL | AuditFooter: render đầy đủ 4 audit fields từ response | `InternalProductDetailPage.tsx` AuditFooter | AC-3 | BE persist audit |

---

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (loading state + route param mount) | test-ui | skeleton → data render |
| AC-2 | UI (12 InfoItem grid + image + tokens) | test-ui | snapshot + `text-primary` class on code field |
| AC-3 | UI (audit footer 4 fields) | test-ui | createdAt/by + updatedAt/by present |
| AC-4 | UI (tab switch state) | test-ui | active tab highlight changes |
| AC-5 | UI (ĐVT table 3-col only + AddUnit dialog open) | test-ui | column count = 3, no "Thao tác" |
| AC-6 | UI (SKU tab + AssignSku dialog open) | test-ui | dialog visibility on button click |
| AC-7 | UI (blocked — NEED CONFIRMATION trigger) | test-ui | defer pending BA confirm |
| AC-8 | UI (FilesPreview + empty state) | test-ui | files-preview render + no-data fallback |
| AC-10 | UI (3 outline buttons + click behavior) | test-ui | button count = 3; navigate + dialog open mocks |
| AC-11 | UI (RBAC — NEED CONFIRMATION role mapping) | test-ui + test-isolation | dual persona; defer pending confirm |
| AC-12 | N/A | — | Mobile spec |
| (smoke) | E2E happy path | test-e2e | Playwright: load detail → verify 12 fields → switch tab → open assign-sku modal |

---

## 11. i18n & a11y

### 11.1 i18n keys

> `NEED CONFIRMATION` — W03 i18n policy pending BA/PO confirm (fixed VN labels vs i18next). Keys dưới đây áp dụng nếu i18next policy active cho W03.

| Key | vi | en | AC ref |
|---|---|---|---|
| `inventory-catalog.product-detail.page-title` | "Chi tiết sản phẩm" | "Product Detail" | AC-1 |
| `inventory-catalog.product-detail.section-info` | "Thông tin sản phẩm" | "Product Information" | AC-2 |
| `inventory-catalog.product-detail.label-image` | "Hình ảnh" | "Image" | AC-2 |
| `inventory-catalog.product-detail.tab-unit` | "ĐVT quy đổi" | "Conversion Units" | AC-4 |
| `inventory-catalog.product-detail.tab-sku` | "Mã SKU" | "SKU Mapping" | AC-4 |
| `inventory-catalog.product-detail.tab-attachment` | "Đính kèm file" | "Attachments" | AC-4 |
| `inventory-catalog.product-detail.btn-edit` | "Chỉnh sửa" | "Edit" | AC-10 |
| `inventory-catalog.product-detail.btn-assign-sku` | "Gắn SKU" | "Assign SKU" | AC-10 |
| `inventory-catalog.product-detail.btn-add-unit` | "Thêm ĐVT quy đổi" | "Add Conversion Unit" | AC-10 |
| `inventory-catalog.product-detail.status-active` | "Đang hoạt động" | "Active" | AC-2 |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | Back button `aria-label="Quay lại"` (icon-only ghost button) | lucide arrow-left |
| AC-2 | InfoItem semantic pairing label + value; color contrast WCAG AA cho `text-muted-foreground` | tokens |
| AC-4 | Tab group: `role="tablist"`, tab `role="tab"`, panel `role="tabpanel"` + Arrow key nav | share/tabs/tab-buttons verify |
| AC-5, AC-6 | Table `role="table"`, column headers `scope="col"` | WCAG 1.3.1 |
| AC-10 | 3 buttons có text label → OK; hover state `bg-muted` contrast check | icon-leading không icon-only |
| AC-11 | Hidden controls via `<Show when={...}>` — KHÔNG CSS visibility/display:none | WCAG 2.1 |
| Dialog | Focus trap khi dialog open; Escape close; return focus to trigger khi close | share/dialogs/dialog |

---

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-DETAIL.md` | DRAFT | BR primary enforcement (BR-CAT-PROD-011..015), V2-8 endpoint contract source |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-DETAIL.md` | PENDING | `getInternalProduct` (V2-Q5) + mutation ops — FE-Web KHÔNG impl trước BFF SDL stable |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DETAIL.md` | PENDING | AC-12 scope (read-only mobile view) |

**Source ID consistency** (item 18): `source_feat_sha` = `1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d` — identical với BE/BFF/Mobile files.

---

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-DETAIL.md`](../../../../../Product/features/FEAT-CAT-PROD-DETAIL.md) v10
- **Paired BE**: [`features/be/FEAT-CAT-PROD-DETAIL.md`](../be/FEAT-CAT-PROD-DETAIL.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-PROD-DETAIL.md`](../bff/FEAT-CAT-PROD-DETAIL.md) (pending)
- **Paired Mobile**: [`features/mobile/FEAT-CAT-PROD-DETAIL.md`](../mobile/FEAT-CAT-PROD-DETAIL.md) (pending)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Figma spec**: [`Product/ux/figma-web/wave03-cat-prod-detail.md`](../../../../../Product/ux/figma-web/wave03-cat-prod-detail.md) (node 14146:87538)
- **ADR-016**: file access pattern (pdfUrl relative path, compose URL from env domain)
- **ADR-017**: InternalProduct additive entities (tables + fields source)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-PROD-DETAIL` W03. Policy v2 tier-authoritative: §0 audit slim, §1 identical cross-tier business goal, §2 FE Web responsibilities, §3 behaviour map 11 ACs (AC-12 N/A mobile, AC-7 + AC-11 NEED CONFIRMATION), §4 visual fidelity (figma SSOT 6 tokens) + state + i18n NC + RBAC NC + BR secondary + error mapping, §5 screen + 17-entry component table (customs scan: no fit → Priority 2 share/ all; 3 build-new justified) + 6-token table, §6 4 GraphQL ops (2 NC pending BFF spec), §7 file map, §8 S6 DAG, §9 BR secondary, §10 test hand-off, §11 i18n NC + a11y, §12 cross-tier. 5 NEED CONFIRMATION items total. |
