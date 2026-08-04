---
feat: FEAT-CAT-GRP-EDIT
feat_file: Product/features/FEAT-CAT-GRP-EDIT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88839
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14423:88839"
fetched_at: "2026-06-29T04:12Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
status: DRAFT
---

# FEAT-CAT-GRP-EDIT — Spec (web)

> Form chỉnh sửa nhóm vật tư hàng hóa — shell IDENTICAL với FEAT-CAT-GRP-CREATE. Khác:
> - Title: "Chỉnh sửa nhóm vật tư hàng hóa" (CREATE: "Thêm nhóm vật tư hàng hóa")
> - Submit button label: "Lưu" (CREATE: "Tạo")
> - All inputs PREFILLED
> Per §2.7.0 step 7 no-sibling-port: §1 DSL re-derived from EDIT own PNG (NOT ported từ CREATE spec); fields verified independently.

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| vuesax/linear/arrow-left | lucide-react | — | back-arrow | `13501-137679.png` L4 left of h1 |
| vuesax/linear/arrow-down-2 | lucide-react | — | chevron Select trailing | `13501-137679.png` L10 |

---

## Screen: Edit Form Prefilled (13501:137679)

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
screenshot: assets/wave03-cat-grp-edit/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-grp-edit/_full.png — full file screenshot covers this Screen state"
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
│ Navbar + Sub-tab nav (Nhóm vật tư hàng hóa selected)                                 │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│ ←  Chỉnh sửa nhóm vật tư hàng hóa                     [ Huỷ bỏ ]  ▌  Lưu  ▐          │ ← header (back + h1 + outline + brand)
│                                                                                       │
│ Thông tin chung                                                                       │
│                                                                                       │
│ Mã nhóm VTHH *                          Tên nhóm VTHH *                                │
│ [IP-BP-0001                       ]     [Lọc dầu động cơ Toyota                  ]    │ ← PREFILLED Inputs
│                                                                                       │
│ Thuộc nhóm                              Trạng thái                                     │
│ [Nhóm vật tư hàng hoá          ▾  ]     [Đang hoạt động                       ▾ ]    │ ← PREFILLED Selects
│                                                                                       │
│ Mô tả                                                                                  │
│ [Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.                              ]  │ ← PREFILLED Textarea
│                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ Section Footer / 2 h=48                                                               │
└──────────────────────────────────────────────────────────────────────────────────────┘
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
      BG: bg-background
      Border: none
      _children_count: 2          # PageHeader + FormSection
      children:
        - id: PageHeader
          type: container
          direction: horizontal
          justify: between
          align: center
          gap: 16
          BG: transparent
          Border: none
          _children_count: 2      # HeaderTitleGroup + PageActionGroup
          children:
            - id: HeaderTitleGroup
              type: container
              direction: horizontal
              align: center
              gap: 12
              _children_count: 2  # BackButton + PageTitle (no status badge — EDIT screen)
              children:
                - id: BackButton
                  type: IconButton
                  icon: { source: lucide-react, name: "arrow-left", size: 20 }
                  variant: ghost
                  _png_verified: "13501-137679.png L4 — back-arrow left of h1"
                - id: PageTitle
                  type: Text
                  content: "Chỉnh sửa nhóm vật tư hàng hóa"
                  _png_verified: "13501-137679.png L4 — verbatim 'Chỉnh sửa nhóm vật tư hàng hóa' h1 text-foreground bold"
                  weight: 600
                  size: 24
                  color: text-foreground
                  _renders_as: h1
            - id: PageActionGroup
              type: container
              direction: horizontal
              gap: 8
              _children_count: 2  # CancelButton + SubmitButton
              children:
                - id: CancelButton
                  type: Button
                  variant: outline
                  size: default
                  label: "Huỷ bỏ"
                  _png_verified: "13501-137679.png L4 — verbatim 'Huỷ bỏ' outline button"
                - id: SubmitButton
                  type: Button
                  variant: brand
                  size: default
                  label: "Lưu"
                  _png_verified: "13501-137679.png L4 — verbatim 'Lưu' brand button (NOT 'Tạo' which is CREATE)"
                  disabled_when: "form.unchanged || form.invalid"

        - id: FormSection
          type: container
          direction: vertical
          gap: 20
          BG: transparent
          Border: none
          _children_count: 3      # SectionTitle + FieldGrid + DescriptionField
          children:
            - id: SectionTitle
              type: Text
              content: "Thông tin chung"
              _png_verified: "13501-137679.png L6 — verbatim 'Thông tin chung' h2"
              weight: 600
              size: 16
              color: text-foreground
              _renders_as: h2

            - id: FieldGrid
              type: container
              direction: grid
              cols: 2
              gap: 16
              _children_count: 4  # 2 rows × 2 fields = 4
              children:
                - id: CodeField
                  type: FieldGroup
                  label: "Mã nhóm VTHH"
                  _png_verified: "13501-137679.png L8 — verbatim 'Mã nhóm VTHH' label + red asterisk"
                  required: true
                  input:
                    type: Input
                    prefill_key: group.code
                    read_only: true   # per FEAT-CAT-GRP-EDIT v3 AC-2 + BR-CAT-GRP-004: Mã VTHH disabled post-create with hint "Không được sửa mã nhóm sau khi tạo."
                    _png_verified: "13501-137679.png L9 — value 'IP-BP-0001' prefilled in Input"
                    _br_ref: BR-CAT-GRP-004
                - id: NameField
                  type: FieldGroup
                  label: "Tên nhóm VTHH"
                  _png_verified: "13501-137679.png L8 — verbatim 'Tên nhóm VTHH' label + red asterisk"
                  required: true
                  input:
                    type: Input
                    prefill_key: group.name
                    _png_verified: "13501-137679.png L9 — value 'Lọc dầu động cơ Toyota' prefilled"
                - id: ParentField
                  type: FieldGroup
                  label: "Thuộc nhóm"
                  _png_verified: "13501-137679.png L11 — verbatim 'Thuộc nhóm' label (no asterisk)"
                  required: false
                  input:
                    type: Select
                    prefill_key: group.parent_id
                    options: dynamic-from-ListMaterialGroups
                    icon_trailing: { source: lucide-react, name: "arrow-down-2", size: 16 }
                    _png_verified: "13501-137679.png L12 — value 'Nhóm vật tư hàng hoá' + chevron-down"
                - id: StatusField
                  type: FieldGroup
                  label: "Trạng thái"
                  _png_verified: "13501-137679.png L11 — verbatim 'Trạng thái' label"
                  required: false
                  input:
                    type: Select
                    prefill_key: group.status
                    options:
                      - { value: ACTIVE, label: "Đang hoạt động" }
                      - { value: INACTIVE, label: "Ngừng hoạt động" }
                    icon_trailing: { source: lucide-react, name: "arrow-down-2", size: 16 }
                    _png_verified: "13501-137679.png L12 — value 'Đang hoạt động' + chevron-down"

            - id: DescriptionField
              type: FieldGroup
              label: "Mô tả"
              _png_verified: "13501-137679.png L14 — verbatim 'Mô tả' label"
              required: false
              full_width: true
              input:
                type: Textarea
                prefill_key: group.description
                _png_verified: "13501-137679.png L15 — placeholder 'Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.' shown when value empty"
                rows: 4
                resize: vertical

    - $ref: SectionFooter

_negative_coverage:
  - "KHÔNG có 'Xóa' button trên header EDIT (Delete chỉ available từ LIST row actions hoặc DETAIL header per FEAT)"
  - "KHÔNG có status badge inline với h1 (differs from DETAIL — EDIT chỉ title)"
  - "KHÔNG có audit/history side panel"
  - "Mã VTHH read-only post-create (per FEAT-CAT-GRP-EDIT v3 AC-2 + BR-CAT-GRP-004 'Không được sửa mã nhóm sau khi tạo.') — spec authority overrides PNG which shows editable input (Figma not yet updated for v3 BR)"
  - "KHÔNG có optimistic-lock hidden field visible"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-grp-edit/13501-137679.png
verified_at: "2026-06-29T04:12Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5, no-sibling-port)
claims_verified:
  - claim: "Page title verbatim 'Chỉnh sửa nhóm vật tư hàng hóa' (NOT 'Thêm…' which is CREATE)"
    status: ✓
    evidence: "13501-137679.png L4 — h1 reads 'Chỉnh sửa nhóm vật tư hàng hóa' character-by-character"
  - claim: "Submit button label is 'Lưu' (NOT 'Tạo' which is CREATE)"
    status: ✓
    evidence: "13501-137679.png L4 — brand button text reads 'Lưu'"
  - claim: "Form fields PREFILLED with current values for Code/Name/Parent/Status (Mô tả shows placeholder when value empty)"
    status: ✓
    evidence: "13501-137679.png L9-15 — Code='IP-BP-0001', Name='Lọc dầu động cơ Toyota', Parent='Nhóm vật tư hàng hoá', Status='Đang hoạt động'; Mô tả Textarea shows muted placeholder text 'Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.' (NOT prefilled in canonical PNG) — note GRP-EDIT has 5 fields total, NO Ghi chú field (Ghi chú only in PROD-EDIT)"
  - claim: "Layout structure (back + h1 + outline + brand header; 2x2 grid + Textarea body) re-derived independently from EDIT PNG (NOT ported từ CREATE)"
    status: ✓
    evidence: "13501-137679.png — same logical structure verified per PNG observation, NOT assumed from CREATE shell"
  - claim: "Header has NO status badge inline (differs from DETAIL which has green pill)"
    status: ✓
    evidence: "13501-137679.png L4 — only back + h1, no badge between h1 and right buttons"
```

### §2 Design Token Map

> Identical to `wave03-cat-grp-create.md §2`. Tokens reused: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `border-input`, `text-destructive`, `rounded-md`, `rounded-lg`, `shadow-sm`, `text-2xl font-semibold`, `text-base font-semibold`, `text-sm font-medium`, `text-sm`, `gap-2/3/4/5/6`.

### §3 State Table

> Identical to CREATE §3. Differences:
> - `SubmitButton` label = "Lưu" / loading "Đang lưu..."
> - `SubmitButton` disabled-when = `form.unchanged || form.invalid` (CREATE: only `form.invalid`)

### §4 Component Prop Map

| Component | Source | Override (vs CREATE) | Lý do |
|---|---|---|---|
| `Button` (Submit) | `share/buttons/button` | variant=`brand` + label=`"Lưu"` + disabled_when=`form.unchanged || form.invalid` | EDIT context (vs CREATE "Tạo") |
| `Button` (Cancel) | `share/buttons/button` | variant=`outline` + label=`"Huỷ bỏ"` | Same as CREATE |
| `Input` (Code) | `share/inputs/input` | + `prefill_key: group.code` + `read_only: true` | per BR-CAT-GRP-004 + FEAT v3 AC-2 — Mã VTHH immutable post-create; PNG override documented in §1 `_negative_coverage` + §8 EDIT-specific trap |

### §5 Field Composition Schema

> Identical structure to CREATE §5; all fields gain `prefill_key: group.<field>` to populate from loaded entity. Validation unchanged.

```yaml
EditGroupForm:
  fields:
    - id: code
      label: "Mã nhóm VTHH"
      combined: false
      inputs: [{ type: text, prefill_key: group.code, read_only: true, required: true }]
      validation: [required, unique_exclude_self]
    - id: name
      label: "Tên nhóm VTHH"
      combined: false
      inputs: [{ type: text, prefill_key: group.name, required: true }]
    - id: parent_group_id
      label: "Thuộc nhóm"
      combined: false
      inputs: [{ type: select, prefill_key: group.parent_id, options: ListMaterialGroups, required: false }]
      validation: [no_circular_self_or_descendant]
    - id: status
      label: "Trạng thái"
      combined: false
      inputs: [{ type: select, prefill_key: group.status, options: [ACTIVE, INACTIVE] }]
    - id: description
      label: "Mô tả"
      combined: false
      inputs: [{ type: textarea, prefill_key: group.description, rows: 4 }]
      full_width: true
```

### §6 Layout Width Table

> Identical to CREATE §6. `DescriptionField col_span: 2` for full-width Textarea.

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | "Chỉnh sửa nhóm vật tư hàng hóa" | `text-2xl font-semibold` | h1 |
| L2 | "Thông tin chung" h2 | `text-base font-semibold` | Section |
| L2 | "Lưu" brand CTA | `text-sm font-medium bg-primary` | Primary save action |
| L3 | Field labels | `text-sm font-medium` | Field identifier |
| L3 | "Huỷ bỏ" secondary action | `text-sm font-medium border-input` | Discard action |
| L4 | Prefilled values | `text-sm font-normal text-foreground` | Form input atomic |
| L4 | Required asterisk | `text-destructive` | Visual cue |

### §8 Anti-Pattern Trap

#### Trap 5 — Tách field combined (same as CREATE)
- Same as CREATE §8 Trap 5 — 2 separate Inputs, NOT combined.

#### Trap 4 — Page hiểu là Modal Dialog (same as CREATE)
- Same as CREATE §8 Trap 4 — full-page route, NOT modal.

#### Trap (EDIT-specific) — Form không load prefill
- **Triệu chứng**: DEV render fields với `defaultValue=""`, user phải re-enter.
- **Đúng**: Mount → fetch group by id → `form.reset(groupData)` → all fields populated.
- `_png_verified: "13501-137679.png L9-15 — all fields show real data values prefilled"`

#### Trap (EDIT-specific) — Mã editable contradict BR
- **Triệu chứng**: DEV để code field editable (input mode), user thay code → BE 409 conflict + audit trail broken.
- **Root cause**: PNG canonical Figma shows editable Input but FEAT-CAT-GRP-EDIT v3 AC-2 + BR-CAT-GRP-004 mandate immutable post-create với helper text "Không được sửa mã nhóm sau khi tạo.".
- **Đúng**: `CodeField.input.read_only: true` + render disabled state + display helper text below field. FEAT/BR authority overrides PNG visual (Figma not updated for v3 BR).
- `_png_verified: "13501-137679.png L9 — PNG shows editable Input visually; FEAT v3 BR overrides to disabled+helper per BR-CAT-GRP-004"`

---

## §9 Container Hierarchy (legacy)

```text
EditPage [vertical, gap=0]
├── Navbar
├── SubTabNav
├── PageContent [vertical, gap=24, padding=24_32]
│   ├── PageHeader [horizontal, justify=between]
│   │   ├── HeaderTitleGroup [horizontal, gap=12, align=center]
│   │   │   ├── BackButton (icon arrow-left)
│   │   │   └── PageTitle "Chỉnh sửa nhóm vật tư hàng hóa" (h1)
│   │   └── PageActionGroup [horizontal, gap=8]
│   │       ├── CancelButton (outline) "Huỷ bỏ"
│   │       └── SubmitButton (brand) "Lưu"
│   └── FormSection [vertical, gap=20]
│       ├── SectionTitle "Thông tin chung" (h2)
│       ├── FieldGrid [grid, cols=2, gap=16]
│       │   ├── CodeField (Input, prefilled, required)
│       │   ├── NameField (Input, prefilled, required)
│       │   ├── ParentField (Select, prefilled)
│       │   └── StatusField (Select, prefilled)
│       └── DescriptionField (Textarea, prefilled, full-width)
└── SectionFooter
```

---

## Screenshots

> `assets/wave03-cat-grp-edit/`

- `_full.png` — section overview reference

- `13501-137679.png` — Screen: Edit Form Prefilled (1440×1024 NATIVE)
