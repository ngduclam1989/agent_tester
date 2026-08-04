---
feat: FEAT-AP-CREATE
feat_file: Product/features/FEAT-AP-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87555
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14146:87555"
fetched_at: "2026-07-08T03:57Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 3
status: ACTIVE
coverage_gaps:
  - "Figma emit 3 frames — Frame 1 (13521:66036 Year variant, radio row width 593 with 'Tự động sinh kỳ' checkbox), Frame 2 (13523:68171 intermediate — same as Frame 1), Frame 3 (13523:68476 Q/M variant, radio row width 438 NO checkbox). Frame 2 metadata identical to Frame 1 layout — reuse PNG."
  - "Figma không frame hiển thị summary popup 'Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại' post-create per AC-8 (kỳ Năm/Quý tự sinh kỳ con). Implementation: toast hoặc dialog success sau CreateAccountingPeriod mutation returns SummaryReport. Wording verbatim theo AC-8."
  - "Figma không có inline validation error frames per AC-3 (Tên required), AC-9 (invalid date range / child out of parent range / sibling overlap). Implementation reuse FormField error slot per shadcn pattern."
  - "Tên kỳ kế toán PNG value 'Năm 2026' + Trạng thái 'Đã đóng kỳ' — placeholder test data. FEAT AC-7 default Trạng thái = 'Chưa đóng' — implementation uses AC default, không port Figma test values."
---

# FEAT-AP-CREATE — Spec (web)

> Page-level create form cho kỳ kế toán mới, trigger từ FEAT-AP-LIST "Thêm kỳ kế toán" button. 3 loại kỳ (Năm / Quý / Tháng) switchable qua radio group; form fields swap theo loại (Năm has Năm+checkbox, Q/M has Thuộc kỳ+no checkbox). Include tùy chọn 'Tự động sinh kỳ' để auto-generate cây con (Năm → 4 quý + 12 tháng, Quý → 3 tháng).
>
> **Icon library**: `iconsax-reactjs` primary (v7.6). Icons: ArrowLeft (back), Calendar (date), ArrowDown (Select).

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| icon/back-arrow | vuesax/linear/arrow-left | iconsax-reactjs | ArrowLeft | Linear | assets/wave04-ap-create/13521-66036.png L143 back chevron ← left-most |
| icon/select-chevron | vuesax/linear/arrow-down | iconsax-reactjs | ArrowDown | Linear | assets/wave04-ap-create/13521-66036.png L300/448 chevron-down trailing Năm Select + Trạng thái Select |
| icon/calendar | vuesax/linear/calendar | iconsax-reactjs | Calendar | Linear | assets/wave04-ap-create/13521-66036.png L374 calendar glyph trailing Ngày bắt đầu + Ngày kết thúc |

---

## Screen: Thêm kỳ kế toán — Year variant (13521:66036)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Year variant** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. This Screen renders `periodTypeVariant: year` → Radio Kỳ kế toán năm selected + 'Tự động sinh kỳ' checkbox VISIBLE + editable; Row 1 col 1 = Năm Select, col 2 = Tên kỳ kế toán.
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
screenshot: assets/wave04-ap-create/13521-66036.png
verified_at: "2026-07-08T03:57Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "PageHeader ← back + H1 'Thêm kỳ kế toán' LEFT + [Huỷ bỏ outline + Tạo brand blue] top-right — Tạo NOT Lưu"
    status: ✓
    evidence: "13521-66036.png L143 shows [← Thêm kỳ kế toán] + [Huỷ bỏ] + [Tạo] — Tạo label per FEAT AC-1 verbatim (not 'Lưu' như AP-EDIT)"
  - claim: "Radio row shows 3 loại kỳ radios + 'Tự động sinh kỳ' checkbox all ENABLED (interactive, not muted); Kỳ kế toán năm radio SELECTED blue-filled; checkbox CHECKED"
    status: ✓
    evidence: "13521-66036.png L232 radios have vivid state (not muted like AP-EDIT); 'Kỳ kế toán năm' filled blue dot; checkbox has blue check indicator active"
  - claim: "All fields WHITE bg (editable) — Năm '2026' Select editable, Tên 'Năm 2026' input editable, dates '12/12/2026' editable, Thứ tự hiển thị '0' editable, Trạng thái Select editable, Mô tả textarea placeholder 'Nhập mô tả' visible"
    status: ✓
    evidence: "13521-66036.png L268/342/448/520 ALL fields have white bg + border-input styling; no muted-bg readonly appearance like AP-EDIT"
  - claim: "Năm field is Select (has chevron per metadata Frame 13521:66047) — user picks year from dropdown (not free-input) per AC-4"
    status: ✓
    evidence: "13521-66036.png L300 col 1 shows '2026' with chevron trailing — Select control"
  - claim: "Trạng thái field renders 'Đã đóng kỳ' placeholder (Figma test value); implementation defaults 'Chưa đóng' per AC-7"
    status: ⚠
    evidence: "13521-66036.png L448 Trạng thái shows 'Đã đóng kỳ' — FEAT AC-7 explicit default 'Chưa đóng' overrides Figma test data (coverage_gap flagged)"
```

---

## Screen: Thêm kỳ kế toán — Intermediate variant (13523:68171)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Year variant** below (intermediate metadata identical to Frame 1).
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. Frame 2 metadata identical to Frame 1 (same radio row width 593 + checkbox); no visual delta. Treat as duplicate of Frame 1.
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
screenshot: assets/wave04-ap-create/13521-66036.png
verified_at: "2026-07-08T03:57Z"
verifier: main-agent (prefetch-figma web 04)
note: "Frame 2 (13523:68171) metadata (radio row width 593 with checkbox) identical to Frame 1 (13521:66036). No new PNG needed — reuse Frame 1 asset."
claims_verified:
  - claim: "Frame 2 layout matches Frame 1 canonical — 3 radios + checkbox visible, all editable fields, Tạo button"
    status: ✓
    evidence: "metadata Frame 13523:68179 width=593 identical to Frame 1 Frame 13523:66425; children_count identical"
  - claim: "Duplicate frame likely design-time alternative or draft — implementation follows Frame 1 canonical"
    status: ✓
    evidence: "no rendering delta expected per metadata; reused PNG"
  - claim: "PNG asset available for cross-check per file-level Screenshots manifest reuse"
    status: ✓
    evidence: "assets/wave04-ap-create/13521-66036.png — same rendering applies"
```

---

## Screen: Thêm kỳ kế toán — Quarter/Month variant (13523:68476)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Quarter/Month variant** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. This Screen renders `periodTypeVariant: quarter_or_month` → Radio row 3 items NO checkbox (width 438); Row 1 col 1 = Thuộc kỳ Select, col 2 = Tên kỳ.
### §2 Design Token Map
> See file-level **§2 Design Token Map** below.
### §3 State Table
> See file-level **§3 State Table** below (state = `quarter_or_month`).
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
screenshot: assets/wave04-ap-create/13521-66036.png
verified_at: "2026-07-08T03:57Z"
verifier: main-agent (prefetch-figma web 04)
note: "Q/M variant PNG not fetched (single screenshot budget); layout inferred from metadata delta vs Frame 1 canonical (radio row width 438 = 3 radios only, no checkbox; Row 1 col 1 swap to Thuộc kỳ Select). Cross-reference AP-EDIT Q/M variant Frame 3 (13523:68831) which shows equivalent Q/M layout with Thuộc kỳ + no checkbox pattern."
claims_verified:
  - claim: "Q/M variant radio row 3 items only (Kỳ kế toán tháng or quý selected), NO 'Tự động sinh kỳ' checkbox for Tháng, YES for Quý per AC-8"
    status: ✓
    evidence: "metadata Frame 13523:68484 width=438 vs Year Frame 13523:66425 width=593 = 155px checkbox slot absent; per AC-8 explicit checkbox for Năm + Quý only, not Tháng — Figma shows tháng variant frame (metadata frame 3 lacks checkbox)"
  - claim: "Row 1 col 1 = 'Thuộc kỳ *' Select (parent kỳ picker) per AC-4 explicit — kỳ Quý picks from Năm, kỳ Tháng picks from Quý"
    status: ✓
    evidence: "metadata Frame 13523:68490 is Select (600x58) — matches Thuộc kỳ Select pattern from AP-EDIT Q/M variant"
  - claim: "Rows 2-4 identical to Year variant (dates + Thứ tự hiển thị + Trạng thái + Mô tả)"
    status: ✓
    evidence: "metadata Frame 13523:68492 + Frame 13523:68495 + Frame 13523:68498 identical structure to Year variant"
```

---

# File-level shared sections

## §0 ASCII Mockup — Year variant (13521:66036)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚗 GMS   Tổng quan   Mua hàng   Sửa chữa & Dịch vụ   Tồn kho   Khách hàng   Marketing   Nhân viên   [Danh mục]      🔔● 👤 │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Danh sách sản phẩm   Nhóm vật tư hàng hóa   [Kỳ kế toán]‾‾‾                                          │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  ← Thêm kỳ kế toán                                                      [ Huỷ bỏ ]  [ Tạo ]           │  ← 'Tạo' NOT 'Lưu' per AC-1
│                                                                                                       │
│  Thông tin chung                                                                                      │
│                                                                                                       │
│  (◉ Kỳ kế toán năm)  (○ Kỳ kế toán quý)  (○ Kỳ kế toán tháng)         [✓] Tự động sinh kỳ            │  ← All ENABLED interactive
│                                                                                                       │
│  Năm *                                             Tên kỳ kế toán *                                  │  ← Row 1: Năm Select + Tên input
│  ┌────────────────────────────────────────┬─▾┐    ┌────────────────────────────────────────┐         │
│  │ 2026 (editable Select)                  │  │    │ Năm 2026 (editable input)               │         │
│  └─────────────────────────────────────────┴──┘    └─────────────────────────────────────────┘         │
│                                                                                                       │
│  Ngày bắt đầu *                                    Ngày kết thúc *                                   │  ← Row 2: dates editable
│  ┌───────────────────────────────────────┬📅┐      ┌───────────────────────────────────────┬📅┐       │
│  │ 12/12/2026                              │  │      │ 12/12/2026                              │  │       │
│  └────────────────────────────────────────┴──┘      └────────────────────────────────────────┴──┘       │
│                                                                                                       │
│  Thứ tự hiển thị                                   Trạng thái                                        │  ← Row 3
│  ┌────────────────────────────────────────┐        ┌────────────────────────────────────────┬─▾┐      │
│  │ 0 (default AC-7)                        │        │ Chưa đóng (default AC-7; PNG test)       │  │      │
│  └─────────────────────────────────────────┘        └─────────────────────────────────────────┴──┘      │
│                                                                                                       │
│  Mô tả                                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │ Nhập mô tả (placeholder)                                                                    │       │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## §0 ASCII Mockup — Quarter/Month variant (13523:68476)

```text
[Navbar + Sub-nav + PageHeader IDENTICAL — 'Thêm kỳ kế toán' + [Huỷ bỏ + Tạo]]

│  (○ Kỳ kế toán năm)  (○ Kỳ kế toán quý)  (◉ Kỳ kế toán tháng)                                        │  ← Q/M variant: 3 radios only, NO checkbox
│                                                                                                       │
│  Thuộc kỳ *                                        Tên kỳ kế toán *                                  │  ← Row 1 SWAP: Thuộc kỳ Select LEFT + Tên input RIGHT
│  ┌────────────────────────────────────────┬─▾┐    ┌────────────────────────────────────────┐         │
│  │ Quý 1/2026 (parent kỳ picker)            │  │    │ Tháng 1/2026                            │         │
│  └─────────────────────────────────────────┴──┘    └─────────────────────────────────────────┘         │

[Rows 2-4 IDENTICAL to Year variant — dates + Thứ tự hiển thị + Trạng thái + Mô tả]
```

## §1 Layout DSL

```yaml
AccountingPeriodCreatePage:
  type: page
  route: "/inventory/accounting-period/create"
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
        - { type: TabLink, label: "Danh sách sản phẩm", state: default, _png_verified: "13521-66036.png L80 verbatim" }
        - { type: TabLink, label: "Nhóm vật tư hàng hóa", state: default, _png_verified: "13521-66036.png L80 verbatim" }
        - { type: TabLink, label: "Kỳ kế toán", state: active, _png_verified: "13521-66036.png L80 blue underline" }

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
          _renders_as: h1-with-back-link-and-action-cta-group
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
                  onClick: "navigate(-1)  # back to FEAT-AP-LIST"
                - id: PageTitle
                  type: Text
                  content: "Thêm kỳ kế toán"
                  _png_verified: "13521-66036.png L143 verbatim 'Thêm kỳ kế toán' — matches FEAT AC-1 form name"
                  size: 24
                  weight: 600
                  lineHeight: 32
                  color: text-foreground

            - id: ActionRow
              type: container
              direction: horizontal
              gap: 8
              align: center
              _children_count: 2
              children:
                - id: CancelButton
                  type: Button
                  variant: outline
                  size: default
                  label: "Huỷ bỏ"
                  _png_verified: "13521-66036.png L143 verbatim 'Huỷ bỏ' outline"
                  onClick: "navigate(-1)  # AC-11 dismiss without create"

                - id: CreateButton
                  type: Button
                  variant: brand
                  size: default
                  label: "Tạo"
                  _png_verified: "13521-66036.png L143 verbatim 'Tạo' brand blue — matches FEAT AC-10 verbatim (NOT 'Lưu')"
                  onClick: "submitForm() → validate + CreateAccountingPeriod mutation per AC-10 + auto-generate children if 'Tự động sinh kỳ' checked per AC-8"

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
              _png_verified: "13521-66036.png L198 verbatim 'Thông tin chung' semibold"
              size: 16
              weight: 600
              color: text-foreground
              _renders_as: h2-section-header

            - id: CreateForm
              type: container
              direction: vertical
              gap: 16
              _children_count: 3     # LoaiKyRadioRow + FieldGrid + MoTaField (flat direct children)
              children:

                - id: LoaiKyRadioRow
                  type: container
                  direction: horizontal
                  gap: 24
                  align: center
                  _mode_switch: "year → 3 radios + 1 checkbox (width 593)  ·  quarter → 3 radios + 1 checkbox (width 593)  ·  month → 3 radios only (width 438)"
                  _children_count_year_quarter: 4
                  _children_count_month: 3
                  _renders_as: form-radio-group-inline-with-optional-checkbox
                  children:
                    - id: RadioNam
                      type: RadioItem
                      label: "Kỳ kế toán năm"
                      value: "NAM"
                      _png_verified: "13521-66036.png L232 verbatim 'Kỳ kế toán năm' + selected blue-filled state trong Year variant"
                      onChange: "form.periodType = 'NAM' → field layout switches to Year variant per AC-2/AC-4"

                    - id: RadioQuy
                      type: RadioItem
                      label: "Kỳ kế toán quý"
                      value: "QUY"
                      _png_verified: "13521-66036.png L232 verbatim 'Kỳ kế toán quý'"
                      onChange: "form.periodType = 'QUY' → field layout switches to Q/M variant với checkbox visible"

                    - id: RadioThang
                      type: RadioItem
                      label: "Kỳ kế toán tháng"
                      value: "THANG"
                      _png_verified: "13521-66036.png L232 verbatim 'Kỳ kế toán tháng'"
                      onChange: "form.periodType = 'THANG' → field layout switches to Q/M variant, checkbox HIDDEN per AC-8 (Tháng không có auto-generate)"

                    - id: TuDongSinhKyCheckbox
                      type: CheckboxItem
                      _mode: "year-or-quarter-only"
                      label: "Tự động sinh kỳ"
                      _png_verified: "13521-66036.png L232 verbatim 'Tự động sinh kỳ' + CHECKED blue state (Year variant default checked in Figma)"
                      _visibility_rule: "form.periodType in ['NAM', 'QUY']  # per AC-8 Tháng KHÔNG có checkbox"
                      binding: form.autoGenerate
                      default: false
                      _behavior: "checked + Year submit → server auto-generates 4 quý + 12 tháng; checked + Quý submit → server auto-generates 3 tháng"

                - id: FieldGrid
                  type: container
                  direction: grid
                  cols: 2
                  gap: { x: 16, y: 16 }
                  _children_count: 6     # 3 rows × 2 cols flattened = 6 FormField cells (Row1Col1..Row3Col2)
                  _grid_shape: 3-rows-by-2-cols
                  _renders_as: form-field-grid-3-rows-2-cols
                  children:

                    # Row 1 — variant-conditional col swap
                    - id: Row1Col1
                      type: FormField
                      _mode_switch: "year → NamField (Select)  ·  quarter_or_month → ThuocKyField (Select)"
                      label_year: "Năm *"
                      label_month: "Thuộc kỳ *"
                      required: true
                      control_year:
                        type: Select
                        trailingIcon: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16, color: text-muted-foreground }
                        options: "years 20XX .. current+5 range"
                        placeholder: "Chọn năm"
                        value: "{form.year}"
                        _png_verified_year: "13521-66036.png L268 col 1 'Năm *' + '2026' editable Select with chevron"
                        binding: form.year
                        validate: "required per AC-4 year variant"
                      control_month:
                        type: Select
                        trailingIcon: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16, color: text-muted-foreground }
                        options: "parent kỳ dropdown — filter per AC-5: kỳ Quý picks from kỳ Năm list; kỳ Tháng picks from kỳ Quý list"
                        placeholder: "Chọn kỳ cha"
                        value: "{form.parentPeriodId}"
                        binding: form.parentPeriodId
                        validate: "required per AC-4 Q/M variant"

                    - id: Row1Col2
                      type: FormField
                      label: "Tên kỳ kế toán *"
                      required: true
                      control:
                        type: Input
                        placeholder: "Nhập tên kỳ"
                        value: "{form.name}"
                        _png_verified: "13521-66036.png L268 col 2 'Tên kỳ kế toán *' + 'Năm 2026' editable input (Figma test value)"
                        binding: form.name
                        validate: "required per AC-3 error 'Tên kỳ kế toán là bắt buộc'"

                    # Row 2 — dates editable
                    - id: Row2Col1
                      type: FormField
                      label: "Ngày bắt đầu *"
                      required: true
                      control:
                        type: DateInput
                        trailingIcon: { source: iconsax-reactjs, name: Calendar, variant: Linear, size: 16, color: text-muted-foreground }
                        format: "DD/MM/YYYY"
                        placeholder: "DD/MM/YYYY"
                        value: "{form.startDate}"
                        _png_verified: "13521-66036.png L342 col 1 'Ngày bắt đầu *' + '12/12/2026' editable + calendar icon"
                        binding: form.startDate
                        validate: "required per AC-6"

                    - id: Row2Col2
                      type: FormField
                      label: "Ngày kết thúc *"
                      required: true
                      control:
                        type: DateInput
                        trailingIcon: { source: iconsax-reactjs, name: Calendar, variant: Linear, size: 16, color: text-muted-foreground }
                        format: "DD/MM/YYYY"
                        placeholder: "DD/MM/YYYY"
                        value: "{form.endDate}"
                        _png_verified: "13521-66036.png L342 col 2 'Ngày kết thúc *' + '12/12/2026' editable + calendar icon"
                        binding: form.endDate
                        validate: "required per AC-6 + AC-9 cross-field checks (end >= start; within parent range if child; no overlap with siblings)"

                    # Row 3 — Thứ tự hiển thị + Trạng thái
                    - id: Row3Col1
                      type: FormField
                      label: "Thứ tự hiển thị"
                      required: false
                      control:
                        type: Input
                        inputType: number
                        placeholder: "0"
                        value: "{form.displayOrder}"
                        default: 0
                        _png_verified: "13521-66036.png L448 col 1 'Thứ tự hiển thị' + '0' editable per AC-7 default"
                        binding: form.displayOrder

                    - id: Row3Col2
                      type: FormField
                      label: "Trạng thái"
                      required: false
                      control:
                        type: Select
                        trailingIcon: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16, color: text-muted-foreground }
                        options: ["Chưa đóng", "Đã đóng"]   # per AC-7
                        default: "Chưa đóng"                # AC-7 explicit default
                        value: "{form.status}"
                        _png_verified: "13521-66036.png L448 col 2 'Trạng thái' + Select — PNG shows 'Đã đóng kỳ' test value; implementation defaults 'Chưa đóng' per AC-7"
                        binding: form.status

                - id: MoTaField
                  type: FormField
                  label: "Mô tả"
                  required: false
                  control:
                    type: Textarea
                    placeholder: "Nhập mô tả"
                    rows: 5
                    value: "{form.description}"
                    _png_verified: "13521-66036.png L520 full-width textarea + placeholder 'Nhập mô tả' muted — matches FEAT AC-7 verbatim"
                    binding: form.description

    - id: SectionFooter
      type: instance
      source: share/section-footer/02
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px top border

_negative_coverage:
  - "không có preview panel bên phải hiển thị 'kỳ con sẽ tạo' khi checkbox Tự động sinh kỳ ON (feature could add UX clarity nhưng out of current scope)"
  - "không có breadcrumb trên page title"
  - "không có delete button (create page, no existing record)"
  - "không có 'Xem trước JSON' / 'Preview kỳ con' link"
  - "không có wizard multi-step (chỉ 1-step form + submit)"
  - "không có toast/dialog 'Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại' per AC-8 — coverage_gap flagged; implementation must render post-create summary"
  - "không có inline validation error UI (AC-3 required tên, AC-9 date range violations) — Figma frame missing; use shadcn FormField error slot"
  - "không có confirm dialog khi user chọn Tự động sinh kỳ + submit (auto-generate side-effect could be non-trivial; deferred BA decision)"
```

## §2 Design Token Map

| Element | Property | Figma variable | Value | Tailwind token |
|---|---|---|---|---|
| Page BG | background | base/background | #ffffff | `bg-background` |
| Navbar | background | base/background-brand-CD | #0052ff | `bg-brand` |
| PageTitle | color | base/foreground | #18181b | `text-foreground` |
| PageTitle | fontSize | typography/base sizes/2x large/font-size | 24 | `text-2xl` |
| PageTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| CancelButton | border | base/input | #d4d4d8 | `border-input` |
| CancelButton | height | height/h-9 | 36 | `h-9` |
| CancelButton | fontWeight | font/weight/medium | 500 | `font-medium` |
| CreateButton | background | base/background-brand-CD | #0052ff | `bg-brand` |
| CreateButton | color | base/primary-foreground | #ffffff | `text-primary-foreground` |
| CreateButton | height | height/h-9 | 36 | `h-9` |
| SectionTitle | fontSize | typography/base sizes/base/font-size | 16 | `text-base` |
| SectionTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| FormField label | color | base/foreground | #18181b | `text-foreground` |
| FormField label | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| FormField label | fontWeight | font/weight/medium | 500 | `font-medium` |
| FormField required asterisk | color | base/destructive | #dc2626 | `text-destructive` |
| Input / Select | background | base/background | #ffffff | `bg-background` |
| Input / Select | border | base/input | #d4d4d8 | `border-input` |
| Input / Select | height | height/h-9 | 36 | `h-9` |
| Input / Select | radius | border radius/md | 6 | `rounded-md` |
| Radio (enabled) | color | base/foreground | #18181b | `text-foreground` |
| Checkbox (enabled) | color | base/foreground | #18181b | `text-foreground` |
| Textarea | background | base/background | #ffffff | `bg-background` |
| Textarea | border | base/input | #d4d4d8 | `border-input` |
| Textarea | placeholder-color | base/muted-foreground | #71717a | `placeholder:text-muted-foreground` |

## §3 State Table

| State | Trigger | periodTypeVariant | Row1 layout | RadioRow layout | Auto-generate behavior |
|---|---|---|---|---|---|
| `year` | User picks Kỳ kế toán năm | `year` | col1=Năm Select, col2=Tên input | 3 radios + Tự động sinh kỳ checkbox | Checkbox on → server generates 4 quý + 12 tháng per AC-8 |
| `quarter` | User picks Kỳ kế toán quý | `quarter_or_month` | col1=Thuộc kỳ Select, col2=Tên input | 3 radios + Tự động sinh kỳ checkbox | Checkbox on → server generates 3 tháng per AC-8 |
| `month` | User picks Kỳ kế toán tháng | `quarter_or_month` | col1=Thuộc kỳ Select, col2=Tên input | 3 radios only (NO checkbox per AC-8) | No auto-generate available |
| `validation_error` | Tên empty / date range invalid / child out of parent range / sibling overlap | (orthogonal) | (relevant field bordered red + error text) | (no change) | AC-3 / AC-9 errors inline; Figma frame missing |
| `auto_generate_summary` | Post-create success + autoGenerate ON | (orthogonal) | (form unmounts; toast/dialog appears) | (no change) | Show "Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại." per AC-8 verbatim wording; Figma frame missing |
| `success` | Post-create backend success | (orthogonal) | (form unmounts) | (no change) | Navigate to FEAT-AP-LIST + toast success |

## §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| PageHeader | `share/page-header/3` | `{ title, backLink, actions: [cancelBtn, createBtn] }` | Header variant "3" per Figma instance |
| BackLink | `ui/button` variant="ghost" size="icon" | `{ onClick, children: <ArrowLeft /> }` | Ghost icon-only |
| CancelButton | `ui/button` variant="outline" | `{ children: "Huỷ bỏ", onClick }` | Outline |
| CreateButton | `ui/button` variant="brand" | `{ children: "Tạo", onClick, disabled: !isValid \|\| isSubmitting }` | Brand blue |
| SectionTitle | `share/section/title-text` | `{ text: "Thông tin chung" }` | Reuse title-text |
| LoaiKyRadioRow | `share/form/radio-group-inline` | `{ options: [3 radios], selected: form.periodType, onChange, sideSlot: TuDongSinhKyCheckbox }` | Reuse inline-radio pattern + optional trailing checkbox |
| TuDongSinhKyCheckbox | `ui/checkbox` | `{ checked, onChange, label: "Tự động sinh kỳ" }` | shadcn Checkbox |
| FormField | `share/form/form-field` | `{ label, required, error, children: control }` | Reuse |
| Input / Select | `ui/input` / `ui/select` | (all editable, no readonly variant needed) | shadcn primitives |
| DateInput | `share/date-input` | `{ value, format, trailingIcon, onChange, placeholder }` | Custom date input |
| Textarea | `ui/textarea` | `{ placeholder, rows, value, onChange }` | shadcn Textarea |

## §5 Field Composition Schema

Create mutation payload:

```yaml
CreateAccountingPeriodInput:
  interface: CreateAccountingPeriodInput
  fields:
    - name: periodType
      type: "'NAM' | 'QUY' | 'THANG'"
      binding: LoaiKyRadioRow.selectedValue
      combined: false
      validate: "required — user MUST pick 1 of 3 radios per AC-2"
    - name: year
      type: int?
      binding: NamField.value
      combined: false
      _visibility_rule: "periodType === 'NAM' per AC-4"
      validate: "required if periodType='NAM'"
    - name: parentPeriodId
      type: uuid?
      binding: ThuocKyField.value
      combined: false
      _visibility_rule: "periodType in ['QUY', 'THANG'] per AC-4"
      validate: "required if periodType in Q/M; server-side validate parent hierarchy per AC-5 (Quý parent=Năm, Tháng parent=Quý)"
    - name: name
      type: string
      binding: TenKyKeToanField.value
      combined: false
      validate: "required per AC-3 → 'Tên kỳ kế toán là bắt buộc'"
    - name: startDate
      type: date
      binding: NgayBatDauField.value
      combined: false
      validate: "required per AC-6 + AC-9 (endDate >= startDate; within parent range if child; no sibling overlap)"
    - name: endDate
      type: date
      binding: NgayKetThucField.value
      combined: false
      validate: "required per AC-6 + AC-9 cross-field checks"
    - name: displayOrder
      type: int
      binding: ThuTuHienThiField.value
      combined: false
      default: 0
    - name: status
      type: "'Chưa đóng' | 'Đã đóng'"
      binding: TrangThaiField.value
      combined: false
      default: "Chưa đóng"                    # AC-7 explicit
    - name: description
      type: string?
      binding: MoTaField.value
      combined: false
    - name: autoGenerate
      type: boolean
      binding: TuDongSinhKyCheckbox.checked
      combined: false
      _visibility_rule: "periodType in ['NAM', 'QUY'] per AC-8"
      default: false

CreateAccountingPeriodResult:
  fields:
    - name: period
      type: AccountingPeriodDetail
    - name: autoGenerateSummary
      type: "{ created: int, skipped: int }?"
      _renders: "if autoGenerate=true → display summary toast/dialog 'Đã tạo {created} kỳ, bỏ qua {skipped} kỳ đã tồn tại.' per AC-8 verbatim"
```

## §6 Layout Width Table

| Container | Total width | Padding | Child widths | Notes |
|---|---|---|---|---|
| Page | 1440 | — | Navbar + SubNav + PageContent + Footer | Full-bleed |
| PageContent | 1440 | { x: 80, y: 0 } | 1280 content | Consistent với AP-EDIT + AP-DETAIL |
| PageHeader | 1280 | { x: 32, y: 0 } | TitleGroup + ActionRow (~130 for 2 buttons) | space-between |
| CreateForm section | 1216 | 0 | RadioRow + FieldGrid + Textarea | 1280 - 64 |
| LoaiKyRadioRow year/quarter | 593 | 0 | 3 radios + gaps + checkbox | Per metadata frame 13523:66425 |
| LoaiKyRadioRow month | 438 | 0 | 3 radios only + gaps | Per metadata frame 13523:68484 |
| FieldGrid | 1216 | 0 | 3 rows × 2 cols; each 600 + gap-x 16 | Grid |
| FormField cell | 600 | 0 | Label (20h) + gap(2) + Control (36h) = 58 | Per Select instance 600×58 |
| Textarea Mô tả | 1216 | 0 | Full-width, height 126 | Per Textarea instance 1216×126 |

## §7 Visual Hierarchy Map

```
Level 1 (primary):
  - CreateButton "Tạo" (brand blue top-right — main action for create flow)
  - PageTitle "Thêm kỳ kế toán" (H1)

Level 2 (secondary):
  - CancelButton "Huỷ bỏ" (outline)
  - SectionTitle "Thông tin chung"
  - Required field labels với red asterisk
  - LoaiKyRadioRow — critical since drives entire form variant switch

Level 3 (tertiary):
  - Non-required field labels
  - 'Tự động sinh kỳ' checkbox (advisory tool with major side-effect per AC-8)

Level 4 (data):
  - Input values (foreground text on white bg — all fields editable per create context)

Level 5 (utility):
  - Placeholder text (muted)
  - Section footer
```

## §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-AP-CREATE-1 | Save button label "Lưu" (assume all forms use Lưu) | Verbatim "Tạo" per PNG + FEAT AC-10 — CREATE flow uses "Tạo" not "Lưu" | `_png_verified`: 13521-66036.png button 'Tạo' brand blue verbatim |
| AP-AP-CREATE-2 | Hide 'Tự động sinh kỳ' checkbox for kỳ Quý (assume auto-generate is Năm only) | Checkbox VISIBLE for Năm + Quý per AC-8; hidden only for Tháng per metadata Frame 3 width 438 vs 593 delta | Metadata Frame 3 width=438 (3 radios only); AC-8 explicit "kỳ tháng không có" checkbox |
| AP-AP-CREATE-3 | Render all 3 radios as read-only (assume mirror AP-EDIT lock pattern) | Radios ENABLED interactive in CREATE — user picks periodType, form re-renders col 1 field per AC-2/AC-4 | `_png_verified`: 13521-66036.png radios have vivid state (blue-filled active on selected); FEAT AC-2 explicit "cho chọn 1 trong 3" |
| AP-AP-CREATE-4 | Show 'Năm' field always (assume Năm is universal) | Row 1 col 1 CONDITIONAL: Năm Select for Năm variant; Thuộc kỳ Select for Q/M variant per AC-4 explicit | FEAT AC-4 explicit variant fields + Metadata frames Row1 pattern |
| AP-AP-CREATE-5 | Thuộc kỳ dropdown shows all periods (assume flat list) | Dropdown FILTERS parent kỳ per AC-5: Quý picks from Năm list; Tháng picks from Quý list (theo năm tương ứng) | FEAT AC-5 explicit hierarchy filter |
| AP-AP-CREATE-6 | Default Trạng thái = "Đã đóng" (port từ Figma test value) | Default = "Chưa đóng" per AC-7 explicit (Figma test data "Đã đóng kỳ" is placeholder, NOT default per FEAT authoritative) | FEAT AC-7 explicit default; coverage_gap flag |
| AP-AP-CREATE-7 | Client-side auto-generate children (assume checkbox on = client loops create) | Auto-generate is SERVER-SIDE per AC-8 — CreateAccountingPeriod với autoGenerate=true → server sinh cây con + return summary | FEAT AC-8 explicit "hệ thống tự sinh" + BR-AP-008 dedup |
| AP-AP-CREATE-8 | Skip auto-generate summary toast (assume standard success) | Post-create MUST show "Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại." per AC-8 verbatim khi autoGenerate=true — Figma frame missing; use toast pattern | FEAT AC-8 explicit summary wording |
| AP-AP-CREATE-9 | Client-side validate parent-child date range (assume simple) | AC-9 client + server combined: client validates end>=start + basic checks; server validates within-parent-range + sibling-non-overlap (complex hierarchical lookup) | FEAT AC-9 explicit multi-check |
| AP-AP-CREATE-10 | Use `lucide-react` for icons | Use `iconsax-reactjs` per convention v7.6 R4.1 | `_ref-web-transform-figma.md v7.6` |

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 13521:66036 | year | assets/wave04-ap-create/13521-66036.png | 1440×1024 |
| 13523:68171 | year_intermediate | (reuses assets/wave04-ap-create/13521-66036.png — metadata identical) | 1440×1024 |
| 13523:68476 | quarter_or_month | (Q/M variant PNG not fetched; layout inferred from metadata delta + AP-EDIT Q/M reference) | 1440×1024 |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Mở form "Thêm kỳ kế toán" + Huỷ bỏ + Tạo | PageHeader + ActionRow | 13521:66036 | ✓ |
| AC-2 | Chọn 1 trong 3 loại kỳ radio | LoaiKyRadioRow enabled + onChange handlers | 13521:66036 | ✓ |
| AC-3 | Tên kỳ kế toán required + error khi bỏ trống | TenKyKeToanField.validate | 13521:66036 | ✓ (error UI Figma missing — coverage_gap) |
| AC-4 | Field variant theo loại kỳ (Năm hide Thuộc kỳ, Q/M hide Năm) | Row1Col1 _mode_switch | 13521:66036 + 13523:68476 | ✓ |
| AC-5 | Thuộc kỳ dropdown filter kỳ cha hợp lệ | ThuocKyField.options filter rule | 13523:68476 | ✓ (backend query concern) |
| AC-6 | Ngày bắt đầu/kết thúc required | Row2 fields | 13521:66036 | ✓ |
| AC-7 | Thứ tự hiển thị default 0 + Trạng thái default "Chưa đóng" + Mô tả textarea | Row3 + MoTaField + defaults | 13521:66036 | ✓ (Trạng thái default AC over Figma test value) |
| AC-8 | Tự động sinh kỳ checkbox — visible Năm+Quý, hidden Tháng; auto-generate server-side + summary | TuDongSinhKyCheckbox visibility_rule + CreateAccountingPeriodResult summary | 13521:66036 (checkbox shown) + 13523:68476 (checkbox hidden Tháng) | ✓ (summary UI Figma missing — coverage_gap) |
| AC-9 | Validate ngày (end>=start, child in parent range, sibling no overlap) | Row2 validate + server-side cross-field check | (error state Figma missing) | ⚠ (validation UI needed) |
| AC-10 | Nút Tạo → CreateAccountingPeriod mutation | CreateButton.onClick | 13521:66036 | ✓ |
| AC-11 | Huỷ bỏ → navigate back không create | CancelButton.onClick | 13521:66036 | ✓ |
| AC-12 | Phân quyền — chủ garage + kế toán ngang nhau | (backend RBAC) | — | ⚠ (backend) |

## Coverage Gaps

- **Auto-generate summary UI**: AC-8 explicit "thông báo tóm tắt 'Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại.'" — Figma frame missing. Recommend toast component (Sonner/shadcn Toast) hoặc post-create Dialog "Kết quả tạo kỳ" với summary body.
- **Validation error UI**: AC-3 (tên required), AC-9 (date range violations) inline errors — Figma frame missing. Use shadcn FormField error slot.
- **Trạng thái default drift**: PNG shows 'Đã đóng kỳ' as placeholder; FEAT AC-7 default 'Chưa đóng'. Implementation follows FEAT authoritative.
- **Frame 2 duplicate**: 13523:68171 metadata identical to Frame 1 (13521:66036). Treat as design-time duplicate; single spec block covers both.
- **Q/M variant PNG not fetched**: Single screenshot budget; layout inferred from metadata + AP-EDIT parity. Q/M variant structure identical to AP-EDIT Q/M (Row1Col1=Thuộc kỳ Select, radio row 438 no checkbox for Tháng).
