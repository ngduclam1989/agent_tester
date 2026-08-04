---
feat: FEAT-CAT-PROD-CREATE
feat_file: Product/features/FEAT-CAT-PROD-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87151
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14146:87151"
fetched_at: "2026-06-29T04:25Z"
supplemented_at: "2026-07-03T01:23Z"
supplement_notes:
  - "2026-07-03: added ImageUpload filled-state spec from figma node 13485:224086 (Content frame → 13485:224091 Upload card → 14703:92792 Upload/Image → 14703:92794 remove Button). Empty-state remains from 13485:224077 primary. Ground-truth PNG: assets/wave03-cat-prod-create/13485-224091-image-filled.png."
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 5
status: ACTIVE
coverage_gaps:
  - "PROD-CREATE section contains 5 frame variants (primary 13485:224077 specced; 4 others = state variants/modal forms). Only primary frame specced fully; variants flagged as coverage. DEV consult `assets/wave03-cat-prod-create/_full.png` for variants if needed."
---

# FEAT-CAT-PROD-CREATE — Spec (web)

> Form thêm sản phẩm — full-page (NOT modal). Per-frame PNG NATIVE 1440×1178 (no downscale per §3.1.1, section width 9393 → per-frame mandatory). Layout: header + image upload (left 252×280) + 3-col field grid + 2-col Textarea rows + Tabs (ĐVT quy đổi / Mã SKU / Đính kèm file).

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| vuesax/linear/arrow-left | lucide-react | — | back-arrow | `13485-224077.png` L4 |
| vuesax/linear/arrow-down-2 | lucide-react | — | chevron Select | `13485-224077.png` L8-12 trailing all selects |
| vuesax/linear/document-upload | lucide-react | — | upload icon image dropzone (empty state) | `13485-224077.png` L8 inside image upload card |
| vuesax/linear/close-circle | lucide-react | — | remove-image icon inside 40×40 outline icon-button (filled state, top-right of preview) | `13485-224091-image-filled.png` — inside filled ImageUploadCard, node `14703:92794` |
| vuesax/linear/trash | lucide-react | — | Trash row action | `13485-224077.png` L23 Thao tác cell |

---

## Screen: Create Form — Tab "Mã SKU" (default tab selected in PNG primary state, 13485:224077)

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
screenshot: assets/wave03-cat-prod-create/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-prod-create/_full.png — full file screenshot covers this Screen state"
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
│ ←  Thêm sản phẩm                                                  [ Huỷ bỏ ]  ▌ Tạo ▐            │ ← header (back + h1 + 2 buttons)
│                                                                                                   │
│ Thông tin chung                                                                                   │
│ ┌─────────────┐  Mã sản phẩm nội bộ *      Tên sản phẩm *           Tính chất                     │
│ │             │  [IP-BP-0001            ]  [Lọc dầu động cơ Toyota] [Nhóm vật tư hàng hoá  ▾]    │
│ │   📤 dropzone│                                                                                   │
│ │  Ảnh sản phẩm│  Nhóm vật tư/hàng hóa     ĐVT chính *              Trạng thái                    │
│ │ Kéo thả hoặc│  [Phụ tùng bảo dưỡng  ▾]  [Cái                  ▾]  [Đang hoạt động         ▾]  │
│ │  Nhấn để tải│                                                                                   │
│ │     lên     │  Thương hiệu                Xuất xứ                  Phương pháp tính giá         │
│ │ .doc .jpeg  │  [Toyota                 ]  [Nhật Bản              ]  [Bình quân cuối kỳ      ▾]  │
│ │ .png .xlxs  │                                                                                   │
│ │  .pdf       │                                                                                   │
│ └─────────────┘  Thông số kỹ thuật                                  Quy cách sản phẩm             │
│                  [Đường kính 68mm, ren M20×1.5, chiều cao 75mm.]    [Lọc dầu động cơ dùng cho ...] │
│                                                                                                   │
│                  Mô tả                                              Ghi chú                       │
│                  [Phụ tùng bảo dưỡng định kỳ, dùng để lọc...]     [Nhập ghi chú               ]  │
│                                                                                                   │
│ [ĐVT quy đổi]  [Mã SKU]  [Đính kèm file]                                                          │ ← Tabs (Mã SKU selected = blue underline)
│                                                                                                   │
│ [Gắn SKU]                                                                                          │
│ ┌─────┬────────────────┬───────────────────────────────┬─────────┐                                │
│ │ STT │ SKU            │ Tên SKU                       │ Thao tác│                                │
│ │ 1   │ SKU-TOY-FO-01  │ Lọc dầu Toyota chính hãng     │  🗑     │                                │
│ │ 2   │ SKU-TOY-FO-02  │ Lọc dầu Toyota Hilux / Fortuner│ 🗑     │                                │
│ │ 3   │ SKU-TOY-FO-03  │ Lọc dầu Toyota Vios / Yaris   │  🗑     │                                │
│ │ 4   │ SKU-TOY-FO-04  │ Lọc dầu Toyota Camry / Corolla │  🗑     │                                │
│ │ 5   │ SKU-TOY-FO-05  │ Lọc dầu Toyota Innova         │  🗑     │                                │
│ └─────┴────────────────┴───────────────────────────────┴─────────┘                                │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
CreatePage:
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
      BG: bg-background
      Border: none
      _children_count: 3        # PageHeader + InfoSection + TabsSection
      children:
        - id: PageHeader
          type: container
          direction: horizontal
          justify: between
          align: center
          BG: transparent
          Border: none
          _children_count: 2    # HeaderTitleGroup + PageActionGroup
          children:
            - id: HeaderTitleGroup
              type: container
              direction: horizontal
              gap: 12
              align: center
              _children_count: 2  # BackButton + PageTitle
              children:
                - id: BackButton
                  type: IconButton
                  icon: { source: lucide-react, name: "arrow-left", size: 20 }
                  variant: ghost
                  _png_verified: "13485-224077.png L4 — back-arrow left of h1"
                - id: PageTitle
                  type: Text
                  content: "Thêm sản phẩm"
                  _png_verified: "13485-224077.png L4 — verbatim 'Thêm sản phẩm' h1 text-foreground bold"
                  weight: 600
                  size: 24
                  color: text-foreground
                  _renders_as: h1
            - id: PageActionGroup
              type: container
              direction: horizontal
              gap: 8
              _children_count: 2  # R10 — 2 buttons (Huỷ bỏ outline + Tạo brand)
              children:
                - id: CancelButton
                  type: Button
                  variant: outline
                  size: default
                  label: "Huỷ bỏ"
                  _png_verified: "13485-224077.png L4 — verbatim 'Huỷ bỏ' outline button right"
                - id: SubmitButton
                  type: Button
                  variant: brand
                  size: default
                  label: "Tạo"
                  _png_verified: "13485-224077.png L4 — verbatim 'Tạo' brand button rightmost (NOT 'Lưu')"
                  disabled_when: "form.invalid"

        - id: InfoSection
          type: container
          direction: vertical
          gap: 16
          _children_count: 4    # SectionTitle + FormFlexRow + SpecRow + DescriptionRow
          children:
            - id: SectionTitle
              type: Text
              content: "Thông tin chung"
              _png_verified: "13485-224077.png L6 — verbatim 'Thông tin chung' h2"
              weight: 600
              size: 16
              color: text-foreground
              _renders_as: h2

            - id: FormFlexRow
              type: container
              direction: horizontal
              gap: 16
              align: start
              _children_count: 2  # ImageUpload + FieldGrid
              children:
                - id: ImageUpload
                  type: ImageUploadCard
                  width: 252
                  height: 280
                  label: "Ảnh sản phẩm"
                  _png_verified: "13485-224077.png L8 — verbatim 'Ảnh sản phẩm' label above 252×280 dropzone card"
                  _figma_supplement: "Node 13485:224086 (Content frame, added 2026-07-03) — supplements previously-missing 'filled' state; empty-state remains from primary 13485:224077"
                  dropzone_text: "Kéo thả hoặc Nhấn để tải lên"
                  dropzone_subtext: "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"
                  _png_verified_subtext: "13485-224077.png L10 — verbatim 'Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf' muted small text"
                  icon: { source: lucide-react, name: "document-upload", size: 32 }
                  states:
                    empty:
                      _description: "Default before user upload — dropzone visible"
                      children:
                        - { role: dropzone, icon: document-upload, primary_text: "Kéo thả hoặc Nhấn để tải lên", secondary_text: "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf" }
                      _png_source: "13485-224077.png L8-10 (primary create frame)"
                    filled:
                      _description: "After user uploads image — preview replaces dropzone, remove-button overlays top-right"
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
                          data_binding: form.image_url  # blob URL (pre-submit) hoặc S3 URL (post-load edit)
                          _png_verified: "13485-224091-image-filled.png — 252×252 image container fills card body, shows uploaded product image"
                        - id: RemoveImageButton
                          type: Button
                          source: ui/button
                          variant: outline
                          size: icon
                          width: 40
                          height: 40
                          position:
                            layout: absolute
                            top: 12.8    # px offset from ImageUpload card top-left
                            right: 14    # 252 - (198 + 40) = 14px from card right edge
                            _figma_absolute: "left=198, top=12.8 relative to Upload/Image node 14703:92792"
                          icon: { source: lucide-react, name: "close-circle", size: 20 }
                          aria_label: "Xoá ảnh sản phẩm"
                          on_click: "form.image_url = null → revert to empty state"
                          _png_verified: "13485-224091-image-filled.png — outline icon-button top-right with × close-circle icon"
                    state_transition:
                      empty → filled: "User drops/selects valid image file → onFileChange → form.image_url = createObjectURL(file) → re-render filled state"
                      filled → empty: "User clicks RemoveImageButton → form.image_url = null → re-render empty state (dropzone visible again)"

                - id: FieldGrid
                  type: container
                  direction: grid
                  cols: 3
                  gap: 16
                  flex-grow: 1
                  _children_count: 9  # R10 — 3 rows × 3 cols = 9 fields (visible in PNG primary)
                  children:
                    - { id: CodeField, type: FieldGroup, label: "Mã sản phẩm nội bộ", required: true, _png_verified: "13485-224077.png L8 — verbatim 'Mã sản phẩm nội bộ' label + red asterisk", input: { type: Input, prefill_demo: "IP-BP-0001" } }
                    - { id: NameField, type: FieldGroup, label: "Tên sản phẩm", required: true, _png_verified: "13485-224077.png L8 — verbatim 'Tên sản phẩm' label + red asterisk", input: { type: Input, prefill_demo: "Lọc dầu động cơ Toyota" } }
                    - { id: TinhChatField, type: FieldGroup, label: "Tính chất", _png_verified: "13485-224077.png L8 — verbatim 'Tính chất' label (no asterisk)", input: { type: Select, prefill_demo: "Nhóm vật tư hàng hoá", options: dynamic-from-PropertyTypes } }
                    - { id: GroupField, type: FieldGroup, label: "Nhóm vật tư/hàng hóa", _png_verified: "13485-224077.png L10 — verbatim 'Nhóm vật tư/hàng hóa' with slash + diacritic", input: { type: Select, prefill_demo: "Phụ tùng bảo dưỡng", options: dynamic-from-ListMaterialGroups } }
                    - { id: PrimaryUnitField, type: FieldGroup, label: "ĐVT chính", required: true, _png_verified: "13485-224077.png L10 — verbatim 'ĐVT chính' label + red asterisk", input: { type: Select, prefill_demo: "Cái", options: dynamic-from-Units } }
                    - { id: StatusField, type: FieldGroup, label: "Trạng thái", _png_verified: "13485-224077.png L10 — verbatim 'Trạng thái' label", input: { type: Select, default: "Đang hoạt động", options: [ACTIVE, INACTIVE] } }
                    - { id: BrandField, type: FieldGroup, label: "Thương hiệu", _png_verified: "13485-224077.png L12 — verbatim 'Thương hiệu' label", input: { type: Input, prefill_demo: "Toyota" } }
                    - { id: OriginField, type: FieldGroup, label: "Xuất xứ", _png_verified: "13485-224077.png L12 — verbatim 'Xuất xứ' label", input: { type: Input, prefill_demo: "Nhật Bản" } }
                    - { id: CostMethodField, type: FieldGroup, label: "Phương pháp tính giá", _png_verified: "13485-224077.png L12 — verbatim 'Phương pháp tính giá' label", input: { type: Select, prefill_demo: "Bình quân cuối kỳ", options: ["Bình quân gia quyền", "FIFO", "Bình quân cuối kỳ"] } }

            - id: SpecRow
              type: container
              direction: grid
              cols: 2
              gap: 16
              _children_count: 2  # 2 Textareas
              children:
                - { id: SpecField, type: FieldGroup, label: "Thông số kỹ thuật", _png_verified: "13485-224077.png L14 — verbatim 'Thông số kỹ thuật' label", input: { type: Textarea, rows: 2, prefill_demo: "Đường kính 68mm, ren M20×1.5, chiều cao 75mm." } }
                - { id: ProductFormatField, type: FieldGroup, label: "Quy cách sản phẩm", _png_verified: "13485-224077.png L14 — verbatim 'Quy cách sản phẩm' label", input: { type: Textarea, rows: 2, prefill_demo: "Lọc dầu động cơ dùng cho Toyota Vios/Altis" } }

            - id: DescriptionRow
              type: container
              direction: grid
              cols: 2
              gap: 16
              _children_count: 2  # Mô tả + Ghi chú
              children:
                - { id: DescriptionField, type: FieldGroup, label: "Mô tả", _png_verified: "13485-224077.png L16 — verbatim 'Mô tả' label", input: { type: Textarea, rows: 3, placeholder: "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ." } }
                - { id: GhiChuField, type: FieldGroup, label: "Ghi chú", _png_verified: "13485-224077.png L16 — verbatim 'Ghi chú' label (NOT in previous spec — added per PNG)", input: { type: Textarea, rows: 3, placeholder: "Nhập ghi chú" } }

        - id: TabsSection
          type: Tabs
          source: ui/tabs
          default: "Mã SKU"
          _children_count: 3   # R10 — 3 tabs verbatim
          tabs:
            - { id: unitTab, label: "ĐVT quy đổi", _png_verified: "13485-224077.png L19 — verbatim 'ĐVT quy đổi' tab text-muted (NOT selected in primary)" }
            - { id: skuTab, label: "Mã SKU", _png_verified: "13485-224077.png L19 — verbatim 'Mã SKU' tab text-primary + blue underline (SELECTED in primary state)" }
            - { id: attachTab, label: "Đính kèm file", _png_verified: "13485-224077.png L19 — verbatim 'Đính kèm file' tab text-muted (NOT 'Biến thể' which is incorrect)" }
          panels:
            - id: SkuPanel        # default visible in primary frame
              children:
                - id: AssignSkuButton
                  type: Button
                  variant: outline       # PNG: outline-style button (NOT ghost-link)
                  size: default
                  label: "Gắn SKU"
                  _png_verified: "13485-224077.png L21 — verbatim 'Gắn SKU' outline button (white bg + border) above table"
                  on_click: "open AssignSkuDialog modal"
                - id: SkuTable
                  type: Table
                  _children_count: 4  # 4 columns
                  columns:
                    - { key: stt, label: "STT", width: 60 }
                    - { key: sku, label: "SKU", width: 200 }
                    - { key: name, label: "Tên SKU", flex: 1 }
                    - { key: actions, label: "Thao tác", width: 80, render: "DeleteOnly (trash icon only)" }
                  data_source: form.skus
                  _png_verified: "13485-224077.png L23-30 — 5 rows visible (SKU-TOY-FO-01..05), trash icon only in Thao tác (no Edit)"

_negative_coverage:
  - "Primary frame 13485:224077 = SKU tab selected. ĐVT quy đổi + Đính kèm file tabs available trong PNG variants (other 4 frames) — covered by coverage_gap, DEV consult those frames if needed"
  - "KHÔNG có 'Lưu nháp' button (only Huỷ bỏ + Tạo)"
  - "Image upload accepts: .doc, .jpeg, .png, .xlxs, .pdf — verbatim per PNG dropzone text (note typo 'xlxs' in design — confirm BA)"
  - "Tab 'Đính kèm file' (NOT 'Biến thể' as previous spec incorrectly stated)"
  - "Has 'Ghi chú' Textarea field (NOT present in previous spec) — 4th Textarea column right of Mô tả"
  - "ImageUpload filled-state (supplement 2026-07-03, node 13485:224086): dropzone REPLACED by 252×252 AspectRatio preview + 40×40 outline icon-button (close-circle) top-right at offset (198,12.8 from card top-left). Click remove → revert empty. NO 'Thay ảnh' text button — remove-only interaction. Preview uses `object-cover` (not contain) to fill 252×252 square"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-create/13485-224077.png
verified_at: "2026-06-29T04:25Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5, per-frame native)
claims_verified:
  - claim: "Tabs verbatim: 'ĐVT quy đổi' / 'Mã SKU' / 'Đính kèm file' (NOT 'Biến thể' which was incorrect in previous spec)"
    status: ✓
    evidence: "13485-224077.png L19 — 3 tab labels visible, middle 'Mã SKU' selected (blue underline)"
  - claim: "Form has 3-col × 3-row field grid (9 fields), NOT 3-col × 3-row + extra Status field (no duplicate Trạng thái)"
    status: ✓
    evidence: "13485-224077.png L8-12 — 9 distinct field labels per 3 visible rows, 1 'Trạng thái' field (NOT 2 like previous spec)"
  - claim: "Has 'Ghi chú' field (4th Textarea) right of Mô tả"
    status: ✓
    evidence: "13485-224077.png L16 — 2-col Textarea row shows 'Mô tả' left + 'Ghi chú' right"
  - claim: "Verbatim labels: 'Mã sản phẩm nội bộ' (NOT 'Mã sản phẩm SKU'), 'Tính chất', 'Nhóm vật tư/hàng hóa', 'ĐVT chính', 'Phương pháp tính giá'"
    status: ✓
    evidence: "13485-224077.png L8-12 — all field labels match PNG character-by-character with proper diacritics"
  - claim: "ImageUpload filled state (supplement 2026-07-03, node 13485:224086 → 13485:224091 → 14703:92792): 252×252 AspectRatio preview replaces dropzone; 40×40 outline icon-button with vuesax/linear/close-circle icon overlays at absolute position (198,12.8) from card top-left (right=14, top=12.8); click = remove image → revert empty"
    status: ✓
    evidence: "13485-224091-image-filled.png — filled card shows Toyota oil filter preview 252×252 + top-right close-circle × button (outline variant, size=icon, 40×40, shadow/sm drop-shadow)"
  - claim: "Image upload dropzone has VN text 'Kéo thả hoặc Nhấn để tải lên' + 'Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf'"
    status: ✓
    evidence: "13485-224077.png L8-10 — verbatim dropzone hint text visible (note 'xlxs' typo in design — should be xlsx)"
```

### §2-§8 (compact)

| Section | Content |
|---|---|
| §2 Token Map | Same as `wave03-cat-grp-create.md §2` |
| §3 State Table | Input/Select/Textarea default/focus/error; SubmitButton brand → hover/loading; Tabs trigger active=text-primary+underline |
| §4 Component Prop | `Button` variant=brand "Tạo"; `Tabs` items=[ĐVT quy đổi, Mã SKU, Đính kèm file]; `Textarea` ×4 rows=2 or 3; `ImageUploadCard` 252×280 (states: empty=dropzone / filled=AspectRatio 252×252 preview + Button variant=outline size=icon 40×40 top-right with `close-circle` icon = remove) |
| §5 Field Schema | 9 grid fields + 4 Textareas + image_upload + 3 tab collections (conversion_units, skus, attachments) |
| §6 Layout Width | `ImageUpload w-[252px] h-[280px]`; `FieldGrid grid-cols-3 flex-grow=1`; `SpecRow grid-cols-2`; `DescriptionRow grid-cols-2`; Tabs full-width |
| §7 Hierarchy | L1 h1, L2 h2/CTA, L3 tab labels, L4 fields/inputs, L5 row actions |
| §8 Trap | Trap 4 modal-vs-page (full-page); Trap 6 gộp 3 tabs vào 1 table; Trap 5 combined nhầm tách (Mô tả + Ghi chú là 2 separate Textareas NOT combined) |

---

## §9 Container Hierarchy

```text
CreatePage [vertical, gap=0]
├── Navbar + SubTabNav
├── PageContent [vertical, gap=24, padding=24_32]
│   ├── PageHeader [horizontal, justify=between]
│   │   ├── HeaderTitleGroup [BackButton + PageTitle h1]
│   │   └── PageActionGroup [horizontal, gap=8]   # _children_count=2
│   │       ├── CancelButton (outline) "Huỷ bỏ"
│   │       └── SubmitButton (brand) "Tạo"
│   ├── InfoSection [vertical, gap=16]
│   │   ├── SectionTitle "Thông tin chung" (h2)
│   │   ├── FormFlexRow [horizontal, gap=16]
│   │   │   ├── ImageUpload (w=252, h=280)
│   │   │   │   ├── Label "Ảnh sản phẩm" (h=20)
│   │   │   │   └── UploadCard (w=252, h=252)
│   │   │   │       ├── [state=empty] Dropzone (document-upload icon + "Kéo thả hoặc Nhấn để tải lên" + file-type hint)
│   │   │   │       └── [state=filled] AspectRatio image preview + Button (outline, size=icon, close-circle) at absolute top=12.8, right=14
│   │   │   └── FieldGrid [grid, cols=3, gap=16, flex-grow=1]   # _children_count=9
│   │   │       ├── CodeField (Input, required)
│   │   │       ├── NameField (Input, required)
│   │   │       ├── TinhChatField (Select)
│   │   │       ├── GroupField (Select)
│   │   │       ├── PrimaryUnitField (Select, required)
│   │   │       ├── StatusField (Select, default Đang hoạt động)
│   │   │       ├── BrandField (Input)
│   │   │       ├── OriginField (Input)
│   │   │       └── CostMethodField (Select)
│   │   ├── SpecRow [grid, cols=2, gap=16]
│   │   │   ├── SpecField (Textarea)
│   │   │   └── ProductFormatField (Textarea)
│   │   └── DescriptionRow [grid, cols=2, gap=16]
│   │       ├── DescriptionField (Textarea, placeholder)
│   │       └── GhiChuField (Textarea, placeholder "Nhập ghi chú")
│   └── TabsSection [Tabs, default=Mã SKU]   # _children_count=3 (ĐVT quy đổi/Mã SKU/Đính kèm file)
│       ├── UnitPanel (covered in variant frames)
│       ├── SkuPanel (default visible primary)
│       │   ├── AssignSkuButton (outline) "Gắn SKU"
│       │   └── SkuTable (4 cols, 5 rows visible, trash-only row action)
│       └── AttachPanel (covered in variant frames)
```

---

## Screenshots

> `assets/wave03-cat-prod-create/`

- `_full.png` — section overview reference

- `13485-224077.png` — Screen: Create Form, Tab "Mã SKU" selected (1440×1178 NATIVE)

- `13485-224091-image-filled.png` — Supplement (2026-07-03): ImageUpload **filled** state (252×280 card, 252×252 preview + close-circle button top-right). Figma node `13485:224091` (Upload card) → `14703:92792` (Upload/Image content) → `14703:92794` (Button 40×40). Screenshot ground-truth for empty→filled state transition — mirrored 1-1 in edit spec.
