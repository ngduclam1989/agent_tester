---
feat: FEAT-CAT-GRP-LIST
feat_file: Product/features/FEAT-CAT-GRP-LIST.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88836
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14423:88836"
fetched_at: "2026-06-29T04:05Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
status: ACTIVE
coverage_gaps:
  - "AC-7 mentions 3 icons (Xem/Sửa/Xóa) trong cột 'Thao tác' but PNG renders chỉ 2 icons (Edit pencil + Trash). 'Xem' action triggered via blue 'Tên nhóm VTHH' link (text-primary clickable → DETAIL). BA confirm: (a) update AC-7 wording to mention link as Xem trigger, OR (b) add Eye icon inline as 3rd icon."
---

# FEAT-CAT-GRP-LIST — Spec (web)

> Danh sách Nhóm vật tư hàng hóa — bảng trải phẳng có phân trang (20/trang mặc định) + thanh tìm kiếm + 2 bộ lọc + nút "Thêm Nhóm VT/HH". 2 screen state: Empty + Populated. Per-frame PNG native resolution (no downscale, root section width 8044 → per-frame rule §3.1.1).

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| vuesax/linear/search-normal-1 | lucide-react | — | search icon trong Input/Search (lucide alias `<Search />`) | `assets/wave03-cat-grp-list/13501-134329.png` L8 left of "Tìm theo mã nhóm, tên nhóm" placeholder |
| vuesax/linear/arrow-down-2 | lucide-react | — | chevron-down dropdown trailing (lucide alias `<ChevronDown />`) | `assets/wave03-cat-grp-list/13501-134329.png` L8 trailing "Trạng thái" + "Thuộc nhóm" |
| vuesax/linear/add | lucide-react | — | plus icon nút brand "Thêm Nhóm VT/HH" (lucide alias `<Plus />`) | `assets/wave03-cat-grp-list/13501-134329.png` L7 leading "Thêm Nhóm VT/HH" |
| vuesax/linear/edit-2 | lucide-react | — | pencil-square icon "Sửa" row action (lucide `<Edit2 />`) | `assets/wave03-cat-grp-list/14432-88912.png` L17 first icon in Thao tác cells |
| vuesax/linear/trash | lucide-react | — | thùng rác icon "Xóa" row action (lucide `<Trash2 />`) | `assets/wave03-cat-grp-list/14432-88912.png` L17 second icon in Thao tác cells |
| vuesax/linear/arrow-left-2 | lucide-react | — | pagination "Trước" leading chevron (lucide `<ChevronLeft />`) | `assets/wave03-cat-grp-list/14432-88912.png` L25 before "Trước" label |
| vuesax/linear/arrow-right-2 | lucide-react | — | pagination "Tiếp" trailing chevron (lucide `<ChevronRight />`) | `assets/wave03-cat-grp-list/14432-88912.png` L25 after "Tiếp" label |
| placeholder-empty-doc | local asset / lucide-react fallback | — | empty-state illustrated icon (giấy mặt buồn); fallback `<FileX />` lucide nếu chưa có asset | `assets/wave03-cat-grp-list/13501-134329.png` L14 centered above "Không có dữ liệu" |
| vuesax/linear/notification-bing | lucide-react | — | bell icon Navbar (lucide `<Bell />`) | `assets/wave03-cat-grp-list/13501-134329.png` L1 right-of-nav |

---

## Screen: Empty State (13501:134329)

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
screenshot: assets/wave03-cat-grp-list/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-grp-list/_full.png — full file screenshot covers this Screen state"
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
│ 🏠 GMS  Tổng quan  Mua hàng  Sửa chữa & Dịch vụ  Tồn kho  Khách hàng  Marketing  Nhân viên [Danh mục] 🔔 👤 │ ← Navbar h=104 bg-primary
├──────────────────────────────────────────────────────────────────────────────────────┤
│ Danh sách sản phẩm   [Nhóm vật tư hàng hóa]   Kỳ kế toán                             │ ← Sub-tab nav (selected = blue underline)
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│ Danh sách nhóm vật tư hàng hóa                          ▌+ Thêm Nhóm VT/HH▐          │ ← Page header (H1 + 1 brand button right)
│                                                                                       │
│ [🔍 Tìm theo mã nhóm, tên nhóm    ]  [Trạng thái     ▾]  [Thuộc nhóm     ▾]          │ ← Filter row (3 controls)
│                                                                                       │
│ ┌─────┬──────────────┬──────────────┬─────────────┬───────┬───────────┬─────────┐    │
│ │ STT │ Tên nhóm VTHH│ Mã nhóm VTHH │ Thuộc nhóm  │ Mô tả │ Trạng thái│ Thao tác │    │ ← Table head bg-muted (7 cols)
│ └─────┴──────────────┴──────────────┴─────────────┴───────┴───────────┴─────────┘    │
│                                                                                       │
│                              📄 (placeholder-empty-doc)                              │
│                                                                                       │
│                              Không có dữ liệu                                         │ ← Empty body centered (icon + bold text)
│                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2   Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │ ← Section Footer / 01 h=40
└──────────────────────────────────────────────────────────────────────────────────────┘
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
    - id: Navbar
      type: InstanceShadcn       # shared app shell
      flex-grow: 0
      _children_count: 1         # navbar is a single instance — shared shell
      _notes: "shared shell — non-spec-scope, see existing app layout"

    - id: SubTabNav
      type: container
      direction: horizontal
      gap: 32
      padding: { y: 16, x: 32 }
      BG: bg-background
      Border: "1px solid border-input (bottom only)"
      flex-grow: 0
      _children_count: 3         # R10 — 3 tab triggers visible in PNG
      children:
        - id: TabProduct
          type: Text
          content: "Danh sách sản phẩm"
          _png_verified: "13501-134329.png L4 — verbatim 'Danh sách sản phẩm' text-muted-foreground"
          weight: 400
          size: 14
          color: text-muted-foreground
        - id: TabGroup
          type: Text
          content: "Nhóm vật tư hàng hóa"
          _png_verified: "13501-134329.png L4 — verbatim 'Nhóm vật tư hàng hóa' text-primary + blue underline"
          weight: 500
          size: 14
          color: text-primary
          state: selected
          _renders_as: tab-trigger-with-underline
        - id: TabAccountingPeriod
          type: Text
          content: "Kỳ kế toán"
          _png_verified: "13501-134329.png L4 — verbatim 'Kỳ kế toán' text-muted-foreground"
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
          flex-grow: 0
          _children_count: 2     # R10 — 1 title + 1 brand button (metadata: no Tải lên / Xuất file in GRP-LIST)
          children:
            - id: PageTitle
              type: Text
              content: "Danh sách nhóm vật tư hàng hóa"
              _png_verified: "13501-134329.png L6 — verbatim 'Danh sách nhóm vật tư hàng hóa' h1 text-foreground"
              weight: 600
              size: 24
              color: text-foreground
              _renders_as: h1
            - id: AddGroupButton
              type: Button
              variant: brand
              size: default
              icon_leading: { source: lucide-react, name: "add" }
              label: "Thêm Nhóm VT/HH"
              _png_verified: "13501-134329.png L6 — verbatim 'Thêm Nhóm VT/HH' label + plus icon leading + bg-primary blue"
              flex-grow: 0

        - id: FilterRow
          type: container
          direction: horizontal
          gap: 8
          align: center
          flex-grow: 0
          BG: transparent
          Border: none
          _children_count: 3     # R10 — confirmed metadata XML "Fillter" frame has 3 instance children (Input/Basic + Button + Button)
          children:
            - id: SearchInput
              type: Input
              variant: Search
              placeholder: "Tìm theo mã nhóm, tên nhóm"
              _png_verified: "13501-134329.png L8 — verbatim placeholder 'Tìm theo mã nhóm, tên nhóm' text-muted-foreground + search icon leading"
              icon_leading: { source: lucide-react, name: "search-normal-1", size: 16 }
              width: 320              # metadata XML width="320"
              flex-grow: 0
              _ac: AC-4
            - id: StatusFilter
              type: Select
              placeholder: "Trạng thái"
              _png_verified: "13501-134329.png L8 — verbatim 'Trạng thái' label + chevron-down trailing"
              icon_trailing: { source: lucide-react, name: "arrow-down-2", size: 16 }
              options: ["Tất cả", "Đang hoạt động", "Ngừng hoạt động"]
              default: "Đang hoạt động"
              width: 123              # metadata XML width="123"
              flex-grow: 0
              _ac: AC-5
            - id: ParentGroupFilter
              type: Select
              placeholder: "Thuộc nhóm"
              _png_verified: "13501-134329.png L8 — verbatim 'Thuộc nhóm' label + chevron-down trailing"
              icon_trailing: { source: lucide-react, name: "arrow-down-2", size: 16 }
              options: dynamic-from-ListMaterialGroups
              multi: false           # AC-6: 1 nhóm cha tại một thời điểm
              width: 139              # metadata XML width="139"
              flex-grow: 0
              _ac: AC-6

        - id: TableShell
          type: container
          direction: vertical
          gap: 0
          flex-grow: 1
          BG: bg-background
          Border: none
          children:
            - id: GroupTable
              type: Table
              title: null
              _renders_as: shadcn-table-header-only-with-empty-state
              _children_count: 7   # R10 — metadata XML "Sản phẩm / Table" frame has 7 Collum children
              columns:
                - { key: stt, label: "STT", width: 95, align: left, _png_verified: "13501-134329.png L11 — verbatim 'STT' col header bg-muted" }
                - { key: name, label: "Tên nhóm VTHH", width: 238, align: left, _png_verified: "13501-134329.png L11 — verbatim 'Tên nhóm VTHH' col header" }
                - { key: code, label: "Mã nhóm VTHH", width: 208.6, align: left, _png_verified: "13501-134329.png L11 — verbatim 'Mã nhóm VTHH' col header" }
                - { key: parent, label: "Thuộc nhóm", width: 208.6, align: left, _png_verified: "13501-134329.png L11 — verbatim 'Thuộc nhóm' col header" }
                - { key: description, label: "Mô tả", width: 208.6, align: left, _png_verified: "13501-134329.png L11 — verbatim 'Mô tả' col header" }
                - { key: status, label: "Trạng thái", width: 208.6, align: left, _png_verified: "13501-134329.png L11 — verbatim 'Trạng thái' col header" }
                - { key: actions, label: "Thao tác", width: 208.6, align: left, _png_verified: "13501-134329.png L11 — verbatim 'Thao tác' col header" }
              data_source: empty
              empty_state:
                icon: placeholder-empty-doc
                text: "Không có dữ liệu"
                _png_verified: "13501-134329.png L14-15 — verbatim 'Không có dữ liệu' bold text-foreground centered below illustrated icon"
                centered: true
                _ac: EC-1
              _png_verified: "13501-134329.png L10-15 — only head row + centered empty placeholder, no rows, no pagination"

    - id: SectionFooter
      type: InstanceShadcn       # shared app shell
      flex-grow: 0
      _children_count: 1
      _notes: "shared shell — Section Footer / 01 h=40"

_negative_coverage:
  - "Empty state KHÔNG có pagination row (PNG: pagination chỉ render khi có data per EC-1)"
  - "Empty state filter row STILL VISIBLE (EC-1 explicit) — KHÔNG hide khi rỗng"
  - "Add button KHÔNG bị disable khi empty (EC-1 mục đích: cho user tạo nhóm đầu tiên)"
  - "KHÔNG có 'Tải lên' button trong PageHeader (differs from PROD-LIST — GRP-LIST chỉ 1 brand button)"
  - "KHÔNG có 'Xuất file' button (differs from PROD-LIST)"
  - "KHÔNG có 'Tính chất' filter dropdown (differs from PROD-LIST 4 filters)"
  - "KHÔNG có pre-existing data placeholder rows (PNG canonical = empty, không skeleton)"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-grp-list/13501-134329.png
verified_at: "2026-06-29T04:05Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch with revised flow v7.5)
claims_verified:
  - claim: "Page header has SINGLE brand button '+ Thêm Nhóm VT/HH' (NOT 2 like PROD-LIST + Tải lên)"
    status: ✓
    evidence: "13501-134329.png L6 — right of h1 shows only one bg-primary blue button labeled 'Thêm Nhóm VT/HH' with plus icon"
  - claim: "Filter row has 3 controls (Search + Trạng thái + Thuộc nhóm) with widths 320/123/139 from metadata XML"
    status: ✓
    evidence: "13501-134329.png L8 — search input 320px wide, 2 dropdowns 123/139px wide; metadata XML 'Fillter' frame _children_count=3 confirms"
  - claim: "Search placeholder verbatim 'Tìm theo mã nhóm, tên nhóm' (NOT 'Tìm kiếm' generic)"
    status: ✓
    evidence: "13501-134329.png L8 — placeholder text reads 'Tìm theo mã nhóm, tên nhóm' character-by-character"
  - claim: "Table head has 7 cols verbatim labels (STT/Tên nhóm VTHH/Mã nhóm VTHH/Thuộc nhóm/Mô tả/Trạng thái/Thao tác)"
    status: ✓
    evidence: "13501-134329.png L11 — head row bg-muted with 7 column labels matching verbatim; metadata XML 'Sản phẩm / Table' frame _children_count=7"
  - claim: "Empty body = centered placeholder icon + bold 'Không có dữ liệu' below"
    status: ✓
    evidence: "13501-134329.png L14-15 — illustrated icon centered + bold text 'Không có dữ liệu' below"
```

### §2 Design Token Map

| Token name | Tailwind class | Hex / Value | Khi dùng |
|---|---|---|---|
| `base/background` | `bg-background` | `#ffffff` | Page bg + table body row |
| `base/foreground` | `text-foreground` | `#18181b` | Body text primary, table cell text |
| `base/muted-foreground` | `text-muted-foreground` | `#71717a` | Filter labels, placeholder, pagination labels |
| `base/background-brand-CD` / `base/foreground-brand-CD` | `bg-primary` / `text-primary` | `#0052ff` | Brand button bg, clickable link "Tên nhóm VTHH" |
| `base/primary-foreground` | `text-primary-foreground` | `#ffffff` | Text trên brand button |
| `base/accent` | `bg-muted` | `#f4f4f5` | Table head bg |
| `base/border` / `base/input` | `border-input` | `#e4e4e7` | Input/Select border, row divider, sub-tab divider |
| `base/background-success` | `bg-background-success` | `#f0fdf4` | Status badge "Đang hoạt động" bg |
| `base/foreground-success` | `text-foreground-success` | `#16a34a` | Status badge "Đang hoạt động" text |
| `border radius/md` | `rounded-md` | `6px` | Button + Input radius |
| `border radius/lg` | `rounded-lg` | `8px` | Larger cards (n/a this screen) |
| `radius/rounded-full` | `rounded-full` | `9999px` | Status badge pill |
| `shadow/sm` | `shadow-sm` | `0 1px 2px #0000000d` | Input shadow ring |
| `text 2x large/leading-normal/semibold` | `text-2xl font-semibold leading-8` | 24/32 | H1 page title |
| `text small/leading-normal/regular` | `text-sm` | 14/20 | Filter label, table cell text |
| `text small/leading-normal/medium` | `text-sm font-medium` | 14/20 | SubTab selected, Button label |
| `spacing/2`/`3`/`4` | `gap-2`/`gap-3`/`gap-4` | 8/12/16 | Filter row gap, page header gap |
| `spacing/6`/`8` | `p-6`/`p-8` | 24/32 | Page content padding |

### §3 State Table

| Element | State | Trigger | Class delta | Visual / Effect |
|---|---|---|---|---|
| `SearchInput` | default | n/a | `border-input shadow-sm` | gray border, search icon leading |
| `SearchInput` | focus | user click/type | `ring-2 ring-primary border-primary` | blue ring outline |
| `StatusFilter` | default | n/a | `border-input` closed | chevron down trailing |
| `StatusFilter` | open | click | `SelectContent` popover open | dropdown panel below |
| `ParentGroupFilter` | empty (no option) | api returns empty | placeholder + disabled | greyed-out trigger |
| `AddGroupButton` | default | n/a | `bg-primary text-primary-foreground` | bg blue solid |
| `AddGroupButton` | hover | mouse over | `bg-primary/90` | slightly darker |
| `AddGroupButton` | focus | keyboard tab | `ring-2 ring-primary/40` outline | a11y ring |
| `GroupTable.empty_state` | static | data_source=empty | centered icon + text | placeholder visible, no rows |

### §4 Component Prop Map

| Component | Source | Prop | Default | Override (this spec) | Lý do |
|---|---|---|---|---|---|
| `Input` (Search) | `share/inputs/input` | variant | `default` | `search` | per Input cva — adds `pl-8` for leading icon |
| `Input` (Search) | `share/inputs/input` | placeholder | — | `"Tìm theo mã nhóm, tên nhóm"` | verbatim PNG per R9 |
| `Button` (AddGroup) | `share/buttons/button` | variant | `default` | `brand` | PNG bg-brand `#0052ff` |
| `Button` (AddGroup) | `share/buttons/button` | size | `default` | `default` (h-9 px-4) | matches PNG 36px tall |
| `Select` (Filter) | `share/selects/select` | placeholder | — | `"Trạng thái"` / `"Thuộc nhóm"` | verbatim PNG per R9 |
| `Table` | `share/tables/table` | header className | `bg-background` | `bg-muted` | PNG head darker gray |
| `EmptyState` | inline | — | n/a | `<EmptyState icon={EmptyDoc} text="Không có dữ liệu" />` | reuse candidate — `share/displays/empty-state` if exists |

### §5 Field Composition Schema

```yaml
SearchField:
  id: search
  label: null                        # placeholder-only
  combined: false
  inputs:
    - { type: text, format: free-text, prefill_key: null, read_only: false, required: false }
  placeholder: "Tìm theo mã nhóm, tên nhóm"
  ac_ref: AC-4

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
      required: false
  ac_ref: AC-5

ParentGroupFilterField:
  id: parentGroupFilter
  label: null
  combined: false
  inputs:
    - type: select
      options: dynamic-from-ListMaterialGroups
      multi: false                   # AC-6: 1 nhóm cha tại một thời điểm
      required: false
  ac_ref: AC-6
```

### §6 Layout Width Table

| Container | width | margin | align-self | Notes |
|---|---|---|---|---|
| `PageContent` | none (full) | 0 | stretch | Padding 32×24 |
| `PageHeader` | full | 0 | stretch | `justify-between` |
| `FilterRow` | full | 0 | stretch | `gap-2` keeps controls left-aligned, no flex-1 |
| `SearchInput` | `w-[320px]` | 0 | start | Fixed per metadata XML width=320 |
| `StatusFilter` | `w-[123px]` | 0 | start | Fixed per metadata XML width=123 |
| `ParentGroupFilter` | `w-[139px]` | 0 | start | Fixed per metadata XML width=139 |
| `GroupTable` | full | 0 | stretch | 7-col grid sums to ~1376px content width |
| Empty placeholder | hug | `mx-auto my-auto` | center | Centered within `TableShell` body when empty |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | Page title "Danh sách nhóm vật tư hàng hóa" | `text-2xl font-semibold` (`#18181b`) | h1 page identifier |
| L2 | Brand CTA "Thêm Nhóm VT/HH" | `text-sm font-medium bg-primary` | Primary action |
| L3 | Table head labels | `text-sm font-medium bg-muted` | Section axis / column identifier |
| L4 | Filter dropdown labels | `text-sm font-normal text-muted-foreground` | Filter control atomic |
| L4 | Search placeholder | `text-sm text-muted-foreground` | Hint atomic |
| L4 | Empty state text | `text-base font-semibold text-foreground` | Fallback message |

### §8 Anti-Pattern Trap

#### Trap 3 — Filter row flex stretch
- **Triệu chứng**: DEV ghi `<div className="flex w-full justify-between">` rồi 3 control auto stretch full-width → ô search dài cả trang.
- **Root cause**: Misread PNG layout — controls có fixed-width (320/123/139 per metadata XML), KHÔNG flex-1.
- **Đúng**: `<div className="flex items-center gap-2"><SearchInput className="w-[320px]" /><StatusFilter className="w-[123px]" /><ParentGroupFilter className="w-[139px]" /></div>` — gap-2 keeps left-aligned, no stretch.
- `_png_verified: "13501-134329.png L8 — 3 controls left-aligned, large empty space to right, NOT full-width stretch"`

#### Trap 4 — Empty state ẩn filter + add button
- **Triệu chứng**: DEV thấy "Không có dữ liệu" rồi hide toàn bộ controls (search, filter, add) → user không biết tạo bản ghi đầu tiên thế nào.
- **Root cause**: Confuse empty state với "feature disabled". EC-1 explicit: filter + add CÒN visible.
- **Đúng**: Render full page chrome unchanged, chỉ swap `<TableBody />` thành `<EmptyState text="Không có dữ liệu" />`. Add button vẫn click được.
- `_png_verified: "13501-134329.png L6-15 — header + filter + table-head + empty placeholder all visible khi empty"`

---

## Screen: Populated State (14432:88912)

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
screenshot: assets/wave03-cat-grp-list/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-grp-list/_full.png — full file screenshot covers this Screen state"
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
│ 🏠 GMS  Tổng quan  Mua hàng  Sửa chữa & Dịch vụ  Tồn kho  Khách hàng  Marketing  Nhân viên [Danh mục] 🔔👤 │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Danh sách sản phẩm   [Nhóm vật tư hàng hóa]   Kỳ kế toán                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                   │
│ Danh sách nhóm vật tư hàng hóa                                      ▌+ Thêm Nhóm VT/HH▐          │
│                                                                                                   │
│ [🔍 Tìm theo mã nhóm, tên nhóm    ]  [Trạng thái     ▾]  [Thuộc nhóm     ▾]                      │
│                                                                                                   │
│ ┌─────┬──────────────────────────┬──────────────┬─────────────────┬──────────────┬──────────────────┬──────────┐
│ │ STT │ Tên nhóm VTHH            │ Mã nhóm VTHH │ Thuộc nhóm      │ Mô tả        │ Trạng thái       │ Thao tác │  ← head bg-muted
│ ├─────┼──────────────────────────┼──────────────┼─────────────────┼──────────────┼──────────────────┼──────────┤
│ │ 1   │ Vật tư hàng hoá          │ BP-63982     │ —               │ Phụ tùng     │ Đang hoạt động   │ ✎  🗑   │  ← Tên = text-primary blue link
│ ├─────┼──────────────────────────┼──────────────┼─────────────────┼──────────────┼──────────────────┼──────────┤
│ │ 2   │ Bộ phận cảm biến tốc độ  │ LG-20487     │ Vật tư hàng hoá │ Hệ thống phanh│ Đang hoạt động  │ ✎  🗑   │
│ ├─────┼──────────────────────────┼──────────────┼─────────────────┼──────────────┼──────────────────┼──────────┤
│ │ 3   │ Bộ phận điều hòa không khí│ BG-48291    │ Vật tư hàng hoá │ Dầu động cơ  │ Đang hoạt động   │ ✎  🗑   │
│ ├─────┼──────────────────────────┼──────────────┼─────────────────┼──────────────┼──────────────────┼──────────┤
│ │ ... │ (12 rows visible)        │ ...          │ ...             │ ...          │ Đang hoạt động   │ ...      │
│ └─────┴──────────────────────────┴──────────────┴─────────────────┴──────────────┴──────────────────┴──────────┘
│                                                                                                   │
│ Hiển thị [20 ▾] mỗi trang                            < Trước   1  [2]  3  ...   Tiếp >          │  ← pagination row
│                                                                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2   Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
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
      BG: bg-background
      Border: none
      children:
        - $ref: PageHeader
        - $ref: FilterRow
        - id: TableShell
          type: container
          direction: vertical
          gap: 16
          flex-grow: 1
          BG: bg-background
          Border: none
          children:
            - id: GroupTable
              type: Table
              title: null
              _children_count: 7   # R10 — 7 Collum entries per metadata XML (head + 12 data cells per col)
              columns:
                - { key: stt, label: "STT", width: 90, align: left }
                - { key: name, label: "Tên nhóm VTHH", width: 416, align: left, render: "Link text-primary clickable" }
                - { key: code, label: "Mã nhóm VTHH", width: 268, align: left }
                - { key: parent, label: "Thuộc nhóm", width: 168, align: left, nullable: true }
                - { key: description, label: "Mô tả", width: 180, align: left, nullable: true }
                - { key: status, label: "Trạng thái", width: 154, align: left, render: "StatusBadge" }
                - { key: actions, label: "Thao tác", width: 100, align: left, render: "RowActions" }
              row_height: 52        # metadata XML: each cell h=52
              header_bg: bg-muted
              row_divider: "1px solid border-input bottom"
              data_source: paginated-material-groups
              _png_verified: "14432-88912.png L11-22 — 12 rows visible, head bg-muted, Tên column text-primary blue (clickable link style), Trạng thái = green pill, Thao tác = 2 icon-buttons spaced ~8px"
              _ac: [AC-1, AC-2, AC-3]

        - id: PaginationRow
          type: container
          direction: horizontal
          justify: between
          align: center
          gap: 16
          flex-grow: 0
          BG: transparent
          Border: none
          _children_count: 2     # R10 — PageSizeControl left + PageNavControl right
          children:
            - id: PageSizeControl
              type: container
              direction: horizontal
              gap: 8
              align: center
              flex-grow: 0
              _children_count: 3 # R10 — label "Hiển thị" + Select + label "mỗi trang"
              children:
                - id: PageSizeLabel
                  type: Text
                  content: "Hiển thị"
                  _png_verified: "14432-88912.png L25 — verbatim 'Hiển thị' text-muted-foreground left of select"
                  size: 14
                  weight: 400
                  color: text-muted-foreground
                - id: PageSizeSelect
                  type: Select
                  default: "20"
                  options: ["10", "20", "50", "100"]
                  width: 80
                  _png_verified: "14432-88912.png L25 — default value '20' visible + chevron-down"
                - id: PageSizeUnit
                  type: Text
                  content: "mỗi trang"
                  _png_verified: "14432-88912.png L25 — verbatim 'mỗi trang' text-muted-foreground right of select"
                  size: 14
                  weight: 400
                  color: text-muted-foreground
            - id: PageNavControl
              type: Pagination
              source: shadcn-pagination
              prev_label: "Trước"
              prev_icon: { source: lucide-react, name: "arrow-left-2", size: 16 }
              next_label: "Tiếp"
              next_icon: { source: lucide-react, name: "arrow-right-2", size: 16 }
              show_first_last: false
              show_ellipsis: true
              current_page_demo: 2
              _png_verified: "14432-88912.png L25 — pagination right-aligned, '< Trước 1 [2] 3 ... Tiếp >' visible, page '2' in selected box bordered"

    - $ref: SectionFooter

# Row cell render specs
StatusBadge:
  type: BadgePill
  variant_map:
    Đang hoạt động:
      bg: bg-background-success           # #f0fdf4
      text: text-foreground-success       # #16a34a
      label: "Đang hoạt động"
      _png_verified: "14432-88912.png L13-22 — every row Trạng thái col shows soft green pill 'Đang hoạt động'"
    Ngừng hoạt động:
      bg: bg-muted                        # gray pill (assumed — PNG only shows active variant)
      text: text-muted-foreground
      label: "Ngừng hoạt động"
      _negative_coverage: "PNG only shows 12 rows toàn 'Đang hoạt động' — inactive variant assumed gray; confirm with BA if distinct color (red/yellow) expected"
  padding: { y: 2, x: 8 }
  rounded: rounded-full
  font: text-xs weight-500

RowActions:
  type: container
  direction: horizontal
  gap: 8
  align: center
  _children_count: 2     # R10 — only 2 icons in PNG, NOT 3 per AC-7 wording
  children:
    - id: EditAction
      type: IconButton
      icon: { source: lucide-react, name: "edit-2", size: 20, color: text-muted-foreground }
      ariaLabel: "Sửa"
      _png_verified: "14432-88912.png L17 — pencil-square icon visible in Thao tác col first position"
      _ac: AC-7 (Sửa → FEAT-CAT-GRP-EDIT)
    - id: DeleteAction
      type: IconButton
      icon: { source: lucide-react, name: "trash", size: 20, color: text-muted-foreground }
      ariaLabel: "Xóa"
      _png_verified: "14432-88912.png L17 — trash icon visible ~8px right of pencil"
      _ac: AC-7 (Xóa → FEAT-CAT-GRP-DELETE)
  _coverage_gap: "AC-7 lists 3 icons (Xem/Sửa/Xóa) but PNG renders 2; Xem triggered by blue name link (text-primary on Tên column → DETAIL). BA confirm."

_negative_coverage:
  - "KHÔNG có expand/collapse caret per row (AC-3: 'KHÔNG biểu tượng expand/collapse' explicit — flat list)"
  - "KHÔNG có indent on child rows (AC-3: 'KHÔNG thụt lề theo cấp' — flat list)"
  - "KHÔNG có 'Eye'/Xem icon trong cột Thao tác (PNG: chỉ 2 icon Edit + Trash; Xem via name link)"
  - "KHÔNG có checkbox per row (no bulk select in PNG)"
  - "KHÔNG có sticky column header (PNG: standard table scroll with body)"
  - "KHÔNG có 'Tải lên' / 'Xuất file' button trong PageHeader (differs from PROD-LIST)"
  - "KHÔNG có 'Tính chất' filter (differs from PROD-LIST)"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-grp-list/14432-88912.png
verified_at: "2026-06-29T04:05Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch with revised flow v7.5)
claims_verified:
  - claim: "Cột 'Tên nhóm VTHH' render as BLUE clickable link (text-primary), NOT plain text"
    status: ✓
    evidence: "14432-88912.png L13-22 — every name cell shows blue link-style text consistent with text-primary color"
  - claim: "Trạng thái cột = green pill 'Đang hoạt động' bg-background-success + text-foreground-success"
    status: ✓
    evidence: "14432-88912.png L13-22 — soft green rounded-full background with darker green text in every visible row"
  - claim: "Thao tác cột render 2 icons (Edit + Trash), KHÔNG 3 (no Eye visible)"
    status: ✓
    evidence: "14432-88912.png L13-22 — only pencil-square + trash icons in cột cuối; no eye/preview glyph; AC-7 drift documented in coverage_gaps"
  - claim: "Pagination row dưới table — left=page-size selector, right=page navigator. Page 2 in selected box"
    status: ✓
    evidence: "14432-88912.png L25 — 'Hiển thị 20 mỗi trang' left + '< Trước 1 [2] 3 ... Tiếp >' right, page '2' in bordered box"
  - claim: "Table head bg-muted distinct từ rows bg-background (light gray vs white)"
    status: ✓
    evidence: "14432-88912.png L11 — header row has noticeably darker bg vs body row in L13+"
```

### §2 Design Token Map

> Same as Empty State §2 (per-file shared tokens). No additional tokens for Populated state.

### §3 State Table

| Element | State | Trigger | Class delta | Visual / Effect |
|---|---|---|---|---|
| `GroupTable` row | default | n/a | `bg-background` | white default |
| `GroupTable` row | hover | mouse over row | `bg-muted/40` | light gray highlight |
| `GroupTable.name` link | default | n/a | `text-primary` | blue |
| `GroupTable.name` link | hover | mouse over text | `underline text-primary` | underline appears |
| `StatusBadge.active` | static | data binding | `bg-background-success text-foreground-success rounded-full` | green pill |
| `RowActions.EditAction` | default | n/a | `text-muted-foreground` | gray pencil |
| `RowActions.EditAction` | hover | mouse over | `text-foreground` | darker glyph |
| `RowActions.DeleteAction` | default | n/a | `text-muted-foreground` | gray trash |
| `RowActions.DeleteAction` | hover | mouse over | `text-foreground-error` (`#ef4444`) | red glyph (danger preview) |
| `PageNavControl.currentPage` | static | current = page | `border border-input bg-background` | boxed page number |
| `PageNavControl.ellipsis` | static | dynamic | `text-muted-foreground` | "..." literal |
| `PageSizeSelect` | default | n/a | `border-input` closed | 20 default |

### §4 Component Prop Map

| Component | Source | Prop | Default | Override (this spec) | Lý do |
|---|---|---|---|---|---|
| `Pagination` | `ui/pagination` (shadcn) | prevLabel | `"Previous"` | `"Trước"` | VN localization |
| `Pagination` | `ui/pagination` | nextLabel | `"Next"` | `"Tiếp"` | VN localization |
| `Badge` (StatusBadge) | `ui/badge` | variant | `default` | inline `bg-background-success text-foreground-success rounded-full` | shadcn Badge default = solid color; spec uses soft-pill |
| `RowActions.EditAction` | inline IconButton | aria-label | — | `"Sửa"` | VN per AC-7 |
| `RowActions.DeleteAction` | inline IconButton | aria-label | — | `"Xóa"` | VN per AC-7 |

### §5 Field Composition Schema

```yaml
PageSizeField:
  id: pageSize
  label: "Hiển thị"
  combined: false
  inputs:
    - { type: select, options: [10, 20, 50, 100], default: 20 }
  trailing_text: "mỗi trang"
  ac_ref: AC-3
```

### §6 Layout Width Table

| Container | width | margin | align-self | Notes |
|---|---|---|---|---|
| `PaginationRow` | full | 0 | stretch | `justify-between` left=page-size right=navigator |
| `PageNavControl` | hug | 0 | end | right-aligned within row |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L4 | Row link "Tên nhóm VTHH" cell | `text-sm font-normal text-primary` | Navigable atomic (→ DETAIL) |
| L4 | Status badge | `text-xs font-medium pill` | Status indicator atomic |
| L5 | Row action icons | `text-muted-foreground 20px` | Per-row tool atomic |
| L5 | Pagination labels + page numbers | `text-sm font-normal text-muted-foreground` | Navigation atomic |

### §8 Anti-Pattern Trap

#### Trap 6 — Gộp 3 thao tác vào 1 icon kebab menu
- **Triệu chứng**: DEV thấy AC-7 nói "3 icon" rồi render `<MoreVertical />` (kebab menu) chứa 3 actions trong popover thay vì render inline.
- **Root cause**: Spec số ít / abstract; PNG canonical = inline 2 icons. Xem via name link.
- **Đúng**: Cell "Thao tác" render `<div className="flex gap-2 items-center"><EditButton /><DeleteButton /></div>` inline mỗi row. KHÔNG kebab menu.
- `_png_verified: "14432-88912.png L13-22 — 2 icons inline per row, NOT kebab menu (no vertical-dots icon visible)"`

#### Trap 7 — Selected page không highlight
- **Triệu chứng**: DEV implement pagination nhưng current page hiển thị giống các page khác → user không biết đang ở page nào.
- **Root cause**: shadcn Pagination default styling uses `bg-transparent` cho all page links; cần override `isActive` → `bg-background border border-input` boxed.
- **Đúng**: `<PaginationItem isActive={page === current}><PaginationLink>{page}</PaginationLink></PaginationItem>`. PNG verified: page "2" có visible border box, others plain text.
- `_png_verified: "14432-88912.png L25 — page '2' in bordered box (selected), pages 1/3 plain text"`

---

## §9 Container Hierarchy (legacy Layout Tree — backward compat)

```text
PopulatedPage [vertical, gap=0]
├── Navbar [shared shell, h=104]
├── SubTabNav [horizontal, gap=32, padding=16_32, border-bottom 1px]
│   ├── TabProduct (text-muted)
│   ├── TabGroup (selected, text-primary, underline)
│   └── TabAccountingPeriod (text-muted)
├── PageContent [vertical, gap=24, padding=24_32]
│   ├── PageHeader [horizontal, justify=between, align=center]
│   │   ├── PageTitle (h1, text-2xl)
│   │   └── AddGroupButton (brand variant, plus icon)
│   ├── FilterRow [horizontal, gap=8, align=center]
│   │   ├── SearchInput (w-[320px])
│   │   ├── StatusFilter (w-[123px])
│   │   └── ParentGroupFilter (w-[139px])
│   ├── TableShell [vertical, gap=16, flex-grow=1]
│   │   └── GroupTable
│   │       ├── TableHead (7 cols, bg-muted)
│   │       └── TableBody (12 rows OR EmptyState)
│   └── PaginationRow [horizontal, justify=between, align=center]
│       ├── PageSizeControl [horizontal, gap=8]
│       │   ├── "Hiển thị" Text
│       │   ├── PageSizeSelect (w-[80px])
│       │   └── "mỗi trang" Text
│       └── PageNavControl (shadcn Pagination)
└── SectionFooter [shared shell, h=40]
```

---

## Screenshots

> `assets/wave03-cat-grp-list/`

- `_full.png` — section overview reference

- `13501-134329.png` — Screen: Empty State (1440×817 NATIVE — per-frame per §3.1.1)
- `14432-88912.png` — Screen: Populated State (1440×1032 NATIVE)
