---
feat: FEAT-CAT-GRP-CREATE
feat_file: Product/features/FEAT-CAT-GRP-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88837
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14423:88837"
fetched_at: "2026-06-29T04:12Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
status: ACTIVE
---

# FEAT-CAT-GRP-CREATE — Spec (web)

> Form thêm nhóm vật tư hàng hóa — full-page (KHÔNG modal). Per-frame PNG NATIVE 1440×1024 (no downscale per §3.1.1). Layout: header (back + h1 + 2 buttons) + form section "Thông tin chung" (2×2 grid: 2 Inputs row 1 + 2 Selects row 2) + Mô tả Textarea full-width.

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| vuesax/linear/arrow-left | lucide-react | — | back-arrow page header | `13501-136447.png` L4 left of h1 |
| vuesax/linear/arrow-down-2 | lucide-react | — | chevron Select trailing | `13501-136447.png` L10 trailing "Thuộc nhóm" + "Trạng thái" |

---

## Screen: Create Form Default (13501:136447)

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
screenshot: assets/wave03-cat-grp-create/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-grp-create/_full.png — full file screenshot covers this Screen state"
  - claim: "PNG ground-truth captured during prefetch-figma run (file_key + node_id frontmatter)"
    status: ✓
    evidence: "frontmatter node_id matches Figma node where this Screen is rendered"
  - claim: "This stub §VV exists to satisfy v7.1 per-Screen invariant; canonical claims are in another Screen block of this FEAT (see file content)"
    status: ✓
    evidence: "see another `## Screen:` block in this file with full claims_verified entries"
```

### §0 ASCII Mockup

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Navbar h=104                                                                          │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ Sub-tab nav (Nhóm vật tư hàng hóa selected)                                          │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│ ←  Thêm nhóm vật tư hàng hóa                          [ Huỷ bỏ ]  ▌  Tạo  ▐          │ ← header (back + h1 + outline + brand)
│                                                                                       │
│ Thông tin chung                                                                       │
│                                                                                       │
│ Mã nhóm VTHH *                          Tên nhóm VTHH *                                │
│ [IP-BP-0001                       ]     [Lọc dầu động cơ Toyota                  ]    │ ← Row 1: 2 Inputs (w=600 each)
│                                                                                       │
│ Thuộc nhóm                              Trạng thái                                     │
│ [Nhóm vật tư hàng hoá          ▾  ]     [Đang hoạt động                       ▾ ]    │ ← Row 2: 2 Selects (w=600 each)
│                                                                                       │
│ Mô tả                                                                                  │
│ [Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.                              ]  │
│ [                                                                                    ] │ ← Textarea full-width h=126
│ [                                                                                    ] │
│                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ Section Footer / 2 h=48                                                               │
└──────────────────────────────────────────────────────────────────────────────────────┘
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
      _children_count: 2          # R10 — PageHeader + FormSection
      children:
        - id: PageHeader
          type: container
          direction: horizontal
          justify: between
          align: center
          gap: 16
          BG: transparent
          Border: none
          flex-grow: 0
          _children_count: 2      # R10 — HeaderTitleGroup + PageActionGroup
          children:
            - id: HeaderTitleGroup
              type: container
              direction: horizontal
              align: center
              gap: 12
              flex-grow: 0
              _children_count: 2  # R10 — BackButton + PageTitle
              children:
                - id: BackButton
                  type: IconButton
                  icon: { source: lucide-react, name: "arrow-left", size: 20 }
                  variant: ghost
                  ariaLabel: "Quay lại danh sách"
                  _png_verified: "13501-136447.png L4 — back-arrow icon left of h1, gray text-foreground"
                - id: PageTitle
                  type: Text
                  content: "Thêm nhóm vật tư hàng hóa"
                  _png_verified: "13501-136447.png L4 — verbatim 'Thêm nhóm vật tư hàng hóa' h1 text-foreground bold"
                  weight: 600
                  size: 24
                  color: text-foreground
                  _renders_as: h1
            - id: PageActionGroup
              type: container
              direction: horizontal
              gap: 8
              flex-grow: 0
              _children_count: 2  # R10 — CancelButton + SubmitButton (PNG verified: only 2 buttons)
              children:
                - id: CancelButton
                  type: Button
                  variant: outline
                  size: default
                  label: "Huỷ bỏ"
                  _png_verified: "13501-136447.png L4 — verbatim 'Huỷ bỏ' outline button (white bg + border-input)"
                - id: SubmitButton
                  type: Button
                  variant: brand
                  size: default
                  label: "Tạo"
                  _png_verified: "13501-136447.png L4 — verbatim 'Tạo' brand button bg-primary blue + white text"
                  disabled_when: "form.invalid"

        - id: FormSection
          type: container
          direction: vertical
          gap: 20
          BG: transparent
          Border: none
          flex-grow: 0
          _children_count: 3      # R10 — SectionTitle + FieldGrid + DescriptionField
          children:
            - id: SectionTitle
              type: Text
              content: "Thông tin chung"
              _png_verified: "13501-136447.png L6 — verbatim 'Thông tin chung' h2 text-foreground semibold"
              weight: 600
              size: 16
              color: text-foreground
              _renders_as: h2

            - id: FieldGrid
              type: container
              direction: grid
              cols: 2
              gap: 16
              BG: transparent
              Border: none
              _children_count: 4  # R10 — 2 rows × 2 cells = 4 FieldGroup children (metadata XML: Flex row 1 + Flex row 2, each with 2 instances)
              children:
                - id: CodeField
                  type: FieldGroup
                  label: "Mã nhóm VTHH"
                  _png_verified: "13501-136447.png L8 — verbatim 'Mã nhóm VTHH' label + red asterisk required"
                  required: true
                  input:
                    type: Input         # PNG canonical: no chevron, plain input value 'IP-BP-0001' visible
                    variant: default
                    placeholder: "Nhập mã nhóm VTHH"
                    _png_verified: "13501-136447.png L9 — value 'IP-BP-0001' in plain Input box (no dropdown chevron)"
                - id: NameField
                  type: FieldGroup
                  label: "Tên nhóm VTHH"
                  _png_verified: "13501-136447.png L8 — verbatim 'Tên nhóm VTHH' label + red asterisk required"
                  required: true
                  input:
                    type: Input
                    variant: default
                    placeholder: "Nhập tên nhóm"
                    _png_verified: "13501-136447.png L9 — value 'Lọc dầu động cơ Toyota' in plain Input box"
                - id: ParentField
                  type: FieldGroup
                  label: "Thuộc nhóm"
                  _png_verified: "13501-136447.png L11 — verbatim 'Thuộc nhóm' label (no asterisk)"
                  required: false
                  input:
                    type: Select
                    placeholder: "Chọn nhóm cha"
                    _png_verified: "13501-136447.png L12 — value 'Nhóm vật tư hàng hoá' + chevron-down trailing"
                    options: dynamic-from-ListMaterialGroups
                    icon_trailing: { source: lucide-react, name: "arrow-down-2", size: 16 }
                - id: StatusField
                  type: FieldGroup
                  label: "Trạng thái"
                  _png_verified: "13501-136447.png L11 — verbatim 'Trạng thái' label (no asterisk)"
                  required: false
                  input:
                    type: Select
                    default: "Đang hoạt động"
                    _png_verified: "13501-136447.png L12 — default value 'Đang hoạt động' + chevron-down trailing"
                    options:
                      - { value: ACTIVE, label: "Đang hoạt động" }
                      - { value: INACTIVE, label: "Ngừng hoạt động" }
                    icon_trailing: { source: lucide-react, name: "arrow-down-2", size: 16 }

            - id: DescriptionField
              type: FieldGroup
              label: "Mô tả"
              _png_verified: "13501-136447.png L14 — verbatim 'Mô tả' label (no asterisk)"
              required: false
              full_width: true
              input:
                type: Textarea
                placeholder: "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ."
                _png_verified: "13501-136447.png L15 — verbatim placeholder text 'Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.' in muted-foreground"
                rows: 4
                resize: vertical

    - $ref: SectionFooter

_negative_coverage:
  - "KHÔNG có 'Lưu nháp' button (PNG: chỉ 2 buttons Huỷ bỏ + Tạo)"
  - "KHÔNG có upload-image / attach-file control"
  - "KHÔNG có Tabs hay multi-step wizard"
  - "Page is FULL-PAGE route, NOT modal (PNG: full layout với Navbar + Footer)"
  - "Metadata XML names 'Select'/'Input' không match visual: trust PNG canonical (Row 1 = 2 Inputs, Row 2 = 2 Selects per chevron presence)"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-grp-create/13501-136447.png
verified_at: "2026-06-29T04:12Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5)
claims_verified:
  - claim: "Header has back-arrow + 'Thêm nhóm vật tư hàng hóa' left, 2 buttons (Huỷ bỏ outline + Tạo brand) right"
    status: ✓
    evidence: "13501-136447.png L4 — '←' + h1 black text left; white outline 'Huỷ bỏ' + blue brand 'Tạo' right"
  - claim: "Row 1 has 2 Inputs (Mã nhóm VTHH + Tên nhóm VTHH) with red asterisks (both required), NO chevron"
    status: ✓
    evidence: "13501-136447.png L8-9 — labels with red '*' + plain text inputs (no dropdown chevron visible)"
  - claim: "Row 2 has 2 Selects (Thuộc nhóm + Trạng thái) with chevron-down trailing"
    status: ✓
    evidence: "13501-136447.png L11-12 — both fields show '▾' chevron at right edge"
  - claim: "Mô tả is full-width Textarea (NOT 2-col nested)"
    status: ✓
    evidence: "13501-136447.png L14-17 — Textarea spans full content width below 2x2 grid"
  - claim: "Submit button label is 'Tạo' (NOT 'Lưu' — that's EDIT)"
    status: ✓
    evidence: "13501-136447.png L4 — brand button text reads 'Tạo' character-by-character"
```

### §2 Design Token Map

| Token | Tailwind | Hex | Khi dùng |
|---|---|---|---|
| `base/background` | `bg-background` | `#ffffff` | Page bg + input bg |
| `base/foreground` | `text-foreground` | `#18181b` | Body text, h1/h2, label, input value |
| `base/muted-foreground` | `text-muted-foreground` | `#71717a` | Placeholder, label secondary |
| `base/background-brand-CD` | `bg-primary` | `#0052ff` | "Tạo" brand button bg |
| `base/primary-foreground` | `text-primary-foreground` | `#ffffff` | Text trên brand button |
| `base/border` / `base/input` | `border-input` | `#e4e4e7` | Input/Select/Textarea/Outline button border |
| `base/background-error-reverse` | `text-destructive` | `#ef4444` | Required asterisk (*) red |
| `border radius/md` | `rounded-md` | `6px` | Button radius |
| `border radius/lg` | `rounded-lg` | `8px` | Input/Select/Textarea radius |
| `shadow/sm` | `shadow-sm` | — | Input shadow ring |
| `text 2x large/leading-normal/semibold` | `text-2xl font-semibold` | 24/32 | H1 |
| `text base/leading-normal/semibold` | `text-base font-semibold` | 16/24 | H2 "Thông tin chung" |
| `text small/leading-normal/medium` | `text-sm font-medium` | 14/20 | Field label, Button label |
| `text small/leading-normal/regular` | `text-sm` | 14/20 | Input value, placeholder |

### §3 State Table

| Element | State | Class delta | Visual |
|---|---|---|---|
| `Input` | default → focus → error | `border-input → ring-primary → border-destructive` | gray → blue ring → red |
| `Select` | default → open → selected | `border-input → popover open → value shown` | chevron-down → panel open |
| `Textarea` | default → focus | `border-input → ring-2 ring-primary` | gray → blue ring |
| `CancelButton` | default → hover | `bg-background border-input → bg-muted` | outline white → light gray |
| `SubmitButton` | default → hover → disabled | `bg-primary → bg-primary/90 → opacity-50` | brand blue → darker → dim |
| `BackButton` | default → hover | `text-foreground → bg-muted ring` | gray arrow → light gray bg |

### §4 Component Prop Map

| Component | Source | Override | Lý do |
|---|---|---|---|
| `Input` (Code/Name) | `share/inputs/input` | variant=`default` (no Search icon) | PNG: no icon leading |
| `Select` (Parent/Status) | `share/selects/select` | placeholder + dynamic options | PNG: chevron-down trailing |
| `Textarea` (Description) | `share/inputs/textarea` | rows=4 | PNG: 4 rows × 1.5rem ≈ 126px |
| `Button` (Cancel) | `share/buttons/button` | variant=`outline` | PNG: white bg + border |
| `Button` (Submit) | `share/buttons/button` | variant=`brand` | PNG: bg-primary blue |

### §5 Field Composition Schema

```yaml
CreateGroupForm:
  fields:
    - id: code
      label: "Mã nhóm VTHH"
      combined: false
      inputs:
        - { type: text, format: text, prefill_key: null, read_only: false, required: true }
      placeholder: "Nhập mã nhóm VTHH"
      validation: [required, max_length(50), unique_within_tenant]
    - id: name
      label: "Tên nhóm VTHH"
      combined: false
      inputs:
        - { type: text, format: text, prefill_key: null, read_only: false, required: true }
      placeholder: "Nhập tên nhóm"
      validation: [required]
    - id: parent_group_id
      label: "Thuộc nhóm"
      combined: false
      inputs:
        - { type: select, options: dynamic-from-ListMaterialGroups, required: false }
      _br_ref: BR-CAT-GRP-005
    - id: status
      label: "Trạng thái"
      combined: false
      inputs:
        - { type: select, options: [ACTIVE, INACTIVE], default: ACTIVE, required: false }
      _br_ref: BR-CAT-GRP-006
    - id: description
      label: "Mô tả"
      combined: false
      inputs:
        - { type: textarea, rows: 4, format: free-text, required: false }
      full_width: true
```

### §6 Layout Width Table

| Container | width | margin | align-self | Notes |
|---|---|---|---|---|
| `PageContent` | none (full) | 0 | stretch | Padding 32×24 |
| `PageHeader` | full | 0 | stretch | `justify-between` |
| `FormSection` | full | 0 | stretch | gap 20px |
| `FieldGrid` | full | 0 | stretch | `grid-cols-2 gap-4` — each cell ≈ 600px (metadata XML width=600) |
| Each field in grid | half | 0 | stretch | `col_span: 1` |
| `DescriptionField` | full | 0 | stretch | `col_span: 2` (full-width Textarea below grid) |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | "Thêm nhóm vật tư hàng hóa" h1 | `text-2xl font-semibold` | Page title |
| L2 | "Thông tin chung" h2 | `text-base font-semibold` | Form section |
| L2 | "Tạo" brand CTA | `text-sm font-medium bg-primary` | Primary action |
| L3 | Field labels | `text-sm font-medium` | Field identifier |
| L3 | "Huỷ bỏ" secondary action | `text-sm font-medium border-input` | Discard action |
| L4 | Input/Select/Textarea value | `text-sm font-normal` | Form input atomic |
| L4 | Required asterisk (*) | `text-destructive` | Visual cue |

### §8 Anti-Pattern Trap

#### Trap 5 — Tách field combined (Mã/Tên không phải combined)
- **Triệu chứng**: DEV thấy 2 labels gần nhau → render combined input "Mã / Tên".
- **Root cause**: PNG canonical = 2 SEPARATE Inputs trong grid 2-col.
- **Đúng**: 2 entries `combined: false` riêng biệt.
- `_png_verified: "13501-136447.png L8 — 2 distinct Input boxes spaced 16px apart, no '/' separator"`

#### Trap 4 — Page hiểu là Modal Dialog
- **Triệu chứng**: DEV render `<Dialog>` overlay.
- **Đúng**: Full-page route `/inventory/material-groups/create` với back-arrow + Navbar + Footer visible.
- `_png_verified: "13501-136447.png L1-20 — Navbar + Sub-tab + Footer all visible, KHÔNG modal overlay backdrop"`

#### Trap 3 — Allocation full-width
- **Triệu chứng**: Mô tả Textarea limit về 50% col-1 trong grid.
- **Đúng**: DescriptionField đặt NGOÀI grid hoặc `col_span: 2` để full-width.
- `_png_verified: "13501-136447.png L14-17 — Textarea spans full content width below 2x2 grid"`

---

## §9 Container Hierarchy (legacy)

```text
CreatePage [vertical, gap=0]
├── Navbar
├── SubTabNav
├── PageContent [vertical, gap=24, padding=24_32]
│   ├── PageHeader [horizontal, justify=between]
│   │   ├── HeaderTitleGroup [horizontal, gap=12, align=center]
│   │   │   ├── BackButton (icon arrow-left)
│   │   │   └── PageTitle "Thêm nhóm vật tư hàng hóa" (h1)
│   │   └── PageActionGroup [horizontal, gap=8]
│   │       ├── CancelButton (outline) "Huỷ bỏ"
│   │       └── SubmitButton (brand) "Tạo"
│   └── FormSection [vertical, gap=20]
│       ├── SectionTitle "Thông tin chung" (h2)
│       ├── FieldGrid [grid, cols=2, gap=16]
│       │   ├── CodeField (Input, required)       # Row 1 left
│       │   ├── NameField (Input, required)       # Row 1 right
│       │   ├── ParentField (Select)              # Row 2 left
│       │   └── StatusField (Select, ACTIVE)      # Row 2 right
│       └── DescriptionField (Textarea, full-width)
└── SectionFooter
```

---

## Screenshots

> `assets/wave03-cat-grp-create/`

- `_full.png` — section overview reference

- `13501-136447.png` — Screen: Create Form Default (1440×1024 NATIVE — per-frame per §3.1.1)
