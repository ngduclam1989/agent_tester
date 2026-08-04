---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-PROD-EDIT.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-EDIT"
source_feat_sha: "e4531a39c8012b1c1c166f8490890d8f31fb7e9c7683282bfc6438e0a142b6dc"
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
consumes_backend_feats: ["FEAT-CAT-PROD-EDIT"]
consumes_bff_feats: ["FEAT-CAT-PROD-EDIT"]
i18n_keys: []
screens_touched:
  - "src/features/inventory-catalog/pages/InternalProductEditPage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave03-cat-prod-edit.md (node 14146:87153 — Edit Form full page; screen 13489:260701 — Tab ĐVT quy đổi prefilled canonical)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "n/a"
  template_sha: "b196f98b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-EDIT.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-EDIT (FE Web): Chỉnh sửa mã sản phẩm nội bộ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-EDIT` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `src/features/inventory-catalog/pages/InternalProductEditPage.tsx` |
| Cross-tier consume | BE: `FEAT-CAT-PROD-EDIT` \| BFF: `FEAT-CAT-PROD-EDIT` |

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-EDIT.md`](../../../../../Product/features/FEAT-CAT-PROD-EDIT.md) |
| Source version | v10 |
| Source SHA | `e4531a39c8012b1c1c166f8490890d8f31fb7e9c7683282bfc6438e0a142b6dc` |
| Generated at | 2026-06-29T15:00:00Z |

## 1. Mục đích nghiệp vụ

Feature này cho phép chủ garage và kế toán cập nhật thông tin mã sản phẩm nội bộ sau khi tạo — đảm bảo danh mục vật tư luôn phản ánh thực tế vận hành. Hệ thống phân biệt rõ hai loại trường: trường bất biến hoàn toàn (mã SP, phương pháp tính giá) và trường bất biến có điều kiện (ĐVT chính — khoá khi đã phát sinh giao dịch kho). Feature thuộc luồng quản trị danh mục và cùng với CREATE/DETAIL/DELETE tạo thành vòng đời đầy đủ cho mã SP nội bộ — nền dữ liệu vật tư cho toàn bộ nghiệp vụ tồn kho V2.

## 2. Trách nhiệm FE Web (garage-web)

- Hiển thị trang chỉnh sửa full-page "Sửa sản phẩm" (Figma node `14146:87153`): pre-fill toàn bộ field từ dữ liệu sản phẩm hiện tại, layout tương tự CREATE với title "Sửa sản phẩm" và submit button "Lưu" (xem `wave03-cat-prod-edit.md §0 ASCII Mockup`).
- Enforce immutability matrix UI: render "Mã sản phẩm nội bộ" và "Phương pháp tính giá" luôn read-only; render "ĐVT chính" disabled khi sản phẩm đã có giao dịch (NEED CONFIRMATION #2).
- Cung cấp tab panel quản lý dữ liệu phụ trợ trong form sửa: tab "ĐVT quy đổi" (default trong EDIT — Figma `13489:260701`), "Mã SKU", "Đính kèm file" — mỗi tab có thao tác thêm/sửa/xóa độc lập qua BFF mutation.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: §G.X báo KG parse error → scan filesystem `src/components/{customs,share,ui}/` manually trước khi build-new.
- **Figma spec là visual SSOT**: bám `wave03-cat-prod-edit.md` cho layout, labels, button text ("Lưu" NOT "Tạo"), tab order, disabled field style. KHÔNG suy luận visual từ AC/BR text đơn thuần.
- Consume BFF query `getInternalProduct` để prefill form; mutations `updateInternalProduct` (V2-M5), SKU-mapping (V2-M7/M8), conversion-unit (V2-M9–M11), attachment (V2-M12/M13).
- RBAC: cả hai persona `garage-owner` và `accountant` có quyền truy cập trang edit; route guard redirect nếu chưa authenticated.

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Khởi tạo và phân quyền

#### AC-1 → Tải dữ liệu sản phẩm và pre-fill form

- **Khi**: người dùng navigate tới route edit page (`/inventory/catalog/internal-products/:id/edit` — NEED CONFIRMATION #4)
- **FE phải**: gọi BFF query `getInternalProduct(id)`, hiển thị loading skeleton; khi response về gọi `form.reset(productData)` (KHÔNG dùng `defaultValues=""`) để pre-fill tất cả field theo `product.*` keys từ Figma DSL `§1 InfoSection`
- **State transition**: `idle → loading (skeleton trên toàn form) → success (form prefilled) | error (toast + redirect về danh sách)`
- **Component**: `InternalProductEditPage` + `share/loadings/loading-screen`
- **GraphQL op**: `getInternalProduct` — input `{ id: string }` → output scalar fields + `skuMappings[]` + `conversionUnits[]` + `attachments[]` (NEED CONFIRMATION #3 — tên op chính xác)
- **Ref**: Figma `wave03-cat-prod-edit.md §5 Field Composition Schema`

#### AC-10 → Kiểm tra quyền truy cập trang chỉnh sửa

- **Khi**: người dùng truy cập route edit page
- **FE phải**: TanStack Router `beforeLoad` kiểm tra authentication + persona (`garage-owner` hoặc `accountant`); chưa auth → redirect `/login`; persona không hợp lệ → redirect trang danh sách với toast lỗi
- **State transition**: unauthorized → redirect (không render trang)
- **Component**: route guard wrapper trong `src/routes/inventory-catalog-routes.tsx`

### Cluster B — Immutability matrix UI

#### AC-2 → Mã sản phẩm nội bộ render read-only

- **Khi**: form load thành công
- **FE phải**: render field "Mã sản phẩm nội bộ" (`share/inputs/input`) với prop `disabled=true` — hiển thị giá trị hiện tại (vd `IP-BP-0001`) nhưng không cho phép sửa; KHÔNG include `code` trong submit payload
- **Lưu ý**: Figma `_negative_coverage` ghi "Mã sản phẩm nội bộ editable per PNG" — spec này ưu tiên BR-CAT-PROD-004 (code immutable) thay vì Figma visual
- **Component**: `share/inputs/input` (disabled) — Priority 2 share/
- **Ref**: BE tier §9 BR-CAT-PROD-004; Figma `13489-260701.png` L8

#### AC-3 → ĐVT chính disable khi đã có giao dịch

- **Khi**: BFF product detail response trả về `hasTransactions: true` (hoặc equivalent — NEED CONFIRMATION #2)
- **FE phải**: render "ĐVT chính" field (`share/inputs/input-select`) với `disabled` + className `bg-gray-50` (muted background theo Figma `13489-260701.png` L10 — "Cái" field grayed); safe fallback: disable luôn trong edit mode nếu flag không có (match Figma always-grayed)
- **NEED CONFIRMATION #2**: BFF `getInternalProduct` response phải include `hasTransactions: boolean` hoặc `canEditMainUnit: boolean` để FE conditional disable. Không có flag → FE mặc định disable ĐVT chính trong edit mode.
- **Component**: `share/inputs/input-select` (disabled, bg-gray-50) — Priority 2 share/
- **Ref**: Figma `wave03-cat-prod-edit.md §1 PrimaryUnitField`; BR-CAT-PROD-006

#### AC-5 → Phương pháp tính giá luôn read-only

- **Khi**: form load (không phụ thuộc transaction state)
- **FE phải**: render "Phương pháp tính giá" (`share/inputs/input-select`) với `disabled=true` + className `bg-gray-50` — hiển thị "Bình quân cuối kỳ" (enum `PWA`); không toggle
- **Component**: `share/inputs/input-select` (disabled, bg-gray-50) — Priority 2 share/
- **Ref**: Figma `13489-260701.png` L12 `_png_verified: "Bình quân cuối kỳ" shown grayed bg-gray-50`; BR-CAT-PROD-010

### Cluster C — Chỉnh sửa thông tin chung

#### AC-4 → Sửa các field thông tin chung và ảnh sản phẩm

- **Khi**: người dùng chỉnh sửa bất kỳ field editable nào trong InfoSection
- **FE phải**:
  - "Tên sản phẩm": `share/inputs/input` — required, Priority 2 share/
  - "Thương hiệu": `share/inputs/input` (text — free-text varchar(255); NEED CONFIRMATION #1: Figma DSL `type: Select, prefill_key: product.brand_id` nhưng bundle API spec says free-text — FE render `Input` pending BA confirmation) — Priority 2 share/
  - "Tính chất", "Nhóm vật tư/hàng hóa", "Trạng thái", "Xuất xứ": `share/inputs/input-select` — Priority 2 share/; "Nhóm" chỉ show ACTIVE groups (BR-CAT-PROD-009)
  - "Thông số kỹ thuật", "Quy cách sản phẩm", "Mô tả", "Ghi chú": `share/textareas/textarea` — "Ghi chú" + "Mô tả" maxLength 500 (BR-CAT-PROD-025); Priority 2 share/
  - Ảnh sản phẩm: `share/images/image-upload` (252×280px — Figma `§1 ImageUpload`); clear-by-null: khi user xóa ảnh → `imageUrl: null` trong payload; Priority 2 share/
  - Validation client-side qua react-hook-form: "Tên sản phẩm" required; textarea maxLength
- **Component**: `share/forms/form-field` (wrapper) + inputs/selects/textareas per field — Priority 2 share/
- **Ref**: Figma `wave03-cat-prod-edit.md §1 InfoSection FieldGrid + SpecRow + DescriptionRow`

#### AC-6 → Đổi trạng thái sản phẩm

- **Khi**: người dùng chọn trạng thái mới trong Select "Trạng thái"
- **FE phải**: update `form.values.status`; render "Đang hoạt động" (ACTIVE) / "Ngừng hoạt động" (INACTIVE); trigger submit khi "Lưu" (AC-8)
- **Component**: `share/inputs/input-select` — Priority 2 share/

### Cluster D — Quản lý dữ liệu phụ trợ (Tab panel)

#### AC-7 → ĐVT quy đổi, SKU mapping, đính kèm trong form sửa

**Tab "ĐVT quy đổi" (default trong EDIT — Figma `13489:260701`)**

- **Khi**: form load, tab "ĐVT quy đổi" active (mặc định)
- **FE phải**:
  - Render `ConversionUnitTable` với cột STT, ĐVT, "Tỷ lệ quy đổi" (verbatim "Tỷ" — NOT "Tỉ" — Figma `13489-260701.png` L23), Thao tác; pre-load từ `product.conversionUnits[]`
  - Button "Thêm ĐVT quy đổi" (variant outline — Figma `13489-260701.png` L21) → mở `AddConversionUnitDialog` (RHF form: ĐVT select + Tỷ lệ number input); submit → mutation `addConversionUnit` (V2-M9)
  - Row action Edit (pencil `lucide-react` — Figma `13489-260701.png` L25-29) → mở `AddConversionUnitDialog` prefilled; submit → `updateConversionUnit` (V2-M10)
  - Row action Delete (trash `lucide-react` — Figma `13489-260701.png` L25-29) → `share/dialogs/alert-confirm` → `removeConversionUnit` (V2-M11)
  - Validation client-side trong dialog: rate > 0 (ERR-INV-013), scale ≤ 6 chữ số thập phân (ERR-INV-047), ĐVT không trùng (ERR-INV-014 — check against existing list)
  - Sau mỗi mutation: refetch `['internal-product', id]` (KHÔNG reload toàn trang)
- **State transition**: dialog `closed → open → submitting → success (close + refetch) | error (inline dialog error)`
- **Component**: `ConversionUnitTable` (NEW wraps `share/tables/table-normal`), `AddConversionUnitDialog` (NEW wraps `share/dialogs/dialog`), `share/dialogs/alert-confirm`, `share/buttons/button` — Priority 2 share/
- **GraphQL op**: `addConversionUnit` (V2-M9), `updateConversionUnit` (V2-M10), `removeConversionUnit` (V2-M11) — NEED CONFIRMATION #3
- **Ref**: Figma `wave03-cat-prod-edit.md §1 TabsSection UnitPanel`; BR-CAT-PROD-011 (v15), BR-CAT-PROD-012

**Tab "Mã SKU"**

- **Khi**: người dùng switch sang tab "Mã SKU"
- **FE phải**: render `SkuMappingTable` (NEW); pre-load `product.skuMappings[]`; button "Gắn SKU" → dialog tìm kiếm SKU → `addSkuMapping` (V2-M7); row action xóa → confirm → `removeSkuMapping` (V2-M8)
- **Component**: `SkuMappingTable` (NEW wraps `share/tables/table-normal`), `share/dialogs/dialog`, `share/dialogs/alert-confirm`

**Tab "Đính kèm file"**

- **Khi**: người dùng switch sang tab "Đính kèm file"
- **FE phải**: render `AttachmentSection` (NEW); pre-load `product.attachments[]`; drag-drop hoặc click → `share/files/file-upload` → `addAttachment` (V2-M12); xóa file → confirm → `removeAttachment` (V2-M13)
- **Validation client-side**: ≤ 5 file total (disable upload button khi `attachments.length >= 5` — BR-CAT-PROD-015); ≤ 10MB/file (ERR-CMN-004); chỉ PDF/JPG/PNG (ERR-CMN-005)
- **Component**: `AttachmentSection` (NEW), `share/files/file-upload`, `share/files/file-thumbnail`, `share/files/files-preview` — Priority 2 share/
- **GraphQL op**: `addAttachment` (V2-M12), `removeAttachment` (V2-M13) — NEED CONFIRMATION #3

### Cluster E — Submit và Cancel

#### AC-8 → Lưu thay đổi

- **Khi**: người dùng click "Lưu"
- **FE phải**: `handleSubmit` (react-hook-form) → nếu valid → gọi `updateInternalProduct` (V2-M5) với payload gồm các field đã thay đổi (KHÔNG include `code`, KHÔNG include `mainUomCode` khi disabled); button "Lưu" disabled khi `!form.isDirty || !form.isValid` (Figma `SubmitButton.disabled_when`)
- **State transition**: `idle → submitting (spinner on button, form disabled) → success (toast "Lưu thành công", navigate → detail page) | error (TOAST hoặc INLINE per §4.6)`
- **GraphQL op**: `updateInternalProduct` (V2-M5) — NEED CONFIRMATION #3
- **Ref**: Figma `13489-260701.png` L4 "Lưu" brand button; BE §6 V2-11

#### AC-9 → Huỷ bỏ

- **Khi**: người dùng click "Huỷ bỏ" hoặc BackButton (arrow-left — Figma `13489-260701.png` L4)
- **FE phải**: nếu `form.isDirty` → mở `share/dialogs/alert-confirm` "Bạn có muốn huỷ thay đổi?"; confirm → navigate về trang detail (hoặc danh sách); form chưa dirty → navigate ngay
- **State transition**: dirty form → confirm dialog → navigate | cancel dismiss dialog
- **Component**: `share/dialogs/alert-confirm` — Priority 2 share/
- **Ref**: Figma `13489-260701.png` L4 "Huỷ bỏ" outline button

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave03-cat-prod-edit.md` (node `14146:87153`) cho layout, labels, spacing.
- PageTitle = "Sửa sản phẩm" (NOT "Thêm sản phẩm" — Figma `13489-260701.png` L4).
- Submit button label = "Lưu" (NOT "Tạo" — Figma `SubmitButton._png_verified`).
- Tab default trong EDIT = "ĐVT quy đổi" (NOT "Mã SKU" như CREATE — Figma `§1 TabsSection.default`).
- Cột table verbatim "Tỷ lệ quy đổi" (ký tự "Tỷ" NOT "Tỉ" — Figma `13489-260701.png` L23).
- Disabled field style: `bg-gray-50` muted background cho ĐVT chính và Phương pháp tính giá (Figma `§1 PrimaryUnitField.read_only + CostMethodField._br_ref: BR-CAT-PROD-010`).
- Image dropzone 252×280px (Figma `§1 ImageUpload width/height`).
- **NEED CONFIRMATION #1**: "Thương hiệu" — Figma DSL `type: Select, prefill_key: product.brand_id` (select UX) nhưng bundle API spec `brand` là free-text varchar(255) không validate catalog (R18). FE render `share/inputs/input` (text) hay `share/inputs/input-select` (searchable)?

### 4.2 State machine + error handling

- Form states: `idle | loading (prefill) | ready | submitting | success | error`
- Sub-list states (per tab): `idle | submitting (row action) | success | error`
- Button "Lưu" disabled khi `!form.isDirty || !form.isValid`.
- Mọi error BE → render theo §4.6; KHÔNG silent fail.

### 4.3 i18n + a11y

- i18n policy: dùng i18next key mặc định (`src/i18n/{vi,en}.json`); xác nhận với BA/PO nếu PKG-W03 override fixed VN labels.
- Form field: `<label>` + `aria-describedby` cho error; icon-only buttons có `aria-label`.
- Keyboard nav: Tab order theo field grid Figma; Escape đóng dialog; Enter submit confirm dialog.

### 4.4 RBAC render + feature flag

- Cả hai persona `garage-owner` và `accountant` có thể truy cập edit page (AC-10).
- Route guard `beforeLoad` (TanStack Router): redirect `/login` nếu chưa auth.
- KHÔNG có feature flag riêng cho edit form trong W03 scope.

### 4.5 Business rule secondary (UI hint)

- BR-CAT-PROD-004: `CodeField` disabled; KHÔNG submit `code` trong payload.
- BR-CAT-PROD-006: `PrimaryUnitField` disabled khi `hasTransactions===true` (NEED CONFIRMATION #2); safe fallback = luôn disable.
- BR-CAT-PROD-010: `CostMethodField` disabled luôn — không toggle.
- BR-CAT-PROD-011 (v15): validate rate > 0 + scale ≤ 6 chữ số trong `AddConversionUnitDialog` client-side; server error fallback ERR-INV-013 + ERR-INV-047.
- BR-CAT-PROD-012: conversion unit immutable khi có giao dịch — BE enforce; FE show toast từ server error.
- BR-CAT-PROD-015: disable upload button khi `attachments.length >= 5`.
- BR-CAT-PROD-009: "Nhóm vật tư/hàng hóa" Select chỉ show ACTIVE groups (filter từ BFF options).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-013` | INLINE (dialog field) | `AddConversionUnitDialog` rate field | AC-7 |
| `ERR-INV-014` | INLINE (dialog field) | `AddConversionUnitDialog` ĐVT field | AC-7 |
| `ERR-INV-047` | INLINE (dialog field) | `AddConversionUnitDialog` rate field | AC-7 |
| `ERR-INV-015` | TOAST | `share/toasts/toast` | AC-7 (SKU đã gắn mã khác) |
| `ERR-CMN-004` | INLINE (attachment) | `AttachmentSection` | AC-7 (file >10MB) |
| `ERR-CMN-005` | INLINE (attachment) | `AttachmentSection` | AC-7 (mime type sai) |
| `ERR-CMN-validation` | TOAST | `share/toasts/toast` | AC-4 (originCode không tồn tại) |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `InternalProductEditPage` | `/inventory/catalog/internal-products/:id/edit` (NEED CONFIRMATION #4) | NEW | `14146:87153` | AC-1–AC-10 |

### 5.2 Components new/modified

> **Reuse pattern column** reference priority order `customs/` > `share/` > `ui/`. §G.X báo KG parse error — author scanned `src/components/{customs,share,ui}/` registry yaml manually; findings: no customs layer match cho bất kỳ UI need nào dưới đây — tất cả đều có Priority 2 share/ match hoặc là feature-slice components (build-new justified).

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `title`, `actions`, `backHref` | — | **Priority 2 — share/** (baseline page header, no customs match) | AC-1, AC-9 |
| `Input` (code — disabled) | `src/components/share/inputs/input.tsx` | REUSE | `value`, `disabled=true` | — | **Priority 2 — share/** | AC-2 |
| `InputSelect` (ĐVT chính — conditional disable) | `src/components/share/inputs/input-select.tsx` | REUSE | `options`, `disabled`, `className` | — | **Priority 2 — share/** | AC-3 |
| `InputSelect` (pricing method — always disabled) | `src/components/share/inputs/input-select.tsx` | REUSE | `options`, `disabled=true` | — | **Priority 2 — share/** | AC-5 |
| `Input` (name, brand — editable) | `src/components/share/inputs/input.tsx` | REUSE | `value`, `onChange` | form | **Priority 2 — share/** | AC-4 |
| `InputSelect` (nature, group, status, origin) | `src/components/share/inputs/input-select.tsx` | REUSE | `options`, `value`, `onChange` | form | **Priority 2 — share/** | AC-4, AC-6 |
| `Textarea` (spec, format, desc, notes) | `src/components/share/textareas/textarea.tsx` | REUSE | `value`, `onChange`, `maxLength` | form | **Priority 2 — share/** | AC-4 |
| `ImageUpload` | `src/components/share/images/image-upload.tsx` | REUSE | `value`, `onChange`, `onClear` | local | **Priority 2 — share/** | AC-4 |
| `TabButtons` | `src/components/share/tabs/tab-buttons.tsx` | REUSE | `tabs`, `defaultTab="ĐVT quy đổi"` | local | **Priority 2 — share/** | AC-7 |
| `TableNormal` (conversion units + SKU) | `src/components/share/tables/table-normal.tsx` | REUSE | `columns`, `data` | — | **Priority 2 — share/** | AC-7 |
| `Dialog` (add/edit unit, add SKU) | `src/components/share/dialogs/dialog.tsx` | REUSE | `open`, `onClose`, `children` | local | **Priority 2 — share/** | AC-7 |
| `AlertConfirm` (delete confirm, cancel guard) | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `open`, `onConfirm`, `onCancel` | local | **Priority 2 — share/** | AC-7, AC-9 |
| `FileUpload` | `src/components/share/files/file-upload.tsx` | REUSE | `onUpload`, `maxSize`, `accept` | local | **Priority 2 — share/** | AC-7 |
| `FileThumbnail` | `src/components/share/files/file-thumbnail.tsx` | REUSE | `file`, `onRemove` | — | **Priority 2 — share/** | AC-7 |
| `Button` (Lưu, Huỷ bỏ, Thêm ĐVT, Gắn SKU, row icons) | `src/components/share/buttons/button.tsx` | REUSE | `variant`, `disabled`, `aria-label` | — | **Priority 2 — share/** | AC-7–AC-9 |
| `FormField` | `src/components/share/forms/form-field.tsx` | REUSE | `label`, `error`, `required` | — | **Priority 2 — share/** | AC-4 |
| `NoData` | `src/components/share/emptys/no-data.tsx` | REUSE | `message` | — | **Priority 2 — share/** | AC-7 |
| `LoadingScreen` | `src/components/share/loadings/loading-screen.tsx` | REUSE | — | — | **Priority 2 — share/** | AC-1 |
| `InternalProductEditPage` | `src/features/inventory-catalog/pages/InternalProductEditPage.tsx` | NEW | `params.id` | TanStack Query + RHF | **Build-new** — justification: feature-level page container; no customs/share/ui page component cho domain này | AC-1–AC-10 |
| `AddConversionUnitDialog` | `src/features/inventory-catalog/components/edit/AddConversionUnitDialog.tsx` | NEW | `open`, `initialData?`, `onSubmit`, `onClose` | RHF local | **Build-new** — justification: domain-specific form dialog cho conversion unit; không có customs/share match | AC-7 |
| `ConversionUnitTable` | `src/features/inventory-catalog/components/edit/ConversionUnitTable.tsx` | NEW | `data`, `onEdit`, `onDelete` | — | **Build-new** — justification: wraps `table-normal` với row Edit+Trash actions renderer; domain-specific | AC-7 |
| `SkuMappingTable` | `src/features/inventory-catalog/components/edit/SkuMappingTable.tsx` | NEW | `data`, `onRemove` | — | **Build-new** — justification: SKU mapping table với remove action; domain-specific | AC-7 |
| `AttachmentSection` | `src/features/inventory-catalog/components/edit/AttachmentSection.tsx` | NEW | `attachments`, `productId`, `onAdd`, `onRemove` | local | **Build-new** — justification: upload + list combined; domain-specific; no customs/share match | AC-7 |

### 5.3 Design tokens & Figma refs

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-background` | `tailwind.config.js` | EditPage container background (Figma `§1 EditPage.BG: bg-background`) | AC-1 |
| `bg-gray-50` | `tailwind.config.js` | Disabled field background: ĐVT chính + Phương pháp tính giá (Figma `§1 PrimaryUnitField.read_only + CostMethodField._png_verified "grayed bg-gray-50"`) | AC-3, AC-5 |
| brand button color | `tailwind.config.js` (variant=brand) | "Lưu" submit button (Figma `13489-260701.png` L4 — brand button) | AC-8 |
| outline button style | `tailwind.config.js` (variant=outline) | "Huỷ bỏ" + "Thêm ĐVT quy đổi" (Figma `13489-260701.png` L4, L21) | AC-7, AC-9 |
| `text-muted` | `tailwind.config.js` | Non-active tab labels (Figma `§1 TabsSection tabs[1][2]`) | AC-7 |

> Figma source-of-truth: `Product/ux/figma-web/wave03-cat-prod-edit.md`. Không re-invent layout/spacing/color.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

> **NEED CONFIRMATION #3**: tên op chính xác phải match paired BFF tier spec `FEAT-CAT-PROD-EDIT` §6.1 khi ACTIVE. Dùng tên dưới đây làm placeholder.

| Operation | Type | Query file | TanStack query key | AC ref |
|---|---|---|---|---|
| `getInternalProduct` | query | `src/api/graphql/getInternalProduct.graphql` | `['internal-product', id]` | AC-1 |
| `updateInternalProduct` | mutation | `src/api/graphql/updateInternalProduct.graphql` | — | AC-8 |
| `addConversionUnit` (V2-M9) | mutation | `src/api/graphql/addConversionUnit.graphql` | — | AC-7 |
| `updateConversionUnit` (V2-M10) | mutation | `src/api/graphql/updateConversionUnit.graphql` | — | AC-7 |
| `removeConversionUnit` (V2-M11) | mutation | `src/api/graphql/removeConversionUnit.graphql` | — | AC-7 |
| `addSkuMapping` (V2-M7) | mutation | `src/api/graphql/addSkuMapping.graphql` | — | AC-7 |
| `removeSkuMapping` (V2-M8) | mutation | `src/api/graphql/removeSkuMapping.graphql` | — | AC-7 |
| `addAttachment` (V2-M12) | mutation | `src/api/graphql/addAttachment.graphql` | — | AC-7 |
| `removeAttachment` (V2-M13) | mutation | `src/api/graphql/removeAttachment.graphql` | — | AC-7 |

### 6.2 REST endpoints consumed direct

_(không có — tất cả qua BFF GraphQL)_

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (product detail) | TanStack Query | — | `['internal-product', id]` | AC-1 |
| Form state | react-hook-form | local `InternalProductEditPage` | — | AC-4, AC-8 |
| Sub-list mutations | TanStack mutations | — | invalidate `['internal-product', id]` after each op | AC-7 |
| Dialog open/close | useState local | — | `addUnitOpen`, `editUnitOpen`, `addSkuOpen` | AC-7 |
| Tab selection | useState local | — | `activeTab` | AC-7 |
| Cancel confirm | useState local | — | `showCancelConfirm` | AC-9 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/catalog/internal-products/:id/edit` | `InternalProductEditPage` | prefetch `getInternalProduct(id)` | auth + persona (`garage-owner` \| `accountant`) | AC-1, AC-10 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-catalog/pages/` | `InternalProductEditPage.tsx` | NEW | TanStack Query + RHF | ~180 | AC-1–AC-10 |
| `src/features/inventory-catalog/components/edit/` | `AddConversionUnitDialog.tsx` | NEW | share/dialogs + RHF | ~120 | AC-7 |
| `src/features/inventory-catalog/components/edit/` | `ConversionUnitTable.tsx` | NEW | share/tables/table-normal | ~90 | AC-7 |
| `src/features/inventory-catalog/components/edit/` | `SkuMappingTable.tsx` | NEW | share/tables/table-normal | ~80 | AC-7 |
| `src/features/inventory-catalog/components/edit/` | `AttachmentSection.tsx` | NEW | share/files | ~110 | AC-7 |
| `src/features/inventory-catalog/hooks/` | `useInternalProduct.ts` | NEW | TanStack Query wrapper | ~40 | AC-1 |
| `src/features/inventory-catalog/hooks/` | `useUpdateInternalProduct.ts` | NEW | TanStack mutation | ~50 | AC-8 |
| `src/features/inventory-catalog/hooks/` | `useConversionUnitMutations.ts` | NEW | TanStack mutations V2-M9–M11 | ~80 | AC-7 |
| `src/features/inventory-catalog/hooks/` | `useSkuMappingMutations.ts` | NEW | TanStack mutations V2-M7/M8 | ~60 | AC-7 |
| `src/features/inventory-catalog/hooks/` | `useAttachmentMutations.ts` | NEW | TanStack mutations V2-M12/M13 | ~60 | AC-7 |
| `src/api/graphql/` | `getInternalProduct.graphql` | NEW | persisted query | ~20 | AC-1 |
| `src/api/graphql/` | `updateInternalProduct.graphql` + 8 mutation files | NEW | persisted queries | ~120 | AC-7, AC-8 |
| `src/api/generated/` | `*.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/i18n/vi/` | `inventory-catalog.json` | ADDITIVE | i18next | ~30 | AC-4, AC-7–AC-9 |
| `src/i18n/en/` | `inventory-catalog.json` | ADDITIVE | i18next | ~30 | AC-4, AC-7–AC-9 |
| `src/routes/` | `inventory-catalog-routes.tsx` | MODIFY (add route) | TanStack Router | ~15 | AC-1, AC-10 |
| `tests/features/inventory-catalog/` | `InternalProductEditPage.test.tsx` | NEW | Vitest + RTL | ~200 | AC-2–AC-9 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL + resolver stable — GraphQL ops V2-M5, M7-M13 confirmed)

S6  UI wire (web) — InternalProductEditPage
    Entry: BFF S5 SDL stable + Figma wave03-cat-prod-edit.md confirmed
    Exit: E2E happy path green (load edit prefilled → Lưu → success)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | UI: page + form + immutability matrix + tabs + mutations + routing + i18n | features/ + routes/ + i18n/ | BFF S5 stable; `getInternalProduct` op confirmed | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-004` | CORNERSTONE | `CodeField` disabled; KHÔNG include `code` trong submit payload | `InternalProductEditPage.tsx` | AC-2 | BE final enforce |
| `BR-CAT-PROD-006` | CORNERSTONE | `PrimaryUnitField` disabled khi `hasTransactions===true`; default disable per safe fallback | `InternalProductEditPage.tsx` | AC-3 | NEED CONFIRMATION #2 — flag từ BFF |
| `BR-CAT-PROD-010` | CORNERSTONE | `CostMethodField` disabled luôn trong edit mode | `InternalProductEditPage.tsx` | AC-5 | Không conditional |
| `BR-CAT-PROD-011` | NORMAL | Client-side: rate > 0 + scale ≤ 6; server error fallback ERR-INV-013 + ERR-INV-047 | `AddConversionUnitDialog.tsx` | AC-7 | BE final enforce |
| `BR-CAT-PROD-012` | NORMAL | Toast từ server khi remove conversion unit bị reject (đã có giao dịch) | `ConversionUnitTable.tsx` | AC-7 | BE enforce |
| `BR-CAT-PROD-015` | NORMAL | Disable upload button khi `attachments.length >= 5` | `AttachmentSection.tsx` | AC-7 | Client-side count |
| `BR-CAT-PROD-009` | NORMAL | Group Select chỉ load ACTIVE groups | `InternalProductEditPage.tsx` | AC-4 | Filter from BFF |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-PROD-EDIT.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (loading + prefill) | test-ui | Mock `getInternalProduct` → verify all fields populated via `form.reset()` |
| AC-2 | UI (disabled field) | test-ui | `CodeField` có `disabled` attribute; submit payload không contain `code` |
| AC-3 | UI (conditional disable) | test-ui | `hasTransactions=true` → `PrimaryUnitField` disabled; fallback luôn disabled |
| AC-4 | UI (form validation + image clear) | test-ui | Required fields; textarea maxLength; `imageUrl=null` khi xóa ảnh |
| AC-5 | UI (always disabled) | test-ui | `CostMethodField` disabled bất kể state |
| AC-6 | UI (status toggle) | test-ui | Select ACTIVE ↔ INACTIVE update form state |
| AC-7 | UI (tabs + sub-mutations) | test-ui | Add/edit/delete conversion unit; add/remove SKU; upload/remove attachment; attachment count gate |
| AC-8 | UI (submit + mutation) | test-ui + test-e2e | Mock `updateInternalProduct` → success toast + redirect; error codes per §4.6 |
| AC-9 | UI (cancel dirty guard) | test-ui | `isDirty=true` → confirm dialog; `isDirty=false` → navigate trực tiếp |
| AC-10 | UI (RBAC guard) | test-ui + test-isolation | Unauthorized → redirect; both personas authorized |
| (smoke) | E2E happy path | test-e2e | Playwright: navigate edit → modify "Tên sản phẩm" → Lưu → verify trên detail page |

## 11. i18n & a11y

### 11.1 i18n keys

| Key | vi | en | AC ref |
|---|---|---|---|
| `inventoryCatalog.product.edit.title` | "Sửa sản phẩm" | "Edit Product" | AC-1 |
| `inventoryCatalog.product.edit.submit` | "Lưu" | "Save" | AC-8 |
| `inventoryCatalog.product.edit.cancel` | "Huỷ bỏ" | "Cancel" | AC-9 |
| `inventoryCatalog.product.edit.cancelConfirm` | "Bạn có muốn huỷ thay đổi?" | "Discard changes?" | AC-9 |
| `inventoryCatalog.product.edit.saveSuccess` | "Lưu thành công" | "Saved successfully" | AC-8 |
| `inventoryCatalog.product.conversionUnit.addBtn` | "Thêm ĐVT quy đổi" | "Add Conversion Unit" | AC-7 |
| `inventoryCatalog.product.conversionUnit.ratioCol` | "Tỷ lệ quy đổi" | "Conversion Rate" | AC-7 |
| `inventoryCatalog.product.sku.addBtn` | "Gắn SKU" | "Link SKU" | AC-7 |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-2 | `CodeField`: `aria-readonly="true"` + `aria-label="Mã sản phẩm nội bộ (không thể thay đổi)"` | Screen reader announce disabled reason |
| AC-3 | `PrimaryUnitField`: `aria-disabled="true"` + descriptive label khi disabled | |
| AC-7 | Row action buttons: `aria-label="Sửa ĐVT [tên]"`, `aria-label="Xóa ĐVT [tên]"` | No icon-only ambiguity |
| AC-8 | "Lưu" button: `aria-busy="true"` khi submitting; form errors announce via `aria-describedby` | |
| AC-9 | Confirm dialog: focus trap; Escape = dismiss; Enter = confirm | Modal a11y |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-EDIT.md` | PENDING | BR primary: BR-CAT-PROD-004/006/010; V2-11 PUT /api/v2/internal-products/{id} |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-EDIT.md` | PENDING | GraphQL ops V2-M5, M7–M13; `getInternalProduct` query — FE chờ BFF spec để confirm op names (NEED CONFIRMATION #3) |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-EDIT.md` | PENDING | Mirror edit flow trên mobile |

**Source ID consistency** (item 18): `source_feat_sha = e4531a39c8012b1c1c166f8490890d8f31fb7e9c7683282bfc6438e0a142b6dc` identical với BE/BFF/Mobile files.

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-EDIT.md`](../../../../../Product/features/FEAT-CAT-PROD-EDIT.md) v10
- **Paired BE**: [`features/be/FEAT-CAT-PROD-EDIT.md`](../be/FEAT-CAT-PROD-EDIT.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-PROD-EDIT.md`](../bff/FEAT-CAT-PROD-EDIT.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Figma web spec**: [`Product/ux/figma-web/wave03-cat-prod-edit.md`](../../../../../Product/ux/figma-web/wave03-cat-prod-edit.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: gf-inventory additive aggregate + entity schema (BE context)
- **BR refs**: `BR-CAT-PROD-004`, `BR-CAT-PROD-006`, `BR-CAT-PROD-009`, `BR-CAT-PROD-010`, `BR-CAT-PROD-011`, `BR-CAT-PROD-012`, `BR-CAT-PROD-015`

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-PROD-EDIT` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (3-5 dòng identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map 10/10 AC-IDs, §4 visual fidelity + state + i18n + a11y + RBAC + BR secondary + error mapping, §5 screens/components (registry-based priority), §6 GraphQL ops, §7 file map, §8 DAG, §9 BR secondary, §10 test hand-off, §11 i18n/a11y, §12 cross-tier. 4 NEED CONFIRMATION markers. |
