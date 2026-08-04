---
feat: FEAT-AP-DETAIL
feat_file: Product/features/FEAT-AP-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87552
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14146:87552"
fetched_at: "2026-07-08T03:45Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 3
status: ACTIVE
coverage_gaps:
  - "Figma emit 3 frames — Frame 1 (Year variant) + Frame 2 (Q/M variant intermediate — no Ngày sửa/Người sửa filled) + Frame 3 (Q/M variant fully filled). Frame 2 = intermediate empty-audit state; delta chỉ ở audit row → không cần fetch riêng PNG cho Frame 2 (rendering identical to Frame 3 khi 2 audit fields blank per AC-3 explicit 'kỳ chưa từng sửa → 2 field vẫn hiển thị label + giá trị trống dấu — hoặc rỗng, KHÔNG ẩn field')."
---

# FEAT-AP-DETAIL — Spec (web)

> Page-level read-only detail view cho 1 kỳ kế toán, trigger từ `FEAT-AP-LIST` row action icon Xem. Structure: page header với back-arrow + title-loại-kỳ + Chỉnh sửa CTA top-right; section "Thông tin chung" với 3 rows × 4 cols field grid (label above value pattern, read-only text). 2 variants — Year (no "Thuộc kỳ") vs Quarter/Month (WITH "Thuộc kỳ").
>
> **Icon library**: `iconsax-reactjs` primary (v7.6). Icons: ArrowLeft (back), Edit2 (chỉnh sửa button leading).

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| icon/back-arrow | vuesax/linear/arrow-left | iconsax-reactjs | ArrowLeft | Linear | assets/wave04-ap-detail/13523-69659.png L143 back chevron ← left-most in header |
| icon/edit-cta | vuesax/linear/edit-2 | iconsax-reactjs | Edit2 | Linear | assets/wave04-ap-detail/13523-69659.png L143 pencil glyph leading "Chỉnh sửa" button top-right |

---

## Screen: Chi tiết kỳ kế toán năm (13523:69659)

### §0 ASCII Mockup

> See file-level **§0 ASCII Mockup — Year variant** below.

### §1 Layout DSL

> See file-level **§1 Layout DSL** below. This Screen renders `periodTypeVariant: year` → Row 1 = [Loại kỳ, Tên kỳ, Thứ tự hiển thị, (empty col 4)]. No "Thuộc kỳ" field per FEAT AC-2 (year là root, không thuộc kỳ cha nào).

### §2 Design Token Map
> See file-level **§2 Design Token Map** below.
### §3 State Table
> See file-level **§3 State Table** below (state = `year`).
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
screenshot: assets/wave04-ap-detail/13523-69659.png
verified_at: "2026-07-08T03:45Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Page-level detail view (1440×1024 viewport) — navbar + subnav 'Danh mục' tab active + page header + section body + section footer"
    status: ✓
    evidence: "13523-69659.png full page with all shell elements visible"
  - claim: "PageHeader has ← back + H1 'Chi tiết kỳ kế toán năm' (variant-specific 'năm' suffix) LEFT + 'Chỉnh sửa' outline button với pencil icon leading TOP-RIGHT — matches FEAT AC-1 header composition"
    status: ✓
    evidence: "13523-69659.png L143 shows [← Chi tiết kỳ kế toán năm] left + [✎ Chỉnh sửa] outline right; NO 'Đóng' button separate per AC-1"
  - claim: "Year variant Row 1 has 3 fields (Loại kỳ | Tên kỳ kế toán | Thứ tự hiển thị) + 4th col empty — NO 'Thuộc kỳ' field"
    status: ✓
    evidence: "13523-69659.png L232 row 1 columns 1-3 filled (Kỳ kế toán năm / Năm 2027 / 5) + column 4 empty"
  - claim: "Row 3 audit fields fully populated (Ngày tạo 07/05/2026 09:55, Người tạo Nguyễn Văn Kho, Ngày sửa 07/05/2026 09:55, Người sửa Nguyễn Văn Kho)"
    status: ✓
    evidence: "13523-69659.png L385-415 row 3 all 4 audit fields have values — Year variant Figma shows 'edited' state"
  - claim: "All values read-only text (no input controls, no chevron, no edit affordance per field)"
    status: ✓
    evidence: "13523-69659.png values render as plain text (foreground color), no border rectangles suggesting input"
```

---

## Screen: Chi tiết kỳ kế toán quarter/month (13523:70227)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Quarter/Month variant** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. This Screen renders `periodTypeVariant: quarter_or_month` → Row 1 = [Loại kỳ, Tên kỳ, Thuộc kỳ, Thứ tự hiển thị] (Thuộc kỳ visible col 3). Frame 2 has audit fields Ngày sửa/Người sửa EMPTY (intermediate state per AC-3 "kỳ chưa từng sửa" — labels visible, values render "—" or blank).
### §2 Design Token Map
> See file-level **§2 Design Token Map** below.
### §3 State Table
> See file-level **§3 State Table** below (state = `quarter_or_month_never_edited`).
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
screenshot: assets/wave04-ap-detail/13523-70433.png
verified_at: "2026-07-08T03:45Z"
verifier: main-agent (prefetch-figma web 04)
note: "Frame 2 (13523:70227) delta = audit fields empty; visually equivalent to Frame 3 (13523:70433) minus Ngày sửa/Người sửa values → 1 PNG asset (Frame 3 fully-populated) covers both. Empty-audit state per AC-3 explicit ('label + giá trị trống dấu — hoặc rỗng, KHÔNG ẩn field') tokens documented in §1"
claims_verified:
  - claim: "PageHeader shows H1 'Chi tiết kỳ kế toán tháng' (variant-specific 'tháng' suffix — could also be 'quý' depending on period type)"
    status: ✓
    evidence: "13523-70433.png L143 title 'Chi tiết kỳ kế toán tháng' — interpolated by variant"
  - claim: "Q/M variant Row 1 has 4 fields (Loại kỳ | Tên kỳ | Thuộc kỳ | Thứ tự hiển thị) — Thuộc kỳ populated ('Năm 2026') per AC-2"
    status: ✓
    evidence: "13523-70433.png L232 row 1 shows Kỳ kế toán năm | Quý 1 năm 2027 | Năm 2026 | 5 — all 4 cols filled"
  - claim: "Empty-state pattern for never-edited (Frame 2 case): Ngày sửa/Người sửa labels remain visible, values collapse to blank/dash — implementation per AC-3 explicit"
    status: ✓
    evidence: "Frame 2 metadata shows Ngày sửa Frame 1948757374 has children '--' text (dash placeholder per shadcn empty-value convention); Frame 3 fully-populated. Same layout, delta only value cells."
```

---

## Screen: Chi tiết kỳ kế toán quarter/month — fully edited (13523:70433)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Quarter/Month variant** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. Same as Frame 2 but with audit fields populated (state = `quarter_or_month_edited`).
### §2 Design Token Map
> See file-level **§2 Design Token Map** below.
### §3 State Table
> See file-level **§3 State Table** below (state = `quarter_or_month_edited`).
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
screenshot: assets/wave04-ap-detail/13523-70433.png
verified_at: "2026-07-08T03:45Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Same Q/M layout as Frame 2 but with audit row fully populated — Ngày sửa 07/05/2026 09:55, Người sửa Nguyễn Văn Kho visible"
    status: ✓
    evidence: "13523-70433.png L385-415 all 4 audit fields have values — populated state"
  - claim: "Section 'Thông tin chung' section title verbatim per FEAT AC-2 explicit section name"
    status: ✓
    evidence: "13523-70433.png L198 verbatim 'Thông tin chung' semibold section header"
  - claim: "Mô tả field spans 2-line wrap in col 4 row 2 (long description text wraps within cell width 298)"
    status: ✓
    evidence: "13523-70433.png L330 shows 'Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.' wrap 2 lines centered col 4"
```

---

# File-level shared sections

## §0 ASCII Mockup — Year variant (13523:69659)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚗 GMS   Tổng quan   Mua hàng   Sửa chữa & Dịch vụ   Tồn kho   Khách hàng   Marketing   Nhân viên   [Danh mục]      🔔● 👤 │  ← Navbar bg-brand
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Danh sách sản phẩm   Nhóm vật tư hàng hóa   [Kỳ kế toán]‾‾‾                                          │  ← Sub-nav Kỳ kế toán active
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  ← Chi tiết kỳ kế toán năm                                              [ ✎ Chỉnh sửa ]              │  ← Page header H1 + back + edit CTA outline top-right (NO 'Đóng' per AC-1)
│                                                                                                       │
│  Thông tin chung                                                                                      │  ← Section title (semibold 16)
│                                                                                                       │
│  Loại kỳ              Tên kỳ kế toán            Thứ tự hiển thị                                       │  ← Row 1 labels (Year: 3 filled + 1 empty)
│  Kỳ kế toán năm       Năm 2027                  5                                                     │  ← Row 1 values
│                                                                                                       │
│  Trạng thái           Ngày bắt đầu              Ngày kết thúc          Mô tả                          │  ← Row 2 labels (all 4 cols filled)
│  Đã đóng kỳ           01/01/2027                31/12/2027             Phụ tùng bảo dưỡng định kỳ,   │
│                                                                        dùng để lọc dầu động cơ.       │
│                                                                                                       │
│  Ngày tạo             Người tạo                 Ngày sửa               Người sửa                      │  ← Row 3 labels (audit)
│  07/05/2026 09:55     Nguyễn Văn Kho            07/05/2026 09:55       Nguyễn Văn Kho                 │  ← Row 3 values
│                                                                                                       │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0     Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## §0 ASCII Mockup — Quarter/Month variant (13523:70227 / 13523:70433)

```text
[Navbar + Sub-nav IDENTICAL to Year variant — Danh mục top tab + Kỳ kế toán sub-nav active]

│  ← Chi tiết kỳ kế toán tháng                                            [ ✎ Chỉnh sửa ]              │  ← Suffix "tháng" or "quý" per periodType
│                                                                                                       │
│  Thông tin chung                                                                                      │
│                                                                                                       │
│  Loại kỳ              Tên kỳ kế toán            Thuộc kỳ               Thứ tự hiển thị                │  ← Row 1: 4 fields (Thuộc kỳ visible col 3)
│  Kỳ kế toán năm       Quý 1 năm 2027            Năm 2026               5                              │
│                                                                                                       │
│  Trạng thái           Ngày bắt đầu              Ngày kết thúc          Mô tả                          │  ← Row 2: same 4 fields
│  Đã đóng kỳ           01/01/2027                31/12/2027             Phụ tùng bảo dưỡng định kỳ,   │
│                                                                        dùng để lọc dầu động cơ.       │
│                                                                                                       │
│  Ngày tạo             Người tạo                 Ngày sửa               Người sửa                      │  ← Row 3: audit
│  07/05/2026 09:55     Nguyễn Văn Kho            07/05/2026 09:55       Nguyễn Văn Kho                 │  ← Populated (Frame 3); Frame 2 empty state renders '—' or blank per AC-3
```

## §1 Layout DSL

```yaml
AccountingPeriodDetailPage:
  type: page
  route: "/inventory/accounting-period/:id"
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
      _png_verified: "13523-69659.png L0-104 navbar shows 'Danh mục' top-tab active (blue background + white text)"

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
      _renders_as: sub-navigation-tabs-danh-muc
      children:
        - { type: TabLink, label: "Danh sách sản phẩm", state: default, _png_verified: "13523-69659.png L80 verbatim" }
        - { type: TabLink, label: "Nhóm vật tư hàng hóa", state: default, _png_verified: "13523-69659.png L80 verbatim" }
        - { type: TabLink, label: "Kỳ kế toán", state: active, activeUnderlineColor: "#0052ff", _png_verified: "13523-69659.png L80 blue underline active" }

    - id: PageContent
      type: container
      width: 1440
      padding: { x: 80, y: 0 }
      BG: bg-background
      direction: vertical
      gap: 0
      _children_count: 2
      children:

        - id: PageHeader
          type: container
          width: 1280
          height: 80
          padding: { x: 32, y: 0 }
          direction: horizontal
          justify: space-between
          align: center
          _children_count: 2
          _renders_as: h1-with-back-link-and-outline-cta
          children:
            - id: PageTitleGroup
              type: container
              direction: horizontal
              gap: 16
              align: center
              _children_count: 2
              children:
                - id: BackLink
                  type: IconButton
                  icon: { source: iconsax-reactjs, name: ArrowLeft, variant: Linear, size: 24, color: text-foreground }
                  onClick: "navigate('/inventory/accounting-period')  # AC-5 back to FEAT-AP-LIST"
                  _renders_as: back-navigation-icon-button
                  _png_verified: "13523-69659.png L143 back chevron ← left-most"
                - id: PageTitle
                  type: Text
                  content: "Chi tiết kỳ kế toán {periodTypeSuffix}"
                  _interpolation: "{periodTypeSuffix} = 'năm' | 'quý' | 'tháng' per period.type"
                  _png_verified_year: "13523-69659.png L143 'Chi tiết kỳ kế toán năm' verbatim"
                  _png_verified_month: "13523-70433.png L143 'Chi tiết kỳ kế toán tháng' verbatim"
                  size: 24
                  weight: 600
                  lineHeight: 32
                  color: text-foreground

            - id: EditCTA
              type: Button
              variant: outline
              size: default
              label: "Chỉnh sửa"
              _png_verified: "13523-69659.png L143 verbatim 'Chỉnh sửa' outline button + leading pencil icon"
              leadingIcon: { source: iconsax-reactjs, name: Edit2, variant: Linear, size: 16, color: text-foreground }
              onClick: "navigate('/inventory/accounting-period/edit/{id}')  # AC-4 → FEAT-AP-EDIT"
              _renders_as: outline-secondary-cta-with-leading-icon

        - id: ThongTinChungSection
          type: container
          width: 1216
          BG: bg-background
          Border: none
          direction: vertical
          gap: 0
          _children_count: 2
          children:
            - id: SectionTitle
              type: Text
              content: "Thông tin chung"
              _png_verified: "13523-69659.png L198 verbatim 'Thông tin chung' semibold 16px"
              size: 16
              weight: 600
              lineHeight: 24
              color: text-foreground
              _renders_as: h2-section-header

            - id: FieldGrid
              type: container
              direction: grid
              cols: 4
              gap: { x: 8, y: 16 }
              _children_count: 3        # 3 rows; each row a container with 4 InforItem children
              _renders_as: form-detail-3-rows-4-cols-grid
              children:

                # Row 1 — Period identity (variant-conditional)
                - id: Row1
                  type: container
                  direction: horizontal
                  gap: 8
                  _mode_switch: "periodTypeVariant='year' → 3 InforItem + 1 empty  ·  periodTypeVariant='quarter_or_month' → 4 InforItem (Thuộc kỳ at col 3)"
                  _children_count: 4    # always 4 grid cols; Year variant has 4th cell empty per metadata
                  children:
                    - id: LoaiKyItem
                      type: InforItem
                      label: "Loại kỳ"
                      value: "{period.periodTypeDisplayName}"
                      _renders_as: label-above-value-plain-text
                      _png_verified_year: "13523-69659.png L232 label 'Loại kỳ' + value 'Kỳ kế toán năm'"
                      _png_verified_month: "13523-70433.png L232 label 'Loại kỳ' + value 'Kỳ kế toán năm' (still 'năm' because loại kỳ is meta descriptor)"

                    - id: TenKyKeToanItem
                      type: InforItem
                      label: "Tên kỳ kế toán"
                      value: "{period.displayName}"
                      _renders_as: label-above-value-plain-text
                      _png_verified_year: "13523-69659.png L232 value 'Năm 2027'"
                      _png_verified_month: "13523-70433.png L232 value 'Quý 1 năm 2027'"

                    - id: ThuocKyItem_or_ThuTuHienThiItem
                      type: InforItem
                      _mode_switch: "year → ThuTuHienThi (position col 3)  ·  quarter_or_month → ThuocKy (position col 3)"
                      label_year: "Thứ tự hiển thị"
                      label_month: "Thuộc kỳ"
                      value_year: "{period.displayOrder}"
                      value_month: "{period.parentPeriod.displayName}"
                      _renders_as: label-above-value-plain-text
                      _png_verified_year: "13523-69659.png L232 col 3 shows 'Thứ tự hiển thị' + '5' — no Thuộc kỳ label"
                      _png_verified_month: "13523-70433.png L232 col 3 shows 'Thuộc kỳ' + 'Năm 2026'"

                    - id: ThuTuHienThiItem_or_empty
                      type: InforItem
                      _mode_switch: "year → empty (Thứ tự hiển thị was already at col 3)  ·  quarter_or_month → ThuTuHienThi (position col 4)"
                      label_month: "Thứ tự hiển thị"
                      value_month: "{period.displayOrder}"
                      _png_verified_year: "13523-69659.png L232 col 4 empty per metadata (frame 15075:93426 empty content)"
                      _png_verified_month: "13523-70433.png L232 col 4 shows 'Thứ tự hiển thị' + '5'"

                # Row 2 — Period metadata (identical both variants)
                - id: Row2
                  type: container
                  direction: horizontal
                  gap: 8
                  _children_count: 4
                  children:
                    - id: TrangThaiItem
                      type: InforItem
                      label: "Trạng thái"
                      value: "{period.status}"        # vd 'Đã đóng kỳ' | 'Chưa đóng'
                      _png_verified: "13523-69659.png + 13523-70433.png L306 label 'Trạng thái' + value 'Đã đóng kỳ'"

                    - id: NgayBatDauItem
                      type: InforItem
                      label: "Ngày bắt đầu"
                      value: "{period.startDate | format('DD/MM/YYYY')}"
                      _png_verified: "13523-69659.png + 13523-70433.png L306 label 'Ngày bắt đầu' + value '01/01/2027'"

                    - id: NgayKetThucItem
                      type: InforItem
                      label: "Ngày kết thúc"
                      value: "{period.endDate | format('DD/MM/YYYY')}"
                      _png_verified: "13523-69659.png + 13523-70433.png L306 label 'Ngày kết thúc' + value '31/12/2027'"

                    - id: MoTaItem
                      type: InforItem
                      label: "Mô tả"
                      value: "{period.description}"
                      _renders_as: label-above-value-wraps-if-long
                      _png_verified: "13523-69659.png + 13523-70433.png L306 label 'Mô tả' + value 'Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.' wrap 2 lines within col width 298"

                # Row 3 — Audit trail (identical both variants; empty state per AC-3)
                - id: Row3
                  type: container
                  direction: horizontal
                  gap: 8
                  _children_count: 4
                  children:
                    - id: NgayTaoItem
                      type: InforItem
                      label: "Ngày tạo"
                      value: "{period.createdAt | format('DD/MM/YYYY HH:mm')}"
                      _png_verified: "13523-69659.png L385 label 'Ngày tạo' + value '07/05/2026 09:55'"

                    - id: NguoiTaoItem
                      type: InforItem
                      label: "Người tạo"
                      value: "{period.createdBy.name}"
                      _png_verified: "13523-69659.png L385 label 'Người tạo' + value 'Nguyễn Văn Kho'"

                    - id: NgaySuaItem
                      type: InforItem
                      label: "Ngày sửa"
                      value: "{period.updatedAt | format('DD/MM/YYYY HH:mm') || '—'}"
                      _empty_render: "kỳ chưa từng sửa → giá trị hiển thị '—' (long dash) HOẶC blank per shadcn empty-value convention. Label VẪN visible per AC-3 explicit"
                      _png_verified_populated: "13523-70433.png L385 label 'Ngày sửa' + value '07/05/2026 09:55'"
                      _png_verified_empty: "13523-70227 (Frame 2) metadata shows Ngày sửa Frame 1948757374 với '--' dash placeholder"

                    - id: NguoiSuaItem
                      type: InforItem
                      label: "Người sửa"
                      value: "{period.updatedBy.name || '—'}"
                      _empty_render: "kỳ chưa từng sửa → giá trị hiển thị '—' HOẶC blank. Label VẪN visible per AC-3"
                      _png_verified_populated: "13523-70433.png L385 label 'Người sửa' + value 'Nguyễn Văn Kho'"

    - id: SectionFooter
      type: instance
      source: share/section-footer/02
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px top border
      _renders_as: version-and-support-links-row
      content:
        - { align: left, text: "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0" }
        - { align: right, links: ["Hướng dẫn sử dụng", "Hỗ trợ", "Hotline: 0985135050"] }

_negative_coverage:
  - "không có 'Đóng' button riêng trong header — điều hướng chỉ qua icon back per AC-1 + AC-5 explicit"
  - "không có breadcrumb (chỉ back-arrow, không có 'Danh mục / Kỳ kế toán / Chi tiết kỳ 2027' path)"
  - "không có 'Đóng kỳ' / 'Mở lại kỳ' action button (state transition thuộc FEAT khác — out of DETAIL scope)"
  - "không có delete button (delete flow riêng qua FEAT-AP-DELETE row action)"
  - "không có audit history log (chỉ 4 audit field snapshot ngày tạo/sửa; full history out of scope)"
  - "không có card chrome / border quanh section (plain stack layout, background-only)"
  - "không có tab / accordion (chỉ 1 section 'Thông tin chung')"
  - "không có delete-linked-children link (nếu kỳ cha có kỳ con → không show inline; user phải quay list drill children)"
```

## §2 Design Token Map

| Element | Property | Figma variable | Value | Tailwind token |
|---|---|---|---|---|
| Page BG | background | base/background | #ffffff | `bg-background` |
| PageTitle | color | base/foreground | #18181b | `text-foreground` |
| PageTitle | fontSize | typography/base sizes/2x large/font-size | 24 | `text-2xl` |
| PageTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| EditCTA button | border | base/input | #d4d4d8 | `border-input` |
| EditCTA button | color | base/foreground | #18181b | `text-foreground` |
| EditCTA button | height | height/h-9 | 36 | `h-9` |
| EditCTA button | fontWeight | font/weight/medium | 500 | `font-medium` |
| SectionTitle | fontSize | typography/base sizes/base/font-size | 16 | `text-base` |
| SectionTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| InforItem label | color | base/muted-foreground | #71717a | `text-muted-foreground` |
| InforItem label | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| InforItem label | fontWeight | font/weight/normal | 400 | `font-normal` |
| InforItem value | color | base/foreground | #18181b | `text-foreground` |
| InforItem value | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| InforItem value | fontWeight | font/weight/normal | 400 | `font-normal` |

## §3 State Table

| State | Trigger | periodTypeVariant | Row1 layout | Row3 audit |
|---|---|---|---|---|
| `year` | Period type is "Năm" | `year` | 3 filled + 1 empty col 4 (no Thuộc kỳ) | Populated normally |
| `quarter_or_month_never_edited` | Period type is Quý/Tháng + updatedAt = null | `quarter_or_month` | 4 filled (Thuộc kỳ col 3, Thứ tự hiển thị col 4) | Ngày sửa + Người sửa render '—' or blank; labels visible |
| `quarter_or_month_edited` | Period type is Quý/Tháng + updatedAt set | `quarter_or_month` | 4 filled | Populated normally |
| `closed_period` | period.status = 'Đã đóng kỳ' | (orthogonal to variant) | Trạng thái field renders 'Đã đóng kỳ' | (no impact on layout) |
| `open_period` | period.status = 'Chưa đóng' | (orthogonal to variant) | Trạng thái field renders 'Chưa đóng' | (no impact on layout) |

## §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| PageHeader | `share/page-header/3` | `{ title, backLink, primaryCta: { label: "Chỉnh sửa", variant: "outline", icon, onClick } }` | Header variant "3" per Figma instance |
| BackLink | `ui/button` variant="ghost" size="icon" | `{ onClick, children: <ArrowLeft /> }` | Ghost icon-only 24px |
| EditCTA | `ui/button` variant="outline" | `{ children: "Chỉnh sửa", leadingIcon: <Edit2 />, onClick }` | Outline + leading icon composition |
| SectionTitle | `share/section/title-text` | `{ text: "Thông tin chung" }` | Reuse title-text |
| FieldGrid | `share/form-detail-grid` | `{ cols: 4, gap-x: 8, gap-y: 16, rows: [Row1, Row2, Row3] }` | Reuse form-detail layout across detail views |
| InforItem | `share/infor-item` | `{ label, value, emptyPlaceholder: '—' }` | Reuse — renders label-above-value vertical stack; falls back to em-dash on null |

## §5 Field Composition Schema

Query payload:

```yaml
GetAccountingPeriodDetailInput:
  interface: GetAccountingPeriodDetailInput
  fields:
    - name: id
      type: uuid
      binding: route param :id
      combined: false

AccountingPeriodDetail:
  fields:
    - { name: id, type: uuid }
    - { name: periodType, type: "'NAM' | 'QUY' | 'THANG'", _renders: "used to switch title suffix + Row1 layout variant" }
    - { name: periodTypeDisplayName, type: string, _example: "'Kỳ kế toán năm'" }
    - { name: displayName, type: string, _example: "'Năm 2027' | 'Quý 1 năm 2027' | 'Tháng 1/2027'" }
    - { name: parentPeriod, type: { id: uuid, displayName: string }?, _renders: "quarter/month variants only — 'Thuộc kỳ' field value" }
    - { name: startDate, type: date }
    - { name: endDate, type: date }
    - { name: displayOrder, type: int }
    - { name: status, type: "'Đã đóng kỳ' | 'Chưa đóng'" }
    - { name: description, type: string? }
    - { name: createdAt, type: datetime }
    - { name: createdBy, type: { id, name } }
    - { name: updatedAt, type: datetime? }
    - { name: updatedBy, type: { id, name }? }
```

## §6 Layout Width Table

| Container | Total width | Padding | Child widths | Notes |
|---|---|---|---|---|
| Page | 1440 | — | Navbar + SubNav + PageContent + Footer | Full-bleed |
| PageContent | 1440 | { x: 80, y: 0 } | 1280 content area | Consistent 80px side padding with FEAT-OB-EDIT |
| PageHeader | 1280 | { x: 32, y: 0 } | TitleGroup + EditCTA (~120) | space-between |
| ThongTinChungSection | 1216 | 0 | SectionTitle full + FieldGrid full | Content area 1280 - 64 |
| FieldGrid | 1216 | 0 | 4 cols × 298 wide + 3 gaps × 8 = 1216 | Grid 4-col; gap-y 16 between rows |
| InforItem cell | 298 | 0 | Label (20h) + gap(8) + Value (20-40h wrap) | Label-above-value vertical stack |

## §7 Visual Hierarchy Map

```
Level 1 (primary):
  - EditCTA "Chỉnh sửa" (outline top-right — clearly the primary action for user of read-only view)

Level 2 (secondary):
  - PageTitle "Chi tiết kỳ kế toán {loại}" (H1 semibold, top-left)

Level 3 (tertiary):
  - SectionTitle "Thông tin chung" (semibold 16px)

Level 4 (data):
  - InforItem values (foreground text, primary content of view)

Level 5 (meta):
  - InforItem labels (muted text signals metadata not value)
  - Section footer

Empty audit state: labels visible (Level 5) + values '—' render at Level 5 too (muted foreground) — visually deprioritized vs populated state
```

## §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-AP-DET-1 | Add "Đóng" button separately (assume detail = modal or panel needs dismiss) | NO "Đóng" button per AC-1 explicit. Điều hướng chỉ qua ← back arrow trong header per AC-5 | `_png_verified`: 13523-69659.png header shows only back + title + Chỉnh sửa — no Đóng button |
| AP-AP-DET-2 | Render Row 1 with 3 fields always (Loại kỳ + Tên kỳ + Thứ tự hiển thị) — forget Thuộc kỳ for Q/M | Row 1 conditional 4 cols: Year variant col 3 = Thứ tự hiển thị + col 4 empty; Q/M variant col 3 = Thuộc kỳ + col 4 = Thứ tự hiển thị per PNG evidence | Frame 1 (Year) vs Frame 2/3 (Q/M) metadata comparison; FEAT AC-2 "Thuộc kỳ (với quý/tháng)" explicit |
| AP-AP-DET-3 | Hide Ngày sửa / Người sửa fields when kỳ chưa từng sửa | Labels + values REMAIN visible; empty values render '—' or blank per AC-3 explicit "KHÔNG ẩn field" | FEAT AC-3 explicit + Frame 2 metadata shows '--' placeholder text |
| AP-AP-DET-4 | Chỉnh sửa button label "Sửa" or "Chỉnh sửa kỳ" | Verbatim "Chỉnh sửa" (2 words) per PNG + FEAT AC-4 | `_png_verified`: 13523-69659.png + 13523-70433.png button label 'Chỉnh sửa' verbatim |
| AP-AP-DET-5 | Chỉnh sửa button as brand-blue primary (assume detail → edit is primary action) | Outline variant per PNG — read-only view có nhiều actions tiềm năng, edit là 1 trong số; outline signals secondary. FEAT chỉ AC-4 mention nút Chỉnh sửa, không nói variant | `_png_verified`: 13523-69659.png Chỉnh sửa button outline (border + white bg + foreground text) not brand-blue filled |
| AP-AP-DET-6 | Chỉnh sửa icon là Trash or Save (wrong glyph) | Icon là Edit2 (pencil) per PNG evidence + iconsax-reactjs variant=Linear per Icon Catalog | `_png_verified`: 13523-69659.png pencil glyph leading button label |
| AP-AP-DET-7 | Page title verbatim "Chi tiết kỳ kế toán" (drop loại kỳ suffix) | Title interpolates period type suffix: "Chi tiết kỳ kế toán năm | quý | tháng" per FEAT AC-1 explicit "[loại]" placeholder | `_png_verified`: 13523-69659.png 'năm' + 13523-70433.png 'tháng' |
| AP-AP-DET-8 | Wrap section 'Thông tin chung' in Card component (assume detail views need card chrome) | Plain stack layout — NO card border per PNG (background only). shadcn Card would add unnecessary chrome | `_png_verified`: 13523-69659.png section renders directly on page background, no card border visible around section content |
| AP-AP-DET-9 | Use table for InforItem rendering (label + value = key-value → assume table) | InforItem is label-above-value vertical stack per PNG, NOT horizontal key-value table row. Grid layout 4-col for parallel InforItem cells | `_png_verified`: 13523-69659.png each cell shows label (small muted) on top, value below larger — vertical stack pattern |
| AP-AP-DET-10 | Use `lucide-react` for ArrowLeft or Edit2 | Use `iconsax-reactjs` PascalCase + variant=Linear per convention v7.6 R4.1 | `_ref-web-transform-figma.md v7.6` |

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 13523:69659 | year (populated audit) | assets/wave04-ap-detail/13523-69659.png | 1440×1024 |
| 13523:70227 | quarter_or_month_never_edited (Frame 2) | (reuses assets/wave04-ap-detail/13523-70433.png with audit values rendered '—') | 1440×1024 |
| 13523:70433 | quarter_or_month_edited | assets/wave04-ap-detail/13523-70433.png | 1440×1024 |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Mở màn chi tiết + title "Chi tiết kỳ kế toán [loại]" + Chỉnh sửa top-right + back arrow + NO Đóng | PageHeader with variant title + BackLink + EditCTA + no Đóng | 13523:69659 + 13523:70433 | ✓ |
| AC-2 | 8 fields read-only + Thuộc kỳ conditional (Q/M only) | Row1 + Row2 InforItem set with variant switch | 13523:69659 (Year) + 13523:70433 (Q/M) | ✓ |
| AC-3 | Audit fields Ngày tạo + Người tạo + Ngày sửa + Người sửa; empty state → label visible + value '—' | Row3 with `_empty_render` behavior | 13523:70227 (empty state) + 13523:70433 (populated) | ✓ |
| AC-4 | Chỉnh sửa button → FEAT-AP-EDIT | EditCTA.onClick → navigate edit route | 13523:69659 + 13523:70433 | ✓ |
| AC-5 | Back arrow → FEAT-AP-LIST; NO Đóng button | BackLink.onClick + no Đóng in §1 | 13523:69659 + 13523:70433 | ✓ |
| AC-6 | Phân quyền — chủ garage + kế toán ngang nhau | (backend RBAC) | — | ⚠ (backend) |

## Coverage Gaps

- **Frame 2 (Q/M never edited)**: Delta chỉ audit row empty values → reuse Frame 3 PNG asset + `_empty_render` behavior documented in §1 Row3 InforItem entries. Không cần dedicated PNG.
- **Font weight of "Thuộc kỳ" values**: Figma L28 metadata shows some values in "Frame 1948757374" wrapper (populated audit) và values thẳng text (Loại kỳ/Tên/Thuộc kỳ). Wrapper là styling group cho date+time compound value không tách rời; not relevant to structural layout.
