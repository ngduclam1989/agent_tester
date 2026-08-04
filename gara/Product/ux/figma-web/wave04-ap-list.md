---
feat: FEAT-AP-LIST
feat_file: Product/features/FEAT-AP-LIST.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89259
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14492:89259"
fetched_at: "2026-07-08T04:03Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
status: ACTIVE
coverage_gaps:
  - "PNG Thao tác col shows 2 icons only (Edit2 pencil + Trash). FEAT AC-7 explicit 3 icons: Xem + Sửa + Xóa. Missing Xem icon (Eye) in Figma. Implementation MUST render 3 icons per FEAT authoritative; Xem icon → Eye variant=Linear per convention. Designer cần bổ sung Figma frame."
  - "Filter dropdown label 'Kỳ kế toán' in PNG is generic — per AC-6 the dropdown filters năm (year). Expected label 'Năm 2026' with year value. Figma placeholder wording drift; implementation uses FEAT AC-6 explicit năm filter."
  - "Không có pagination trong PNG. FEAT không explicit pagination trong AC — tree view có thể long-scroll. Implementation: cây có ≥50 nodes → paginate hoặc virtualize scroll (recommend). Xác nhận với BA nếu cần pagination."
  - "Tên kỳ kế toán tree cell expand/collapse chevron pattern: expanded row shows chevron-down ▼; collapsed shows chevron-up ^ (unusual — typically chevron-right → chevron-down). Implementation uses standard chevron-down (expanded) / chevron-right (collapsed) per shadcn Collapsible convention."
---

# FEAT-AP-LIST — Spec (web)

> Page-level list view cho kỳ kế toán dạng cây phân cấp (năm → quý → tháng). Structure: page header + Thêm kỳ kế toán CTA + filter row (search + năm dropdown) + table 6-col với tree expand/collapse ở cột đầu + status badge chip + Thao tác icons. 2 states: default (populated) + empty (chưa có kỳ nào).
>
> **Icon library**: `iconsax-reactjs` primary (v7.6). Icons: AddCircle (add CTA), SearchNormal, ArrowDown, ArrowUp / ArrowRight2 (tree expand), Eye (Xem), Edit2 (Sửa), Trash (Xóa).

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| icon/add-cta | vuesax/linear/add-circle | iconsax-reactjs | AddCircle | Linear | assets/wave04-ap-list/14653-92128.png L143 add-circle glyph leading 'Thêm kỳ kế toán' brand blue button |
| icon/search | vuesax/linear/search-normal | iconsax-reactjs | SearchNormal | Linear | assets/wave04-ap-list/14653-92128.png L200 magnifying-glass leading search input |
| icon/filter-chevron | vuesax/linear/arrow-down | iconsax-reactjs | ArrowDown | Linear | assets/wave04-ap-list/14653-92128.png L200 chevron-down trailing 'Kỳ kế toán' filter dropdown |
| icon/tree-expanded | vuesax/linear/arrow-down | iconsax-reactjs | ArrowDown | Linear | assets/wave04-ap-list/14653-92128.png L310 chevron-down ▼ leading Năm 2026 row (expanded state) |
| icon/tree-collapsed | vuesax/linear/arrow-right | iconsax-reactjs | ArrowRight | Linear | (used when row collapsed — Figma frame shows chevron-up ^ for Q3/Q4 which is anomalous; implementation follows shadcn Collapsible ▶ → ▼ convention) |
| icon/row-view | vuesax/linear/eye | iconsax-reactjs | Eye | Linear | (FEAT AC-7 requires; Figma missing per coverage_gap) |
| icon/row-edit | vuesax/linear/edit-2 | iconsax-reactjs | Edit2 | Linear | assets/wave04-ap-list/14653-92128.png row Thao tác col pencil glyph per row |
| icon/row-delete | vuesax/linear/trash | iconsax-reactjs | Trash | Linear | assets/wave04-ap-list/14653-92128.png row Thao tác col trash-bin glyph per row |

---

## Screen: Default populated tree (14653:92128)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Default state** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `tableBody = TreeRowList[]` with expand/collapse per row + `tableFooter: hidden`.

### §2 Design Token Map
> See file-level **§2 Design Token Map** below.
### §3 State Table
> See file-level **§3 State Table** below (state = `default`).
### §4 Component Prop Map
> See file-level **§4 Component Prop Map** below.
### §5 Field Composition Schema
> See file-level **§5 Field Composition Schema** below.
### §6 Layout Width Table
> See file-level **§6 Layout Width Table** below.
### §7 Visual Hierarchy Map
> See file-level **§7 Visual Hierarchy Map** below.
### §8 Anti-Pattern Trap
> See file-level **§8 Anti-Pattern Trap** below.

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ap-list/14653-92128.png
verified_at: "2026-07-08T04:03Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Page title verbatim 'Danh sách kỳ kế toán' + '+' Thêm kỳ kế toán brand blue button top-right"
    status: ✓
    evidence: "14653-92128.png L143 shows H1 'Danh sách kỳ kế toán' left + '+ Thêm kỳ kế toán' blue button with add-circle icon leading top-right"
  - claim: "Filter row = search input (placeholder 'Tìm theo tên kỳ kế toán') + năm filter dropdown showing 'Kỳ kế toán' text with chevron"
    status: ✓
    evidence: "14653-92128.png L200 search + dropdown 2-element filter row; dropdown label 'Kỳ kế toán' is generic — per FEAT AC-6 should show năm value; coverage_gap"
  - claim: "Table 6 cols per AC-2: Tên kỳ kế toán + Loại kỳ kế toán + Ngày bắt đầu + Ngày kết thúc + Trạng thái + Thao tác"
    status: ✓
    evidence: "14653-92128.png L260 header row exactly 6 columns matching AC-2 verbatim labels"
  - claim: "Tree tán cây per AC-3: Năm root với chevron-down ▼ expand; Quý indented below Năm; Tháng indented below Quý"
    status: ✓
    evidence: "14653-92128.png row Năm 2026 has chevron-down + no indent; Quý 1/2026 has chevron-down + 1-level indent; Tháng 1/2026 no chevron + 2-level indent (leaf)"
  - claim: "Trạng thái badge chip per AC-4: 'Đã đóng kỳ' red bg + 'Chưa đóng kỳ' green bg — text badge, no icon"
    status: ✓
    evidence: "14653-92128.png Trạng thái col rows show pink/red bg badges for 'Đã đóng kỳ' + green bg badges for 'Chưa đóng kỳ' — matches AC-4 color mapping"
  - claim: "Thao tác col shows 2 icons only (Edit2 + Trash) — FEAT AC-7 requires 3 icons (Xem + Sửa + Xóa), Eye icon missing in Figma"
    status: ⚠
    evidence: "14653-92128.png Thao tác col each row shows only 2 icon-buttons; coverage_gap flagged; implementation MUST render 3 icons per FEAT authoritative"
  - claim: "Không có pagination row visible — tree scrolls long; FEAT không explicit pagination"
    status: ✓
    evidence: "14653-92128.png below last row no pagination controls; page footer immediately after last table row"
```

---

## Screen: Empty state — chưa có kỳ nào (13521:59963)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Empty state** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `tableBody = EmptyIllustration` per AC-4b (header + filter + Thêm kỳ kế toán button STILL visible).

### §2 Design Token Map
> See file-level **§2 Design Token Map** below.
### §3 State Table
> See file-level **§3 State Table** below (state = `empty`).
### §4 Component Prop Map
> See file-level **§4 Component Prop Map** below.
### §5 Field Composition Schema
> See file-level **§5 Field Composition Schema** below.
### §6 Layout Width Table
> See file-level **§6 Layout Width Table** below (Table height compresses; no data rows).
### §7 Visual Hierarchy Map
> See file-level **§7 Visual Hierarchy Map** below.
### §8 Anti-Pattern Trap
> See file-level **§8 Anti-Pattern Trap** below.

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ap-list/13521-59963.png
verified_at: "2026-07-08T04:03Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Header + filter row identical to default state (page title + search + năm filter + Thêm kỳ kế toán visible) per AC-4b explicit 'header giữ đầy đủ'"
    status: ✓
    evidence: "13521-59963.png header + filter row visually identical to 14653-92128.png; Thêm kỳ kế toán button top-right visible"
  - claim: "Table header row (6 columns) visible + no data rows"
    status: ✓
    evidence: "13521-59963.png L260 shows column header row only, empty table body below"
  - claim: "Empty illustration + text 'Không có dữ liệu' centered ở giữa vùng bảng"
    status: ✓
    evidence: "13521-59963.png L500-580 shows sketched empty-document illustration + verbatim label 'Không có dữ liệu' centered semibold"
  - claim: "Không có pagination hoặc dòng Tổng (không applicable cho tree list)"
    status: ✓
    evidence: "13521-59963.png below empty illustration — no total row, no page controls (parity with populated state which also lacks pagination)"
  - claim: "'Thêm kỳ kế toán' button top-right ENABLED khi empty state per AC-4b 'luôn enable' — click mở FEAT-AP-CREATE"
    status: ✓
    evidence: "13521-59963.png button rendered brand blue enabled state; FEAT AC-4b explicit trigger to FEAT-AP-CREATE"
```

---

# File-level shared sections

## §0 ASCII Mockup — Default state (14653:92128)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚗 GMS   Tổng quan   Mua hàng   Sửa chữa & Dịch vụ   Tồn kho   Khách hàng   Marketing   Nhân viên   [Danh mục]      🔔● 👤 │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Danh sách sản phẩm   Nhóm vật tư hàng hóa   [Kỳ kế toán]‾‾‾                                          │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  Danh sách kỳ kế toán                                                       [ ⊕ Thêm kỳ kế toán ]     │  ← H1 + primary CTA
│                                                                                                       │
│  [🔍 Tìm theo tên kỳ kế toán ]  [ Kỳ kế toán ▾ ]                                                     │  ← FilterRow: search + năm dropdown
│                                                                                                       │
│  ┌───────────────────────────────────┬───────────────────────────────┬────────────┬────────────┬─────────────┬──────┐ │
│  │ Tên kỳ kế toán                     │ Loại kỳ kế toán               │Ngày bắt đầu│Ngày kết thúc│ Trạng thái  │Thao  │ │  ← Table header (40h)
│  │                                    │                               │            │            │             │tác   │ │
│  ├───────────────────────────────────┼───────────────────────────────┼────────────┼────────────┼─────────────┼──────┤ │
│  │ ▼ Năm 2026                         │ Kỳ kế toán năm                │12/12/2026  │12/12/2026  │[Đã đóng kỳ] │✎ 🗑 │ │  ← Root row (Năm)
│  │  ▼ Quý 1/2026                      │ Kỳ kế toán quý                │12/12/2026  │12/12/2026  │[Đã đóng kỳ] │✎ 🗑 │ │  ← L1 indent (Quý)
│  │    Tháng 1/2026                    │ Kỳ kế toán tháng              │12/12/2026  │12/12/2026  │[Đã đóng kỳ] │✎ 🗑 │ │  ← L2 indent (Tháng, leaf)
│  │    Tháng 3/2026                    │ Kỳ kế toán tháng              │12/12/2026  │12/12/2026  │[Chưa đóng kỳ]│✎ 🗑 │ │
│  │    Tháng 5/2026                    │ Kỳ kế toán tháng              │12/12/2026  │12/12/2026  │[Đã đóng kỳ] │✎ 🗑 │ │
│  │  ▼ Quý 2/2026                      │ Kỳ kế toán quý                │12/12/2026  │12/12/2026  │[Chưa đóng kỳ]│✎ 🗑 │ │
│  │    Tháng 5/2026                    │ Kỳ kế toán tháng              │12/12/2026  │12/12/2026  │[Chưa đóng kỳ]│✎ 🗑 │ │
│  │    Tháng 7/2026                    │ Kỳ kế toán tháng              │12/12/2026  │12/12/2026  │[Chưa đóng kỳ]│✎ 🗑 │ │
│  │  ▶ Quý 3/2026 (collapsed)          │ Kỳ kế toán quý                │12/12/2026  │12/12/2026  │[Chưa đóng kỳ]│✎ 🗑 │ │
│  │  ▶ Quý 4/2026 (collapsed)          │ Kỳ kế toán quý                │12/12/2026  │12/12/2026  │[Chưa đóng kỳ]│✎ 🗑 │ │
│  └───────────────────────────────────┴───────────────────────────────┴────────────┴────────────┴─────────────┴──────┘ │
│                                                                                                       │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0     Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘

NOTE: Thao tác col in ASCII shows 2 icons (✎ 🗑) matching Figma; implementation MUST render 3 icons (👁 ✎ 🗑) per FEAT AC-7.
```

## §0 ASCII Mockup — Empty state (13521:59963)

```text
[Navbar + Sub-nav + Page Header + FilterRow IDENTICAL to Default state above — Thêm kỳ kế toán button still visible]
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────┬───────────────────────────────┬────────────┬────────────┬─────────────┬──────┐ │
│  │ Tên kỳ kế toán                     │ Loại kỳ kế toán               │Ngày bắt đầu│Ngày kết thúc│ Trạng thái  │Thao  │ │  ← Header row still visible
│  └───────────────────────────────────┴───────────────────────────────┴────────────┴────────────┴─────────────┴──────┘ │
│                                                                                                       │
│                                                                                                       │
│                                       ╭──────────╮                                                     │
│                                       │  📄◔◔◔   │  ← Empty illustration (broken-document sketch)
│                                       ╰──────────╯                                                     │
│                                                                                                       │
│                                    Không có dữ liệu                                                    │  ← Semibold 16px centered
│                                                                                                       │
[No pagination; No total row]
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0     Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## §1 Layout DSL

```yaml
AccountingPeriodListPage:
  type: page
  route: "/inventory/accounting-period"
  width: 1440
  BG: bg-background
  Border: none
  direction: vertical
  gap: 0
  _children_count: 4
  children:
    - id: Navbar
      type: instance
      source: share/navigation/navbar-main
      width: 1440
      height: 104
      BG: bg-brand
      _renders_as: primary-navigation
      _png_verified: "14653-92128.png L0-104 navbar identical AP-DETAIL/AP-EDIT"

    - id: SubNav
      type: container
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px bottom border-input
      direction: horizontal
      gap: 24
      padding: { x: 32, y: 12 }
      _children_count: 3
      children:
        - { type: TabLink, label: "Danh sách sản phẩm", state: default, _png_verified: "14653-92128.png L80 verbatim" }
        - { type: TabLink, label: "Nhóm vật tư hàng hóa", state: default, _png_verified: "14653-92128.png L80 verbatim" }
        - { type: TabLink, label: "Kỳ kế toán", state: active, activeUnderlineColor: "#0052ff", _png_verified: "14653-92128.png L80 blue underline" }

    - id: PageContent
      type: container
      width: 1440
      padding: { x: 32, y: 0 }
      BG: bg-background
      direction: vertical
      gap: 0
      _children_count: 3
      children:

        - id: PageHeader
          type: container
          width: 1376
          height: 80
          direction: horizontal
          justify: space-between
          align: center
          _renders_as: h1-with-primary-cta-right
          _children_count: 2
          children:
            - id: PageTitle
              type: Text
              content: "Danh sách kỳ kế toán"
              _png_verified: "14653-92128.png L143 verbatim 'Danh sách kỳ kế toán' H1 semibold 24px — matches FEAT AC-1 màn tên"
              size: 24
              weight: 600
              lineHeight: 32
              color: text-foreground

            - id: AddCTA
              type: Button
              variant: brand
              size: default
              label: "Thêm kỳ kế toán"
              _png_verified: "14653-92128.png L143 verbatim 'Thêm kỳ kế toán' brand blue with add-circle leading icon — matches FEAT AC-8 verbatim"
              leadingIcon:
                source: iconsax-reactjs
                name: AddCircle
                variant: Linear
                size: 20
                color: "#ffffff"
              onClick: "navigate('/inventory/accounting-period/create')  # AC-8 → FEAT-AP-CREATE"
              _renders_as: primary-cta-button

        - id: FilterRow
          type: container
          width: 1376
          height: 36
          BG: bg-background
          direction: horizontal
          gap: 8
          align: center
          _children_count: 2
          children:
            - id: SearchInput
              type: Input
              variant: basic
              width: 320
              height: 36
              BG: bg-background
              Border: 1px solid border-input
              rounded: rounded-md
              placeholder: "Tìm theo tên kỳ kế toán"
              _png_verified: "14653-92128.png L200 verbatim placeholder 'Tìm theo tên kỳ kế toán' — matches FEAT AC-5 verbatim"
              leadingIcon:
                source: iconsax-reactjs
                name: SearchNormal
                variant: Linear
                size: 16
                color: text-muted-foreground
              onChange: "debounce 300ms → filter.keyword (LIKE match tên kỳ kế toán per AC-5)"

            - id: YearFilter
              type: Button
              variant: outline
              size: default
              width: 126
              label: "Năm 2026"
              _png_verified: "14653-92128.png L200 outline button — Figma shows 'Kỳ kế toán' placeholder text, implementation renders 'Năm {year}' per AC-6 authoritative"
              _wording_note: "Figma placeholder wording 'Kỳ kế toán' generic; per FEAT AC-6 filter default = năm hiện tại, hiển thị 'Năm 2026'. Coverage_gap flagged."
              trailingIcon:
                source: iconsax-reactjs
                name: ArrowDown
                variant: Linear
                size: 16
                color: text-muted-foreground
              onClick: "openYearDropdown() — list years descending, năm mới nhất lên đầu per AC-6"
              default: "current year"

        - id: TableSection
          type: container
          width: 1376
          BG: bg-background
          Border: none
          direction: vertical
          gap: 0
          _children_count: 2         # TableHeader + TableBody
          children:

            - id: TableHeader
              type: TableHeadRow
              height: 40
              BG: bg-background
              Border: 1px bottom border
              _children_count: 6       # R10 — 6 cols per AC-2
              _png_verified: "14653-92128.png L260 header row 6 cols per AC-2 explicit"
              columns:
                - { id: TenKyKeToan, label: "Tên kỳ kế toán", width: 392, align: left, _png_verified: "14653-92128.png L260 verbatim col header" }
                - { id: LoaiKyKeToan, label: "Loại kỳ kế toán", width: 392, align: left, _png_verified: "14653-92128.png L260 verbatim" }
                - { id: NgayBatDau, label: "Ngày bắt đầu", width: 164, align: left, _png_verified: "14653-92128.png L260 verbatim" }
                - { id: NgayKetThuc, label: "Ngày kết thúc", width: 164, align: left, _png_verified: "14653-92128.png L260 verbatim" }
                - { id: TrangThai, label: "Trạng thái", width: 164, align: left, _png_verified: "14653-92128.png L260 verbatim" }
                - { id: ThaoTac, label: "Thao tác", width: 100, align: center, _png_verified: "14653-92128.png L260 verbatim" }

            - id: TableBody
              type: TableBody
              _mode_switch: "state=default → TreeRowList[]  ·  state=empty → EmptyIllustration"
              default_case:
                type: tree-rows
                rowHeight: 52
                sort: "ASC by displayOrder within each parent scope per AC-6b"
                _renders_as: "hierarchical tree — Năm → Quý → Tháng"
                rowContent:
                  - TenKyKeToanCell:
                      type: TreeCell
                      field: displayName
                      indent_level: "period.depth (0=Năm, 1=Quý, 2=Tháng)"
                      expand_control:
                        _visibility_rule: "period.hasChildren === true"
                        icon_expanded: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16 }
                        icon_collapsed: { source: iconsax-reactjs, name: ArrowRight, variant: Linear, size: 16 }
                        _png_note: "Figma shows chevron-down ▼ expanded + chevron-up ^ for collapsed (Q3/Q4) — unusual pattern; implementation uses standard chevron-right → chevron-down per shadcn Collapsible"
                        onToggle: "toggleExpand(period.id)"

                  - LoaiKyKeToanCell:
                      type: Cell
                      field: period.periodTypeDisplayName
                      _png_current_values: "['Kỳ kế toán năm', 'Kỳ kế toán quý', 'Kỳ kế toán tháng']"

                  - NgayBatDauCell:
                      type: Cell
                      field: period.startDate
                      format: "DD/MM/YYYY"

                  - NgayKetThucCell:
                      type: Cell
                      field: period.endDate
                      format: "DD/MM/YYYY"

                  - TrangThaiCell:
                      type: BadgeCell
                      _renders_as: badge-chip-text-no-icon
                      _mode_switch: "period.status === 'Đã đóng' → red bg + 'Đã đóng kỳ' label  ·  period.status === 'Chưa đóng' → green bg + 'Chưa đóng kỳ' label"
                      variant_closed: { BG: bg-destructive-subtle, color: text-destructive, label: "Đã đóng kỳ" }
                      variant_open: { BG: bg-success-subtle, color: text-success, label: "Chưa đóng kỳ" }
                      _png_verified: "14653-92128.png Trạng thái col rows show text badge chips: pink/red bg for 'Đã đóng kỳ' + green bg for 'Chưa đóng kỳ' — no icon per AC-4"

                  - ThaoTacCell:
                      type: IconButtonGroup
                      align: center
                      gap: 8
                      _children_count: 3      # AC-7 explicit 3 icons — Figma only shows 2 (coverage_gap)
                      _children_count_png: 2  # observed in Figma; implementation MUST render 3 per FEAT authoritative
                      children:
                        - id: RowViewButton
                          type: IconButton
                          icon: { source: iconsax-reactjs, name: Eye, variant: Linear, size: 16, color: text-muted-foreground }
                          onClick: "navigate('/inventory/accounting-period/{row.id}')  # → FEAT-AP-DETAIL per AC-7"
                          _png_note: "MISSING in Figma — FEAT AC-7 explicit requires; add per authoritative source"

                        - id: RowEditButton
                          type: IconButton
                          icon: { source: iconsax-reactjs, name: Edit2, variant: Linear, size: 16, color: text-muted-foreground }
                          onClick: "navigate('/inventory/accounting-period/edit/{row.id}')  # → FEAT-AP-EDIT per AC-7"
                          _png_verified: "14653-92128.png Thao tác col pencil glyph per row"

                        - id: RowDeleteButton
                          type: IconButton
                          icon: { source: iconsax-reactjs, name: Trash, variant: Linear, size: 16, color: text-muted-foreground }
                          onClick: "openDeleteConfirm({periodId: row.id})  # → FEAT-AP-DELETE per AC-7"
                          _png_verified: "14653-92128.png Thao tác col trash-bin glyph per row"

              empty_case:
                type: EmptyIllustration
                height: 445
                _renders_as: illustration-centered-with-caption
                _children_count: 2
                children:
                  - id: EmptyIcon
                    type: Illustration
                    source: assets/empty-data-illustration.svg
                    width: 120
                    height: 100
                    _png_verified: "13521-59963.png L500 broken-document sketch illustration centered"
                  - id: EmptyCaption
                    type: Text
                    content: "Không có dữ liệu"
                    _png_verified: "13521-59963.png L580 verbatim 'Không có dữ liệu' semibold centered"
                    size: 16
                    weight: 600
                    color: text-foreground
                    align: center

    - id: SectionFooter
      type: instance
      source: share/section-footer/01
      width: 1440
      height: 40
      BG: bg-background
      Border: 1px top border
      _renders_as: version-and-support-links-row
      content:
        - { align: left, text: "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0" }
        - { align: right, links: ["Hướng dẫn sử dụng", "Hỗ trợ", "Hotline: 0985135050"] }

_negative_coverage:
  - "không có pagination row — tree list scrolls long; implementation nếu > 50 nodes total → consider virtualize scroll hoặc top-level pagination cho năm root"
  - "không có sort UI trên cột — sort mặc định theo AC-6b (displayOrder ASC per parent scope)"
  - "không có bulk-select checkbox — action per row only, no bulk-delete pattern như OB-LIST"
  - "không có 'Đóng kỳ' / 'Mở kỳ' quick action inline — status change qua FEAT-AP-EDIT per AC-4 (edit form)"
  - "không có badge cho hasChildren indicator (chỉ chevron expand toggle signals cây)"
  - "không có Xem icon (Eye) trong Figma Thao tác col — coverage_gap flag, add per FEAT AC-7"
  - "không có tooltip trên Thao tác icons — icons standalone"
  - "không có breadcrumb"
```

## §2 Design Token Map

| Element | Property | Figma variable | Value | Tailwind token |
|---|---|---|---|---|
| Page BG | background | base/background | #ffffff | `bg-background` |
| Navbar | background | base/background-brand-CD | #0052ff | `bg-brand` |
| PageTitle | color | base/foreground | #18181b | `text-foreground` |
| PageTitle | fontSize | typography/base sizes/2x large/font-size | 24 | `text-2xl` |
| PageTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| AddCTA button | background | base/background-brand-CD | #0052ff | `bg-brand` |
| AddCTA button | color | base/primary-foreground | #ffffff | `text-primary-foreground` |
| AddCTA button | height | height/h-9 | 36 | `h-9` |
| SearchInput | border | base/input | #d4d4d8 | `border-input` |
| YearFilter | border | base/input | #d4d4d8 | `border-input` |
| YearFilter | height | height/h-9 | 36 | `h-9` |
| TableHeader | border-bottom | base/border | #e4e4e7 | `border-b border-border` |
| TableHeader | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| TableHeader | fontWeight | font/weight/medium | 500 | `font-medium` |
| TableHeader | color | base/muted-foreground | #71717a | `text-muted-foreground` |
| TableRow | border-bottom | base/border | #e4e4e7 | `border-b border-border` |
| TableRow | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| TableRow | color | base/foreground | #18181b | `text-foreground` |
| TrạngThái badge red | background | red-100 (or destructive-subtle extension) | ~#fee2e2 | `bg-red-100 text-red-700` |
| TrạngThái badge green | background | green-100 (or success-subtle extension) | ~#dcfce7 | `bg-green-100 text-green-700` |
| TrạngThái badge | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| TrạngThái badge | radius | border radius/full | 9999 | `rounded-full` |
| EmptyCaption | color | base/foreground | #18181b | `text-foreground` |
| EmptyCaption | fontSize | typography/base sizes/base/font-size | 16 | `text-base` |

## §3 State Table

| State | Trigger | tableBody mode | Filter default | AddCTA visible | Notes |
|---|---|---|---|---|---|
| `default` | Page mount + ≥1 kỳ exists (any year) | tree-rows filtered by năm | năm hiện tại per AC-6 default | ✓ | Rows sorted ASC by displayOrder within each parent scope per AC-6b |
| `empty` | Page mount + zero kỳ for tenant | EmptyIllustration | năm hiện tại | ✓ (always enabled per AC-4b) | Header + filter + AddCTA remain visible per AC-4b |
| `filter_year_changed` | User picks different năm from dropdown | tree-rows filtered by new năm | selected năm | ✓ | Bảng chuyển sang năm đã chọn per AC-6 |
| `search_active` | User types trong search box | tree-rows filtered by keyword LIKE tên | inherited from năm filter | ✓ | Filter năm + keyword combine (AND) |
| `expanded_all_collapsed` | User collapses Năm root row | tree-rows show only root Năm + collapsed siblings | (no change) | ✓ | Chevron toggle |

## §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| Navbar | `share/navigation/navbar-main` | `variant="brand"` | Reuse cross-page navbar |
| PageHeader | `share/page-header/3` | `{ title, primaryCta: { label, icon, onClick } }` | Header variant "3" per Figma instance |
| SubNav | `customs/inventory/sub-nav-danh-muc` | `{ activeKey: "accounting-period" }` | Danh mục sub-nav 3 tabs |
| AddCTA / YearFilter | `ui/button` | `variant="brand" \| "outline"` | shadcn Button |
| SearchInput | `share/input/basic` | `{ placeholder, leadingIcon, onChange }` | Reuse |
| YearFilter | `share/dropdown/filter-trigger` | `{ label, trailingIcon, onOpen, options: yearsDesc }` | Reuse — dropdown năm sorted desc per AC-6 |
| Table | `ui/table` (shadcn) | `{ columns, rows, treeMode: true, expandField: 'children', onExpand }` | shadcn Table with tree mode extension |
| TreeCell | `share/table/tree-cell` | `{ depth, hasChildren, expanded, onToggle, children }` | Custom tree cell handling indent + chevron |
| BadgeCell | `ui/badge` | `{ variant: 'closed' \| 'open', children: label }` | shadcn Badge with 2 variants |
| Row action icons | `ui/button` variant="ghost" size="icon" | `{ children: <IconComponent /> }` | Ghost icon-only 32×32 hit area |
| EmptyIllustration | `share/empty-state/data-empty` | `{ caption: "Không có dữ liệu" }` | Reuse |
| SectionFooter | `share/section-footer/01` | (static content) | Layout footer |

## §5 Field Composition Schema

Query payload:

```yaml
ListAccountingPeriodsInput:
  interface: ListAccountingPeriodsInput
  fields:
    - name: keyword
      type: string?
      binding: SearchInput.value
      combined: false
      transform: "LIKE match against period.name per AC-5"
    - name: year
      type: int
      binding: YearFilter.selectedValue
      combined: false
      default: "current year per AC-6"

ListAccountingPeriodsResult:
  fields:
    - name: rows
      type: AccountingPeriodTreeNode[]
    - name: totalCount
      type: int

AccountingPeriodTreeNode:
  fields:
    - { name: id, type: uuid }
    - { name: displayName, type: string, _example: "'Năm 2026' | 'Quý 1/2026' | 'Tháng 1/2026'" }
    - { name: periodTypeDisplayName, type: string, _example: "'Kỳ kế toán năm' | 'Kỳ kế toán quý' | 'Kỳ kế toán tháng'" }
    - { name: startDate, type: date }
    - { name: endDate, type: date }
    - { name: status, type: "'Chưa đóng' | 'Đã đóng'" }
    - { name: depth, type: int, _renders: "0=Năm root, 1=Quý, 2=Tháng — used for indent_level in TreeCell" }
    - { name: hasChildren, type: boolean, _renders: "controls expand chevron visibility" }
    - { name: displayOrder, type: int, _renders: "sort key ASC per parent scope per AC-6b; NOT displayed as column" }
    - { name: children, type: AccountingPeriodTreeNode[], _renders: "nested tree structure — server-side hierarchical query" }
```

## §6 Layout Width Table

| Container | Total width | Padding-x | Child widths (sum) | Notes |
|---|---|---|---|---|
| Navbar | 1440 | — | (identical to other pages) | Full-bleed |
| SubNav | 1440 | 32 | 3 tabs Danh mục | 1376 content |
| PageContent | 1440 | 32 | 1376 content | Same padding as OB-LIST |
| PageHeader | 1376 | 0 | Title + AddCTA (~150) | space-between |
| FilterRow | 1376 | 0 | SearchInput(320) + gap(8) + YearFilter(126) = 454 | Trailing whitespace 922 |
| TableHeader / TableRow | 1376 | 0 | 392+392+164+164+164+100 = 1376 | Exact fit, 6 cols per metadata |
| TrangThai badge | (intrinsic) | px-2 | text width + 8 padding side | rounded-full |
| Thao tác col | 100 | 0 | 3 icons × ~24 + gaps × 4 = 80 | Centered within 100px cell |
| EmptyIllustration | 1376 | 0 | Centered | Height 445 |

## §7 Visual Hierarchy Map

```
Level 1 (primary): AddCTA "Thêm kỳ kế toán" (brand blue) + PageTitle "Danh sách kỳ kế toán"
Level 2 (secondary): SubNav active tab "Kỳ kế toán" + FilterRow (search + năm dropdown)
Level 3 (tertiary): TableHeader labels + Tree expand chevrons (interactive elements)
Level 4 (data): Table data rows — TrangThai badges (color-coded, high visual weight)
Level 5 (utility): SectionFooter + row action icons
Empty state override: EmptyIllustration + EmptyCaption Level 3 (replaces data rows entirely)
```

## §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-AP-LIST-1 | Render Thao tác col với chỉ 2 icons (mirror Figma) | 3 icons per AC-7 explicit: Xem + Sửa + Xóa. Figma missing Xem — implementation ADD Eye icon per FEAT authoritative | FEAT AC-7 explicit 3 icons + coverage_gap flag |
| AP-AP-LIST-2 | Render TrangThai as icon-based badge (assume icon + label) | Text-only badge chip per AC-4 explicit "KHÔNG dùng icon" — chỉ text với bg color coding | FEAT AC-4 explicit + `_png_verified`: 14653-92128.png badges text-only no icon |
| AP-AP-LIST-3 | Wrong badge color — use grey/muted for closed | Đã đóng = RED bg (destructive-subtle) + Chưa đóng = GREEN bg (success-subtle) per AC-4 explicit color mapping | FEAT AC-4 explicit + `_png_verified`: 14653-92128.png pink/red vs green bg |
| AP-AP-LIST-4 | Flatten tree to flat list (assume tree = complex) | Tree structure per AC-3 explicit — indent per depth + expand/collapse chevron on rows với children | FEAT AC-3 explicit + `_png_verified`: 14653-92128.png tree visual với chevron + indent |
| AP-AP-LIST-5 | Show 'Thứ tự hiển thị' as visible column | Column HIDDEN per AC-6b explicit "KHÔNG hiển thị thành cột — chỉ dùng làm sort key ngầm" | FEAT AC-6b explicit hidden field |
| AP-AP-LIST-6 | Sort by tên hoặc ngày (default) | Sort by displayOrder ASC per parent scope per AC-6b explicit | FEAT AC-6b explicit sort rule |
| AP-AP-LIST-7 | Filter năm defaults to "All years" | Default = năm hiện tại per AC-6 explicit — restrict initial view | FEAT AC-6 explicit default filter |
| AP-AP-LIST-8 | Năm dropdown sort ascending | Sort DESCENDING (năm mới nhất lên đầu) per AC-6 explicit | FEAT AC-6 explicit sort desc |
| AP-AP-LIST-9 | Search matches loại kỳ hoặc mã | Search matches tên kỳ kế toán ONLY per AC-5 explicit (LIKE match tên) | FEAT AC-5 explicit field scope |
| AP-AP-LIST-10 | Filter năm label 'Kỳ kế toán' (port Figma placeholder) | Label 'Năm {year}' per AC-6 authoritative — dropdown filters năm not kỳ | FEAT AC-6 explicit năm filter; PNG generic label coverage_gap |
| AP-AP-LIST-11 | Empty state hide filter row / AddCTA | Header + filter + AddCTA visible per AC-4b explicit "header giữ đầy đủ" — chỉ table body → EmptyIllustration | FEAT AC-4b explicit + `_png_verified`: 13521-59963.png header identical to default |
| AP-AP-LIST-12 | Use `lucide-react` for icons | Use `iconsax-reactjs` per convention v7.6 R4.1 | `_ref-web-transform-figma.md v7.6` |

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 14653:92128 | default (populated tree) | assets/wave04-ap-list/14653-92128.png | 1440×868 |
| 13521:59963 | empty (no data) | assets/wave04-ap-list/13521-59963.png | 1440×817 |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Màn "Danh sách Kỳ kế toán" + search + filter năm + table cây + Thêm kỳ kế toán button | PageHeader + FilterRow + TableSection | 14653:92128 | ✓ |
| AC-2 | 6 columns bảng | TableHeader.columns (6 entries) | 14653:92128 | ✓ |
| AC-3 | Tree phân cấp với chevron expand/collapse | TreeCell with indent_level + expand_control | 14653:92128 | ✓ |
| AC-4 | Trạng thái badge chip text (không icon) — Chưa đóng green + Đã đóng red | TrangThaiCell BadgeCell với 2 variants | 14653:92128 | ✓ |
| AC-4b | Empty state — header giữ đầy đủ + illustration + Không có dữ liệu | TableBody empty_case + Header persistent | 13521:59963 | ✓ |
| AC-5 | Search LIKE tên kỳ kế toán | SearchInput onChange | 14653:92128 | ✓ |
| AC-6 | Filter năm default năm hiện tại + dropdown sort desc | YearFilter default + options desc | 14653:92128 | ✓ (dropdown label 'Kỳ kế toán' Figma placeholder — coverage_gap) |
| AC-6b | Sort ASC theo displayOrder per parent scope + 'Thứ tự hiển thị' hidden col | rows.sort + TableHeader không có col Thứ tự hiển thị | 14653:92128 | ✓ |
| AC-7 | Thao tác col 3 icons: Xem + Sửa + Xóa | ThaoTacCell IconButtonGroup 3 children | 14653:92128 | ⚠ (Xem icon Figma missing — coverage_gap; implementation add per FEAT) |
| AC-8 | Thêm kỳ kế toán button → FEAT-AP-CREATE | AddCTA.onClick | 14653:92128 | ✓ |
| AC-9 | Phân quyền + tenant isolation | (backend concern) | — | ⚠ (backend) |

## Coverage Gaps

- **Xem icon (Eye) missing in Figma Thao tác col**: FEAT AC-7 explicit 3 icons; Figma shows only 2 (pencil + trash). Implementation MUST add Eye icon per FEAT authoritative. Designer bổ sung Figma.
- **Năm filter label drift**: PNG shows generic 'Kỳ kế toán' text; per FEAT AC-6 filter is năm với default năm hiện tại. Implementation renders 'Năm {year}' verbatim.
- **Tree chevron collapsed state**: Figma Q3/Q4 rows show chevron-up ^ (unusual). Standard shadcn Collapsible = chevron-right ▶ (collapsed) → chevron-down ▼ (expanded). Implementation follows standard.
- **Không có pagination**: Tree list scrolls long. Consider virtualize scroll cho performance nếu >50 nodes. BA confirm nếu cần top-level pagination cho năm root.
