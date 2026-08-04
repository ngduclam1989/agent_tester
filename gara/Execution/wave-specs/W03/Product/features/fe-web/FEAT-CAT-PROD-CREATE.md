---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-PROD-CREATE.md"
source_version: 12
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-CREATE"
source_feat_sha: "ea1840f182e9f1b7d399cf9f327e242d6fbe686ac5860c1e8049a986edbaaaab"
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
consumes_backend_feats: ["FEAT-CAT-PROD-CREATE"]
consumes_bff_feats: ["FEAT-CAT-PROD-CREATE"]
i18n_keys: []
screens_touched:
  - "src/features/inventory-catalog/pages/InternalProductCreatePage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave03-cat-prod-create.md (node 14146:87151 — full-page create form, primary frame 13485:224077 SKU tab selected)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "NEED CONFIRMATION"
  template_sha: "b196f9...8b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-CREATE.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-CREATE (FE Web): Thêm mã sản phẩm nội bộ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-CREATE` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `src/features/inventory-catalog/pages/InternalProductCreatePage.tsx` |
| Cross-tier consume | BE: `FEAT-CAT-PROD-CREATE` \| BFF: `FEAT-CAT-PROD-CREATE` |

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-CREATE.md`](../../../../../Product/features/FEAT-CAT-PROD-CREATE.md) |
| Source version | v12 |
| Source SHA | `ea1840f182e9f1b7d399cf9f327e242d6fbe686ac5860c1e8049a986edbaaaab` |
| Generated at | 2026-06-29T00:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần danh mục mã sản phẩm nội bộ chuẩn hóa làm nền cho toàn bộ nghiệp vụ kho V2. Mỗi mã nội bộ tích hợp thông tin định danh (mã, tên, đơn vị chính, tính chất), bộ đơn vị quy đổi và danh sách SKU gắn kèm — đảm bảo data tồn kho nhất quán trước khi thực hiện nhập/xuất/tính giá. Feature này là entry point bắt buộc của catalog V2; FEAT-CAT-PROD-DETAIL, FEAT-CAT-PROD-EDIT và toàn bộ nghiệp vụ kho V2 đều phụ thuộc vào sự tồn tại của mã nội bộ.

## 2. Trách nhiệm FE Web (garage-web)

- Render màn hình **full-page** `InternalProductCreatePage` (không phải modal) tại route `/inventory/catalog/products/create`, gồm header với back-arrow + title "Thêm sản phẩm" + hai nút "Huỷ bỏ" (outline) / "Tạo" (brand) — xem figma spec `wave03-cat-prod-create.md` §1 Layout DSL (node 13485:224077).
- Render section "Thông tin chung": ImageUpload card 252×280 (dropzone) bên trái; FieldGrid 3-col × 3-row (9 fields) bên phải; 2 SpecRow textarea 2-col; 2 DescriptionRow textarea 2-col (Mô tả + Ghi chú) — layout theo figma §9 Container Hierarchy.
- Render TabsSection 3 tab: "ĐVT quy đổi" / "Mã SKU" (default) / "Đính kèm file"; mỗi tab quản lý collection riêng (form state local trước khi submit tổng).
- **Component reuse-first (priority `customs/` > `share/` > `ui/`)**: tất cả input/select/textarea/button/table sử dụng `share/` layer (không có customs component match cho domain catalog-v2 mới). Build-new chỉ cho feature-composition page/panel không có component tương đương.
- **Figma là visual SSOT**: layout, label text, color tokens, tab order, icon source theo `wave03-cat-prod-create.md` — không suy luận từ AC text. Token `text-foreground` dùng cho heading/label; `text-primary` dùng cho tab active.
- Consume BFF mutation `createInternalProduct` (V2-M4) khi submit; query `searchProducts` (mdm module, V2-Q8) trong AssignSkuDialog; query units từ erp-mdm directory=UNIT cho ĐVT dropdowns; query countries từ erp-mdm directory=COUNTRY cho Xuất xứ field (NEED CONFIRMATION #1 xem §4.6).
- RBAC render: chỉ hiển thị trang và nút "Tạo" cho persona có quyền `inventory:internal-product:create` (garage-owner hoặc accountant theo AC-17).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> i18n policy: KHÔNG dùng i18next — fixed VN labels inline (pattern W03, verify với BA/PO).

### Cluster A — Mở form và điều hướng

#### AC-1 → Render màn hình tạo sản phẩm khi user điều hướng đến route create

- **Khi**: user click "Thêm sản phẩm" từ trang danh sách (FEAT-CAT-PROD-LIST) hoặc navigate trực tiếp đến `/inventory/catalog/products/create`
- **FE phải**: render `InternalProductCreatePage` full-page với react-hook-form khởi tạo default values: `status=ACTIVE`, `nature=GOODS`, `pricingMethod=PWA` (locked), `initialConversionUnits=[]`, `initialProductIds=[]`
- **State transition**: idle → page mounted (no loading skeleton vì form không cần prefetch data riêng, chỉ dropdown options lazy load)
- **Component**: `src/features/inventory-catalog/pages/InternalProductCreatePage.tsx` (NEW)
- **GraphQL op**: không có initial query riêng cho trang create; dropdowns (units, material-groups, countries) lazy-load khi user focus
- **Ref**: Figma `wave03-cat-prod-create.md` §0 ASCII Mockup + §9 Container Hierarchy

#### AC-16 → Điều hướng rời trang khi user huỷ bỏ

- **Khi**: user click nút "Huỷ bỏ" (outline button góc trên phải)
- **FE phải**: navigate back (`history.back()` hoặc `router.navigate({ to: '/inventory/catalog/products' })`). Nếu form đã có dữ liệu → hiển thị `AlertConfirmDialog` "Bạn có chắc muốn huỷ? Dữ liệu chưa lưu sẽ bị mất." trước khi rời
- **State transition**: idle → confirm dialog visible → confirm: navigate away; cancel: stay
- **Component**: `share/dialogs/alert-confirm` (Priority 2 — share/)
- **Ref**: Figma `wave03-cat-prod-create.md` §1 Layout DSL `CancelButton` node (13485-224077.png L4)

### Cluster B — Section "Thông tin chung" — trường bắt buộc

#### AC-2 → Nhập và validate mã sản phẩm nội bộ

- **Khi**: user nhập vào field "Mã sản phẩm nội bộ" (required, asterisk đỏ)
- **FE phải**: bind `code` trong react-hook-form + zod; validate client-side: không rỗng, không chứa ký tự `~!@#$%^&*`; hiển thị inline error dưới field nếu vi phạm; khi BE trả `ERR-INV-007` (trùng mã) sau submit → inline error "Mã sản phẩm nội bộ đã tồn tại"
- **State transition**: idle → typing → invalid (inline error) / valid (no error)
- **Component**: `share/inputs/input` (Priority 2 — share/) wrapped trong `share/forms/form-field` (Priority 2 — share/)
- **Ref**: Figma `13485-224077.png` L8 "Mã sản phẩm nội bộ" label + red asterisk; AC-15 (trùng mã xem §3 Cluster E)

#### AC-3 → Nhập và validate tên sản phẩm

- **Khi**: user nhập vào field "Tên sản phẩm" (required, asterisk đỏ)
- **FE phải**: bind `name` trong react-hook-form + zod; validate not-empty; inline error "Tên sản phẩm không được để trống" khi bỏ trống submit
- **State transition**: idle → typing → valid / invalid
- **Component**: `share/inputs/input` (Priority 2 — share/) + `share/forms/form-field`
- **Ref**: Figma `13485-224077.png` L8 "Tên sản phẩm" label

#### AC-6 → Chọn ĐVT chính từ danh mục

- **Khi**: user click vào Select "ĐVT chính" (required, asterisk đỏ)
- **FE phải**: render searchable select lazy-load options từ erp-mdm directory=UNIT; bind `mainUnitCode`; nếu không chọn → inline error khi submit "Vui lòng chọn ĐVT chính"
- **State transition**: idle → dropdown open (loading options) → selected
- **Component**: `share/inputs/input-select` (Priority 2 — share/)
- **Ref**: Figma `13485-224077.png` L10 "ĐVT chính" + chevron icon (arrow-down-2)

### Cluster C — Section "Thông tin chung" — trường tuỳ chọn

#### AC-4 → Chọn tính chất sản phẩm

- **Khi**: user chọn từ dropdown "Tính chất"
- **FE phải**: render Select với 4 options cố định: "Vật tư hàng hoá" (GOODS, default), "CCDC" (TOOL), "Dịch vụ" (SERVICE), "Khác" (OTHER); bind `nature`; default = GOODS
- **Component**: `share/selects/select-filter` (Priority 2 — share/)
- **Ref**: Figma `13485-224077.png` L8 "Tính chất" field

#### AC-5 → Chọn nhóm vật tư/hàng hóa

- **Khi**: user click vào Select "Nhóm vật tư/hàng hóa"
- **FE phải**: render searchable select lazy-load từ BFF query `searchMaterialGroups` (V2-Q1); chỉ ACTIVE groups; bind `materialGroupCode` (optional)
- **Component**: `share/inputs/input-select` (Priority 2 — share/)
- **Ref**: Figma `13485-224077.png` L10 "Nhóm vật tư/hàng hóa" label (verbatim slash + diacritics)

#### AC-7 → Chọn trạng thái

- **Khi**: user chọn từ dropdown "Trạng thái"
- **FE phải**: render Select với 2 options: "Đang hoạt động" (ACTIVE, default), "Ngừng hoạt động" (INACTIVE); bind `status`
- **Component**: `share/selects/select-filter` (Priority 2 — share/)
- **Ref**: Figma `13485-224077.png` L10 "Trạng thái" field, default = "Đang hoạt động"

#### AC-8 → Nhập các trường thông tin bổ sung

- **Khi**: user nhập vào các field bổ sung: Thương hiệu, Xuất xứ, Thông số kỹ thuật, Quy cách sản phẩm, Mô tả, Ghi chú — tất cả optional
- **FE phải**:
  - `brand` (Thương hiệu): free-text `share/inputs/input` (Priority 2 — share/); không validate catalog; max 255 chars
  - `originCode` (Xuất xứ): **NEED CONFIRMATION #1** — figma §1 Layout DSL cho thấy `type: Input` nhưng R18 codified vs gf-erp-mdm directory=COUNTRY. Tạm thời render `share/inputs/input-select` searchable combobox; nếu user nhập code không valid → server trả `ERR-CMN-validation` "Mã quốc gia xuất xứ không tồn tại" → inline error
  - `technicalSpec` (Thông số kỹ thuật): `share/textareas/textarea` rows=2
  - `productSpec` (Quy cách sản phẩm): `share/textareas/textarea` rows=2
  - `description` (Mô tả): `share/textareas/textarea` rows=3, max 500 chars
  - `notes` (Ghi chú): `share/textareas/textarea` rows=3, max 500 chars, placeholder "Nhập ghi chú"
- **Ref**: Figma `13485-224077.png` L12 (Thương hiệu/Xuất xứ), L14 (Thông số kỹ thuật/Quy cách sản phẩm), L16 (Mô tả/Ghi chú)

#### AC-9 → Hiển thị phương pháp tính giá (locked)

- **Khi**: form render
- **FE phải**: render field "Phương pháp tính giá" là Select **disabled** (read-only), giá trị cố định "Bình quân cuối kỳ" (PWA); không cho user thay đổi; không bind vào submit payload (BE default PWA)
- **Component**: `share/selects/select-filter` (Priority 2 — share/) với `disabled` prop
- **Ref**: Figma `13485-224077.png` L12 "Phương pháp tính giá" Select; BR-CAT-PROD-010 (pricing_method locked)

#### AC-10 → Upload ảnh sản phẩm

- **Khi**: user kéo thả hoặc click vào ImageUpload card 252×280
- **FE phải**: render `share/images/image-upload` (Priority 2 — share/); dropzone text "Kéo thả hoặc Nhấn để tải lên"; subtext "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf" (verbatim từ figma — note typo 'xlxs' per PNG, KHÔNG sửa); icon `document-upload` (lucide-react); khi upload success → set `imageUrl` trong form state (opaque URL string trả từ file storage); preview ảnh thay thế dropzone
- **State transition**: empty dropzone → uploading (spinner) → preview (with trash-icon to clear)
- **Component**: `share/images/image-upload` (Priority 2 — share/)
- **Ref**: Figma `13485-224077.png` L8 ImageUpload card; `wave03-cat-prod-create.md` §1 Layout DSL `ImageUpload`

### Cluster D — Tab ĐVT quy đổi

#### AC-11 → Thêm và quản lý ĐVT quy đổi trong tab

- **Khi**: user click tab "ĐVT quy đổi" → click "Thêm ĐVT quy đổi"
- **FE phải**: render `UomConversionPanel` trong tab panel; mỗi row = 1 ĐVT quy đổi gồm: Select `uomCode` (từ directory=UNIT, loại trừ `mainUnitCode` đã chọn + các code đã thêm — tránh trùng ERR-INV-014) + NumberInput `conversionRate` (>0, **client-validate scale ≤6 chữ số thập phân → hiển thị error "Tỷ lệ quy đổi tối đa 6 chữ số thập phân" trước submit → ERR-INV-047**); nút trash để xoá row
- **State transition**: empty panel → add row → filled row (valid/invalid)
- **Validation client-side**: conversionRate > 0; scale ≤6; uomCode không trùng trong danh sách; nếu vi phạm → disable nút "Tạo"
- **Component**: `UomConversionPanel` (NEW — build-new, justification: no component fit at customs/share/ui for multi-row UOM conversion table editor specific to this domain)
- **Collect into**: `form.initialConversionUnits[]` dạng `{uomCode, conversionRate}`
- **Ref**: BR-CAT-PROD-011 v15 (scale ≤6 → ERR-INV-047, R29); BR-CAT-PROD-012 (immutable khi đã giao dịch — không áp dụng cho form create mới)

### Cluster E — Tab Mã SKU

#### AC-12 → Gắn SKU vào sản phẩm nội bộ

- **Khi**: user click tab "Mã SKU" (default tab trong primary state); click nút "Gắn SKU" (outline button)
- **FE phải**: mở `AssignSkuDialog` (modal); trong dialog: search input → gọi BFF query `searchProducts` (mdm module, input có `name/sku` keyword); hiển thị kết quả trong paginated table (STT / SKU / Tên SKU / Checkbox); user chọn SKUs → confirm → add vào `form.initialProductIds[]`; SkuTable trong tab hiển thị danh sách đã gắn (4 cột: STT / SKU / Tên SKU / Thao tác[trash-only]); trash icon → xoá khỏi danh sách local
- **State transition** (dialog): closed → open (idle) → typing (loading results) → results shown → selected → confirmed → closed (SkuTable updated)
- **Component**:
  - `AssignSkuDialog` (NEW — build-new, justification: domain-specific SKU selection modal not in customs/share/ui)
  - `share/dialogs/dialog` shell (Priority 2 — share/)
  - `share/inputs/input-search` for search input (Priority 2 — share/)
  - `share/tables/table` for SKU result table + SkuTable (Priority 2 — share/)
- **GraphQL op**: `searchProducts` (mdm module) — query BFF; input `{name/sku keyword, page, size}`
- **Ref**: Figma `13485-224077.png` L21 "Gắn SKU" outline button; L23-30 SkuTable; icon `trash` (lucide-react) cho row action

#### AC-15 → Xử lý lỗi trùng mã sản phẩm

- **Khi**: user submit form; BE trả `ERR-INV-007` (code đã tồn tại trong tenant)
- **FE phải**: hiển thị inline error dưới field "Mã sản phẩm nội bộ" — "Mã sản phẩm nội bộ đã tồn tại"; focus về field code; KHÔNG reset toàn bộ form
- **State transition**: submitting → error (inline field error visible; submit button trở lại enabled)
- **Component**: `share/forms/form-field` error state (Priority 2 — share/)
- **Ref**: error code `ERR-INV-007`

### Cluster F — Tab Đính kèm file

#### AC-13 → Tải tệp đính kèm

- **Khi**: user click tab "Đính kèm file"; click upload button trong panel
- **FE phải**: render `AttachmentPanel`; cho phép upload tối đa 5 file (BR-CAT-PROD-015); validate client-side: `mime_type ∈ {PDF, JPG, PNG}` → error "Chỉ hỗ trợ PDF, JPG, PNG"; `file_size ≤ 10MB` → error "Tệp không được vượt quá 10MB"; danh sách file đã upload hiển thị với tên file + kích thước + trash icon
- **NEED CONFIRMATION #2**: xác nhận attachment upload flow — (A) upload lên ct-file-storage trước → collect fileUrl/fileName/fileSize vào `form.initialAttachments[]` → submit cùng V2-10 createInternalProduct, hoặc (B) upload qua endpoint riêng sau khi product đã tạo xong. FE sequencing thay đổi hoàn toàn theo lựa chọn này.
- **State transition**: empty → uploading (progress bar per file) → list with delete
- **Component**:
  - `AttachmentPanel` (NEW — build-new, justification: file collection panel with inline validation specific to this domain)
  - `share/files/file-upload` (Priority 2 — share/) cho upload trigger
  - `share/files/file-thumbnail` (Priority 2 — share/) cho từng file item

### Cluster G — Submit và kết quả

#### AC-14 → Lưu sản phẩm thành công

- **Khi**: user click nút "Tạo" (brand button) với form valid
- **FE phải**: disable nút "Tạo" + hiển thị spinner (loading state); gọi BFF mutation `createInternalProduct` với payload `{code, name, mainUnitCode, materialGroupCode?, nature, brand?, originCode?, productSpec?, technicalSpec?, imageUrl?, description?, notes?, initialProductIds?[], initialConversionUnits?[]}`; khi success → navigate đến trang detail sản phẩm vừa tạo; toast success "Đã tạo sản phẩm thành công"
- **State transition**: idle (SubmitButton enabled) → loading (SubmitButton disabled + spinner) → success (navigate away + toast) / error (SubmitButton re-enabled + error display)
- **GraphQL op**: `createInternalProduct` mutation (V2-M4); map response `{id}` → navigate `/inventory/catalog/products/{id}`
- **Component**: `share/buttons/button` (Priority 2 — share/) variant=brand; `share/toasts/toast` (Priority 2 — share/)
- **Ref**: Figma `13485-224077.png` L4 "Tạo" brand button; `disabled_when: form.invalid`

#### AC-17 → Phân quyền — chỉ user có quyền tạo mới được truy cập

- **Khi**: user không có permission `inventory:internal-product:create` điều hướng đến route create
- **FE phải**: RBAC route guard redirect về trang danh sách (`/inventory/catalog/products`); KHÔNG show page rồi disable — redirect sớm ở loader
- **State transition**: route access → guard check → unauthorized → redirect
- **Component**: route guard (TanStack Router `beforeLoad`) tại `src/routes/inventory-catalog-routes.tsx`

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Layout full-page (KHÔNG modal) per figma `wave03-cat-prod-create.md` §8 Anti-Pattern Trap 4.
- ImageUpload card: width=252px, height=280px (exact, không responsive stretch) — figma §1 `ImageUpload w-[252px] h-[280px]`.
- FieldGrid: `grid-cols-3 gap-16` với `flex-grow=1` bên phải ImageUpload — figma §6 Layout Width Table.
- SpecRow + DescriptionRow: `grid-cols-2 gap-16` — 2 Textareas mỗi row. "Mô tả" và "Ghi chú" là 2 Textareas RIÊNG BIỆT (không gộp) — figma §8 Trap 5.
- Tab labels verbatim: "ĐVT quy đổi" / "Mã SKU" / "Đính kèm file" (KHÔNG "Biến thể") — figma `13485-224077.png` L19.
- Nút submit: label "Tạo" (KHÔNG "Lưu") — figma §1 `SubmitButton label: "Tạo"`.
- Design tokens: `text-foreground` cho heading/label; `text-primary` cho tab active underline — khớp bundle §G.Y "Design tokens referenced".

### 4.2 State machine + error handling

- `SubmitButton` disabled khi: form invalid (required fields empty hoặc zod error) hoặc đang loading.
- Mọi BFF error code → render theo display mode trong §4.6.
- KHÔNG silent fail — mọi mutation error hiển thị toast hoặc inline field error.
- UOM conversionRate scale > 6 chữ số thập phân → client-validate TRƯỚC submit (ERR-INV-047); không cho gửi request.

### 4.3 i18n + a11y

- **KHÔNG dùng i18next** — fixed VN labels inline (pattern W03).
- Form field: `<label htmlFor>` + `aria-describedby` trỏ đến error message element.
- Button icon-only (trash row action): `aria-label="Xoá"`.
- Tab keyboard nav: `Tab` → focus tab trigger; `Enter/Space` → activate tab; `Esc` → close dialog.
- SubmitButton: `aria-busy="true"` khi loading.

### 4.4 RBAC render + feature flag

- Route guard: kiểm tra permission `inventory:internal-product:create` trong `beforeLoad` TanStack Router.
- Hai persona: `garage-owner` và `accountant` — cả hai có thể tạo mã SP nội bộ (AC-17).
- KHÔNG show nút "Tạo" rồi disable cho unauthorized — redirect sớm.

### 4.5 Business rule secondary (UI hint)

- **BR-CAT-PROD-005** (required fields): zod schema enforce `code` + `name` + `mainUnitCode` not-empty client-side.
- **BR-CAT-PROD-011 v15** (conversionRate scale ≤6): client-validate trước submit — hiển thị inline error ngay khi blur field.
- **BR-CAT-PROD-013** (1 SKU chỉ thuộc 1 mã nội bộ): khi BE trả `ERR-INV-015` trong AssignSkuDialog → hiển thị toast "SKU đã được gắn cho mã sản phẩm nội bộ khác".
- **BR-CAT-PROD-015** (≤5 tệp, ≤10MB, PDF/JPG/PNG): client-validate trong AttachmentPanel trước upload.
- BR primary enforcement nằm tại BE tier (xem `be/FEAT-CAT-PROD-CREATE.md §9`).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-006` | INLINE field "Mã sản phẩm nội bộ" | `share/forms/form-field` error | AC-2 |
| `ERR-INV-007` | INLINE field "Mã sản phẩm nội bộ" — "Mã đã tồn tại" | `share/forms/form-field` error | AC-15 |
| `ERR-INV-012` | INLINE field "Tính chất" | `share/forms/form-field` error | AC-4 |
| `ERR-INV-013` | INLINE row "Tỷ lệ quy đổi phải lớn hơn 0" | `UomConversionPanel` row error | AC-11 |
| `ERR-INV-014` | INLINE row "ĐVT đã được khai báo" | `UomConversionPanel` row error | AC-11 |
| `ERR-INV-047` | INLINE row "Tỷ lệ quy đổi tối đa 6 chữ số thập phân" | client-side (trước submit) | AC-11 |
| `ERR-INV-015` | TOAST "SKU đã gắn cho mã sản phẩm nội bộ khác" | `share/toasts/toast` | AC-12 |
| `ERR-CMN-validation` (originCode) | INLINE field "Xuất xứ" — "Mã quốc gia không tồn tại" | `share/forms/form-field` error | AC-8 |
| `ERR-CMN-004` | INLINE attachment "Tệp vượt quá 10MB" | `AttachmentPanel` error | AC-13 |
| `ERR-CMN-005` | INLINE attachment "Định dạng file không hỗ trợ" | `AttachmentPanel` error | AC-13 |

---

## 5. Screen / Component breakdown (FE — primary content)

> Author scanned `web-component-registry.yaml` manually (§G.X KG parse error — filesystem scan fallback).

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `InternalProductCreatePage` | `/inventory/catalog/products/create` | NEW | `14146:87151` (primary frame `13485:224077`) | AC-1, AC-14, AC-17 |

### 5.2 Components new/modified

> Author scanned `web-component-registry.yaml` manually (§G.X KG parse error). Priority order: customs/ > share/ > ui/.

| Component | Path | Change type | Props (key) | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `InternalProductCreatePage` | `src/features/inventory-catalog/pages/InternalProductCreatePage.tsx` | NEW | — | form (RHF) | **Build-new** — justification: no component fit at customs/share/ui; domain-new feature page | AC-1, AC-14, AC-17 |
| `InternalProductForm` | `src/features/inventory-catalog/components/InternalProductForm.tsx` | NEW | `{ onSuccess, onCancel }` | local form submit state | **Build-new** — justification: multi-section form composition specific to this domain | AC-2..AC-14 |
| `UomConversionPanel` | `src/features/inventory-catalog/components/UomConversionPanel.tsx` | NEW | `{ value, onChange, mainUnitCode }` | rows[] | **Build-new** — justification: multi-row UOM conversion editor with domain-specific validation (scale ≤6) not in any layer | AC-11 |
| `AssignSkuDialog` | `src/features/inventory-catalog/components/AssignSkuDialog.tsx` | NEW | `{ open, onConfirm, excludedIds }` | search results, selection | **Build-new** — justification: domain-specific SKU picker dialog not in customs/share/ui | AC-12 |
| `AttachmentPanel` | `src/features/inventory-catalog/components/AttachmentPanel.tsx` | NEW | `{ value, onChange, maxFiles=5 }` | files[] | **Build-new** — justification: domain-specific file collection panel with inline validation not in customs/share/ui | AC-13 |
| `share/inputs/input` | `src/components/share/inputs/input.tsx` | REUSE | `{ value, onChange, placeholder }` | — | **Priority 2 — share/** (generic text input — no customs match for catalog domain) | AC-2, AC-3, AC-8 |
| `share/inputs/input-select` | `src/components/share/inputs/input-select.tsx` | REUSE | `{ options, onChange, searchable }` | dropdown open | **Priority 2 — share/** (searchable select — covers ĐVT/Group/Origin dropdowns) | AC-5, AC-6, AC-8 |
| `share/selects/select-filter` | `src/components/share/selects/select-filter.tsx` | REUSE | `{ options, value, disabled? }` | — | **Priority 2 — share/** (non-searchable select — Tính chất, Trạng thái, Phương pháp tính giá) | AC-4, AC-7, AC-9 |
| `share/textareas/textarea` | `src/components/share/textareas/textarea.tsx` | REUSE | `{ rows, placeholder, maxLength }` | — | **Priority 2 — share/** (4 textarea fields in SpecRow + DescriptionRow) | AC-8 |
| `share/images/image-upload` | `src/components/share/images/image-upload.tsx` | REUSE | `{ onUpload, preview, width, height }` | uploading | **Priority 2 — share/** (image dropzone 252×280) | AC-10 |
| `share/buttons/button` | `src/components/share/buttons/button.tsx` | REUSE | `{ variant: 'brand'\|'outline', disabled, loading }` | — | **Priority 2 — share/** (Tạo / Huỷ bỏ / Gắn SKU buttons) | AC-14, AC-16, AC-12 |
| `share/tables/table` | `src/components/share/tables/table.tsx` | REUSE | `{ columns, data, rowActions }` | — | **Priority 2 — share/** (SkuTable + AssignSkuDialog result table) | AC-12 |
| `share/dialogs/dialog` | `src/components/share/dialogs/dialog.tsx` | REUSE | `{ open, onClose, title }` | — | **Priority 2 — share/** (AssignSkuDialog shell) | AC-12 |
| `share/dialogs/alert-confirm` | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `{ open, onConfirm, onCancel, message }` | — | **Priority 2 — share/** (Huỷ bỏ confirm dialog) | AC-16 |
| `share/forms/form-field` | `src/components/share/forms/form-field.tsx` | REUSE | `{ label, required, error }` | — | **Priority 2 — share/** (field wrapper với label + error cho mọi field) | AC-2..AC-8 |
| `share/files/file-upload` | `src/components/share/files/file-upload.tsx` | REUSE | `{ accept, maxSize, onUpload }` | uploading | **Priority 2 — share/** (file upload trigger trong AttachmentPanel) | AC-13 |
| `share/files/file-thumbnail` | `src/components/share/files/file-thumbnail.tsx` | REUSE | `{ file, onDelete }` | — | **Priority 2 — share/** (individual file display in AttachmentPanel list) | AC-13 |
| `share/toasts/toast` | `src/components/share/toasts/toast.tsx` | REUSE | `{ message, type }` | — | **Priority 2 — share/** (success/error notifications) | AC-14, AC-12 |
| `share/inputs/input-search` | `src/components/share/inputs/input-search.tsx` | REUSE | `{ value, onChange, placeholder }` | — | **Priority 2 — share/** (search input trong AssignSkuDialog) | AC-12 |
| `share/emptys/no-data` | `src/components/share/emptys/no-data.tsx` | REUSE | `{ message }` | — | **Priority 2 — share/** (empty state khi SkuTable / UOM list trống) | AC-11, AC-12 |

### 5.3 Design tokens & Figma refs

> Tokens khớp bundle §G.Y "Design tokens referenced": `text-foreground`, `text-primary`.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `text-foreground` | `tailwind.config.js` | PageTitle "Thêm sản phẩm" (h1), SectionTitle "Thông tin chung" (h2), field labels | AC-1, AC-8 |
| `text-primary` | `tailwind.config.js` | Tab active label ("Mã SKU" underline xanh) | AC-12 |

> **Figma source-of-truth**: `Product/ux/figma-web/wave03-cat-prod-create.md` — mọi layout/spacing/label/icon lấy từ spec này. Không re-invent.
> Coverage gap: 4 frame variants còn lại (state variants/modal forms) chưa được spec đầy đủ trong figma — DEV consult `assets/wave03-cat-prod-create/_full.png` cho visual reference nếu cần.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | AC ref |
|---|---|---|---|---|
| `createInternalProduct` | mutation | `src/api/graphql/createInternalProduct.graphql` | — | AC-14 |
| `searchProducts` | query (mdm module) | `src/api/graphql/searchProducts.graphql` | `['products', searchInput]` | AC-12 (SKU picker trong AssignSkuDialog) |
| `searchMaterialGroups` | query | `src/api/graphql/searchMaterialGroups.graphql` | `['material-groups', keyword]` | AC-5 |

> Mọi op phải tồn tại ở paired BFF FEAT `bff/FEAT-CAT-PROD-CREATE.md §6.1`.

### 6.2 REST endpoints consumed direct (bypass BFF)

Không có — mọi data qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Form state | react-hook-form + zod | local (page scope) | — | AC-2..AC-13 |
| SKU search results | TanStack Query | — | `['products', searchInput]` | AC-12 |
| Material group options | TanStack Query | — | `['material-groups']` | AC-5 |
| Unit options | TanStack Query | — | `['units', 'UNIT']` | AC-6, AC-11 |
| Country options | TanStack Query | — | `['countries', 'COUNTRY']` | AC-8 |
| Submit mutation | TanStack Mutation | — | — | AC-14 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/catalog/products/create` | `InternalProductCreatePage` | prefetch material-groups + units | RBAC: `inventory:internal-product:create` | AC-1, AC-17 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-catalog/pages/` | `InternalProductCreatePage.tsx` | NEW | Page composition | ~80 | AC-1, AC-17 |
| `src/features/inventory-catalog/components/` | `InternalProductForm.tsx` | NEW | RHF + zod form shell | ~150 | AC-2..AC-10 |
| `src/features/inventory-catalog/components/` | `UomConversionPanel.tsx` | NEW | share/inputs reuse | ~120 | AC-11 |
| `src/features/inventory-catalog/components/` | `AssignSkuDialog.tsx` | NEW | share/dialogs + table | ~130 | AC-12 |
| `src/features/inventory-catalog/components/` | `AttachmentPanel.tsx` | NEW | share/files reuse | ~100 | AC-13 |
| `src/features/inventory-catalog/hooks/` | `useCreateInternalProduct.ts` | NEW | TanStack mutation wrapper | ~40 | AC-14 |
| `src/features/inventory-catalog/hooks/` | `useSearchSkus.ts` | NEW | TanStack query wrapper | ~30 | AC-12 |
| `src/features/inventory-catalog/types/` | `internal-product.types.ts` | NEW | TypeScript types | ~50 | — |
| `src/api/graphql/` | `createInternalProduct.graphql` | ADDITIVE | persisted mutation | ~20 | AC-14 |
| `src/api/graphql/` | `searchProducts.graphql` | ADDITIVE or REUSE | persisted query | ~15 | AC-12 |
| `src/api/graphql/` | `searchMaterialGroups.graphql` | ADDITIVE | persisted query | ~15 | AC-5 |
| `src/api/generated/` | `*.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/routes/` | `inventory-catalog-routes.tsx` | MODIFY (add route) | TanStack Router | ~15 | AC-1, AC-17 |
| `tests/features/inventory-catalog/` | `InternalProductCreatePage.test.tsx` | NEW | Vitest + RTL | ~200 | AC-2..AC-17 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL + resolver stable — createInternalProduct mutation + searchProducts query)

S6  UI wire (web) — InternalProductCreatePage
    Entry: BFF S5 SDL stable + Figma wave03-cat-prod-create.md ACTIVE (confirmed)
    Exit:  E2E happy path green (submit form → navigate to detail)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Build `InternalProductCreatePage` + form + panels + dialogs + routing + hooks | features + routes + api/graphql | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE chỉ UI hint; primary enforcement tại BE (`be/FEAT-CAT-PROD-CREATE.md §9`).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-005` | CORNERSTONE | Disable "Tạo" + zod required() cho code/name/mainUnitCode | `InternalProductForm.tsx` | AC-2, AC-3, AC-6 | BE final enforce |
| `BR-CAT-PROD-011 v15` | CORNERSTONE | client-validate conversionRate scale ≤6 trước submit | `UomConversionPanel.tsx::onBlur` | AC-11 | ERR-INV-047; app-layer must reject trước DB |
| `BR-CAT-PROD-013` | CORNERSTONE | toast khi server reject `ERR-INV-015` trong SKU picker | `AssignSkuDialog.tsx` | AC-12 | 1 SKU → 1 mã nội bộ |
| `BR-CAT-PROD-015` | NORMAL | client-validate max 5 files, ≤10MB, PDF/JPG/PNG trước upload | `AttachmentPanel.tsx` | AC-13 | non-blocking UX until exceed |
| `BR-CAT-PROD-019` | NORMAL | Select "Tính chất" default = "Vật tư hàng hoá" (GOODS) | `InternalProductForm.tsx` | AC-4 | enum 4 values |
| `BR-CAT-PROD-010` | NORMAL | "Phương pháp tính giá" disabled Select, display "Bình quân cuối kỳ" | `InternalProductForm.tsx` | AC-9 | locked PWA per BE |

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (route render) | test-ui | page mounts, form initializes |
| AC-2 | UI (form validation) | test-ui | code field inline error (empty + special chars) |
| AC-3 | UI (form validation) | test-ui | name field inline error |
| AC-4 | UI (select options) | test-ui | 4 nature options, default GOODS |
| AC-5 | UI (async select) | test-ui | material-group options load |
| AC-6 | UI (async select) | test-ui | unit options load, required validation |
| AC-7 | UI (select default) | test-ui | status default ACTIVE |
| AC-8 | UI (optional fields) | test-ui | brand free-text, origin codified error |
| AC-9 | UI (disabled field) | test-ui | pricing_method non-interactive |
| AC-10 | UI (upload) | test-ui | image upload preview |
| AC-11 | UI (form validation) | test-ui | conversionRate scale >6 → inline error |
| AC-12 | UI (dialog flow) | test-ui | AssignSkuDialog open/search/select/confirm; ERR-INV-015 toast |
| AC-13 | UI (attachment validation) | test-ui | file type/size client-validate |
| AC-14 | UI (mutation success) | test-ui + test-e2e | submit → navigate; toast success |
| AC-15 | UI (server error) | test-ui | ERR-INV-007 → inline field error |
| AC-16 | UI (cancel) | test-ui | confirm dialog khi form dirty |
| AC-17 | UI (RBAC) | test-ui + test-isolation | redirect khi unauthorized |
| (smoke) | E2E happy path | test-e2e | Playwright: open form → fill → submit → detail page |

## 11. i18n & a11y

### 11.1 i18n

**KHÔNG dùng i18next — fixed VN labels inline** (pattern W03). `i18n_keys: []` frontmatter empty.

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | Page heading h1 "Thêm sản phẩm" accessible | `_renders_as: h1` per figma §1 |
| AC-2, AC-3, AC-6 | Required field `aria-required="true"` + `aria-describedby` trỏ error element | inline error link |
| AC-11 | conversionRate number input `aria-label="Tỷ lệ quy đổi"` + error announce | live region |
| AC-12 | Dialog `role="dialog" aria-modal="true" aria-labelledby`; Tab trap trong dialog | Escape closes dialog |
| AC-14 | SubmitButton `aria-busy="true"` khi loading | screen reader announce |
| AC-16 | CancelButton `aria-label="Huỷ bỏ"` | trash icon-only có `aria-label="Xoá"` |
| AC-17 | Không hiển thị hidden content cho unauthorized | route redirect, không CSS hide |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-CREATE.md` | DRAFT | BR primary enforcement; REST V2-10 contract source; scale ≤6 ERR-INV-047 |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-CREATE.md` | DRAFT | GraphQL ops consumed (§6.1): `createInternalProduct`, `searchProducts`, `searchMaterialGroups` |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-CREATE.md` | DRAFT | Mirror create feature trên mobile (Bloc state, Flutter form) |

**Source ID consistency** (item 18): `source_feat_sha` = `ea1840f182e9f1b7d399cf9f327e242d6fbe686ac5860c1e8049a986edbaaaab` — identical với BE/BFF/Mobile files.

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-CREATE.md`](../../../../../Product/features/FEAT-CAT-PROD-CREATE.md) v12
- **Paired BE**: [`features/be/FEAT-CAT-PROD-CREATE.md`](../be/FEAT-CAT-PROD-CREATE.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-PROD-CREATE.md`](../bff/FEAT-CAT-PROD-CREATE.md)
- **Paired Mobile**: [`features/mobile/FEAT-CAT-PROD-CREATE.md`](../mobile/FEAT-CAT-PROD-CREATE.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Figma spec (web)**: [`Product/ux/figma-web/wave03-cat-prod-create.md`](../../../../../Product/ux/figma-web/wave03-cat-prod-create.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: Additive aggregates — InternalProduct + MaterialGroup độc lập trong gf-inventory
- **ADR-018**: JSON body 2-step import pattern (V2-import scope, không áp dụng trực tiếp cho create form)
- **Web component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho FEAT-CAT-PROD-CREATE W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ 3-5 dòng, §2 trách nhiệm FE Web, §3 behaviour map 17/17 AC-IDs, §4 visual fidelity + state + a11y + RBAC + BR secondary, §5-§11 FE-specific. Bundle-driven. 2 NEED CONFIRMATION markers (§3 AC-8 originCode UI type; §3 AC-13 attachment upload flow sequence). |
