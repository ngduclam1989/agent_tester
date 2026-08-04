---
feat: FEAT-OB-LIST
feat_file: Product/features/FEAT-OB-LIST.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89262
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14492:89262"
fetched_at: "2026-07-08T03:05Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 3
status: ACTIVE
coverage_gaps: []
---

# FEAT-OB-LIST — Spec (web)

> Danh sách tồn đầu kỳ (Opening Balance List) — page-level `/inventory/opening-balance` với 3 state variants: (1) default main list có data + pagination; (2) empty state (chưa import OB nào); (3) bulk-select mode (≥1 dòng checked, hiển thị button "Xoá các dòng đã chọn"). Header + filter row + pagination + table structure identical across 3 states; delta chỉ nằm ở body (rows + tổng + empty-illustration) và filter-row prefix (bulk-delete button visibility).
>
> **Icon library**: `iconsax-reactjs` primary (garage-web convention v7.6, 2026-07-08). Figma vuesax layer → PascalCase name + PascalCase variant.

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| icon/import | vuesax/linear/document-upload | iconsax-reactjs | DocumentUpload | Linear | assets/wave04-ob-list/13575-86900.png L143 cloud-upload glyph inside "Import tồn đầu kỳ" button top-right |
| icon/search | vuesax/linear/search-normal | iconsax-reactjs | SearchNormal | Linear | assets/wave04-ob-list/13575-86900.png L200 magnifying-glass glyph leading search input |
| icon/filter-chevron | vuesax/linear/arrow-down | iconsax-reactjs | ArrowDown | Linear | assets/wave04-ob-list/13575-86900.png L200 chevron-down trailing "Kho" and "Người import" filter buttons |
| icon/calendar | vuesax/linear/calendar | iconsax-reactjs | Calendar | Linear | assets/wave04-ob-list/13575-86900.png L200 calendar glyph trailing "Ngày import" filter |
| icon/row-edit | vuesax/linear/edit-2 | iconsax-reactjs | Edit2 | Linear | assets/wave04-ob-list/13575-86900.png row Thao tác col — pencil glyph per row |
| icon/row-delete | vuesax/linear/trash | iconsax-reactjs | Trash | Linear | assets/wave04-ob-list/13575-86900.png row Thao tác col — trash bin glyph per row |
| icon/bulk-delete | vuesax/linear/trash | iconsax-reactjs | Trash | Linear | assets/wave04-ob-list/13575-95132.png L200 trash bin leading "Xoá các dòng đã chọn" button |
| icon/notification-bell | vuesax/linear/notification | iconsax-reactjs | Notification | Linear | assets/wave04-ob-list/13575-86900.png navbar right corner — bell with red dot indicator |
| icon/pagination-prev | vuesax/linear/arrow-left-2 | iconsax-reactjs | ArrowLeft2 | Linear | assets/wave04-ob-list/13575-86900.png pagination footer "Trước" leading chevron-left |
| icon/pagination-next | vuesax/linear/arrow-right-2 | iconsax-reactjs | ArrowRight2 | Linear | assets/wave04-ob-list/13575-86900.png pagination footer "Tiếp" trailing chevron-right |

---

## Screen: Default main list — có data (13575:86900)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Default state** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `filterRow._bulk_delete_visible: false` + `tableBody = OBRowList[]` + `tableFooter = { totalRow: visible, paginationRow: visible }`.

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
screenshot: assets/wave04-ob-list/13575-86900.png
verified_at: "2026-07-08T03:07Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Page header title verbatim 'Danh sách tồn đầu kỳ' (H1, không có 'đã import' suffix per FEAT-OB-LIST v6 rename 2026-07-08)"
    status: ✓
    evidence: "13575-86900.png header row — bold large text 'Danh sách tồn đầu kỳ' aligned left, no trailing text"
  - claim: "Filter row chỉ có 4 elements khi state=default: SearchInput + Kho dropdown + Người import dropdown + Ngày import date-picker; KHÔNG có 'Xoá các dòng đã chọn' button (verifies AC-1 ẩn ở default)"
    status: ✓
    evidence: "13575-86900.png filter row L200 shows [🔍 search input | Kho ▾ | Người import ▾ | Ngày import 📅] — 4 elements, no bulk-delete prefix"
  - claim: "Table renders 12 data rows, all with same product 'Lọc dầu động cơ Toyota' + Mã 'PN-18901' (blue link), STT 1-12; row Thao tác col có 2 icon (pencil + trash) per row"
    status: ✓
    evidence: "13575-86900.png table body 12 rows, Mã nội bộ cột render as blue text-link (verifies AC-2 column list)"
  - claim: "Dòng Tổng KHÔNG visible in current PNG frame (would be at bottom of paginated slice) — pagination shows page 2 active"
    status: ⚠
    evidence: "13575-86900.png pagination footer 'Hiển thị [20 ▾] mỗi trang' + '< Trước | 1 [2] 3 ... Tiếp >' — page 2 highlighted; totalRow logic per AC-3 will render once page tail reached"
  - claim: "Import button top-right brand blue with cloud-upload icon (DocumentUpload variant=Linear) — verbatim label 'Import tồn đầu kỳ'"
    status: ✓
    evidence: "13575-86900.png top-right corner — blue button bg #0052ff, white text 'Import tồn đầu kỳ', leading cloud-arrow-up glyph"
```

---

## Screen: Empty state — chưa import OB nào (14547:95824)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Empty state** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `filterRow._bulk_delete_visible: false` + `tableBody = EmptyIllustration` + `tableFooter = { totalRow: hidden, paginationRow: hidden }`.

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
screenshot: assets/wave04-ob-list/14547-95824.png
verified_at: "2026-07-08T03:07Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Header + filter row identical to default state (page title + search + 3 filters + Import button top-right visible) — verifies AC-3b 'header giữ đầy đủ'"
    status: ✓
    evidence: "14547-95824.png header + filter row identical to 13575-86900.png (same 4 filter elements, Import button top-right blue)"
  - claim: "Table header row (checkbox + STT + Tồn đến ngày + Kho + Mã nội bộ + Tên nội bộ + ĐVT + Số lượng tồn + Giá trị tồn + Người import + Ngày import + Thao tác) visible, KHÔNG có data rows"
    status: ✓
    evidence: "14547-95824.png y≈260 shows column header row only, empty table body below"
  - claim: "Empty illustration + text 'Không có dữ liệu' centered ở giữa vùng bảng (below header, above where pagination would be)"
    status: ✓
    evidence: "14547-95824.png y≈500-580 shows sketched broken-document illustration + verbatim label 'Không có dữ liệu' centered horizontally"
  - claim: "Pagination footer + dòng Tổng + button 'Xoá các dòng đã chọn' ALL absent (verifies AC-3b hide list)"
    status: ✓
    evidence: "14547-95824.png below empty illustration — no total row, no page controls, no bulk-delete button in filter row"
```

---

## Screen: Bulk-select mode — có ≥1 dòng tick (13575:95132)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Bulk-select state** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `filterRow._bulk_delete_visible: true` (button "Xoá các dòng đã chọn" prefix left of search) + `tableBody = OBRowList[]` (selected rows highlighted).

### §2 Design Token Map

> See file-level **§2 Design Token Map** below.

### §3 State Table

> See file-level **§3 State Table** below (state = `bulk_select`).

### §4 Component Prop Map

> See file-level **§4 Component Prop Map** below.

### §5 Field Composition Schema

> See file-level **§5 Field Composition Schema** below.

### §6 Layout Width Table

> See file-level **§6 Layout Width Table** below (filter row expands to include bulk-delete button width ≈ 205px + divider gap).

### §7 Visual Hierarchy Map

> See file-level **§7 Visual Hierarchy Map** below.

### §8 Anti-Pattern Trap

> See file-level **§8 Anti-Pattern Trap** below.

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ob-list/13575-95132.png
verified_at: "2026-07-08T03:07Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Filter row PREFIX (left of search) render button 'Xoá các dòng đã chọn' với trash icon (Trash variant=Linear) — verifies AC-1 vị trí + AC-7 conditional visibility"
    status: ✓
    evidence: "13575-95132.png filter row L200 shows [🗑 Xoá các dòng đã chọn | 🔍 search input | Kho ▾ | Người import ▾ | Ngày import 📅] — bulk-delete button leftmost + subtle vertical divider before search"
  - claim: "Verbatim label 'Xoá các dòng đã chọn' (dấu huyền 'Xoá' + có 'các') per FEAT-OB-LIST v4 verbatim rule 2026-07-06 — KHÔNG 'Xóa dòng đã chọn'"
    status: ✓
    evidence: "13575-95132.png button text reads 'Xoá các dòng đã chọn' character-by-character — preserve diacritic 'oá' + word 'các'"
  - claim: "≥1 row tick state renders row checkbox filled blue #0052ff (7 rows checked out of 12 visible) — matches AC-7 trigger condition"
    status: ✓
    evidence: "13575-95132.png rows STT 1, 4, 5, 6, 8, 9, 10 show blue-filled checkbox squares; rows STT 2, 3, 7, 11, 12 show empty outlined checkbox"
  - claim: "Header title / Import button top-right / column set / row action icons IDENTICAL to default state — only delta: filter-row prefix"
    status: ✓
    evidence: "13575-95132.png header + column header row + Thao tác icons (pencil + trash) identical to 13575-86900.png; delta strictly filter-row bulk-delete prefix"
  - claim: "Table Pagination footer visible (same as default state) — bulk-select KHÔNG hide pagination"
    status: ✓
    evidence: "13575-95132.png bottom shows 'Hiển thị 20 mỗi trang' + '< Trước | 1 [2] 3 ... Tiếp >' identical to default"
```

---

# File-level shared sections

> Content sau đây shared cho 3 Screen blocks trên. Screen block §VV per Screen chứa delta observation cụ thể per state.

## §0 ASCII Mockup — Default state (13575:86900)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚗 GMS   Tổng quan   Mua hàng   Sửa chữa & Dịch vụ   [Tồn kho]   Khách hàng   Marketing   Nhân viên   Danh mục      🔔● 👤 │  ← Navbar bg-brand #0052ff
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phiếu nhập kho   Phiếu xuất kho   [Tồn đầu kỳ]‾‾‾   Tính giá xuất kho   Báo cáo tồn kho   Báo cáo NXT │  ← Sub-nav bg-background, active underline #0052ff
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  Danh sách tồn đầu kỳ                                                     [ ⬆ Import tồn đầu kỳ ]     │  ← H1 (24px semibold) + primary button top-right
│                                                                                                       │
│  [🔍 Tìm theo mã, tên sản phẩm nội bộ ]  [ Kho ▾ ]  [ Người import ▾ ]  [ Ngày import 📅 ]           │  ← FilterRow default — 4 elements
│                                                                                                       │
│  ┌──┬────┬─────────────┬──────────┬──────────┬─────────────┬────┬───────────┬───────────┬──────────┬──────────┬─────┐ │
│  │☐ │STT │ Tồn đến ngày│ Kho      │ Mã nội bộ│ Tên nội bộ  │ĐVT │ Số lượng  │ Giá trị   │Người     │Ngày      │Thao │ │  ← Table header row (40px)
│  │  │    │             │          │          │             │    │ tồn       │ tồn       │import    │import    │tác  │ │
│  ├──┼────┼─────────────┼──────────┼──────────┼─────────────┼────┼───────────┼───────────┼──────────┼──────────┼─────┤ │
│  │☐ │ 1  │ 15/03/2023  │ Kho chính│ PN-18901 │ Lọc dầu ...│Cái │       24  │ 9.300.000đ│Nguyễn Ánh│15/03/2023│✎ 🗑 │ │  ← Row 1 (52px)
│  │☐ │ 2  │ 22/07/2023  │ Kho phụ… │ PN-18901 │ Lọc dầu ...│Cái │       24  │ 1.000.000đ│Đinh Thu H│22/07/2023│✎ 🗑 │ │
│  │☐ │ 3  │ 05/01/2024  │ Kho chính│ PN-18901 │ Lọc dầu ...│Cái │       24  │15.000.000đ│Lê Minh T │05/01/2024│✎ 🗑 │ │
│  │  │... │             │          │          │             │    │           │           │          │          │     │ │  ← Rows 4-12 (12 rows visible/page)
│  └──┴────┴─────────────┴──────────┴──────────┴─────────────┴────┴───────────┴───────────┴──────────┴──────────┴─────┘ │
│                                                                                                       │
│  Hiển thị [20 ▾] mỗi trang                                     < Trước   1  [2]  3  …   Tiếp >       │  ← Pagination footer
│                                                                                                       │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0     Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │  ← Section Footer / 01 (40px)
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## §0 ASCII Mockup — Empty state (14547:95824)

```text
[Navbar + Sub-nav + Page Header + FilterRow IDENTICAL to Default state above — no delta]
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──┬────┬─────────────┬──────────┬──────────┬─────────────┬────┬───────────┬───────────┬──────────┬──────────┬─────┐ │
│  │☐ │STT │ Tồn đến ngày│ Kho      │ Mã nội bộ│ Tên nội bộ  │ĐVT │ Số lượng  │ Giá trị   │Người     │Ngày      │Thao │ │  ← Header row STILL visible (per AC-3b "chỉ hiển thị header cột không có row")
│  └──┴────┴─────────────┴──────────┴──────────┴─────────────┴────┴───────────┴───────────┴──────────┴──────────┴─────┘ │
│                                                                                                       │
│                                                                                                       │
│                                       ╭──────────╮                                                     │
│                                       │  📄◔◔◔   │  ← Empty illustration (broken-document sketch, muted grey)
│                                       ╰──────────╯                                                     │
│                                                                                                       │
│                                    Không có dữ liệu                                                    │  ← Text-muted 16px semibold centered
│                                                                                                       │
│                                                                                                       │
[No pagination footer per AC-3b]
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0     Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## §0 ASCII Mockup — Bulk-select state (13575:95132)

```text
[Navbar + Sub-nav + Page Header + Table body + Pagination footer IDENTICAL to Default state — delta ONLY at FilterRow prefix]

│  [ 🗑 Xoá các dòng đã chọn ] │ [🔍 Tìm theo mã, tên sản phẩm nội bộ ]  [ Kho ▾ ]  [ Người import ▾ ]  [ Ngày import 📅 ]  │  ← FilterRow bulk-select — 5 elements (bulk-delete prefix + vertical divider + 4 default)
│                                                                                                                              │
│  ┌──┬────┬…rows…                                                                                                              │
│  │☑ │ 1  │ ... ← blue-filled checkbox (selected)                                                                              │
│  │☐ │ 2  │ ... ← empty checkbox                                                                                                │
│  │☐ │ 3  │ ...                                                                                                                 │
│  │☑ │ 4  │ ... ← selected                                                                                                      │
│  │☑ │ 5  │ ... ← selected                                                                                                      │
│  │☑ │ 6  │ ... ← selected                                                                                                      │
│  │☐ │ 7  │ ...                                                                                                                 │
│  │☑ │ 8  │ ... ← selected                                                                                                      │
│  │☑ │ 9  │ ... ← selected                                                                                                      │
│  │☑ │10  │ ... ← selected                                                                                                      │
│  │☐ │11  │ ...                                                                                                                 │
│  │☐ │12  │ ...                                                                                                                 │
```

## §1 Layout DSL

```yaml
OpeningBalanceListPage:
  type: page
  route: "/inventory/opening-balance"
  width: 1440
  BG: bg-background                # base/background #ffffff
  Border: none
  direction: vertical
  gap: 0
  _children_count: 4               # R10 — Navbar + SubNav + PageContent + SectionFooter
  children:
    - id: Navbar
      type: instance
      source: share/navigation/navbar-main   # per component-registry
      width: 1440
      height: 104
      BG: bg-brand                 # #0052ff base/background-brand-CD
      _renders_as: primary-navigation
      _children_count: 10          # logo + 8 nav-links + notification + avatar
      _png_verified: "13575-86900.png L0-104 blue navbar row, GMS logo left + nav-links center + bell/avatar right"

    - id: SubNav
      type: container
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px bottom border-input   # subtle underline
      direction: horizontal
      gap: 24
      padding: { x: 32, y: 12 }
      _children_count: 6           # 6 sub-nav links: Phiếu nhập kho, Phiếu xuất kho, Tồn đầu kỳ (active), Tính giá xuất kho, Báo cáo tồn kho, Báo cáo NXT
      _renders_as: sub-navigation-tabs
      children:
        - { type: TabLink, label: "Phiếu nhập kho", state: default, _png_verified: "13575-86900.png L80 verbatim label" }
        - { type: TabLink, label: "Phiếu xuất kho", state: default, _png_verified: "13575-86900.png L80 verbatim label" }
        - { type: TabLink, label: "Tồn đầu kỳ", state: active, activeUnderlineColor: "#0052ff", _png_verified: "13575-86900.png L80 blue-underlined active" }
        - { type: TabLink, label: "Tính giá xuất kho", state: default, _png_verified: "13575-86900.png L80 verbatim label" }
        - { type: TabLink, label: "Báo cáo tồn kho", state: default, _png_verified: "13575-86900.png L80 verbatim label" }
        - { type: TabLink, label: "Báo cáo NXT", state: default, _png_verified: "13575-86900.png L80 verbatim label" }

    - id: PageContent
      type: container
      width: 1440
      padding: { x: 32, y: 0 }
      BG: bg-background
      direction: vertical
      gap: 0
      _children_count: 3           # PageHeader + FilterRow + TableSection
      children:

        - id: PageHeader
          type: container
          width: 1376
          height: 80
          BG: bg-background
          Border: none
          direction: horizontal
          justify: space-between
          align: center
          _renders_as: h1-with-primary-cta-right
          _children_count: 2       # Title + ImportButton
          children:
            - id: PageTitle
              type: Text
              content: "Danh sách tồn đầu kỳ"
              _png_verified: "13575-86900.png L140-160 verbatim H1 'Danh sách tồn đầu kỳ' semibold 24px — no 'đã import' suffix per FEAT v6 rename 2026-07-08"
              size: 24                     # text-2xl (typography/base sizes/2x large/font-size)
              weight: 600                  # font/weight/semibold
              lineHeight: 32
              color: text-foreground       # #18181b base/foreground

            - id: ImportButton
              type: Button
              variant: brand                 # bg-brand #0052ff filled
              size: default                  # h-9 (spacing/9 = 36)
              label: "Import tồn đầu kỳ"
              leadingIcon:
                source: iconsax-reactjs
                name: DocumentUpload
                variant: Linear
                size: 20
                color: "#ffffff"
              onClick: "navigate('/inventory/opening-balance/import')  # FEAT-OB-IMPORT wizard per AC-8"
              _png_verified: "13575-86900.png L140 top-right blue button #0052ff, white text 'Import tồn đầu kỳ', leading cloud-upload glyph"
              _renders_as: primary-cta-button

        - id: FilterRow
          type: container
          width: 1376
          height: 36
          BG: bg-background
          Border: none
          direction: horizontal
          gap: 8
          align: center
          _children_count: 4           # R10 default; bulk_select mode = 6 (prefix + divider + 4 default)
          _bulk_delete_visible: false  # AC-1 conditional — Screen 3 flips to true
          children:
            # === Bulk-delete prefix (state=bulk_select ONLY, absent when default/empty) ===
            - id: BulkDeleteButton
              type: Button
              _mode: bulk-select-only            # Screen 3 (13575:95132) ONLY
              variant: outline                    # border-input + bg-background
              size: default                       # h-9
              label: "Xoá các dòng đã chọn"       # R9 verbatim (dấu huyền + "các") per FEAT v4 2026-07-06
              _png_verified: "13575-95132.png L200 verbatim button label — preserve diacritic 'oá' + word 'các'"
              leadingIcon:
                source: iconsax-reactjs
                name: Trash
                variant: Linear
                size: 16
                color: text-foreground
              onClick: "openBulkDeleteConfirm(selectedIds)  # → FEAT-OB-DELETE-LINES popup per AC-7"
              _renders_as: secondary-conditional-cta
              _visibility_rule: "selectedRowsCount >= 1"

            - id: FilterDivider
              type: separator
              _mode: bulk-select-only
              orientation: vertical
              height: 12
              color: border-input
              _png_verified: "13575-95132.png subtle vertical divider between bulk-delete button and search input"

            # === Default elements (present in all 3 states) ===
            - id: SearchInput
              type: Input
              variant: basic                 # per share/input/basic
              width: 320
              height: 36
              BG: bg-background
              Border: 1px solid border-input # base/input #d4d4d8
              rounded: rounded-md            # 6px
              placeholder: "Tìm theo mã, tên sản phẩm nội bộ"   # R9 verbatim per FEAT AC-4 v4 2026-07-06
              _png_verified: "13575-86900.png L200 verbatim placeholder — preserve 'Tìm theo' + comma + full 'mã, tên sản phẩm nội bộ'"
              leadingIcon:
                source: iconsax-reactjs
                name: SearchNormal
                variant: Linear
                size: 16
                color: text-muted-foreground
              onChange: "debounce 300ms → filter.keyword (LIKE match mã/tên sản phẩm nội bộ per AC-4)"

            - id: KhoFilter
              type: Button
              variant: outline
              size: default
              width: 82
              label: "Kho"
              _png_verified: "13575-86900.png L200 outline button label 'Kho'"
              trailingIcon:
                source: iconsax-reactjs
                name: ArrowDown
                variant: Linear
                size: 16
                color: text-muted-foreground
              onClick: "openKhoDropdown()"
              _renders_as: filter-dropdown-trigger

            - id: NguoiImportFilter
              type: Button
              variant: outline
              size: default
              width: 143
              label: "Người import"
              _png_verified: "13575-86900.png L200 outline button 'Người import' + trailing chevron"
              trailingIcon:
                source: iconsax-reactjs
                name: ArrowDown
                variant: Linear
                size: 16
                color: text-muted-foreground
              onClick: "openNguoiImportDropdown()"

            - id: NgayImportFilter
              type: Button
              variant: outline
              size: default
              width: 138
              label: "Ngày import"
              _png_verified: "13575-86900.png L200 outline button 'Ngày import' + trailing calendar glyph (Calendar variant=Linear per Icon Catalog)"
              trailingIcon:
                source: iconsax-reactjs
                name: Calendar
                variant: Linear
                size: 16
                color: text-muted-foreground
              onClick: "openDateRangePicker()"

        - id: TableSection
          type: container
          width: 1376
          BG: bg-background
          Border: none
          direction: vertical
          gap: 0
          _children_count: 3         # TableHeader + TableBody + TableFooter
          children:

            - id: TableHeader
              type: TableHeadRow
              height: 40
              BG: bg-background
              Border: 1px bottom border  # base/border #e4e4e7
              _children_count: 12      # R10 — 12 columns per AC-2 + FEAT v3 add Thao tác
              _png_verified: "13575-86900.png L260 header row — 12 columns visible in exact order per AC-2"
              columns:
                - { id: SelectAll, type: Checkbox, width: 60, align: center, _renders_as: "checkbox in header selects all rows on current page" }
                - { id: STT, label: "STT", width: 60, align: left, _png_verified: "13575-86900.png L260 verbatim col header" }
                - { id: TonDenNgay, label: "Tồn đến ngày", width: 113, align: left, _png_verified: "13575-86900.png L260 verbatim" }
                - { id: Kho, label: "Kho", width: 113, align: left, _png_verified: "13575-86900.png L260 verbatim" }
                - { id: MaNoiBo, label: "Mã nội bộ", width: 120, align: left, _renders_as: "cell shows as blue text-link (foreground-brand-CD #0052ff)", _png_verified: "13575-86900.png L260 verbatim + cell PN-18901 links blue" }
                - { id: TenNoiBo, label: "Tên nội bộ", width: 201, align: left, _png_verified: "13575-86900.png L260 verbatim" }
                - { id: DVT, label: "ĐVT", width: 79, align: left, _png_verified: "13575-86900.png L260 verbatim (2 uppercase D+VT)" }
                - { id: SoLuongTon, label: "Số lượng tồn", width: 112, align: right, _renders_as: "numeric right-aligned", _png_verified: "13575-86900.png L260 verbatim col header, cell values right-aligned (e.g. '24')" }
                - { id: GiaTriTon, label: "Giá trị tồn", width: 133, align: right, format: "vnd", _renders_as: "vnd formatted right-aligned (e.g. '9.300.000đ')", _png_verified: "13575-86900.png L260 verbatim + cell '9.300.000đ' right-aligned with 'đ' suffix" }
                - { id: NguoiImport, label: "Người import", width: 172, align: left, _png_verified: "13575-86900.png L260 verbatim" }
                - { id: NgayImport, label: "Ngày import", width: 113, align: left, _png_verified: "13575-86900.png L260 verbatim" }
                - { id: ThaoTac, label: "Thao tác", width: 100, align: center, _renders_as: "2 icon-buttons per row (edit + delete) — visible always", _png_verified: "13575-86900.png L260 verbatim col header per FEAT v3 add" }

            - id: TableBody
              type: TableBody
              _mode_switch: "state=default → OBRowList[]  ·  state=empty → EmptyIllustration  ·  state=bulk_select → OBRowList[] with selected highlight"
              default_case:
                type: rows
                rowCount: 12                 # AC-6 default 20/page — screenshot shows 12 rows fit viewport
                rowHeight: 52
                rowContent:
                  - CheckboxCell: { field: rowSelected, onChange: "toggleRowSelection(row.id)" }
                  - STTCell: { field: index, format: "1-based" }
                  - TonDenNgayCell: { field: tonDenNgay, format: "DD/MM/YYYY" }
                  - KhoCell: { field: kho.name, ellipsis: "Kho phụ tùng ô tô" }
                  - MaNoiBoCell: { field: product.internalCode, _renders_as: "blue link → navigate to product detail" }
                  - TenNoiBoCell: { field: product.internalName }
                  - DVTCell: { field: product.unit }
                  - SoLuongTonCell: { field: soLuongTon, format: "number", align: right }
                  - GiaTriTonCell: { field: giaTriTon, format: "vnd", align: right }
                  - NguoiImportCell: { field: importedBy.name }
                  - NgayImportCell: { field: importedAt, format: "DD/MM/YYYY" }
                  - ThaoTacCell:
                      type: IconButtonGroup
                      align: center
                      gap: 8
                      _children_count: 2
                      children:
                        - id: RowEditButton
                          type: IconButton
                          icon: { source: iconsax-reactjs, name: Edit2, variant: Linear, size: 16, color: text-muted-foreground }
                          onClick: "navigate('/inventory/opening-balance/edit/{row.id}')  # → FEAT-OB-EDIT per AC-10"
                          _png_verified: "13575-86900.png Thao tác col — pencil glyph per row"
                        - id: RowDeleteButton
                          type: IconButton
                          icon: { source: iconsax-reactjs, name: Trash, variant: Linear, size: 16, color: text-muted-foreground }
                          onClick: "openDeleteConfirm({rowId: row.id})  # → FEAT-OB-DELETE-LINES popup per AC-11"
                          _png_verified: "13575-86900.png Thao tác col — trash bin glyph per row"

              empty_case:
                type: EmptyIllustration
                height: 445                    # matches Table Data/Empty instance 14547:101030
                _renders_as: illustration-centered-with-caption
                _children_count: 2             # icon + caption
                children:
                  - id: EmptyIcon
                    type: Illustration
                    source: assets/empty-data-illustration.svg    # broken-document sketch, muted grey
                    width: 120
                    height: 100
                    _png_verified: "14547-95824.png L500 broken-document sketch illustration centered horizontally"
                  - id: EmptyCaption
                    type: Text
                    content: "Không có dữ liệu"
                    _png_verified: "14547-95824.png L580 verbatim label 'Không có dữ liệu' semibold centered"
                    size: 16
                    weight: 600
                    color: text-foreground
                    align: center

            - id: TableFooter
              type: container
              _mode_switch: "state=default | bulk_select → { totalRow + paginationRow visible }  ·  state=empty → hidden entirely"
              _children_count: 2         # TotalRow + PaginationRow (in non-empty modes)
              children:
                - id: TotalRow
                  type: TableTotalRow
                  height: 40
                  BG: bg-accent           # base/accent #f4f4f5 subtle highlight
                  Border: 1px top border
                  _renders_as: "aggregate footer row spanning all columns"
                  _visibility_rule: "state !== 'empty' AND rows.length > 0"
                  content:
                    - { colSpan: 7, label: "Tổng", weight: 600, align: left, _renders_as: "left-aligned label" }
                    - { colSpan: 1, content: "{sum(soLuongTon)}", format: "number", align: right, weight: 600 }
                    - { colSpan: 1, content: "{sum(giaTriTon)}", format: "vnd", align: right, weight: 600 }
                    - { colSpan: 3, content: "" }
                  _computed_over: "current-filtered result (per AC-3 + EC-2 — reflects filter, không phải toàn bộ)"

                - id: PaginationRow
                  type: TablePagination
                  height: 36
                  direction: horizontal
                  justify: space-between
                  align: center
                  padding: { x: 0, y: 8 }
                  _visibility_rule: "state !== 'empty' AND totalCount > pageSize"
                  _children_count: 2       # PageSizeSelector + PageNavigator
                  children:
                    - id: PageSizeSelector
                      direction: horizontal
                      align: center
                      gap: 8
                      children:
                        - { type: Text, content: "Hiển thị", _png_verified: "13575-86900.png L950 verbatim 'Hiển thị'" }
                        - { type: Select, options: [10, 20, 50, 100], default: 20, width: 72, trailingIcon: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16 } }
                        - { type: Text, content: "mỗi trang", _png_verified: "13575-86900.png L950 verbatim 'mỗi trang'" }
                    - id: PageNavigator
                      direction: horizontal
                      align: center
                      gap: 4
                      children:
                        - { type: IconButton, icon: { source: iconsax-reactjs, name: ArrowLeft2, variant: Linear, size: 16 }, label: "Trước", _renders_as: "chevron-left + text" }
                        - { type: PageNumber, value: 1 }
                        - { type: PageNumber, value: 2, active: true }
                        - { type: PageNumber, value: 3 }
                        - { type: Text, content: "…" }
                        - { type: IconButton, icon: { source: iconsax-reactjs, name: ArrowRight2, variant: Linear, size: 16 }, label: "Tiếp", trailingIcon: true, _renders_as: "text + chevron-right" }

    - id: SectionFooter
      type: instance
      source: share/section-footer/01
      width: 1440
      height: 40
      BG: bg-background
      Border: 1px top border
      _renders_as: version-and-support-links-row
      content:
        - { align: left, text: "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0", _png_verified: "13575-86900.png L1010 verbatim" }
        - { align: right, links: ["Hướng dẫn sử dụng", "Hỗ trợ", "Hotline: 0985135050"] }

_negative_coverage:
  - "không có sort chevron icon per column header (AC-2 quy định sort mặc định ngày import mới nhất — không có UI toggle sort per PNG observation)"
  - "không có bulk-action dropdown (chỉ single 'Xoá các dòng đã chọn' button per FEAT scope — no 'Export selected' / 'Copy selected' etc.)"
  - "không có row-hover state visible (default state PNG shows resting; hover behavior implicit per shadcn Table pattern, not spec'd)"
  - "không có tooltip trên Thao tác icons (icons standalone per PNG, no title/tooltip visible)"
  - "không có toolbar filter chip (khi filter active) — PNG không show applied-filter chip state; AC-5 chỉ định apply filter, không định chip UI"
  - "không có breadcrumb bên trên page title (page-header component design chỉ có H1 + CTA, không breadcrumb per PNG)"
```

## §2 Design Token Map

| Element | Property | Figma variable | Value | Tailwind token |
|---|---|---|---|---|
| Page BG | background | base/background | #ffffff | `bg-background` |
| Navbar | background | base/background-brand-CD | #0052ff | `bg-brand` (custom, defined in @theme) |
| PageTitle | color | base/foreground | #18181b | `text-foreground` |
| PageTitle | fontSize | typography/base sizes/2x large/font-size | 24 | `text-2xl` |
| PageTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| PageTitle | lineHeight | typography/base sizes/2x large/line-height | 32 | `leading-8` |
| ImportButton | background | base/background-brand-CD | #0052ff | `bg-brand` |
| ImportButton | color | base/primary-foreground | #ffffff | `text-primary-foreground` |
| ImportButton | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| ImportButton | fontWeight | font/weight/medium | 500 | `font-medium` |
| ImportButton | height | height/h-9 | 36 | `h-9` |
| ImportButton | padding-x | spacing/4 | 16 | `px-4` |
| ImportButton | radius | border radius/md | 6 | `rounded-md` |
| ImportButton | shadow | shadow/sm | 0 1 2 #0000000D | `shadow-sm` |
| BulkDeleteButton | background | base/background | #ffffff | `bg-background` |
| BulkDeleteButton | border | base/input | #d4d4d8 | `border-input` |
| BulkDeleteButton | color | base/foreground | #18181b | `text-foreground` |
| SearchInput | border | base/input | #d4d4d8 | `border-input` |
| SearchInput | placeholder-color | base/muted-foreground | #71717a | `placeholder:text-muted-foreground` |
| SearchInput | height | height/h-9 | 36 | `h-9` |
| SearchInput | radius | border radius/md | 6 | `rounded-md` |
| TableHeader | border-bottom | base/border | #e4e4e7 | `border-b border-border` |
| TableHeader | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| TableHeader | fontWeight | font/weight/medium | 500 | `font-medium` |
| TableHeader | color | base/muted-foreground | #71717a | `text-muted-foreground` |
| TableRow | border-bottom | base/border | #e4e4e7 | `border-b border-border` |
| TableRow | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| TableRow | color | base/foreground | #18181b | `text-foreground` |
| MaNoiBoCell (link) | color | base/foreground-brand-CD | #0052ff | `text-brand` |
| Checkbox (selected) | background | base/background-brand-CD | #0052ff | `bg-brand data-[state=checked]:bg-brand` |
| TotalRow | background | base/accent | #f4f4f5 | `bg-accent` |
| EmptyCaption | color | base/foreground | #18181b | `text-foreground` |
| EmptyCaption | fontSize | typography/base sizes/base/font-size | 16 | `text-base` |
| SectionFooter | color | tailwind colors/neutral/600 | #525252 | `text-neutral-600` |

## §3 State Table

| State | Trigger | filterRow._bulk_delete_visible | TableBody mode | TotalRow | PaginationRow | Screen node |
|---|---|---|---|---|---|---|
| `default` | Page mount + ≥1 OB row exists + no row selected | `false` | rows (paginated) | visible | visible | 13575:86900 |
| `empty` | Page mount + zero OB row for tenant | `false` | EmptyIllustration | hidden | hidden | 14547:95824 |
| `bulk_select` | ≥1 row checkbox tick | `true` (prefix Xoá các dòng đã chọn + divider) | rows (paginated, selected rows highlighted with blue-filled checkbox) | visible | visible | 13575:95132 |
| `filter_applied` | User selects value trong Kho / Người import / Ngày import filter (also applies when SearchInput has keyword) | inherits from bulk selection state | rows (filtered subset) | visible (recomputed per filter, per AC-3 + EC-2) | visible | (not a distinct Figma frame — mixin) |

## §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| Navbar | `share/navigation/navbar-main` | `variant="brand"` (bg-brand) | Reuse cross-page navbar; no page-specific props |
| PageHeader | `share/page-header/4` | `{ title, primaryCta: { label, icon, onClick } }` | Header variant "4" per Figma "Page Header / 4" instance |
| SubNav | `customs/inventory/sub-nav` | `{ activeKey: "opening-balance" }` | Inventory-scoped sub-navigation |
| ImportButton / BulkDeleteButton / Filter buttons | `ui/button` | `variant="brand" \| "outline"`, `size="default"` | shadcn Button — variant brand = filled #0052ff, outline = white bg + border |
| SearchInput | `share/input/basic` | `{ placeholder, leadingIcon, onChange }` | Reuse across list pages |
| Filter dropdowns | `share/dropdown/filter-trigger` | `{ label, trailingIcon, onOpen }` | Trigger button; actual dropdown menu lazy-mounted |
| Table | `ui/table` (shadcn) | `{ columns, rows, onRowSelect, selectedIds }` | shadcn Table with row-selection controlled state |
| Row action icons | `ui/button` variant="ghost" size="icon" | `{ children: <IconComponent /> }` | Ghost icon-only 32×32 hit area |
| Pagination | `share/table-pagination` | `{ pageSize, currentPage, totalCount, onPageChange, onPageSizeChange }` | Reuse across list pages |
| EmptyIllustration | `share/empty-state/data-empty` | `{ caption: "Không có dữ liệu" }` | Reuse empty-state with default illustration |
| SectionFooter | `share/section-footer/01` | (no props — static content) | Layout-level footer, mounted at app-shell |

## §5 Field Composition Schema

Query filter payload:

```yaml
ListOpeningBalancesInput:
  interface: ListOpeningBalancesInput   # per API PROPOSED query FEAT §4
  fields:
    - name: keyword
      type: string?
      binding: SearchInput.value
      combined: false
      transform: "trim + lowercase; LIKE match against product.internalCode || product.internalName per AC-4"
    - name: khoId
      type: uuid?
      binding: KhoFilter.selectedValue
      combined: false
    - name: nguoiImportId
      type: uuid?
      binding: NguoiImportFilter.selectedValue
      combined: false
    - name: ngayImport
      type: DateRange?      # { from: date, to: date }
      binding: NgayImportFilter.selectedRange
      combined: true        # single date-picker with range mode
      transform: "date-picker returns { from, to } tuple, submit as ISO YYYY-MM-DD"
    - name: page
      type: int
      binding: PaginationRow.currentPage
      default: 1
    - name: pageSize
      type: int
      binding: PageSizeSelector.value
      default: 20
      enum: [10, 20, 50, 100]

ListOpeningBalancesResult:
  fields:
    - name: rows
      type: OpeningBalanceLine[]
    - name: totalCount
      type: int
    - name: aggregate
      type: OpeningBalanceAggregate   # { totalSoLuong, totalGiaTri } — for Tổng row per AC-3

OpeningBalanceLine:
  fields:
    - { name: id, type: uuid }
    - { name: tonDenNgay, type: date }
    - { name: kho, type: { id, name, code } }
    - { name: product, type: { id, internalCode, internalName, unit } }
    - { name: soLuongTon, type: decimal }
    - { name: giaTriTon, type: decimal, currency: VND }
    - { name: importedBy, type: { id, name } }
    - { name: importedAt, type: datetime }
```

## §6 Layout Width Table

| Container | Total width | Padding-x | Child widths (sum) | Notes |
|---|---|---|---|---|
| Navbar | 1440 | — | logo(80) + navlinks(≈900) + rightGroup(bell+avatar ≈ 100) | Fluid center, right-aligned meta |
| SubNav | 1440 | 32 | 6 tab-links horizontal (variable widths per label; gap-24 between) | 1440 - 64 = 1376 content area |
| PageContent | 1440 | 32 | 1376 content | Same padding as SubNav |
| PageHeader | 1376 | 0 | Title (variable) + ImportButton (169) | space-between; ImportButton width from px-4 + label(≈130) + icon(20+8) ≈ 169 |
| FilterRow (default 4 elements) | 1376 | 0 | SearchInput(320) + gap(8) + Kho(82) + gap(8) + NguoiImport(143) + gap(8) + NgayImport(138) = 715 | Trailing whitespace 661 |
| FilterRow (bulk_select 6 elements) | 1376 | 0 | BulkDelete(≈205) + gap(8) + Divider(1) + gap(8) + Search(320) + gap(8) + Kho(82) + gap(8) + NguoiImport(143) + gap(8) + NgayImport(138) = 929 | Trailing whitespace 447 |
| TableHeader | 1376 | 0 | 60+60+113+113+120+201+79+112+133+172+113+100 = 1376 | Exact fit, 12 columns |
| TableRow | 1376 | 0 | Same as TableHeader | 52px row height (40 for header) |
| TotalRow | 1376 | 0 | colspan structure: 7 cols left ("Tổng") + 1 col SoLuong + 1 col GiaTri + 3 cols right blank | Aggregates align under respective numeric cols |
| PaginationRow | 1376 | 0 | Left group (Hiển thị + Select + mỗi trang) + right group (nav buttons) | space-between |
| SectionFooter | 1440 | 32 | Left text + right links | Full-bleed, 40px |

## §7 Visual Hierarchy Map

```
Level 1 (primary): PageTitle "Danh sách tồn đầu kỳ" (H1 24px semibold) + ImportButton (primary brand CTA)
Level 2 (secondary): SubNav active tab "Tồn đầu kỳ" (blue underline signals current section) + FilterRow (search + 3 filters)
Level 3 (tertiary): TableHeader labels (14px medium muted) + BulkDeleteButton (conditional, outline secondary)
Level 4 (data): Table data rows (14px foreground) — MaNoiBoCell blue link stands out as interactive
Level 5 (utility): TotalRow (bg-accent aggregate summary) + PaginationRow (navigation utility) + SectionFooter
Empty state override: EmptyIllustration + EmptyCaption Level 3 (replaces data level entirely; Level 5 utility hidden)
```

## §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-OB-LIST-1 | Assume `Xoá các dòng đã chọn` button visible always (as static header CTA) | Button MUST be conditional on `selectedRowsCount >= 1`, hidden in default + empty states — prefix filter row when triggered, NOT top-right | `_png_verified`: 13575-86900.png filter row has 4 elements only; 13575-95132.png filter row has 6 (prefix + divider + 4). AC-1 explicit "chỉ hiển thị khi có ≥1 dòng được tick". |
| AP-OB-LIST-2 | Paraphrase button label to "Xóa dòng đã chọn" (drop dấu huyền + drop "các") | Verbatim "Xoá các dòng đã chọn" — preserve diacritic 'oá' + word 'các' per FEAT v4 verbatim rule 2026-07-06 | `_png_verified`: 13575-95132.png button text L200; FEAT-OB-LIST §8 v4 Change Log entry explicit. |
| AP-OB-LIST-3 | Import button label to "Import" or "Nhập tồn đầu kỳ" or "Import OB" | Verbatim "Import tồn đầu kỳ" — full 4-word Vietnamese label | `_png_verified`: 13575-86900.png button label + FEAT AC-1 verbatim. |
| AP-OB-LIST-4 | SearchInput placeholder shortcut "Tìm kiếm" or "Mã/Tên sản phẩm nội bộ" | Verbatim "Tìm theo mã, tên sản phẩm nội bộ" (per AC-4 v4 2026-07-06 rename from "Mã/Tên sản phẩm nội bộ") | `_png_verified`: 13575-86900.png placeholder L200 — matches AC-4 explicit verbatim change log. |
| AP-OB-LIST-5 | Empty state hide entire filter row + header (assume empty = zero UI) | Header + FilterRow + Import button ALL visible in empty state (per AC-3b explicit "header giữ đầy đủ"); ONLY table body + total + pagination hide | `_png_verified`: 14547-95824.png shows identical header + filter row to default; empty illustration replaces data rows only. |
| AP-OB-LIST-6 | Total row visible in empty state | TotalRow hidden when state=empty (AC-3b: "KHÔNG hiển thị: dòng Tổng") | `_png_verified`: 14547-95824.png no total row below empty illustration. |
| AP-OB-LIST-7 | Total row sums whole dataset instead of filtered result | Total row aggregates over CURRENT-FILTERED result set per AC-3 + EC-2 explicit | FEAT-OB-LIST EC-2 explicit; §1 TotalRow `_computed_over` note. |
| AP-OB-LIST-8 | Row `Thao tác` col shows single overflow menu (⋯ 3-dot) instead of 2 explicit icons | 2 icon-buttons visible per row: pencil (Edit2) + trash (Trash) per AC-2 v3 explicit + PNG evidence | `_png_verified`: 13575-86900.png row Thao tác col shows 2 icon-buttons per row + FEAT AC-2 v3 Change Log. |
| AP-OB-LIST-9 | Delete row (per-row 🗑) opens simple confirm without guardrail check (chỉ hỏi Yes/No) | Per AC-11 explicit: cùng luồng FEAT-OB-DELETE-LINES — guardrail kỳ đóng + tồn âm áp dụng per dòng | FEAT-OB-LIST AC-11 cross-ref FEAT-OB-DELETE-LINES. |
| AP-OB-LIST-10 | Use `lucide-react` for filter chevron / trash / edit / calendar icons | Use `iconsax-reactjs` per garage-web convention v7.6 2026-07-08 — vuesax/{V}/{name} → iconsax-reactjs PascalCase(name) + variant=PascalCase(V). See §Icon Catalog | Icon Catalog table + `_ref-web-transform-figma.md` v7.6 R4.1 swap. |

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 13575:86900 | default (main list with 12 rows) | assets/wave04-ob-list/13575-86900.png | 1440×1032 |
| 14547:95824 | empty (no data) | assets/wave04-ob-list/14547-95824.png | 1440×817 |
| 13575:95132 | bulk_select (7 rows checked, delete button visible) | assets/wave04-ob-list/13575-95132.png | 1440×1032 |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Header + filter + table + Import + Xoá conditional | PageHeader + FilterRow + `_bulk_delete_visible` conditional | 13575:86900, 13575:95132 | ✓ |
| AC-2 | 12 columns bảng including Thao tác (✎ + 🗑) | TableHeader.columns (12 entries) + ThaoTacCell IconButtonGroup | 13575:86900 | ✓ |
| AC-3 | Dòng Tổng = sum SL + GT of filtered rows | TotalRow with `_computed_over: current-filtered` | 13575:86900 (implicit — page 2 slice) | ✓ |
| AC-3b | Empty state — header giữ đầy đủ, table body → illustration + "Không có dữ liệu" | TableBody empty_case + TableFooter `_visibility_rule: state !== 'empty'` | 14547:95824 | ✓ |
| AC-4 | Search LIKE match mã / tên sản phẩm nội bộ | SearchInput `onChange: filter.keyword` + `ListOpeningBalancesInput.keyword` | 13575:86900 | ✓ |
| AC-5 | 3 filter Kho / Người import / Ngày import | KhoFilter + NguoiImportFilter + NgayImportFilter | 13575:86900 | ✓ |
| AC-6 | Pagination default 20/page | PageSizeSelector default 20 + PaginationRow | 13575:86900 | ✓ |
| AC-7 | Checkbox chọn dòng — bulk button hiện | Checkbox column + BulkDeleteButton `_visibility_rule` | 13575:95132 | ✓ |
| AC-8 | Import button → wizard | ImportButton `onClick: navigate('/inventory/opening-balance/import')` | 13575:86900 | ✓ |
| AC-9 | Phân quyền + tenant isolation | (backend concern — no UI encoding; TenantFilter enforced server-side) | — | ⚠ (backend) |
| AC-10 | Row edit icon → FEAT-OB-EDIT | RowEditButton `onClick: navigate('/inventory/opening-balance/edit/{row.id}')` | 13575:86900 | ✓ |
| AC-11 | Row delete icon → popup xác nhận (FEAT-OB-DELETE-LINES guardrail) | RowDeleteButton `onClick: openDeleteConfirm({rowId})` | 13575:86900 | ✓ |

## Coverage Gaps

_(none — all UI-facing AC covered in §1 DSL. AC-9 tenant enforcement is backend concern per boundary isolation, no client-side encoding needed beyond authenticated session context.)_
