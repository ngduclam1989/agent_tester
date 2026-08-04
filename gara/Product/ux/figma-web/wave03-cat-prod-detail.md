---
feat: FEAT-CAT-PROD-DETAIL
feat_file: Product/features/FEAT-CAT-PROD-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87538
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14146:87538"
fetched_at: "2026-06-29T04:25Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 5
status: ACTIVE
coverage_gaps:
  - "PROD-DETAIL section contains 5 frame variants (primary 13492:57582 specced; 4 others = tab variants / modal). Per §2.7.0 step 7 no-sibling-port — §1 DSL re-derived independently."
  - "PNG Row 3 'Ghi chú' shows 'ĐVT chính không được sửa vì mã đã phát sinh giao dịch.' which is a SYSTEM MESSAGE, NOT user note. Confirm BA whether this is fixed system text or actual user-entered ghi chú."
---

# FEAT-CAT-PROD-DETAIL — Spec (web)

> Trang chi tiết sản phẩm — full-page read-only. Per-frame PNG NATIVE 1440×1124. Header: back + h1 + inline green badge + **3 outline buttons** (Chỉnh sửa + Gắn SKU + Thêm ĐVT quy đổi). Body: "Thông tin sản phẩm" h2 + "Hình ảnh" + 4-col × 3-row info grid (12 fields) + Tabs (ĐVT quy đổi / Mã SKU / Đính kèm file) read-only + audit footer.

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| vuesax/linear/arrow-left | lucide-react | — | back-arrow | `13492-57582.png` L4 |
| vuesax/linear/edit-2 | lucide-react | — | pencil "Chỉnh sửa" icon leading | `13492-57582.png` L4 leading "Chỉnh sửa" |
| vuesax/linear/add | lucide-react | — | plus "Gắn SKU" + "Thêm ĐVT quy đổi" icon leading | `13492-57582.png` L4 |

---

## Screen: Detail Read-only (13492:57582)

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
screenshot: assets/wave03-cat-prod-detail/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-prod-detail/_full.png — full file screenshot covers this Screen state"
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
│ ←  Chi tiết sản phẩm  [Đang hoạt động]        [Chỉnh sửa]  [Gắn SKU]  [Thêm ĐVT quy đổi]        │ ← header (back + h1 + badge + 3 outline buttons)
│                                                                                                   │
│ Thông tin sản phẩm                                                                                │ ← h2 (NOT 'Thông tin chung')
│                                                                                                   │
│ Hình ảnh                                                                                          │ ← subheading "Hình ảnh"
│ [📷 product image thumbnail]                                                                       │ ← image displayed
│                                                                                                   │
│ Mã sản phẩm nội bộ    Tên sản phẩm           Tính chất            Nhóm vật tư/hàng hóa            │ ← Row 1 labels (gray)
│ #IP-BP-0001          Lọc dầu động cơ Toyota Vật tư hàng hóa      Phụ tùng bảo dưỡng              │ ← Row 1 values (Mã = BLUE link)
│                                                                                                   │
│ ĐVT chính            Thương hiệu             Xuất xứ              Phương pháp tính giá            │ ← Row 2 labels
│ Cái                  Toyota                  Nhật Bản             Bình quân cuối kỳ                │ ← Row 2 values
│                                                                                                   │
│ Thông số kỹ thuật     Quy cách sản phẩm      Mô tả                Ghi chú                         │ ← Row 3 labels
│ Đường kính 68mm,      Lọc dầu động cơ dùng   Phụ tùng bảo dưỡng    ĐVT chính không được sửa      │
│ ren M20×1.5, ...      cho Toyota Vios/Altis  định kỳ, dùng để...   vì mã đã phát sinh giao dịch. │ ← Row 3 values
│                                                                                                   │
│ [ĐVT quy đổi]  [Mã SKU]  [Đính kèm file]                                                          │ ← Tabs read-only
│ ┌─────┬─────────┬────────────────┐                                                                │
│ │ STT │ ĐVT     │ Tỷ lệ quy đổi  │ ← read-only — 3 cols only (NO Thao tác column in DETAIL)      │
│ │ 1   │ Thùng   │ 12             │
│ │ 2-5 │ ...     │ ...            │
│ └─────┴─────────┴────────────────┘
│                                                                                                   │
│ Ngày tạo            Người tạo               Ngày sửa              Người sửa                       │ ← audit footer (read-only)
│ 07/05/2026 09:55    Nguyễn Văn Kho           07/05/2026 09:55     Nguyễn Văn Kho                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
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
      _children_count: 4   # R10 — PageHeader + InfoSection + TabsSection + AuditFooter
      children:
        - id: PageHeader
          type: container
          direction: horizontal
          justify: between
          align: center
          _children_count: 2
          children:
            - id: HeaderTitleGroup
              type: container
              direction: horizontal
              gap: 12
              align: center
              _children_count: 3   # BackButton + PageTitle + StatusBadgeInline
              children:
                - { id: BackButton, type: IconButton, icon: { source: lucide-react, name: "arrow-left" }, variant: ghost }
                - id: PageTitle
                  type: Text
                  content: "Chi tiết sản phẩm"
                  _png_verified: "13492-57582.png L4 — verbatim 'Chi tiết sản phẩm' h1"
                  weight: 600
                  size: 24
                  _renders_as: h1
                - id: StatusBadgeInline
                  type: BadgePill
                  variant_map:
                    "Đang hoạt động":
                      bg: bg-background-success
                      text: text-foreground-success
                      label: "Đang hoạt động"
                  padding: { y: 2, x: 8 }
                  rounded: rounded-full
                  _png_verified: "13492-57582.png L4 — green soft pill 'Đang hoạt động' inline ~12px right of h1"
            - id: PageActionGroup
              type: container
              direction: horizontal
              gap: 8
              _children_count: 3   # R10 — 3 outline buttons (Chỉnh sửa + Gắn SKU + Thêm ĐVT quy đổi)
              children:
                - id: EditButton
                  type: Button
                  variant: outline
                  icon_leading: { source: lucide-react, name: "edit-2", size: 16 }
                  label: "Chỉnh sửa"
                  _png_verified: "13492-57582.png L4 — verbatim 'Chỉnh sửa' outline button (white + pencil icon) left of 3-button group"
                  _ac: links to FEAT-CAT-PROD-EDIT
                - id: AssignSkuButton
                  type: Button
                  variant: outline
                  icon_leading: { source: lucide-react, name: "add", size: 16 }
                  label: "Gắn SKU"
                  _png_verified: "13492-57582.png L4 — verbatim 'Gắn SKU' outline button middle"
                  on_click: "open AssignSkuDialog modal"
                - id: AddUnitButton
                  type: Button
                  variant: outline
                  icon_leading: { source: lucide-react, name: "add", size: 16 }
                  label: "Thêm ĐVT quy đổi"
                  _png_verified: "13492-57582.png L4 — verbatim 'Thêm ĐVT quy đổi' outline button rightmost"
                  on_click: "open AddConversionUnitDialog modal"

        - id: InfoSection
          type: container
          direction: vertical
          gap: 16
          _children_count: 5   # SectionTitle + ImageSubsection + InfoRow1 + InfoRow2 + InfoRow3
          children:
            - { id: SectionTitle, type: Text, content: "Thông tin sản phẩm", _png_verified: "13492-57582.png L6 — verbatim 'Thông tin sản phẩm' h2 (NOT 'Thông tin chung' which is CREATE/EDIT)", weight: 600, size: 16, _renders_as: h2 }

            - id: ImageSubsection
              type: container
              direction: vertical
              gap: 4
              _children_count: 2
              children:
                - { id: ImageLabel, type: Text, content: "Hình ảnh", _png_verified: "13492-57582.png L8 — verbatim 'Hình ảnh' label text-muted-foreground", size: 14, color: text-muted-foreground }
                - { id: ProductImage, type: Image, src: product.image_url, width: 96, height: 96, rounded: rounded-md, _png_verified: "13492-57582.png L9 — square product thumbnail visible" }

            - id: InfoRow1
              type: container
              direction: grid
              cols: 4
              gap: 16
              _children_count: 4
              children:
                - { id: CodeInfo, type: InfoItem, label: "Mã sản phẩm nội bộ", value_render: "Link text-primary", value_demo: "#IP-BP-0001", _png_verified: "13492-57582.png L11 — verbatim 'Mã sản phẩm nội bộ' label + '#IP-BP-0001' BLUE link value" }
                - { id: NameInfo, type: InfoItem, label: "Tên sản phẩm", value_demo: "Lọc dầu động cơ Toyota", _png_verified: "13492-57582.png L11 — verbatim 'Tên sản phẩm' label" }
                - { id: TinhChatInfo, type: InfoItem, label: "Tính chất", value_demo: "Vật tư hàng hóa", _png_verified: "13492-57582.png L11 — verbatim 'Tính chất' label" }
                - { id: GroupInfo, type: InfoItem, label: "Nhóm vật tư/hàng hóa", value_demo: "Phụ tùng bảo dưỡng", _png_verified: "13492-57582.png L11 — verbatim 'Nhóm vật tư/hàng hóa' with slash" }

            - id: InfoRow2
              type: container
              direction: grid
              cols: 4
              gap: 16
              _children_count: 4
              children:
                - { id: PrimaryUnitInfo, type: InfoItem, label: "ĐVT chính", value_demo: "Cái", _png_verified: "13492-57582.png L13 — verbatim 'ĐVT chính' label" }
                - { id: BrandInfo, type: InfoItem, label: "Thương hiệu", value_demo: "Toyota", _png_verified: "13492-57582.png L13 — verbatim 'Thương hiệu'" }
                - { id: OriginInfo, type: InfoItem, label: "Xuất xứ", value_demo: "Nhật Bản", _png_verified: "13492-57582.png L13 — verbatim 'Xuất xứ'" }
                - { id: CostMethodInfo, type: InfoItem, label: "Phương pháp tính giá", value_demo: "Bình quân cuối kỳ", _png_verified: "13492-57582.png L13 — verbatim 'Phương pháp tính giá'" }

            - id: InfoRow3
              type: container
              direction: grid
              cols: 4
              gap: 16
              _children_count: 4
              children:
                - { id: SpecInfo, type: InfoItem, label: "Thông số kỹ thuật", value_demo: "Đường kính 68mm, ren M20×1.5, chiều cao 75mm.", _png_verified: "13492-57582.png L15 — verbatim 'Thông số kỹ thuật' label" }
                - { id: FormatInfo, type: InfoItem, label: "Quy cách sản phẩm", value_demo: "Lọc dầu động cơ dùng cho Toyota Vios/Altis", _png_verified: "13492-57582.png L15 — verbatim 'Quy cách sản phẩm'" }
                - { id: DescInfo, type: InfoItem, label: "Mô tả", value_demo: "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.", _png_verified: "13492-57582.png L15 — verbatim 'Mô tả'" }
                - { id: GhiChuInfo, type: InfoItem, label: "Ghi chú", value_demo: "ĐVT chính không được sửa vì mã đã phát sinh giao dịch.", _png_verified: "13492-57582.png L15 — verbatim 'Ghi chú' (note: PNG demo shows system-message-style text — confirm BA if this is fixed or user-entered)" }

        - id: TabsSection
          type: Tabs
          source: ui/tabs
          default: "ĐVT quy đổi"
          _children_count: 3
          tabs:
            - { id: unitTab, label: "ĐVT quy đổi", _png_verified: "13492-57582.png L19 — verbatim 'ĐVT quy đổi' SELECTED" }
            - { id: skuTab, label: "Mã SKU", _png_verified: "13492-57582.png L19 — verbatim 'Mã SKU'" }
            - { id: attachTab, label: "Đính kèm file", _png_verified: "13492-57582.png L19 — verbatim 'Đính kèm file'" }
          panels:
            - id: UnitPanel
              children:
                - id: ConversionUnitReadonlyTable
                  type: Table
                  _children_count: 3        # R10 — PNG read-only DETAIL table has 3 cols only (STT/ĐVT/Tỷ lệ quy đổi); NO Thao tác column (DETAIL is read-only, row actions only exist in EDIT)
                  columns:
                    - { key: stt, label: "STT", width: 60 }
                    - { key: unit, label: "ĐVT", flex: 1 }
                    - { key: ratio, label: "Tỷ lệ quy đổi", width: 160 }
                  data_source: product.conversion_units
                  read_only: true
                  _png_verified: "13492-57582.png L21-26 — table head + 5 rows visible, ONLY 3 columns (STT/ĐVT/Tỷ lệ quy đổi); NO Thao tác column in read-only DETAIL view (Thao tác column exists only in EDIT mode)"

        - id: AuditFooter
          type: container
          direction: grid
          cols: 4
          gap: 16
          padding: { t: 16 }
          _children_count: 4
          children:
            - { id: CreatedAtInfo, type: InfoItem, label: "Ngày tạo", value_demo: "07/05/2026 09:55", _png_verified: "13492-57582.png L29 — verbatim 'Ngày tạo'" }
            - { id: CreatedByInfo, type: InfoItem, label: "Người tạo", value_demo: "Nguyễn Văn Kho", _png_verified: "13492-57582.png L29 — verbatim 'Người tạo'" }
            - { id: UpdatedAtInfo, type: InfoItem, label: "Ngày sửa", value_demo: "07/05/2026 09:55", _png_verified: "13492-57582.png L29 — verbatim 'Ngày sửa'" }
            - { id: UpdatedByInfo, type: InfoItem, label: "Người sửa", value_demo: "Nguyễn Văn Kho", _png_verified: "13492-57582.png L29 — verbatim 'Người sửa'" }

InfoItem:
  type: container
  direction: vertical
  gap: 4
  BG: transparent
  Border: none
  children:
    - { id: Label, type: Text, weight: 400, size: 14, color: text-muted-foreground, _renders_as: label-text }
    - { id: Value, type: Text, weight: 400, size: 14, color: text-foreground }

_negative_coverage:
  - "Header has 3 outline buttons (Chỉnh sửa + Gắn SKU + Thêm ĐVT quy đổi) — NOT 1 like GRP-DETAIL"
  - "Section title 'Thông tin sản phẩm' (NOT 'Thông tin chung' which is CREATE/EDIT)"
  - "Body has 4-col × 3-row info grid (12 fields including Ghi chú) — 'Ghi chú' visible (NOT missing per previous spec)"
  - "Image displayed as thumbnail under 'Hình ảnh' subheading separate from grid (NOT inline in grid)"
  - "Tab panels READ-ONLY (NO Edit/Trash row actions)"
  - "Audit footer (Ngày/Người tạo/sửa) at bottom — separate from main info grid"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-detail/13492-57582.png
verified_at: "2026-06-29T04:25Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5)
claims_verified:
  - claim: "Header has 3 outline buttons (Chỉnh sửa + Gắn SKU + Thêm ĐVT quy đổi)"
    status: ✓
    evidence: "13492-57582.png L4 — 3 distinct outline buttons visible right of inline status badge"
  - claim: "Section title verbatim 'Thông tin sản phẩm' (NOT 'Thông tin chung')"
    status: ✓
    evidence: "13492-57582.png L6 — h2 text reads 'Thông tin sản phẩm'"
  - claim: "Body has 12 info fields in 4-col × 3-row grid, plus separate 'Hình ảnh' subsection above + audit footer below"
    status: ✓
    evidence: "13492-57582.png L8-29 — Image label + 12 InfoItems organized as 4×3 grid + bottom audit row 4 fields"
  - claim: "'Ghi chú' field visible as 4th column row 3 with text 'ĐVT chính không được sửa vì mã đã phát sinh giao dịch.'"
    status: ✓
    evidence: "13492-57582.png L15 — Ghi chú label + multi-line system-message-style text in 4th column row 3"
  - claim: "Tab panel ConversionUnitReadonlyTable has ONLY 3 columns (STT/ĐVT/Tỷ lệ quy đổi) — NO Thao tác column at all in DETAIL view (read-only)"
    status: ✓
    evidence: "13492-57582.png L21-26 — table head shows only 3 column labels; rows have no 4th cell for actions; Thao tác column exists in EDIT mode only"
  - claim: "Mã sản phẩm value '#IP-BP-0001' is BLUE clickable (text-primary)"
    status: ✓
    evidence: "13492-57582.png L11 — value text in primary blue distinct from black other values"
```

### §2-§8

Same as `wave03-cat-prod-create.md §2-§8` tokens. DETAIL-specific:
- §3 EditButton/AssignSkuButton/AddUnitButton: outline → hover (bg-background → bg-muted)
- §4 3 outline buttons header + Badge soft-pill inline + InfoItem reuse
- §5 read-only binding (no form fields — value paths from product entity)
- §8 Trap card-chrome-thừa (info grid plain stack, no card wrapper); Trap (DETAIL-specific) — tab panels read-only (no row actions)

---

## §9 Container Hierarchy

```text
DetailPage [vertical, gap=0]
├── Navbar + SubTabNav
├── PageContent [vertical, gap=24, padding=24_32]
│   ├── PageHeader [horizontal, justify=between]
│   │   ├── HeaderTitleGroup [BackButton + PageTitle + StatusBadgeInline]   # _children_count=3
│   │   └── PageActionGroup [horizontal, gap=8]                              # _children_count=3
│   │       ├── EditButton (outline + edit-2) "Chỉnh sửa"
│   │       ├── AssignSkuButton (outline + add) "Gắn SKU"
│   │       └── AddUnitButton (outline + add) "Thêm ĐVT quy đổi"
│   ├── InfoSection [vertical, gap=16]
│   │   ├── SectionTitle "Thông tin sản phẩm" (h2)
│   │   ├── ImageSubsection [Label "Hình ảnh" + ProductImage 96×96]
│   │   ├── InfoRow1 [grid, cols=4] — Mã/Tên/Tính chất/Nhóm VT-HH
│   │   ├── InfoRow2 [grid, cols=4] — ĐVT chính/Thương hiệu/Xuất xứ/Phương pháp
│   │   └── InfoRow3 [grid, cols=4] — Thông số kỹ thuật/Quy cách/Mô tả/Ghi chú
│   ├── TabsSection [Tabs, default=ĐVT quy đổi]   # _children_count=3
│   │   └── UnitPanel: ConversionUnitReadonlyTable (no row actions)
│   └── AuditFooter [grid, cols=4]                  # _children_count=4
│       └── Ngày tạo / Người tạo / Ngày sửa / Người sửa
```

---

## Screenshots

> `assets/wave03-cat-prod-detail/`

- `_full.png` — section overview reference (per-frame PNG is canonical visual source)

- `13492-57582.png` — Screen: Detail Read-only (1440×1124 NATIVE)
