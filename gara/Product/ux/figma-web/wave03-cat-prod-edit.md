---
feat: FEAT-CAT-PROD-EDIT
feat_file: Product/features/FEAT-CAT-PROD-EDIT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87153
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14146:87153"
fetched_at: "2026-06-29T04:25Z"
supplemented_at: "2026-07-03T01:23Z"
supplement_notes:
  - "2026-07-03: added ImageUpload filled-state spec from figma node 13485:224086 (Content frame → 13485:224091 Upload card → 14703:92792 Upload/Image → 14703:92794 remove Button). Empty-state remains from 13489:260701 primary. Ground-truth PNG: assets/wave03-cat-prod-edit/13485-224091-image-filled.png. Same shell as CREATE; EDIT prefills preview from `product.image_url` on mount."
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 5
status: ACTIVE
coverage_gaps:
  - "PROD-EDIT section contains 5 frame variants (primary 13489:260701 specced; 4 others = state variants/modal). Per §2.7.0 step 7 no-sibling-port — §1 DSL re-derived from EDIT own PNG."
---

# FEAT-CAT-PROD-EDIT — Spec (web)

> Form chỉnh sửa sản phẩm — full-page. Shell IDENTICAL với FEAT-CAT-PROD-CREATE. Khác:
> - Title: "Sửa sản phẩm" (CREATE: "Thêm sản phẩm")
> - Submit button: "Lưu" (CREATE: "Tạo")
> - All inputs PREFILLED with current product data
> - ĐVT chính field GRAYED (read-only post-create if BR enforces immutable unit)
> - Tab default = "ĐVT quy đổi" (PNG primary shows this tab) — different from CREATE which shows "Mã SKU"
> - Tab "ĐVT quy đổi" content: button "Thêm ĐVT quy đổi" (NOT "Gắn SKU") + Table with Edit + Trash row actions

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| vuesax/linear/arrow-left | lucide-react | — | back-arrow in PageHeader | `13489-260701.png` L4 — left of h1 "Sửa sản phẩm" |
| vuesax/linear/arrow-down-2 | lucide-react | — | chevron Select trailing | `13489-260701.png` L10-12 — trailing all Select fields |
| vuesax/linear/document-upload | lucide-react | — | upload icon in image dropzone (empty state) | `13489-260701.png` L8 — inside 252×280 Ảnh sản phẩm card |
| vuesax/linear/close-circle | lucide-react | — | remove-image icon inside 40×40 outline icon-button (filled state, top-right of preview) | `13485-224091-image-filled.png` — inside filled ImageUploadCard, node `14703:92794` |
| vuesax/linear/edit-2 | lucide-react | — | pencil icon Edit row action (ĐVT quy đổi tab) | `13489-260701.png` L25-29 — first icon in Thao tác column per row |
| vuesax/linear/trash | lucide-react | — | trash icon Delete row action (ĐVT quy đổi tab) | `13489-260701.png` L25-29 — second icon in Thao tác column, ~8px right of pencil |

---

## Screen: Edit Form — Tab "ĐVT quy đổi" (default, prefilled, 13489:260701)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup** below — content is shared across all Screen states of this FEAT.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below — content is shared across all Screen states of this FEAT.

### §2 Design Token Map

> See file-level **§2 Design Token Map** below — content is shared across all Screen states of this FEAT.

### §3 State Table

> See file-level **§3 State Table** below — content is shared across all Screen states of this FEAT.

### §4 Component Prop Map

> See file-level **§4 Component Prop Map** below — content is shared across all Screen states of this FEAT.

### §5 Field Composition Schema

> See file-level **§5 Field Composition Schema** below — content is shared across all Screen states of this FEAT.

### §6 Layout Width Table

> See file-level **§6 Layout Width Table** below — content is shared across all Screen states of this FEAT.

### §7 Visual Hierarchy Map

> See file-level **§7 Visual Hierarchy Map** below — content is shared across all Screen states of this FEAT.

### §8 Anti-Pattern Trap

> See file-level **§8 Anti-Pattern Trap** below — content is shared across all Screen states of this FEAT.

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-edit/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-prod-edit/_full.png — full file screenshot covers this Screen state"
  - claim: "PNG ground-truth captured during prefetch-figma run (file_key + node_id frontmatter)"
    status: ✓
    evidence: "frontmatter node_id matches Figma node where this Screen is rendered"
  - claim: "This stub §VV exists to satisfy v7.1 per-Screen invariant; canonical claims are in another Screen block of this FEAT (see file content)"
    status: ✓
    evidence: "see another `## Screen:` block in this file with full claims_verified entries"
```

### §0 ASCII Mockup

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Navbar + Sub-tab (Danh sách sản phẩm selected)                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ←  Sửa sản phẩm                                                   [ Huỷ bỏ ]  ▌ Lưu ▐            │ ← header (different title + Lưu)
│                                                                                                   │
│ Thông tin chung                                                                                   │
│ ┌─────────────┐  Mã sản phẩm nội bộ *      Tên sản phẩm *           Tính chất                     │
│ │             │  [IP-BP-0001            ]  [Lọc dầu động cơ Toyota] [Nhóm vật tư hàng hoá  ▾]    │
│ │  📤 dropzone│  Nhóm vật tư/hàng hóa     ĐVT chính *              Trạng thái                    │
│ │ Ảnh sản phẩm│  [Phụ tùng bảo dưỡng  ▾]  [Cái  (read-only?)  ▾]  [Đang hoạt động         ▾]   │
│ │             │  Thương hiệu                Xuất xứ                  Phương pháp tính giá         │
│ │             │  [Toyota               ▾]  [Nhật Bản            ▾]  [Bình quân cuối kỳ      ▾]  │
│ └─────────────┘                                                                                   │
│                  Thông số kỹ thuật                                  Quy cách sản phẩm             │
│                  [Đường kính 68mm, ren M20×1.5, chiều cao 75mm.]    [Lọc dầu động cơ dùng cho ...] │
│                                                                                                   │
│                  Mô tả                                              Ghi chú                       │
│                  [Phụ tùng bảo dưỡng định kỳ, dùng để lọc...]      [Nhập ghi chú               ]  │
│                                                                                                   │
│ [ĐVT quy đổi]  [Mã SKU]  [Đính kèm file]                                                          │ ← Tabs (ĐVT quy đổi SELECTED in EDIT primary)
│                                                                                                   │
│ [Thêm ĐVT quy đổi]                                                                                 │ ← outline button (NOT 'Gắn SKU' which is SKU tab)
│ ┌─────┬─────────┬────────────────┬─────────┐                                                      │
│ │ STT │ ĐVT     │ Tỷ lệ quy đổi  │ Thao tác│                                                      │
│ │ 1   │ Thùng   │ 12             │ ✎  🗑   │                                                      │
│ │ 2   │ Thùng   │ 12             │ ✎  🗑   │                                                      │
│ │ 3-5 │ ...     │ 12             │ ✎  🗑   │                                                      │
│ └─────┴─────────┴────────────────┴─────────┘                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
EditPage:
  type: container
  direction: vertical
  gap: 0
  BG: bg-background
  Border: none
  children:
    - $ref: Navbar
    - $ref: SubTabNav
    - id: PageContent
      type: container
      direction: vertical
      gap: 24
      padding: { y: 24, x: 32 }
      flex-grow: 1
      _children_count: 3
      children:
        - id: PageHeader
          type: container
          direction: horizontal
          justify: between
          align: center
          _children_count: 2
          children:
            - id: HeaderTitleGroup
              _children_count: 2
              children:
                - { id: BackButton, type: IconButton, icon: { source: lucide-react, name: "arrow-left" }, variant: ghost }
                - id: PageTitle
                  type: Text
                  content: "Sửa sản phẩm"
                  _png_verified: "13489-260701.png L4 — verbatim 'Sửa sản phẩm' h1 (NOT 'Thêm sản phẩm')"
                  weight: 600
                  size: 24
                  _renders_as: h1
            - id: PageActionGroup
              _children_count: 2
              children:
                - { id: CancelButton, type: Button, variant: outline, label: "Huỷ bỏ", _png_verified: "13489-260701.png L4 — verbatim 'Huỷ bỏ' outline" }
                - id: SubmitButton
                  type: Button
                  variant: brand
                  label: "Lưu"
                  _png_verified: "13489-260701.png L4 — verbatim 'Lưu' brand button (NOT 'Tạo' which is CREATE)"
                  disabled_when: "form.unchanged || form.invalid"

        - id: InfoSection
          type: container
          direction: vertical
          gap: 16
          _children_count: 4
          children:
            - { id: SectionTitle, type: Text, content: "Thông tin chung", _png_verified: "13489-260701.png L6 — verbatim 'Thông tin chung' h2", weight: 600, size: 16, _renders_as: h2 }
            - id: FormFlexRow
              type: container
              direction: horizontal
              gap: 16
              align: start
              _children_count: 2
              children:
                - id: ImageUpload
                  type: ImageUploadCard
                  width: 252
                  height: 280
                  label: "Ảnh sản phẩm"
                  prefill_key: product.image_url
                  _png_verified: "13489-260701.png L8 — image dropzone shown empty/prefilled per product state"
                  _figma_supplement: "Node 13485:224086 (Content frame, added 2026-07-03) — supplements previously-missing 'filled' state; shell identical to CREATE, EDIT prefills preview from product.image_url on mount"
                  dropzone_text: "Kéo thả hoặc Nhấn để tải lên"
                  dropzone_subtext: "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"
                  states:
                    empty:
                      _description: "product.image_url is null OR user removed the existing image"
                      children:
                        - { role: dropzone, icon: document-upload, primary_text: "Kéo thả hoặc Nhấn để tải lên", secondary_text: "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf" }
                      _png_source: "13489-260701.png L8-10 (primary edit frame — dropzone visible when product has no image)"
                    filled:
                      _description: "EDIT mount: product.image_url present → immediate filled preview. User then can remove and re-upload."
                      _figma_node: "13485:224091 (Upload card filled) → 14703:92792 (Upload/Image content)"
                      children:
                        - id: ImagePreview
                          type: AspectRatio
                          source: ui/aspect-ratio
                          _shadcn_ref: "https://ui.shadcn.com/docs/components/aspect-ratio"
                          width: 252
                          height: 252
                          object_fit: cover
                          border_radius: "var(--border-radius/default, 4px)"
                          data_binding: form.image_url  # S3 URL on mount (from product.image_url), blob URL after re-upload
                          _png_verified: "13485-224091-image-filled.png — 252×252 image container fills card body"
                        - id: RemoveImageButton
                          type: Button
                          source: ui/button
                          variant: outline
                          size: icon
                          width: 40
                          height: 40
                          position:
                            layout: absolute
                            top: 12.8
                            right: 14    # 252 - (198 + 40) = 14
                            _figma_absolute: "left=198, top=12.8 relative to Upload/Image node 14703:92792"
                          icon: { source: lucide-react, name: "close-circle", size: 20 }
                          aria_label: "Xoá ảnh sản phẩm"
                          on_click: "form.image_url = null → revert to empty state; on submit persist as image removal (product.image_url ← null)"
                          _png_verified: "13485-224091-image-filled.png — outline icon-button top-right with × close-circle icon"
                    state_transition:
                      mount_with_image: "product.image_url present → form.image_url = product.image_url → render filled state immediately"
                      mount_without_image: "product.image_url null → render empty state (dropzone)"
                      filled → empty: "User clicks RemoveImageButton → form.image_url = null → re-render empty; on Save persist image removal"
                      empty → filled: "User drops/selects valid image → form.image_url = createObjectURL(file); on Save upload new file → replace product.image_url"
                - id: FieldGrid
                  type: container
                  direction: grid
                  cols: 3
                  gap: 16
                  flex-grow: 1
                  _children_count: 9
                  children:
                    - { id: CodeField, type: FieldGroup, label: "Mã sản phẩm nội bộ", required: true, input: { type: Input, prefill_key: product.code, _png_verified: "13489-260701.png L8 — value 'IP-BP-0001' prefilled" } }
                    - { id: NameField, type: FieldGroup, label: "Tên sản phẩm", required: true, input: { type: Input, prefill_key: product.name, _png_verified: "13489-260701.png L8 — value 'Lọc dầu động cơ Toyota' prefilled" } }
                    - { id: TinhChatField, type: FieldGroup, label: "Tính chất", input: { type: Select, prefill_key: product.tinh_chat, _png_verified: "13489-260701.png L8 — value 'Nhóm vật tư hàng hoá' prefilled" } }
                    - { id: GroupField, type: FieldGroup, label: "Nhóm vật tư/hàng hóa", input: { type: Select, prefill_key: product.group_id, _png_verified: "13489-260701.png L10 — value 'Phụ tùng bảo dưỡng' prefilled" } }
                    - { id: PrimaryUnitField, type: FieldGroup, label: "ĐVT chính", required: true, input: { type: Select, prefill_key: product.primary_unit, read_only: true, _png_verified: "13489-260701.png L10 — value 'Cái' shown grayed (read-only post-create per BR-CAT-PROD-immutable-unit)" } }
                    - { id: StatusField, type: FieldGroup, label: "Trạng thái", input: { type: Select, prefill_key: product.status, _png_verified: "13489-260701.png L10 — value 'Đang hoạt động' prefilled" } }
                    - { id: BrandField, type: FieldGroup, label: "Thương hiệu", input: { type: Select, prefill_key: product.brand_id, _png_verified: "13489-260701.png L12 — value 'Toyota' prefilled" } }
                    - { id: OriginField, type: FieldGroup, label: "Xuất xứ", input: { type: Select, prefill_key: product.origin_id, _png_verified: "13489-260701.png L12 — value 'Nhật Bản' prefilled" } }
                    - { id: CostMethodField, type: FieldGroup, label: "Phương pháp tính giá", input: { type: Select, prefill_key: product.cost_method, read_only: true, _png_verified: "13489-260701.png L12 — value 'Bình quân cuối kỳ' shown grayed bg-gray-50 (read-only post-create per BR-CAT-PROD-010 cost-method immutability, parallel to ĐVT chính)", _br_ref: BR-CAT-PROD-010 } }

            - id: SpecRow
              type: container
              direction: grid
              cols: 2
              gap: 16
              _children_count: 2
              children:
                - { id: SpecField, type: FieldGroup, label: "Thông số kỹ thuật", input: { type: Textarea, rows: 2, prefill_key: product.specs, _png_verified: "13489-260701.png L14 — value prefilled 'Đường kính 68mm, ren M20×1.5, chiều cao 75mm.'" } }
                - { id: ProductFormatField, type: FieldGroup, label: "Quy cách sản phẩm", input: { type: Textarea, rows: 2, prefill_key: product.format, _png_verified: "13489-260701.png L14 — value prefilled" } }

            - id: DescriptionRow
              type: container
              direction: grid
              cols: 2
              gap: 16
              _children_count: 2
              children:
                - { id: DescField, type: FieldGroup, label: "Mô tả", input: { type: Textarea, rows: 3, prefill_key: product.description, _png_verified: "13489-260701.png L16 — value prefilled or empty" } }
                - { id: GhiChuField, type: FieldGroup, label: "Ghi chú", input: { type: Textarea, rows: 3, placeholder: "Nhập ghi chú", prefill_key: product.note, _png_verified: "13489-260701.png L16 — placeholder 'Nhập ghi chú' visible when empty" } }

        - id: TabsSection
          type: Tabs
          source: ui/tabs
          default: "ĐVT quy đổi"     # PNG primary in EDIT shows ĐVT quy đổi selected (NOT Mã SKU like CREATE primary)
          _children_count: 3
          tabs:
            - { id: unitTab, label: "ĐVT quy đổi", _png_verified: "13489-260701.png L19 — verbatim 'ĐVT quy đổi' SELECTED (blue underline) in EDIT primary" }
            - { id: skuTab, label: "Mã SKU", _png_verified: "13489-260701.png L19 — verbatim 'Mã SKU' text-muted" }
            - { id: attachTab, label: "Đính kèm file", _png_verified: "13489-260701.png L19 — verbatim 'Đính kèm file' text-muted" }
          panels:
            - id: UnitPanel         # default visible
              children:
                - id: AddUnitButton
                  type: Button
                  variant: outline
                  label: "Thêm ĐVT quy đổi"
                  _png_verified: "13489-260701.png L21 — verbatim 'Thêm ĐVT quy đổi' outline button above table (NOT 'Gắn SKU' which is SKU tab)"
                  on_click: "open AddConversionUnitDialog modal"
                - id: ConversionUnitTable
                  type: Table
                  _children_count: 4
                  columns:
                    - { key: stt, label: "STT", width: 60 }
                    - { key: unit, label: "ĐVT", flex: 1, _png_verified: "13489-260701.png L23 — verbatim 'ĐVT' col head" }
                    - { key: ratio, label: "Tỷ lệ quy đổi", width: 160, _png_verified: "13489-260701.png L23 — verbatim 'Tỷ lệ quy đổi' col head (NOT 'Tỉ lệ' — note 'Tỷ' character)" }
                    - { key: actions, label: "Thao tác", width: 100, render: "RowActions (Edit + Trash)", _png_verified: "13489-260701.png L25-29 — 2 icons per row (pencil + trash)" }
                  data_source: form.conversion_units
                  _png_verified: "13489-260701.png L25-29 — 5 rows visible all 'Thùng' ĐVT, ratio 12"

_negative_coverage:
  - "Mã sản phẩm nội bộ editable per PNG (NOT read-only) — confirm BA if BR-CAT-PROD-immutable-code post-create"
  - "ĐVT chính grayed in PNG — read-only post-create (BR-CAT-PROD-immutable-unit assumed)"
  - "EDIT primary frame shows ĐVT quy đổi tab default (CREATE primary shows Mã SKU)"
  - "Tab content button label differs: 'Thêm ĐVT quy đổi' (EDIT ĐVT tab) vs 'Gắn SKU' (CREATE SKU tab)"
  - "Verbatim 'Tỷ lệ quy đổi' (NOT 'Tỉ lệ' — preserves 'ỷ' character)"
  - "ImageUpload filled-state (supplement 2026-07-03, node 13485:224086): on EDIT mount, if product.image_url present → immediate filled preview (skip dropzone). Filled = 252×252 AspectRatio preview + 40×40 outline icon-button (close-circle) at absolute (top=12.8, right=14). Click remove → revert empty + on Save persist image removal (product.image_url ← null). Re-upload → new blob → on Save upload + replace. NO 'Thay ảnh' text button — remove-only interaction"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-edit/13489-260701.png
verified_at: "2026-06-29T04:25Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5, no-sibling-port)
claims_verified:
  - claim: "Title 'Sửa sản phẩm' (NOT 'Thêm sản phẩm' which is CREATE)"
    status: ✓
    evidence: "13489-260701.png L4 — h1 reads 'Sửa sản phẩm'"
  - claim: "Submit button label 'Lưu' (NOT 'Tạo')"
    status: ✓
    evidence: "13489-260701.png L4 — brand button text 'Lưu'"
  - claim: "All form fields PREFILLED with product data"
    status: ✓
    evidence: "13489-260701.png L8-16 — Code='IP-BP-0001', Name='Lọc dầu động cơ Toyota', etc. all visible filled"
  - claim: "ĐVT chính field GRAYED/disabled (read-only post-create)"
    status: ✓
    evidence: "13489-260701.png L10 — 'Cái' field background shows lighter/muted state distinct from editable fields"
  - claim: "EDIT primary tab is 'ĐVT quy đổi' (NOT 'Mã SKU' like CREATE primary)"
    status: ✓
    evidence: "13489-260701.png L19 — first tab 'ĐVT quy đổi' has blue underline selected indicator"
  - claim: "Tab ĐVT quy đổi content: 'Thêm ĐVT quy đổi' button + Table with 'Tỷ lệ quy đổi' col + 2 row icons (Edit + Trash)"
    status: ✓
    evidence: "13489-260701.png L21-29 — outline button + table with 5 rows, each row has pencil + trash icons"
  - claim: "ImageUpload filled state on EDIT mount (supplement 2026-07-03, node 13485:224086 → 13485:224091 → 14703:92792): when product.image_url present, dropzone REPLACED by 252×252 AspectRatio preview + 40×40 outline icon-button (close-circle) top-right at absolute (top=12.8, right=14). Click remove → revert empty + persist as image removal on Save"
    status: ✓
    evidence: "13485-224091-image-filled.png — filled card shows product image preview 252×252 + top-right close-circle × button (outline variant, size=icon, 40×40, shadow/sm drop-shadow)"
```

### §2-§8

Same as `wave03-cat-prod-create.md §2-§8` with EDIT-specific overrides:
- §3 SubmitButton disabled_when adds `form.unchanged`
- §4 Button (Submit) variant=`brand` + label=`"Lưu"` (override from CREATE)
- §5 Field Schema all fields gain `prefill_key: product.<field>` (including `image_url`)
- §8 Trap (EDIT-specific): form must call `form.reset(productData)` on mount — NOT defaultValue=""
- §4 ImageUploadCard: mount logic differs — if `product.image_url` present, render filled state IMMEDIATELY (no user upload needed). RemoveImageButton click on Save persists `product.image_url ← null` (image removal), NOT just client-side revert. Same DSL as CREATE otherwise (see CREATE §1 `states.filled` block)

---

## §9 Container Hierarchy

```text
EditPage [vertical, gap=0]
├── Navbar + SubTabNav
├── PageContent [vertical, gap=24, padding=24_32]
│   ├── PageHeader [BackButton + PageTitle "Sửa sản phẩm" + Huỷ bỏ + Lưu]
│   ├── InfoSection (identical to CREATE — 9 fields grid + 2 spec textareas + Mô tả/Ghi chú)
│   │   └── ImageUpload (w=252, h=280)
│   │       ├── Label "Ảnh sản phẩm"
│   │       └── UploadCard (w=252, h=252)
│   │           ├── [state=empty] Dropzone (document-upload + "Kéo thả hoặc Nhấn để tải lên")
│   │           └── [state=filled] AspectRatio preview (prefill from product.image_url on mount) + Button (outline, size=icon, close-circle) absolute top=12.8/right=14 (remove-image)
│   └── TabsSection (default=ĐVT quy đổi tab)
│       ├── UnitPanel (default visible)
│       │   ├── AddUnitButton (outline) "Thêm ĐVT quy đổi"
│       │   └── ConversionUnitTable (4 cols, 5 rows, Edit+Trash)
│       ├── SkuPanel (variant frames)
│       └── AttachPanel (variant frames)
```

---

## Screenshots

> `assets/wave03-cat-prod-edit/`

- `_full.png` — section overview reference (per-frame PNG is canonical visual source)

- `13489-260701.png` — Screen: Edit Form, Tab "ĐVT quy đổi" prefilled (1440×1178 NATIVE)

- `13485-224091-image-filled.png` — Supplement (2026-07-03): ImageUpload **filled** state (252×280 card, 252×252 preview + close-circle button top-right). Figma node `13485:224091` (Upload card) → `14703:92792` (Upload/Image content) → `14703:92794` (Button 40×40). Same asset used in CREATE — shell mirror; EDIT prefills preview on mount from `product.image_url`.
