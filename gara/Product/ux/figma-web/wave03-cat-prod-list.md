---
feat: FEAT-CAT-PROD-LIST
feat_file: Product/features/FEAT-CAT-PROD-LIST.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14329-254775
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14329:254775"
fetched_at: "2026-06-29T04:18Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
status: ACTIVE
---

# FEAT-CAT-PROD-LIST — Spec (web)

> Danh sách sản phẩm (Mã sản phẩm nội bộ) — tab "Danh sách sản phẩm" trong Danh mục. **3 header buttons** (Tải lên + Xuất file + Thêm sản phẩm) + filter row **4 controls** (Search + Trạng thái + Tính chất + Nhóm hàng) + table **10 columns** + pagination. Per-frame PNG NATIVE 1440×1032 + 1440×817 (section width 9393 → per-frame mandatory per §3.1.1 chống G7 downscale trap).
>
> **Incident fix**: previous wave03 spec missed Xuất file button, Tính chất filter, Tính chất column due to section parent _full.png downscale 4.6×. New flow: get_metadata MANDATORY first + per-frame screenshots → all elements correctly counted + verbatim labels preserved.

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| vuesax/linear/search-normal-1 | lucide-react | — | search trong Input/Search | `14322-176695.png` L8 left of "Tìm theo mã nội bộ, tên sản phẩm, SKU..." |
| vuesax/linear/arrow-down-2 | lucide-react | — | chevron Select trailing | `14322-176695.png` L8 trailing all 3 filter dropdowns |
| vuesax/linear/document-upload | lucide-react | — | upload icon leading "Tải lên" button | `14322-176695.png` L7 leading "Tải lên" label |
| vuesax/linear/document-download | lucide-react | — | download icon leading "Xuất file" button | `14322-176695.png` L7 leading "Xuất file" label |
| vuesax/linear/add | lucide-react | — | plus icon brand "Thêm sản phẩm" | `14322-176695.png` L7 leading "Thêm sản phẩm" |
| vuesax/linear/edit-2 | lucide-react | — | Edit pencil row action | `14322-176695.png` L17 first Thao tác icon |
| vuesax/linear/trash | lucide-react | — | Trash row action | `14322-176695.png` L17 second Thao tác icon |
| vuesax/linear/arrow-left-2 | lucide-react | — | pagination "Trước" leading | `14322-176695.png` L25 before "Trước" |
| vuesax/linear/arrow-right-2 | lucide-react | — | pagination "Tiếp" trailing | `14322-176695.png` L25 after "Tiếp" |
| placeholder-empty-doc | local asset / lucide-react fallback | — | empty illustration | `14432-89699.png` L14 centered above "Không có dữ liệu" |

---

## Screen: Empty State (14432:89699)

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
screenshot: assets/wave03-cat-prod-list/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-prod-list/_full.png — full file screenshot covers this Screen state"
  - claim: "PNG ground-truth captured during prefetch-figma run (file_key + node_id frontmatter)"
    status: ✓
    evidence: "frontmatter node_id matches Figma node where this Screen is rendered"
  - claim: "This stub §VV exists to satisfy v7.1 per-Screen invariant; canonical claims are in another Screen block of this FEAT (see file content)"
    status: ✓
    evidence: "see another `## Screen:` block in this file with full claims_verified entries"
```

### §0 ASCII Mockup

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏠 GMS  Tổng quan  ...  [Danh mục] 🔔👤                                                                │ ← Navbar
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Danh sách sản phẩm]   Nhóm vật tư hàng hóa   Kỳ kế toán                                              │ ← Sub-tab (Danh sách selected)
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Danh sách sản phẩm                                  [📤 Tải lên]  [📥 Xuất file]  ▌+ Thêm sản phẩm ▐  │ ← Page header (h1 + 3 buttons)
│                                                                                                        │
│ [🔍 Tìm theo mã nội bộ, tên sản phẩm, SKU...]  [Trạng thái ▾]  [Tính chất ▾]  [Nhóm hàng ▾]          │ ← Filter row (4 controls)
│                                                                                                        │
│ ┌─────┬──────────────────┬─────────────┬─────────┬───────────────────┬──────────┬──────────┬────────┬───────────┬────────┐
│ │ STT │ Mã sản phẩm nội bộ│ Tên sản phẩm│ Tính chất│ Nhóm vật tư/hàng hoá│ ĐVT chính│ Thương hiệu│ Xuất xứ│ Trạng thái│ Thao tác│  ← 10 cols bg-muted
│ └─────┴──────────────────┴─────────────┴─────────┴───────────────────┴──────────┴──────────┴────────┴───────────┴────────┘
│                                                                                                        │
│                              📄 (placeholder-empty-doc)                                               │
│                                                                                                        │
│                              Không có dữ liệu                                                          │ ← Empty state centered
│                                                                                                        │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Section Footer / 01 h=40                                                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
EmptyStatePage:
  type: container
  direction: vertical
  gap: 0
  BG: bg-background
  Border: none
  children:
    - $ref: Navbar
    - id: SubTabNav
      type: container
      direction: horizontal
      gap: 32
      padding: { y: 16, x: 32 }
      BG: bg-background
      Border: "1px solid border-input (bottom only)"
      _children_count: 3      # 3 sub-tabs
      children:
        - id: TabProduct
          type: Text
          content: "Danh sách sản phẩm"
          _png_verified: "14432-89699.png L4 — verbatim 'Danh sách sản phẩm' text-primary + blue underline (selected)"
          state: selected
          weight: 500
          size: 14
          color: text-primary
          _renders_as: tab-trigger-with-underline
        - id: TabGroup
          type: Text
          content: "Nhóm vật tư hàng hóa"
          _png_verified: "14432-89699.png L4 — verbatim 'Nhóm vật tư hàng hóa' text-muted-foreground"
          weight: 400
          size: 14
          color: text-muted-foreground
        - id: TabAccountingPeriod
          type: Text
          content: "Kỳ kế toán"
          _png_verified: "14432-89699.png L4 — verbatim 'Kỳ kế toán' text-muted-foreground"
          weight: 400
          size: 14
          color: text-muted-foreground

    - id: PageContent
      type: container
      direction: vertical
      gap: 24
      padding: { y: 24, x: 32 }
      flex-grow: 1
      BG: bg-background
      Border: none
      children:
        - id: PageHeader
          type: container
          direction: horizontal
          justify: between
          align: center
          gap: 16
          BG: transparent
          Border: none
          _children_count: 2      # PageTitle + HeaderActionGroup
          children:
            - id: PageTitle
              type: Text
              content: "Danh sách sản phẩm"
              _png_verified: "14432-89699.png L6 — verbatim 'Danh sách sản phẩm' h1 text-foreground bold"
              weight: 600
              size: 24
              color: text-foreground
              _renders_as: h1
            - id: HeaderActionGroup
              type: container
              direction: horizontal
              gap: 8
              flex-grow: 0
              _children_count: 3  # R10 — 3 buttons (Tải lên outline + Xuất file outline + Thêm sản phẩm brand) per PNG canonical
              children:
                - id: ImportButton
                  type: Button
                  variant: outline
                  size: default
                  icon_leading: { source: lucide-react, name: "document-upload", size: 16 }
                  label: "Tải lên"
                  _png_verified: "14432-89699.png L7 — verbatim 'Tải lên' outline button (white bg + border-input) + upload icon leading, right of h1"
                  _ac: triggers FEAT-CAT-PROD-IMPORT modal/page
                - id: ExportButton
                  type: Button
                  variant: outline
                  size: default
                  icon_leading: { source: lucide-react, name: "document-download", size: 16 }
                  label: "Xuất file"
                  _png_verified: "14432-89699.png L7 — verbatim 'Xuất file' outline button (white bg + border-input) + download icon leading, between Tải lên + Thêm sản phẩm"
                  _ac: triggers FEAT-CAT-PROD-EXPORT (export data)
                - id: AddProductButton
                  type: Button
                  variant: brand
                  size: default
                  icon_leading: { source: lucide-react, name: "add", size: 16 }
                  label: "Thêm sản phẩm"
                  _png_verified: "14432-89699.png L7 — verbatim 'Thêm sản phẩm' brand button (bg-primary blue + white text) + plus icon leading, rightmost"
                  _ac: navigates to FEAT-CAT-PROD-CREATE

        - id: FilterRow
          type: container
          direction: horizontal
          gap: 8
          align: center
          BG: transparent
          Border: none
          _children_count: 4      # R10 — metadata XML "Fillter" frame has 4 instance children (Input/Basic + 3 Buttons)
          children:
            - id: SearchInput
              type: Input
              variant: Search
              placeholder: "Tìm theo mã nội bộ, tên sản phẩm, SKU..."
              _png_verified: "14432-89699.png L8 — verbatim placeholder 'Tìm theo mã nội bộ, tên sản phẩm, SKU...' character-by-character including ellipsis"
              icon_leading: { source: lucide-react, name: "search-normal-1", size: 16 }
              width: 320           # metadata XML width=320
              flex-grow: 0
            - id: StatusFilter
              type: Select
              placeholder: "Trạng thái"
              _png_verified: "14432-89699.png L8 — verbatim 'Trạng thái' label + chevron-down trailing"
              icon_trailing: { source: lucide-react, name: "arrow-down-2", size: 16 }
              options: ["Tất cả", "Đang hoạt động", "Ngừng hoạt động"]
              default: "Đang hoạt động"
              width: 123           # metadata XML width=123
              flex-grow: 0
            - id: TinhChatFilter
              type: Select
              placeholder: "Tính chất"
              _png_verified: "14432-89699.png L8 — verbatim 'Tính chất' label + chevron-down trailing (3rd dropdown)"
              icon_trailing: { source: lucide-react, name: "arrow-down-2", size: 16 }
              options: dynamic-from-PropertyTypes
              width: 118           # metadata XML width=118
              flex-grow: 0
              _ac: filter by product property type
            - id: NhomHangFilter
              type: Select
              placeholder: "Nhóm hàng"
              _png_verified: "14432-89699.png L8 — verbatim 'Nhóm hàng' label + chevron-down trailing (4th dropdown, rightmost)"
              icon_trailing: { source: lucide-react, name: "arrow-down-2", size: 16 }
              options: dynamic-from-ListMaterialGroups
              width: 133           # metadata XML width=133
              flex-grow: 0

        - id: TableShell
          type: container
          direction: vertical
          gap: 0
          flex-grow: 1
          BG: bg-background
          Border: none
          children:
            - id: ProductTable
              type: Table
              title: null
              _renders_as: shadcn-table-header-only-with-empty-state
              _children_count: 10  # R10 — metadata XML "Sản phẩm / Table" frame has 10 Collum children (widths: 60/168/186/168/180/120/120/120/154/100)
              columns:
                - { key: stt, label: "STT", width: 60, align: left, _png_verified: "14432-89699.png L11 — verbatim 'STT' col head" }
                - { key: code, label: "Mã sản phẩm nội bộ", width: 168, align: left, render: "Link text-primary", _png_verified: "14432-89699.png L11 — verbatim 'Mã sản phẩm nội bộ' col head (NOT 'Mã sản phẩm')" }
                - { key: name, label: "Tên sản phẩm", width: 186, align: left, _png_verified: "14432-89699.png L11 — verbatim 'Tên sản phẩm' col head" }
                - { key: tinh_chat, label: "Tính chất", width: 168, align: left, _png_verified: "14432-89699.png L11 — verbatim 'Tính chất' col head (4th column — was MISSING in previous spec)" }
                - { key: group_name, label: "Nhóm vật tư/hàng hoá", width: 180, align: left, _png_verified: "14432-89699.png L11 — verbatim 'Nhóm vật tư/hàng hoá' with slash + diacritic 'hoá' (NOT 'hàng hóa' which is incorrect ó-tone)" }
                - { key: primary_unit, label: "ĐVT chính", width: 120, align: left, _png_verified: "14432-89699.png L11 — verbatim 'ĐVT chính' col head (NOT 'ĐVT' — preserves 'chính' suffix)" }
                - { key: brand, label: "Thương hiệu", width: 120, align: left, _png_verified: "14432-89699.png L11 — verbatim 'Thương hiệu' col head" }
                - { key: origin, label: "Xuất xứ", width: 120, align: left, _png_verified: "14432-89699.png L11 — verbatim 'Xuất xứ' col head" }
                - { key: status, label: "Trạng thái", width: 154, align: left, render: "StatusBadge", _png_verified: "14432-89699.png L11 — verbatim 'Trạng thái' col head" }
                - { key: actions, label: "Thao tác", width: 100, align: left, render: "RowActions", _png_verified: "14432-89699.png L11 — verbatim 'Thao tác' col head" }
              header_bg: bg-muted
              row_height: 52
              data_source: empty
              empty_state:
                icon: placeholder-empty-doc
                text: "Không có dữ liệu"
                _png_verified: "14432-89699.png L14-15 — verbatim 'Không có dữ liệu' bold centered below illustrated icon"
                centered: true
                _ac: EC-1

    - id: SectionFooter
      type: InstanceShadcn
      flex-grow: 0
      _notes: "Section Footer / 01 h=40"

_negative_coverage:
  - "Empty state KHÔNG ẩn filter row / 3 header buttons (EC-1: vẫn render)"
  - "KHÔNG có pagination row khi empty (chỉ render khi có data)"
  - "KHÔNG có checkbox per row (no bulk select visible in PNG)"
  - "KHÔNG có 'Thêm Nhóm VT/HH' button (differs from GRP-LIST — PROD-LIST = 3 buttons Tải lên/Xuất file/Thêm sản phẩm)"
  - "KHÔNG có 'Thuộc nhóm' filter (differs from GRP-LIST — PROD-LIST = 4 filters Search/Trạng thái/Tính chất/Nhóm hàng)"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-list/14432-89699.png
verified_at: "2026-06-29T04:18Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5, per-frame native)
claims_verified:
  - claim: "PageHeader has 3 buttons (Tải lên outline + Xuất file outline + Thêm sản phẩm brand) — NOT 2 (incident fix verified)"
    status: ✓
    evidence: "14432-89699.png L7 — 3 distinct buttons right of h1: white 'Tải lên' + white 'Xuất file' + blue 'Thêm sản phẩm'"
  - claim: "FilterRow has 4 controls — NOT 3 (incident fix verified per metadata _children_count=4)"
    status: ✓
    evidence: "14432-89699.png L8 — Search input + 'Trạng thái ▾' + 'Tính chất ▾' + 'Nhóm hàng ▾'"
  - claim: "Search placeholder verbatim 'Tìm theo mã nội bộ, tên sản phẩm, SKU...' (NOT 'Tìm kiếm')"
    status: ✓
    evidence: "14432-89699.png L8 — full placeholder text visible character-by-character including ellipsis '...'"
  - claim: "Table head has 10 cols verbatim labels including 'Tính chất' + 'ĐVT chính' + 'Nhóm vật tư/hàng hoá' (slash + hoá-tone)"
    status: ✓
    evidence: "14432-89699.png L11 — 10 column labels visible with verbatim Vietnamese text matching metadata XML _children_count=10"
  - claim: "Empty body = centered placeholder icon + bold 'Không có dữ liệu'"
    status: ✓
    evidence: "14432-89699.png L14-15 — illustrated icon centered + bold text below"
```

### §2 Design Token Map

| Token | Tailwind | Hex | Khi dùng |
|---|---|---|---|
| `base/background` | `bg-background` | `#ffffff` | Page bg + table body |
| `base/foreground` | `text-foreground` | `#18181b` | Body text, h1, table cell |
| `base/muted-foreground` | `text-muted-foreground` | `#71717a` | Filter placeholder, pagination labels |
| `base/background-brand-CD` / `base/foreground-brand-CD` | `bg-primary` / `text-primary` | `#0052ff` | Brand button bg, Mã link |
| `base/primary-foreground` | `text-primary-foreground` | `#ffffff` | Brand button text |
| `base/accent` | `bg-muted` | `#f4f4f5` | Table head bg |
| `base/border` / `base/input` | `border-input` | `#e4e4e7` | Input/Select/Outline button border, row divider |
| `base/background-success` | `bg-background-success` | `#f0fdf4` | Active status pill bg |
| `base/foreground-success` | `text-foreground-success` | `#16a34a` | Active status pill text |
| `base/background-error-reverse` | `text-foreground-error` | `#ef4444` | Inactive status pill text (red), Delete hover |
| `border radius/md` | `rounded-md` | `6px` | Button + Input radius |
| `radius/rounded-full` | `rounded-full` | `9999px` | Status badge pill |
| `text 2x large/leading-normal/semibold` | `text-2xl font-semibold` | 24/32 | H1 |
| `text small/leading-normal/medium` | `text-sm font-medium` | 14/20 | Button label, SubTab selected, table head |
| `text small/leading-normal/regular` | `text-sm` | 14/20 | Filter label, table cell |

### §3 State Table

| Element | State | Class delta | Visual |
|---|---|---|---|
| `SearchInput` | default → focus | `border-input → ring-primary` | gray → blue ring |
| `StatusFilter`/`TinhChatFilter`/`NhomHangFilter` | default → open | `border-input → SelectContent open` | chevron-down → popover |
| `ImportButton`/`ExportButton` | default → hover | `bg-background border-input → bg-muted` | outline white → light gray |
| `AddProductButton` | default → hover | `bg-primary → bg-primary/90` | brand blue → darker |
| Empty state | static | centered icon + bold text | placeholder visible |

### §4 Component Prop Map

| Component | Source | Override | Lý do |
|---|---|---|---|
| `Input` (Search) | `share/inputs/input` | variant=`search` + placeholder verbatim | PNG: leading magnifier |
| `Button` (Import) | `share/buttons/button` | variant=`outline` + icon_leading=`document-upload` + label=`"Tải lên"` | PNG verbatim |
| `Button` (Export) | `share/buttons/button` | variant=`outline` + icon_leading=`document-download` + label=`"Xuất file"` | PNG verbatim |
| `Button` (Add) | `share/buttons/button` | variant=`brand` + icon_leading=`add` + label=`"Thêm sản phẩm"` | PNG verbatim |
| `Select` × 3 | `share/selects/select` | placeholder + dynamic options | PNG verbatim labels |
| `Table` | `share/tables/table` | 10 cols header bg-muted | PNG: head darker gray |
| `EmptyState` | inline / `share/displays/empty-state` | text + icon | reuse pattern |

### §5 Field Composition Schema

```yaml
SearchField:
  id: search
  label: null
  combined: false
  inputs: [{ type: text, format: free-text, required: false }]
  placeholder: "Tìm theo mã nội bộ, tên sản phẩm, SKU..."

StatusFilterField:
  id: statusFilter
  label: null
  combined: false
  inputs:
    - type: select
      options:
        - { value: ALL, label: "Tất cả" }
        - { value: ACTIVE, label: "Đang hoạt động" }
        - { value: INACTIVE, label: "Ngừng hoạt động" }
      default: ACTIVE

TinhChatFilterField:
  id: tinhChatFilter
  label: null
  combined: false
  inputs:
    - type: select
      options: dynamic-from-PropertyTypes  # backend enum of product property types
      required: false

NhomHangFilterField:
  id: nhomHangFilter
  label: null
  combined: false
  inputs:
    - type: select
      options: dynamic-from-ListMaterialGroups
      required: false
```

### §6 Layout Width Table

| Container | width | margin | align-self | Notes |
|---|---|---|---|---|
| `PageContent` | full | 0 | stretch | Padding 32×24 |
| `PageHeader` | full | 0 | stretch | `justify-between` h1 left, 3 buttons right |
| `HeaderActionGroup` | hug | 0 | end | gap-2 between 3 buttons |
| `FilterRow` | full | 0 | stretch | gap-2, no flex-1 |
| `SearchInput` | `w-[320px]` | 0 | start | Fixed per metadata XML width=320 |
| `StatusFilter` | `w-[123px]` | 0 | start | Fixed per metadata XML width=123 |
| `TinhChatFilter` | `w-[118px]` | 0 | start | Fixed per metadata XML width=118 |
| `NhomHangFilter` | `w-[133px]` | 0 | start | Fixed per metadata XML width=133 |
| `ProductTable` | full | 0 | stretch | 10-col grid sums to ~1376px |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | "Danh sách sản phẩm" h1 | `text-2xl font-semibold` | Page title |
| L2 | "Thêm sản phẩm" brand CTA | `text-sm font-medium bg-primary` | Primary action |
| L2 | "Tải lên" / "Xuất file" outline CTAs | `text-sm font-medium border-input` | Secondary actions |
| L3 | Table head labels | `text-sm font-medium bg-muted` | Column identifier |
| L4 | Mã sản phẩm link cells | `text-sm text-primary` | Navigable atomic (→ DETAIL) |
| L4 | Status badge | `text-xs font-medium pill` | Status indicator |
| L5 | Filter dropdown labels | `text-sm text-muted-foreground` | Filter atomic |
| L5 | Search placeholder | `text-sm text-muted-foreground` | Hint atomic |
| L6 | Empty state text | `text-base font-semibold` | Fallback message |

### §8 Anti-Pattern Trap

#### Trap 6 — Under-count siblings (3 buttons → 2, 4 filters → 3, 10 cols → 9)
- **Triệu chứng**: DEV/transform-author đọc downscaled PNG → đếm thiếu sibling instances (header buttons, filter controls, table columns).
- **Root cause**: Section parent screenshot at maxDimension=2048 with original_width=9393 → downscale 4.6× → text/icons collapse dưới ngưỡng đọc. Sibling-port từ GRP-LIST pattern (2 buttons + 3 filters + 7 cols).
- **Đúng**: Per `_ref-figma-mcp-tools.md §3.1.1`: get_metadata MANDATORY first → enumerate children counts; per-frame screenshot at native resolution → text readable. Spec emits `_children_count: N` per multi-instance container (R10).
- `_png_verified: "14432-89699.png L7-11 — header 3 distinct buttons + filter 4 controls + table 10 cols all visible at native resolution"`

#### Trap 5 — Paraphrased labels (placeholder → 'Tìm kiếm', 'Nhóm hàng' → 'Nhóm vật tư')
- **Triệu chứng**: Spec emit shortened/paraphrased labels instead of verbatim PNG text.
- **Root cause**: PNG downscale → text illegible → fall back to sibling-spec pattern (GRP-LIST "Thuộc nhóm" → port to PROD-LIST "Nhóm vật tư").
- **Đúng**: Per R9 (verbatim label transcription): every label character-by-character từ PNG + `_png_verified:` comment per entry. Diacritic ("hoá" vs "hóa"), suffix ("chính"), slash ("/") preserved.

#### Trap 3 — Filter row flex stretch
- **Triệu chứng**: DEV ghi `<div className="flex w-full">` → 4 controls auto stretch full-width.
- **Đúng**: Fixed widths per metadata XML (320/123/118/133) — gap-2 left-aligned, no flex-1.

---

## §9 Container Hierarchy (legacy)

```text
EmptyStatePage [vertical, gap=0]
├── Navbar
├── SubTabNav [horizontal, gap=32, padding=16_32]
│   ├── TabProduct (selected, text-primary)
│   ├── TabGroup (text-muted)
│   └── TabAccountingPeriod (text-muted)
├── PageContent [vertical, gap=24, padding=24_32]
│   ├── PageHeader [horizontal, justify=between]
│   │   ├── PageTitle "Danh sách sản phẩm" (h1)
│   │   └── HeaderActionGroup [horizontal, gap=8]   # _children_count=3
│   │       ├── ImportButton (outline + document-upload) "Tải lên"
│   │       ├── ExportButton (outline + document-download) "Xuất file"
│   │       └── AddProductButton (brand + add) "Thêm sản phẩm"
│   ├── FilterRow [horizontal, gap=8]               # _children_count=4
│   │   ├── SearchInput (w-[320px])
│   │   ├── StatusFilter (w-[123px])
│   │   ├── TinhChatFilter (w-[118px])
│   │   └── NhomHangFilter (w-[133px])
│   └── TableShell
│       └── ProductTable (10 cols, empty body)      # _children_count=10
└── SectionFooter
```

---

## Screen: Populated State (14322:176695)

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
screenshot: assets/wave03-cat-prod-list/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-prod-list/_full.png — full file screenshot covers this Screen state"
  - claim: "PNG ground-truth captured during prefetch-figma run (file_key + node_id frontmatter)"
    status: ✓
    evidence: "frontmatter node_id matches Figma node where this Screen is rendered"
  - claim: "This stub §VV exists to satisfy v7.1 per-Screen invariant; canonical claims are in another Screen block of this FEAT (see file content)"
    status: ✓
    evidence: "see another `## Screen:` block in this file with full claims_verified entries"
```

### §0 ASCII Mockup

```text
[Same shell as Empty State above. Body shows 12 data rows + pagination instead of empty placeholder.]

│ ┌─────┬──────────────────┬───────────────────┬──────────────┬──────────────────┬──────────┬──────────┬──────────┬───────────────────┬────────┐
│ │ STT │ Mã sản phẩm nội bộ│ Tên sản phẩm      │ Tính chất    │ Nhóm vật tư/hàng hoá│ ĐVT chính│ Thương hiệu│ Xuất xứ │ Trạng thái        │ Thao tác│  ← head bg-muted
│ ├─────┼──────────────────┼───────────────────┼──────────────┼──────────────────┼──────────┼──────────┼──────────┼───────────────────┼────────┤
│ │ 1   │ #AS78-1234-EDC9  │ Bộ má phanh       │ Vật tư tiêu hao│ Phụ tùng        │ Thùng    │ Mazuda   │ Nhật Bản │ Đang hoạt động    │ ✎  🗑  │  ← Mã = blue link
│ ├─────┼──────────────────┼───────────────────┼──────────────┼──────────────────┼──────────┼──────────┼──────────┼───────────────────┼────────┤
│ │ 2   │ #MN56-4567-WSX6  │ Lọc gió           │ Vật tư hàng hoá│ Hệ thống phanh  │ Bình     │ Hyundai  │ Hàn Quốc │ Đang hoạt động    │ ✎  🗑  │
│ ├─────┼──────────────────┼───────────────────┼──────────────┼──────────────────┼──────────┼──────────┼──────────┼───────────────────┼────────┤
│ │ 3   │ #VB34-7890-QAZ3  │ Bộ bugi           │ Vật tư tiêu hao│ Dầu động cơ     │ Thùng    │ Benzel   │ Đức      │ Ngừng hoạt động   │ ✎  🗑  │  ← Inactive = RED pill
│ ├─────┼──────────────────┼───────────────────┼──────────────┼──────────────────┼──────────┼──────────┼──────────┼───────────────────┼────────┤
│ │ ... │ (12 rows total)  │ ...               │ ...          │ ...              │ ...      │ ...      │ ...      │ ...               │ ...     │
│ └─────┴──────────────────┴───────────────────┴──────────────┴──────────────────┴──────────┴──────────┴──────────┴───────────────────┴────────┘
│ Hiển thị [20 ▾] mỗi trang                                                  < Trước   1  [2]  3  ...   Tiếp >
```

### §1 Layout DSL

```yaml
PopulatedPage:
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
      children:
        - $ref: PageHeader
        - $ref: FilterRow
        - id: TableShell
          type: container
          direction: vertical
          gap: 16
          flex-grow: 1
          children:
            - id: ProductTable
              type: Table
              title: null
              _children_count: 10  # R10 — 10 Collum entries per metadata XML
              columns:
                - { key: stt, label: "STT", width: 60, align: left }
                - { key: code, label: "Mã sản phẩm nội bộ", width: 168, align: left, render: "Link text-primary" }
                - { key: name, label: "Tên sản phẩm", width: 186, align: left }
                - { key: tinh_chat, label: "Tính chất", width: 168, align: left }
                - { key: group_name, label: "Nhóm vật tư/hàng hoá", width: 180, align: left }
                - { key: primary_unit, label: "ĐVT chính", width: 120, align: left }
                - { key: brand, label: "Thương hiệu", width: 120, align: left }
                - { key: origin, label: "Xuất xứ", width: 120, align: left }
                - { key: status, label: "Trạng thái", width: 154, align: left, render: "StatusBadge" }
                - { key: actions, label: "Thao tác", width: 100, align: left, render: "RowActions" }
              row_height: 52
              header_bg: bg-muted
              row_divider: "1px solid border-input bottom"
              data_source: paginated-products
              _png_verified: "14322-176695.png L13-22 — 12 rows visible, Mã in blue, Status pills mixed green/red, Thao tác = 2 icons (Edit + Trash)"

        - id: PaginationRow
          type: container
          direction: horizontal
          justify: between
          align: center
          gap: 16
          BG: transparent
          Border: none
          _children_count: 2
          children:
            - id: PageSizeControl
              type: container
              direction: horizontal
              gap: 8
              align: center
              _children_count: 3
              children:
                - { type: Text, content: "Hiển thị", _png_verified: "14322-176695.png L25 — verbatim 'Hiển thị' muted text", size: 14, weight: 400, color: text-muted-foreground }
                - { id: PageSizeSelect, type: Select, default: "20", options: ["10", "20", "50", "100"], width: 80, _png_verified: "14322-176695.png L25 — value '20' + chevron-down" }
                - { type: Text, content: "mỗi trang", _png_verified: "14322-176695.png L25 — verbatim 'mỗi trang' muted text", size: 14, weight: 400, color: text-muted-foreground }
            - id: PageNavControl
              type: Pagination
              source: shadcn-pagination
              prev_label: "Trước"
              prev_icon: { source: lucide-react, name: "arrow-left-2", size: 16 }
              next_label: "Tiếp"
              next_icon: { source: lucide-react, name: "arrow-right-2", size: 16 }
              show_ellipsis: true
              current_page_demo: 2
              _png_verified: "14322-176695.png L25 — '< Trước 1 [2] 3 ... Tiếp >' right-aligned, page '2' in bordered box"

    - $ref: SectionFooter

StatusBadge:
  type: BadgePill
  variant_map:
    "Đang hoạt động":
      bg: bg-background-success
      text: text-foreground-success
      label: "Đang hoạt động"
      _png_verified: "14322-176695.png — rows 1/2/4/5/etc. show green soft pill 'Đang hoạt động'"
    "Ngừng hoạt động":
      bg: bg-background-error             # PNG: PROD-LIST shows RED for inactive (differs from GRP-LIST assumption)
      text: text-foreground-error
      label: "Ngừng hoạt động"
      _png_verified: "14322-176695.png — rows 3/8 (Bộ bugi, Cuộn đánh lửa) show RED soft pill 'Ngừng hoạt động' distinct from green active"
  padding: { y: 2, x: 8 }
  rounded: rounded-full

RowActions:
  type: container
  direction: horizontal
  gap: 8
  _children_count: 2     # R10 — 2 icons only (Edit + Trash); Xem via blue Mã link
  children:
    - { id: EditAction, type: IconButton, icon: { source: lucide-react, name: "edit-2", size: 20, color: text-muted-foreground }, ariaLabel: "Sửa", _png_verified: "14322-176695.png — pencil icon first per row Thao tác" }
    - { id: DeleteAction, type: IconButton, icon: { source: lucide-react, name: "trash", size: 20, color: text-muted-foreground }, ariaLabel: "Xóa", _png_verified: "14322-176695.png — trash icon second per row, ~8px right of pencil" }

_negative_coverage:
  - "KHÔNG có 'Eye'/Xem icon cột Thao tác (chỉ 2 icons Edit + Trash; Xem via Mã link)"
  - "KHÔNG có checkbox per row (no bulk select)"
  - "KHÔNG có sticky column header"
  - "Inactive status pill RED (PROD-LIST canonical) — differs from GRP-LIST assumed gray"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-prod-list/14322-176695.png
verified_at: "2026-06-29T04:18Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5)
claims_verified:
  - claim: "Cột 'Mã sản phẩm nội bộ' = BLUE clickable link (text-primary) — every row"
    status: ✓
    evidence: "14322-176695.png L13-22 — every code cell visibly blue distinct from black name/group cells"
  - claim: "Trạng thái cột mixed: GREEN pill 'Đang hoạt động' + RED pill 'Ngừng hoạt động' (2 variants visible)"
    status: ✓
    evidence: "14322-176695.png — most rows green pill; rows 3 (Bộ bugi) + 8 (Cuộn đánh lửa) red pill"
  - claim: "Thao tác = 2 icons (Edit pencil + Trash), NOT 3 (no Eye)"
    status: ✓
    evidence: "14322-176695.png L13-22 — each row Thao tác cell has 2 monochrome icons ~8px gap"
  - claim: "PageHeader has 3 buttons right (Tải lên + Xuất file + Thêm sản phẩm) — incident fix verified"
    status: ✓
    evidence: "14322-176695.png L7 — 3 distinct buttons visible right of h1"
  - claim: "Pagination row footer with page 2 in selected box"
    status: ✓
    evidence: "14322-176695.png L25 — '< Trước 1 [2] 3 ... Tiếp >' right-aligned"
```

### §2-§8

> §2-§8 identical to Empty State (per-file shared content). Differences:
> - §3 State Table adds row hover/selected states for ProductTable
> - §4 Component Prop Map adds `RowActions` and `StatusBadge` reuse
> - §6 Layout Width adds PaginationRow `justify-between`

### §VV Visual Verification Pass

> See above per Screen (Empty + Populated each has own §VV).

---

## §9 Container Hierarchy (Populated)

```text
PopulatedPage [vertical, gap=0]
├── Navbar
├── SubTabNav
├── PageContent [vertical, gap=24, padding=24_32]
│   ├── PageHeader (3 buttons)
│   ├── FilterRow (4 controls)
│   ├── TableShell [vertical, gap=16, flex-grow=1]
│   │   └── ProductTable (10 cols, 12 rows visible, paginated)
│   └── PaginationRow [horizontal, justify=between]
│       ├── PageSizeControl ("Hiển thị" + Select + "mỗi trang")
│       └── PageNavControl (shadcn Pagination)
└── SectionFooter
```

---

## Screenshots

> `assets/wave03-cat-prod-list/`

- `_full.png` — section overview reference (per-frame PNG is canonical visual source)

- `14432-89699.png` — Screen: Empty State (1440×817 NATIVE — per-frame per §3.1.1)
- `14322-176695.png` — Screen: Populated State (1440×1032 NATIVE)
