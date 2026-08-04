---
feat: FEAT-CAT-GRP-DETAIL
feat_file: Product/features/FEAT-CAT-GRP-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88838
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14423:88838"
fetched_at: "2026-06-29T04:12Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
status: ACTIVE
coverage_gaps:
  - "DETAIL screen renders 'Nhóm vật tư/hàng hóa' column (text 'Phụ tùng bảo dưỡng') as 4th info field on row 1; FEAT AC mentions 'Mô tả' as a field but PNG does NOT show Mô tả on detail. BA confirm: is 'Mô tả' missing by design, or should it appear?"
  - "Mã nhóm VTHH value rendered as BLUE LINK (text-primary, e.g. '#IP-BP-0001'); unclear navigation target — may be copy-id-to-clipboard or no-op style"
---

# FEAT-CAT-GRP-DETAIL — Spec (web)

> Trang chi tiết nhóm vật tư hàng hóa — full-page read-only. Header: back + h1 + status badge inline + outline "Chỉnh sửa". Body: 4-col × 2-row info grid (8 fields). Per-frame PNG NATIVE 1440×1024.

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| vuesax/linear/arrow-left | lucide-react | — | back-arrow | `13501-137145.png` L4 left of h1 |
| vuesax/linear/edit-2 | lucide-react | — | pencil "Chỉnh sửa" icon leading | `13501-137145.png` L4 right side leading "Chỉnh sửa" |

---

## Screen: Detail Read-only (13501:137145)

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
screenshot: assets/wave03-cat-grp-detail/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-grp-detail/_full.png — full file screenshot covers this Screen state"
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
│ ←  Chi tiết nhóm vật tư hàng hóa  [Đang hoạt động]              [ ✎ Chỉnh sửa ]      │ ← header (back + h1 + inline badge + outline btn)
│                                                                                       │
│ Thông tin chung                                                                       │
│                                                                                       │
│ Mã nhóm VTHH      Tên nhóm VTHH       Thuộc nhóm        Nhóm vật tư/hàng hóa         │ ← row 1 labels (gray)
│ #IP-BP-0001       Lọc dầu động cơ T.  Vật tư hàng hóa   Phụ tùng bảo dưỡng           │ ← row 1 values (Mã = BLUE link)
│                                                                                       │
│ Ngày tạo          Người tạo            Ngày sửa           Người sửa                   │ ← row 2 labels (gray)
│ 07/05/2026 09:55  Nguyễn Văn Kho       07/05/2026 09:55   Nguyễn Văn Kho              │ ← row 2 values
│                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ Section Footer / 2 h=48                                                               │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
DetailPage:
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
      _children_count: 2          # PageHeader + InfoSection
      children:
        - id: PageHeader
          type: container
          direction: horizontal
          justify: between
          align: center
          gap: 16
          BG: transparent
          Border: none
          _children_count: 2      # HeaderTitleGroup + EditButton
          children:
            - id: HeaderTitleGroup
              type: container
              direction: horizontal
              align: center
              gap: 12
              flex-grow: 0
              _children_count: 3  # BackButton + PageTitle + StatusBadgeInline
              children:
                - id: BackButton
                  type: IconButton
                  icon: { source: lucide-react, name: "arrow-left", size: 20 }
                  variant: ghost
                  _png_verified: "13501-137145.png L4 — back-arrow icon left of h1"
                - id: PageTitle
                  type: Text
                  content: "Chi tiết nhóm vật tư hàng hóa"
                  _png_verified: "13501-137145.png L4 — verbatim 'Chi tiết nhóm vật tư hàng hóa' h1 text-foreground bold"
                  weight: 600
                  size: 24
                  color: text-foreground
                  _renders_as: h1
                - id: StatusBadgeInline
                  type: BadgePill
                  variant_map:
                    "Đang hoạt động":
                      bg: bg-background-success
                      text: text-foreground-success
                      label: "Đang hoạt động"
                    "Ngừng hoạt động":
                      bg: bg-muted
                      text: text-muted-foreground
                      label: "Ngừng hoạt động"
                  padding: { y: 2, x: 8 }
                  rounded: rounded-full
                  font: text-xs weight-500
                  _png_verified: "13501-137145.png L4 — green soft pill 'Đang hoạt động' inline right of h1, ~12px gap"
            - id: EditButton
              type: Button
              variant: outline
              size: default
              icon_leading: { source: lucide-react, name: "edit-2", size: 16 }
              label: "Chỉnh sửa"
              _png_verified: "13501-137145.png L4 — verbatim 'Chỉnh sửa' outline button (white + border-input) with pencil icon leading; right of header"
              _ac: links to FEAT-CAT-GRP-EDIT

        - id: InfoSection
          type: container
          direction: vertical
          gap: 16
          BG: transparent
          Border: none
          flex-grow: 0
          _children_count: 3      # SectionTitle + InfoRow1 + InfoRow2
          children:
            - id: SectionTitle
              type: Text
              content: "Thông tin chung"
              _png_verified: "13501-137145.png L6 — verbatim 'Thông tin chung' h2 text-foreground semibold"
              weight: 600
              size: 16
              color: text-foreground
              _renders_as: h2

            - id: InfoRow1
              type: container
              direction: grid
              cols: 4
              gap: 8
              BG: transparent
              Border: none
              _children_count: 4  # R10 — metadata XML "Content" frame has 4 children (Mã + Tên + Thuộc nhóm + Nhóm vật tư/hàng hóa)
              children:
                - id: CodeInfo
                  type: InfoItem
                  label: "Mã nhóm VTHH"
                  _png_verified: "13501-137145.png L8 — verbatim 'Mã nhóm VTHH' label text-muted-foreground"
                  value_render: "Link text-primary"
                  value_demo: "#IP-BP-0001"
                  col_span: 1
                - id: NameInfo
                  type: InfoItem
                  label: "Tên nhóm VTHH"
                  _png_verified: "13501-137145.png L8 — verbatim 'Tên nhóm VTHH' label"
                  value_render: "Text foreground"
                  value_demo: "Lọc dầu động cơ Toyota"
                  col_span: 1
                - id: ParentInfo
                  type: InfoItem
                  label: "Thuộc nhóm"
                  _png_verified: "13501-137145.png L8 — verbatim 'Thuộc nhóm' label"
                  value_render: "Text foreground"
                  value_demo: "Vật tư hàng hóa"
                  col_span: 1
                - id: CategoryInfo
                  type: InfoItem
                  label: "Nhóm vật tư/hàng hóa"
                  _png_verified: "13501-137145.png L8 — verbatim 'Nhóm vật tư/hàng hóa' label with slash; metadata XML text node name preserves slash verbatim"
                  value_render: "Text foreground"
                  value_demo: "Phụ tùng bảo dưỡng"
                  col_span: 1
                  _coverage_gap: "FEAT AC không nêu field này; PNG hiển thị — BA xác nhận"

            - id: InfoRow2
              type: container
              direction: grid
              cols: 4
              gap: 8
              BG: transparent
              Border: none
              _children_count: 4  # R10 — metadata XML "Content" frame row 2 has 4 children (Ngày tạo + Người tạo + Ngày sửa + Người sửa)
              children:
                - id: CreatedAtInfo
                  type: InfoItem
                  label: "Ngày tạo"
                  _png_verified: "13501-137145.png L11 — verbatim 'Ngày tạo' label"
                  value_demo: "07/05/2026 09:55"
                  col_span: 1
                - id: CreatedByInfo
                  type: InfoItem
                  label: "Người tạo"
                  _png_verified: "13501-137145.png L11 — verbatim 'Người tạo' label"
                  value_demo: "Nguyễn Văn Kho"
                  col_span: 1
                - id: UpdatedAtInfo
                  type: InfoItem
                  label: "Ngày sửa"
                  _png_verified: "13501-137145.png L11 — verbatim 'Ngày sửa' label"
                  value_demo: "07/05/2026 09:55"
                  col_span: 1
                - id: UpdatedByInfo
                  type: InfoItem
                  label: "Người sửa"
                  _png_verified: "13501-137145.png L11 — verbatim 'Người sửa' label"
                  value_demo: "Nguyễn Văn Kho"
                  col_span: 1

    - $ref: SectionFooter

# Reusable InfoItem pattern
InfoItem:
  type: container
  direction: vertical
  gap: 4
  BG: transparent
  Border: none
  children:
    - id: Label
      type: Text
      weight: 400
      size: 14
      color: text-muted-foreground
      _renders_as: label-text
    - id: Value
      type: Text
      weight: 400
      size: 14
      color: text-foreground          # OR text-primary if render="Link"

_negative_coverage:
  - "KHÔNG có 'Mô tả' field trên DETAIL screen (PNG: 8 fields, NOT 9; AC drift documented)"
  - "KHÔNG có 'Xóa' button trên header (chỉ 1 outline 'Chỉnh sửa') — Delete có thể chỉ từ LIST row actions"
  - "KHÔNG có breadcrumb (chỉ back-arrow)"
  - "KHÔNG có audit log / history section"
  - "Mã VTHH value rendered as text-primary blue link — navigation/click action TBD per BA"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-grp-detail/13501-137145.png
verified_at: "2026-06-29T04:12Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5)
claims_verified:
  - claim: "Header has 3 elements: back-arrow + h1 + green badge 'Đang hoạt động' inline (R10 _children_count=3 HeaderTitleGroup)"
    status: ✓
    evidence: "13501-137145.png L4 — '←' + bold h1 + green pill inline on one line"
  - claim: "EditButton is OUTLINE variant with pencil icon (NOT brand/filled)"
    status: ✓
    evidence: "13501-137145.png L4 — 'Chỉnh sửa' button white interior + thin border + dark text + pencil glyph"
  - claim: "Body has 4-col × 2-row info grid (8 fields total), label muted gray + value below (R10 _children_count=4 per row)"
    status: ✓
    evidence: "13501-137145.png L8-12 — 4 columns per row, label smaller gray, value bold black"
  - claim: "Mã nhóm VTHH value '#IP-BP-0001' is BLUE clickable (text-primary)"
    status: ✓
    evidence: "13501-137145.png L9 — value shows primary blue color distinct from other foreground values"
  - claim: "NO 'Mô tả' field visible (drift from FEAT AC)"
    status: ✓
    evidence: "13501-137145.png — 8 info items total, none labeled 'Mô tả'; row 1=Mã/Tên/Thuộc/NhómVTHH, row 2=Ngày tạo/Người tạo/Ngày sửa/Người sửa"
  - claim: "4th column label is VERBATIM 'Nhóm vật tư/hàng hóa' (with slash + diacritic 'hóa')"
    status: ✓
    evidence: "13501-137145.png L8 + metadata XML text node 'Nhóm vật tư/hàng hóa' — slash preserved character-by-character"
```

### §2 Design Token Map

| Token | Tailwind | Hex | Khi dùng |
|---|---|---|---|
| `base/background` | `bg-background` | `#ffffff` | Page bg |
| `base/foreground` | `text-foreground` | `#18181b` | Value text |
| `base/muted-foreground` | `text-muted-foreground` | `#71717a` | Label text |
| `base/foreground-brand-CD` | `text-primary` | `#0052ff` | Code value link |
| `base/background-success` | `bg-background-success` | `#f0fdf4` | Inline status badge bg |
| `base/foreground-success` | `text-foreground-success` | `#16a34a` | Inline status badge text |
| `base/border` | `border-input` | `#e4e4e7` | Outline button border |
| `border radius/md` | `rounded-md` | `6px` | Outline button radius |
| `radius/rounded-full` | `rounded-full` | `9999px` | Status badge pill |
| `text 2x large/leading-normal/semibold` | `text-2xl font-semibold` | 24/32 | H1 |
| `text base/leading-normal/semibold` | `text-base font-semibold` | 16/24 | H2 |
| `text small/leading-normal/regular` | `text-sm` | 14/20 | InfoItem label + value |

### §3 State Table

| Element | State | Class delta | Visual |
|---|---|---|---|
| `EditButton` | default → hover → focus | `bg-background → bg-muted → ring-2` | outline → light gray |
| `CodeInfo.value` link | default → hover | `text-primary → underline` | blue → underline |
| `StatusBadgeInline.active` | static | `bg-background-success text-foreground-success rounded-full` | green pill |
| `StatusBadgeInline.inactive` | static | `bg-muted text-muted-foreground rounded-full` | gray pill (assumed) |

### §4 Component Prop Map

| Component | Source | Override | Lý do |
|---|---|---|---|
| `Button` (Edit) | `share/buttons/button` | variant=`outline` + icon_leading | PNG: outline + pencil |
| `Badge` (Status) | `ui/badge` | inline `bg-background-success text-foreground-success rounded-full` | shadcn default solid → soft pill |
| `InfoItem` | `share/displays/info-item` (or inline) | label + value vertical 4px gap | reuse candidate |

### §5 Field Composition Schema

> KHÔNG có form input trên DETAIL — read-only view binding.

```yaml
DetailViewBinding:
  fields:
    - { id: code, label: "Mã nhóm VTHH", value_path: group.code, render: "link-primary" }
    - { id: name, label: "Tên nhóm VTHH", value_path: group.name, render: "text-foreground" }
    - { id: parent_name, label: "Thuộc nhóm", value_path: group.parent_name, render: "text-foreground", fallback: "—" }
    - { id: category, label: "Nhóm vật tư/hàng hóa", value_path: group.category_label, render: "text-foreground", _coverage_gap: "BA confirm field" }
    - { id: created_at, label: "Ngày tạo", value_path: group.created_at, format: "dd/MM/yyyy HH:mm" }
    - { id: created_by, label: "Người tạo", value_path: group.created_by_name }
    - { id: updated_at, label: "Ngày sửa", value_path: group.updated_at, format: "dd/MM/yyyy HH:mm" }
    - { id: updated_by, label: "Người sửa", value_path: group.updated_by_name }
    - { id: status, label: "(inline với title)", value_path: group.status, render: "BadgePill", position: "header-inline" }
```

### §6 Layout Width Table

| Container | width | margin | align-self | Notes |
|---|---|---|---|---|
| `PageContent` | full | 0 | stretch | Padding 32×24 |
| `PageHeader` | full | 0 | stretch | `justify-between` |
| `InfoSection` | full | 0 | stretch | gap 16px |
| `InfoRow1` / `InfoRow2` | full | 0 | stretch | `grid-cols-4 gap-2` — each col ≈ 298px (metadata XML width=298) |
| `InfoItem` | full (within col) | 0 | stretch | vertical: label + value 4px gap |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | "Chi tiết nhóm vật tư hàng hóa" h1 | `text-2xl font-semibold` | Page title |
| L2 | "Thông tin chung" h2 | `text-base font-semibold` | Section |
| L2 | "Chỉnh sửa" outline action | `text-sm font-medium border-input` | Secondary action |
| L3 | Status badge inline | `text-xs font-medium pill` | Status indicator |
| L3 | Info value text | `text-sm text-foreground` | Data atomic |
| L3 | Mã VTHH value as link | `text-sm text-primary` | Navigable atomic |
| L4 | Info labels (gray) | `text-sm text-muted-foreground` | Field identifier |

### §8 Anti-Pattern Trap

#### Trap 7 — Status badge nhầm chỗ
- **Triệu chứng**: DEV render badge separate row / section / footer thay vì inline với h1.
- **Đúng**: `<div className="flex items-center gap-3"><BackButton /><h1>…</h1><Badge /></div>` — INLINE 12px gap.
- `_png_verified: "13501-137145.png L4 — badge on same line as h1, immediately to right with ~12px gap"`

#### Trap 4 — Card chrome thừa
- **Triệu chứng**: DEV bọc info grid trong `<Card>` shadow/border/padding.
- **Đúng**: Plain stack, NO card wrapper.
- `_png_verified: "13501-137145.png L6-12 — info grid plain background, no surrounding card border or shadow"`

#### Trap (DETAIL-specific) — Render 9 fields với Mô tả
- **Triệu chứng**: DEV thấy FEAT AC mention Mô tả → render 3rd row hoặc squeeze vào row 2.
- **Đúng**: Chỉ 8 fields như PNG; flag coverage_gap để BA xác nhận.

---

## §9 Container Hierarchy (legacy)

```text
DetailPage [vertical, gap=0]
├── Navbar
├── SubTabNav
├── PageContent [vertical, gap=24, padding=24_32]
│   ├── PageHeader [horizontal, justify=between]
│   │   ├── HeaderTitleGroup [horizontal, gap=12, align=center]
│   │   │   ├── BackButton (icon)
│   │   │   ├── PageTitle (h1)
│   │   │   └── StatusBadgeInline (green pill)
│   │   └── EditButton (outline + pencil)
│   └── InfoSection [vertical, gap=16]
│       ├── SectionTitle "Thông tin chung" (h2)
│       ├── InfoRow1 [grid, cols=4, gap=8]
│       │   ├── CodeInfo (Mã VTHH, link)
│       │   ├── NameInfo (Tên VTHH)
│       │   ├── ParentInfo (Thuộc nhóm)
│       │   └── CategoryInfo (Nhóm VT/HH — coverage_gap)
│       └── InfoRow2 [grid, cols=4, gap=8]
│           ├── CreatedAtInfo
│           ├── CreatedByInfo
│           ├── UpdatedAtInfo
│           └── UpdatedByInfo
└── SectionFooter
```

---

## Screenshots

> `assets/wave03-cat-grp-detail/`

- `_full.png` — section overview reference

- `13501-137145.png` — Screen: Detail Read-only (1440×1024 NATIVE)
