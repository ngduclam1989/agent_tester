---
feat: FEAT-AP-EDIT
feat_file: Product/features/FEAT-AP-EDIT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87554
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14146:87554"
fetched_at: "2026-07-08T03:52Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 3
status: ACTIVE
coverage_gaps:
  - "Figma emit 3 frames — Frame 1 (Year variant, has 'Năm' field + 'Tự động sinh kỳ' checkbox), Frame 2 (Q/M intermediate variant), Frame 3 (Q/M variant, has 'Thuộc kỳ' field + NO checkbox). Delta chỉ ở loại kỳ selected radio + col 1 row 1 field (Năm vs Thuộc kỳ) + checkbox visibility. Frame 2 metadata visually equal to Frame 3 → 2 PNGs cover 3 states."
  - "Figma không hiển thị inline error khi validate fail (vd 'Tên kỳ kế toán là bắt buộc' per AC-2). Implementation: shadcn FormField error slot dưới input khi bỏ trống + submit. AC-4 đóng kỳ + AC-5 mở lại kỳ trigger side-effects (chặn phiếu / mở khóa phiếu) — no UI feedback in edit form beyond toast success."
  - "'Trạng thái' Select dropdown chỉ có 2 options 'Chưa đóng' / 'Đã đóng' per AC-2; PNG shows 'Đã đóng kỳ' → verbatim option label có thể là 'Đã đóng kỳ' hoặc 'Đã đóng' (FEAT dùng 'Đã đóng'; PNG value 'Đã đóng kỳ' more descriptive). BA confirm exact wording khi ACTIVE."
---

# FEAT-AP-EDIT — Spec (web)

> Page-level edit form cho kỳ kế toán, trigger từ FEAT-AP-LIST icon Sửa hoặc FEAT-AP-DETAIL "Chỉnh sửa". 4 editable fields (Tên + Mô tả + Trạng thái + Thứ tự hiển thị) + 6 locked fields (Loại kỳ radios + Năm/Thuộc kỳ + Ngày bắt đầu + Ngày kết thúc + Tự động sinh kỳ). Include đóng/mở kỳ workflow qua Trạng thái Select.
>
> **Icon library**: `iconsax-reactjs` primary (v7.6). Icons: ArrowLeft (back), Calendar (date input trailing), ArrowDown (Select trailing).

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| icon/back-arrow | vuesax/linear/arrow-left | iconsax-reactjs | ArrowLeft | Linear | assets/wave04-ap-edit/13523-68781.png L143 back chevron ← left-most in header |
| icon/select-chevron | vuesax/linear/arrow-down | iconsax-reactjs | ArrowDown | Linear | assets/wave04-ap-edit/13523-68781.png L448 Trạng thái Select trailing chevron |
| icon/calendar | vuesax/linear/calendar | iconsax-reactjs | Calendar | Linear | assets/wave04-ap-edit/13523-68781.png L374 date inputs Ngày bắt đầu + Ngày kết thúc calendar glyph |

---

## Screen: Sửa Kỳ kế toán — Year variant (13523:68781)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Year variant** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. This Screen renders `periodTypeVariant: year` → Radio row shows 3 radios + 'Tự động sinh kỳ' checkbox; Row 1 col 1 = Năm field (readonly), col 2 = Tên kỳ kế toán (editable).
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
screenshot: assets/wave04-ap-edit/13523-68781.png
verified_at: "2026-07-08T03:53Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "PageHeader ← back + H1 'Sửa Kỳ kế toán' LEFT + [Huỷ bỏ outline + Lưu brand blue] top-right"
    status: ✓
    evidence: "13523-68781.png L143 shows [← Sửa Kỳ kế toán] + [Huỷ bỏ] + [Lưu] — verbatim FEAT AC-1 header composition"
  - claim: "Year variant Radio row shows 3 loại kỳ radios (Kỳ kế toán năm SELECTED filled) + 'Tự động sinh kỳ' checkbox CHECKED — all disabled per AC-3 locked field"
    status: ✓
    evidence: "13523-68781.png L232 radios have muted appearance (grey label, not vivid); checkbox has filled blue check but disabled state visual (per AC-3 explicit lock)"
  - claim: "Row 1 col 1 = 'Năm *' with value '2026' (grey bg readonly per AC-3); col 2 = 'Tên kỳ kế toán *' with value 'Năm 2026' (white bg editable per AC-2)"
    status: ✓
    evidence: "13523-68781.png L268 shows 2 inputs — LEFT '2026' in muted-bg + readonly; RIGHT 'Năm 2026' in white-bg + editable per AC-2/AC-3 distinction"
  - claim: "Ngày bắt đầu + Ngày kết thúc both readonly (grey bg) '12/12/2026' with calendar icon trailing per AC-3"
    status: ✓
    evidence: "13523-68781.png L342 both date fields muted-bg + calendar glyph trailing; disabled state per AC-3"
  - claim: "Trạng thái Select shows current value 'Đã đóng kỳ' with chevron — EDITABLE per AC-2 (can switch to 'Chưa đóng' for reopen per AC-5)"
    status: ✓
    evidence: "13523-68781.png L448 Trạng thái field has white bg + chevron indicator — editable Select not readonly"
  - claim: "Mô tả Textarea full-width with placeholder 'Nhập mô tả' — editable per AC-2"
    status: ✓
    evidence: "13523-68781.png L520 full-width textarea with placeholder text muted"
```

---

## Screen: Sửa Kỳ kế toán — Quarter/Month intermediate variant (13523:68806)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Quarter/Month variant** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. Frame 2 intermediate — visually equivalent to Frame 3 (Q/M variant); metadata identical except Page Header instance (variant "Page Header / 3" vs "Page Header / 4"). Reuse Frame 3 PNG for verification.
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
screenshot: assets/wave04-ap-edit/13523-68831.png
verified_at: "2026-07-08T03:53Z"
verifier: main-agent (prefetch-figma web 04)
note: "Frame 2 (13523:68806) is intermediate design frame — visually equivalent to Frame 3 (13523:68831) per metadata comparison. Delta only in Page Header instance variant selector. Reuse Frame 3 PNG for claims_verified."
claims_verified:
  - claim: "Q/M variant Radio row shows 3 loại kỳ radios (Kỳ kế toán tháng SELECTED filled trong Frame 3 sample) + NO checkbox (metadata width 438 vs 593 delta indicates absent)"
    status: ✓
    evidence: "13523-68831.png L232 shows 3 radios only, no checkbox on right; matches metadata Frame 3 radio group width 438 (3 radio × 130-137 + gaps)"
  - claim: "Q/M variant Row 1 col 1 = 'Tên kỳ kế toán *' editable + col 2 = 'Thuộc kỳ *' readonly — swap position từ Year variant"
    status: ✓
    evidence: "13523-68831.png L268 shows LEFT 'Tên kỳ kế toán' with 'Quý 1/2026' editable white-bg; RIGHT 'Thuộc kỳ' with 'Năm 2026' readonly muted-bg — reverse column pattern vs Year variant"
  - claim: "Rows 2-4 (dates, Thứ tự hiển thị + Trạng thái, Mô tả) IDENTICAL to Year variant"
    status: ✓
    evidence: "13523-68831.png L342/448/520 rows 2-4 pixel-identical layout with Year variant Frame 1"
```

---

## Screen: Sửa Kỳ kế toán — Quarter/Month final variant (13523:68831)

### §0 ASCII Mockup
> See file-level **§0 ASCII Mockup — Quarter/Month variant** below.
### §1 Layout DSL
> See file-level **§1 Layout DSL** below. Frame 3 canonical Q/M variant — identical to Frame 2 rendering.
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
screenshot: assets/wave04-ap-edit/13523-68831.png
verified_at: "2026-07-08T03:53Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Q/M variant rendering per Frame 3 canonical — same as Frame 2 intermediate"
    status: ✓
    evidence: "13523-68831.png identical rendering; Frame 2/3 delta only in metadata Page Header instance selector (Page Header / 4 both)"
  - claim: "Radio group width 438 (3 radios only, no checkbox) — signals Q/M variant hides 'Tự động sinh kỳ' checkbox per BR-AP-016 lock"
    status: ✓
    evidence: "metadata frame 13523:68839 width=438 matches 3-radio-only layout; Year Frame width=593 includes 4th checkbox element"
  - claim: "'Thuộc kỳ' field displays parent period name 'Năm 2026' — signals hierarchical period reference per FEAT AC-3 explicit"
    status: ✓
    evidence: "13523-68831.png L268 col 2 shows 'Thuộc kỳ *' label + 'Năm 2026' value — matches AC-3 lock rule 'Thuộc kỳ' cố định sau tạo"
```

---

# File-level shared sections

## §0 ASCII Mockup — Year variant (13523:68781)

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚗 GMS   Tổng quan   Mua hàng   Sửa chữa & Dịch vụ   Tồn kho   Khách hàng   Marketing   Nhân viên   [Danh mục]      🔔● 👤 │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Danh sách sản phẩm   Nhóm vật tư hàng hóa   [Kỳ kế toán]‾‾‾                                          │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  ← Sửa Kỳ kế toán                                                       [ Huỷ bỏ ]  [ Lưu ]           │
│                                                                                                       │
│  Thông tin chung                                                                                      │
│                                                                                                       │
│  (◉ Kỳ kế toán năm)  (○ Kỳ kế toán quý)  (○ Kỳ kế toán tháng)         [✓] Tự động sinh kỳ            │  ← Radio row + checkbox ALL disabled per AC-3
│                                                                                                       │
│  Năm *                                             Tên kỳ kế toán *                                  │  ← Row 1: Năm READONLY | Tên EDITABLE
│  ┌────────────────────────────────────────┐        ┌────────────────────────────────────────┐         │
│  │ 2026 (muted-bg readonly)                │        │ Năm 2026 (white-bg editable)            │         │
│  └─────────────────────────────────────────┘        └─────────────────────────────────────────┘         │
│                                                                                                       │
│  Ngày bắt đầu *                                    Ngày kết thúc *                                   │  ← Row 2: both READONLY
│  ┌───────────────────────────────────────┬📅┐      ┌───────────────────────────────────────┬📅┐       │
│  │ 12/12/2026 (muted)                     │  │      │ 12/12/2026 (muted)                     │  │       │
│  └────────────────────────────────────────┴──┘      └────────────────────────────────────────┴──┘       │
│                                                                                                       │
│  Thứ tự hiển thị                                   Trạng thái                                        │  ← Row 3: both EDITABLE
│  ┌────────────────────────────────────────┐        ┌────────────────────────────────────────┬─▾┐      │
│  │ 0                                       │        │ Đã đóng kỳ                              │  │      │
│  └─────────────────────────────────────────┘        └─────────────────────────────────────────┴──┘      │
│                                                                                                       │
│  Mô tả                                                                                                │  ← Row 4: EDITABLE full-width
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐       │
│  │ Nhập mô tả (placeholder muted)                                                              │       │
│  │                                                                                             │       │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                       │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0     Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## §0 ASCII Mockup — Quarter/Month variant (13523:68831)

```text
[Navbar + Sub-nav + PageHeader IDENTICAL to Year variant]

│  (○ Kỳ kế toán năm)  (○ Kỳ kế toán quý)  (◉ Kỳ kế toán tháng)                                        │  ← 3 radios only, NO checkbox (width 438)
│                                                                                                       │
│  Tên kỳ kế toán *                                  Thuộc kỳ *                                        │  ← Row 1: Tên EDITABLE | Thuộc kỳ READONLY (SWAP vs Year variant col order)
│  ┌────────────────────────────────────────┐        ┌────────────────────────────────────────┐         │
│  │ Quý 1/2026 (editable)                   │        │ Năm 2026 (muted-bg readonly)            │         │
│  └─────────────────────────────────────────┘        └─────────────────────────────────────────┘         │

[Rows 2-4 IDENTICAL to Year variant — Ngày bắt đầu/kết thúc readonly; Thứ tự hiển thị + Trạng thái editable; Mô tả textarea]
```

## §1 Layout DSL

```yaml
AccountingPeriodEditPage:
  type: page
  route: "/inventory/accounting-period/edit/:id"
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
      _png_verified: "13523-68781.png navbar identical to FEAT-AP-DETAIL"

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
        - { type: TabLink, label: "Danh sách sản phẩm", state: default, _png_verified: "13523-68781.png L80 verbatim" }
        - { type: TabLink, label: "Nhóm vật tư hàng hóa", state: default, _png_verified: "13523-68781.png L80 verbatim" }
        - { type: TabLink, label: "Kỳ kế toán", state: active, activeUnderlineColor: "#0052ff", _png_verified: "13523-68781.png L80 blue underline" }

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
                  onClick: "navigate(-1)  # back to prior detail/list per AC-7 behavior"
                  _renders_as: back-navigation-icon-button
                  _png_verified: "13523-68781.png L143 back chevron"
                - id: PageTitle
                  type: Text
                  content: "Sửa Kỳ kế toán"
                  _png_verified: "13523-68781.png L143 verbatim 'Sửa Kỳ kế toán' — matches FEAT AC-1 form name"
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
                  _png_verified: "13523-68781.png L143 verbatim 'Huỷ bỏ' outline — matches FEAT AC-7 verbatim"
                  onClick: "navigate(-1)  # AC-7 dismiss without save"

                - id: SaveButton
                  type: Button
                  variant: brand
                  size: default
                  label: "Lưu"
                  _png_verified: "13523-68781.png L143 verbatim 'Lưu' brand blue — matches FEAT AC-6"
                  onClick: "submitForm() → validate + UpdateAccountingPeriod mutation + SetAccountingPeriodStatus if trạng thái changed per AC-4/AC-5"

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
              _png_verified: "13523-68781.png L198 verbatim 'Thông tin chung' semibold — matches FEAT AC-1 section name"
              size: 16
              weight: 600
              color: text-foreground
              _renders_as: h2-section-header

            - id: EditForm
              type: container
              direction: vertical
              gap: 16
              _children_count: 3      # LoaiKyRadioRow + FieldGrid + MoTaField (flat direct children)
              children:

                - id: LoaiKyRadioRow
                  type: container
                  direction: horizontal
                  gap: 24
                  align: center
                  _mode_switch: "year → 3 radios + 1 checkbox (width 593)  ·  quarter_or_month → 3 radios only (width 438), NO checkbox"
                  _children_count_year: 4
                  _children_count_month: 3
                  disabled: true          # AC-3 explicit lock
                  children:
                    - id: RadioNam
                      type: RadioItem
                      label: "Kỳ kế toán năm"
                      value: "NAM"
                      _png_verified: "13523-68781.png L232 verbatim 'Kỳ kế toán năm' label"
                      disabled: true
                      _mode_selected: "year → selected filled  ·  quarter_or_month → unselected"

                    - id: RadioQuy
                      type: RadioItem
                      label: "Kỳ kế toán quý"
                      value: "QUY"
                      _png_verified: "13523-68781.png L232 verbatim 'Kỳ kế toán quý'"
                      disabled: true

                    - id: RadioThang
                      type: RadioItem
                      label: "Kỳ kế toán tháng"
                      value: "THANG"
                      _png_verified: "13523-68831.png L232 verbatim 'Kỳ kế toán tháng' + selected filled state trong Q/M frame"
                      disabled: true

                    - id: TuDongSinhKyCheckbox
                      type: CheckboxItem
                      _mode: year-only
                      label: "Tự động sinh kỳ"
                      _png_verified_year: "13523-68781.png L232 verbatim 'Tự động sinh kỳ' + checkbox CHECKED disabled state"
                      _visibility_rule: "periodTypeVariant === 'year'  # per BR-AP-016 auto-generate applies to Năm only"
                      disabled: true
                      value: "boolean readonly display of period.autoGenerate"

                - id: FieldGrid
                  type: container
                  direction: grid
                  cols: 2
                  gap: { x: 16, y: 16 }
                  _children_count: 6        # 3 rows × 2 cols flattened = 6 FormField cells (Row1Col1..Row3Col2)
                  _grid_shape: 3-rows-by-2-cols
                  _renders_as: form-field-grid-3-rows-2-cols
                  children:

                    # Row 1 — variant-conditional col swap (Năm vs Thuộc kỳ + Tên position)
                    - id: Row1Col1
                      type: FormField
                      _mode_switch: "year → NamField (readonly)  ·  quarter_or_month → TenKyKeToanField (editable, position col 1)"
                      label_year: "Năm *"
                      label_month: "Tên kỳ kế toán *"
                      required: true
                      control_year:
                        type: Input
                        readonly: true
                        BG: bg-muted            # base/muted grey signal disabled
                        value: "{period.year}"
                        _png_verified_year: "13523-68781.png L268 col 1 shows 'Năm *' + '2026' muted-bg readonly"
                      control_month:
                        type: Input
                        placeholder: "Nhập tên kỳ"
                        _placeholder_source: "spec-authored default — PNGs show pre-filled values ('Quý 1/2026', 'Năm 2026'), placeholder not visible in Figma; wording default consistent với FEAT AC-3 empty state error 'Tên kỳ kế toán là bắt buộc'"
                        value: "{form.name}"
                        _png_verified_month: "13523-68831.png L268 col 1 shows 'Tên kỳ kế toán *' + 'Quý 1/2026' editable white-bg"
                        binding: form.name
                        validate: "required per AC-2 error 'Tên kỳ kế toán là bắt buộc'"

                    - id: Row1Col2
                      type: FormField
                      _mode_switch: "year → TenKyKeToanField (editable, position col 2)  ·  quarter_or_month → ThuocKyField (readonly)"
                      label_year: "Tên kỳ kế toán *"
                      label_month: "Thuộc kỳ *"
                      required: true
                      control_year:
                        type: Input
                        placeholder: "Nhập tên kỳ"
                        _placeholder_source: "spec-authored default — PNG pre-filled ('Năm 2026'), placeholder not visible in Figma"
                        value: "{form.name}"
                        _png_verified_year: "13523-68781.png L268 col 2 shows 'Tên kỳ kế toán *' + 'Năm 2026' editable white-bg"
                        binding: form.name
                        validate: "required per AC-2 error 'Tên kỳ kế toán là bắt buộc'"
                      control_month:
                        type: Input
                        readonly: true
                        BG: bg-muted
                        value: "{period.parentPeriod.displayName}"
                        _png_verified_month: "13523-68831.png L268 col 2 shows 'Thuộc kỳ *' + 'Năm 2026' muted-bg readonly"

                    # Row 2 — dates readonly (identical both variants per AC-3)
                    - id: Row2Col1
                      type: FormField
                      label: "Ngày bắt đầu *"
                      required: true
                      control:
                        type: DateInput
                        readonly: true
                        BG: bg-muted
                        trailingIcon: { source: iconsax-reactjs, name: Calendar, variant: Linear, size: 16, color: text-muted-foreground }
                        format: "DD/MM/YYYY"
                        value: "{period.startDate}"
                        _png_verified: "13523-68781.png L342 col 1 'Ngày bắt đầu *' + '12/12/2026' muted-bg + calendar icon"
                      disabled: true

                    - id: Row2Col2
                      type: FormField
                      label: "Ngày kết thúc *"
                      required: true
                      control:
                        type: DateInput
                        readonly: true
                        BG: bg-muted
                        trailingIcon: { source: iconsax-reactjs, name: Calendar, variant: Linear, size: 16, color: text-muted-foreground }
                        format: "DD/MM/YYYY"
                        value: "{period.endDate}"
                        _png_verified: "13523-68781.png L342 col 2 'Ngày kết thúc *' + '12/12/2026' muted-bg + calendar icon"
                      disabled: true

                    # Row 3 — Thứ tự hiển thị + Trạng thái (both editable)
                    - id: Row3Col1
                      type: FormField
                      label: "Thứ tự hiển thị"
                      required: false
                      control:
                        type: Input
                        inputType: number
                        placeholder: "0"
                        value: "{form.displayOrder}"
                        _png_verified: "13523-68781.png L448 col 1 'Thứ tự hiển thị' + '0' editable"
                        binding: form.displayOrder

                    - id: Row3Col2
                      type: FormField
                      label: "Trạng thái"
                      required: false
                      control:
                        type: Select
                        trailingIcon: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16, color: text-muted-foreground }
                        options: ["Chưa đóng", "Đã đóng"]   # per AC-2 explicit
                        value: "{form.status}"
                        _png_verified: "13523-68781.png L448 col 2 'Trạng thái' + 'Đã đóng kỳ' editable Select with chevron"
                        _wording_note: "Figma value 'Đã đóng kỳ' (3 chữ) may map to option 'Đã đóng' (2 chữ) per AC-2 — coverage_gaps flag; BA confirm exact option wording"
                        binding: form.status
                        onChange: |
                          "if newValue !== oldValue: trigger SetAccountingPeriodStatus mutation per AC-4 (closing) or AC-5 (reopening).
                          Đóng kỳ side-effect: chặn thêm/sửa/xóa phiếu nhập/xuất có ngày chứng từ thuộc kỳ (per EP-INVENTORY-RECEIPT-V2/DELIVERY-V2).
                          Mở lại kỳ side-effect: bỏ khóa, phiếu thao tác lại được; user MUST tự chạy FEAT-PRC-RECALC nếu sửa phiếu sau khi mở lại per AC-5 explicit."

                - id: MoTaField
                  type: FormField
                  label: "Mô tả"
                  required: false
                  control:
                    type: Textarea
                    placeholder: "Nhập mô tả"
                    rows: 5
                    value: "{form.description}"
                    _png_verified: "13523-68781.png L520 full-width textarea with placeholder 'Nhập mô tả' muted"
                    binding: form.description

    - id: SectionFooter
      type: instance
      source: share/section-footer/02
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px top border

_negative_coverage:
  - "không có nút 'Đóng kỳ' / 'Mở lại kỳ' riêng — action đóng/mở qua Trạng thái Select value change per AC-4/AC-5 (unified into Save flow)"
  - "không có confirm dialog khi đổi Trạng thái Đã đóng → Chưa đóng (AC-5 mở lại) — chỉ Save flow submit; nếu BA muốn confirm phải thêm dialog trước submit"
  - "không có warning banner 'Sau khi mở lại kỳ, phải tự chạy RECALC' — AC-5 explicit side-effect chỉ documented, không surface trong form UI"
  - "không có breadcrumb trên page title"
  - "không có 'Xóa kỳ' button trong edit form (delete flow riêng qua FEAT-AP-DELETE)"
  - "không có kỳ-parent-lookup nếu Thuộc kỳ bị đóng (edge case: user đóng kỳ cha khiến all children readonly Thuộc kỳ vẫn hiển thị parent name)"
  - "không có audit trail preview trong edit form (Ngày sửa/Người sửa updates on Save per AC-6 — visible only ở FEAT-AP-DETAIL post-save)"
  - "không có inline validation error UI (chỉ toast/dialog on save fail); shadcn FormField error slot pattern applies but no PNG frame"
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
| SaveButton | background | base/background-brand-CD | #0052ff | `bg-brand` |
| SaveButton | color | base/primary-foreground | #ffffff | `text-primary-foreground` |
| SaveButton | height | height/h-9 | 36 | `h-9` |
| SectionTitle | fontSize | typography/base sizes/base/font-size | 16 | `text-base` |
| SectionTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| FormField label | color | base/foreground | #18181b | `text-foreground` |
| FormField label | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| FormField label | fontWeight | font/weight/medium | 500 | `font-medium` |
| FormField required asterisk | color | base/destructive | #dc2626 | `text-destructive` |
| Editable Input/Select | background | base/background | #ffffff | `bg-background` |
| Editable Input/Select | border | base/input | #d4d4d8 | `border-input` |
| Readonly Input | background | base/muted | #f4f4f5 | `bg-muted` |
| Readonly Input | color | base/muted-foreground | #71717a | `text-muted-foreground` |
| Input/Select | height | height/h-9 | 36 | `h-9` (per Select instance metadata) |
| Input/Select | radius | border radius/md | 6 | `rounded-md` |
| Radio disabled | color | base/muted-foreground | #71717a | `text-muted-foreground opacity-70` |
| Textarea | background | base/background | #ffffff | `bg-background` |
| Textarea | border | base/input | #d4d4d8 | `border-input` |
| Textarea | placeholder-color | base/muted-foreground | #71717a | `placeholder:text-muted-foreground` |

## §3 State Table

| State | Trigger | periodTypeVariant | Row1 layout | RadioRow | Editable fields |
|---|---|---|---|---|---|
| `year` | period.type = 'NAM' | `year` | col1=Năm readonly, col2=Tên editable | 3 radios + checkbox "Tự động sinh kỳ" (all disabled) | Tên, Thứ tự hiển thị, Trạng thái, Mô tả |
| `quarter_or_month` | period.type in ['QUY', 'THANG'] | `quarter_or_month` | col1=Tên editable, col2=Thuộc kỳ readonly | 3 radios only (no checkbox) | Tên, Thứ tự hiển thị, Trạng thái, Mô tả |
| `closing_kỳ` | User switches Trạng thái Chưa đóng → Đã đóng + Save | (orthogonal to variant) | (no layout change) | (no layout change) | (submit triggers SetAccountingPeriodStatus mutation + downstream lock per AC-4) |
| `reopening_kỳ` | User switches Trạng thái Đã đóng → Chưa đóng + Save | (orthogonal) | (no layout change) | (no layout change) | (submit triggers SetAccountingPeriodStatus reopening; AC-5 side-effect user must manually RECALC after) |
| `validation_error` | Tên empty + Submit | (orthogonal) | (Tên cell borders red + error text) | (no change) | Error "Tên kỳ kế toán là bắt buộc" per AC-2; Figma frame missing |

## §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| PageHeader | `share/page-header/3` (Year) / `share/page-header/4` (Q/M) | `{ title, backLink, actions: [cancelBtn, saveBtn] }` | Metadata frames use different Page Header variants (3 vs 4); implementation can unify with single variant "3" — visual delta negligible per PNG |
| BackLink | `ui/button` variant="ghost" size="icon" | `{ onClick, children: <ArrowLeft /> }` | Ghost icon-only |
| CancelButton | `ui/button` variant="outline" | `{ children: "Huỷ bỏ", onClick }` | Outline |
| SaveButton | `ui/button` variant="brand" | `{ children: "Lưu", onClick, disabled: !isDirty \|\| isSubmitting }` | Brand blue |
| SectionTitle | `share/section/title-text` | `{ text: "Thông tin chung" }` | Reuse title-text component per FEAT-AP-DETAIL parity |
| LoaiKyRadioRow | `share/form/radio-group-inline` | `{ options: [3 radios], selected: period.type, disabled: true }` | Reuse inline-radio pattern |
| TuDongSinhKyCheckbox | `ui/checkbox` | `{ checked: period.autoGenerate, disabled: true, label: "Tự động sinh kỳ" }` | shadcn Checkbox with disabled + label |
| FormField | `share/form/form-field` | `{ label, required, error, children: control }` | Reuse |
| Input / Select | `ui/input` / `ui/select` | (readonly variants use `disabled` + `className="bg-muted"`) | shadcn primitives |
| DateInput | `share/date-input` | `{ value, format, trailingIcon, disabled }` | Custom date input |
| Textarea | `ui/textarea` | `{ placeholder, rows, value, onChange }` | shadcn Textarea |

## §5 Field Composition Schema

Update mutation payload:

```yaml
UpdateAccountingPeriodInput:
  interface: UpdateAccountingPeriodInput
  fields:
    - name: id
      type: uuid
      binding: route param :id
      combined: false
    - name: name
      type: string
      binding: TenKyKeToanField.value
      combined: false
      validate: "required per AC-2 → 'Tên kỳ kế toán là bắt buộc'"
    - name: description
      type: string?
      binding: MoTaField.value
      combined: false
    - name: displayOrder
      type: int
      binding: ThuTuHienThiField.value
      combined: false
      default: 0
    # Locked fields per AC-3 — NOT part of update payload (server rejects if included per BR-AP-016)

SetAccountingPeriodStatusInput:
  interface: SetAccountingPeriodStatusInput
  fields:
    - name: id
      type: uuid
      binding: route param :id
      combined: false
    - name: status
      type: "'Chưa đóng' | 'Đã đóng'"
      binding: TrangThaiField.value
      combined: false
      transform: "if changed from current period.status → invoke this mutation separately from UpdateAccountingPeriod"
      _side_effects: |
        "AC-4 (→ Đã đóng): lock phiếu nhập/xuất có ngày chứng từ thuộc kỳ.
        AC-5 (→ Chưa đóng): bỏ lock; user MUST run FEAT-PRC-RECALC nếu modify phiếu sau reopen per BR-PRC-015."
```

## §6 Layout Width Table

| Container | Total width | Padding | Child widths | Notes |
|---|---|---|---|---|
| Page | 1440 | — | Navbar + SubNav + PageContent + Footer | Full-bleed |
| PageContent | 1440 | { x: 80, y: 0 } | 1280 content | Consistent with AP-DETAIL |
| PageHeader | 1280 | { x: 32, y: 0 } | TitleGroup + ActionRow (~148 for 2 buttons) | space-between |
| EditForm section | 1216 | 0 | RadioRow + FieldGrid + Textarea | 1280 - 64 |
| LoaiKyRadioRow year | 593 | 0 | 3 radios (130 + 123 + 137) + gaps + checkbox (131) | Per metadata frame 13523:68789 width |
| LoaiKyRadioRow month | 438 | 0 | 3 radios (130 + 123 + 137) + gaps | Per metadata frame 13523:68839 width |
| FieldGrid | 1216 | 0 | 3 rows × 2 cols; each cell 600 + gap-x 16 = (600 + 16 + 600) = 1216 | Grid |
| FormField cell | 600 | 0 | Label (20h) + gap(2) + Control (36h) = 58 | Per Select instance 600×58 |
| Textarea Mô tả | 1216 | 0 | Full-width, height 126 | Per Textarea instance 1216×126 |

## §7 Visual Hierarchy Map

```
Level 1 (primary):
  - SaveButton "Lưu" (brand blue top-right — main action)
  - PageTitle "Sửa Kỳ kế toán" (H1)

Level 2 (secondary):
  - CancelButton "Huỷ bỏ" (outline)
  - SectionTitle "Thông tin chung"
  - Editable field labels với red asterisk (required marker)

Level 3 (tertiary):
  - Readonly field labels (same visual weight as editable — user distinguishes via bg color)

Level 4 (data):
  - Input values editable (foreground text on white bg)
  - Input values readonly (muted-foreground text on muted bg — visually deprioritized signals lock)

Level 5 (utility):
  - LoaiKyRadioRow disabled radios + checkbox (muted throughout — signals informational not actionable)
  - Section footer
```

## §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-AP-EDIT-1 | Allow all fields editable (assume edit = full mutability) | ONLY 4 fields editable per AC-2: Tên + Mô tả + Thứ tự hiển thị + Trạng thái. Other 6 fields LOCKED per AC-3 explicit + BR-AP-016 | `_png_verified`: 13523-68781.png readonly fields have muted-bg + disabled state; FEAT AC-3 explicit lock rule |
| AP-AP-EDIT-2 | Render Loại kỳ radios as Select dropdown or hide entirely | Radios REMAIN visible but DISABLED per AC-3 — user sees current type but cannot switch | `_png_verified`: 13523-68781.png radios visible + muted state (disabled visual) |
| AP-AP-EDIT-3 | Hide 'Tự động sinh kỳ' checkbox on all variants | Checkbox VISIBLE for Year variant only (per BR-AP-016 auto-gen applies to Năm). Q/M variant hides checkbox per metadata frame 13523:68839 width delta | Metadata Frame 1 vs Frame 3 radio-row width (593 vs 438) confirms visibility swap |
| AP-AP-EDIT-4 | Auto-invoke SetAccountingPeriodStatus mutation on Trạng thái Select change (before Save) | Trạng thái change is CLIENT-side form state until user clicks Save — mutation runs on submit per AC-6. Per AC-4/AC-5, status change side-effects apply POST commit | FEAT AC-4/AC-5 explicit trigger on Save, not on-change |
| AP-AP-EDIT-5 | Show confirm dialog "Bạn có chắc mở lại kỳ?" khi user switches Đã đóng → Chưa đóng | Figma KHÔNG có confirm dialog; per AC-5 explicit "đổi trạng thái và Lưu" — 1-step commit. Nếu future BA muốn confirm phải add explicit dialog | `_png_verified`: 13523-68781.png Trạng thái Select changes value inline; no dialog shown |
| AP-AP-EDIT-6 | Verbatim Trạng thái Select options as "Đóng" / "Mở" (semantic paraphrase) | Verbatim per AC-2: "Chưa đóng" / "Đã đóng" — Figma shows current value "Đã đóng kỳ" (3 chữ) which may be display-only label; options list per AC-2 = 2-chữ. Wording verify với BA khi ACTIVE | FEAT AC-2 explicit; PNG value display 'Đã đóng kỳ' flagged in coverage_gaps |
| AP-AP-EDIT-7 | Automatically trigger RECALC after mở lại kỳ | AC-5 EXPLICIT: mở lại kỳ KHÔNG tự tính lại giá; user MUST tự chạy FEAT-PRC-RECALC per BR-PRC-015 | FEAT AC-5 explicit "KHÔNG tự tính lại giá" |
| AP-AP-EDIT-8 | Save button label "Cập nhật" hoặc "Xác nhận" | Verbatim "Lưu" per PNG + FEAT AC-6 | `_png_verified`: 13523-68781.png button 'Lưu' verbatim |
| AP-AP-EDIT-9 | Cancel label "Hủy" (drop dấu hỏi + "bỏ") | Verbatim "Huỷ bỏ" (dấu hỏi 'ỷ' + 'ỏ') per PNG + FEAT AC-7 — matches OB-EDIT convention | `_png_verified`: 13523-68781.png button 'Huỷ bỏ' character-by-character |
| AP-AP-EDIT-10 | Use `lucide-react` for icons | Use `iconsax-reactjs` per convention v7.6 R4.1 — ArrowLeft/ArrowDown/Calendar variant=Linear | `_ref-web-transform-figma.md v7.6` |

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 13523:68781 | year | assets/wave04-ap-edit/13523-68781.png | 1440×1024 |
| 13523:68806 | quarter_or_month_intermediate | (reuses assets/wave04-ap-edit/13523-68831.png — visually equivalent per metadata) | 1440×1024 |
| 13523:68831 | quarter_or_month_final | assets/wave04-ap-edit/13523-68831.png | 1440×1024 |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Mở form "Sửa Kỳ kế toán" + pre-filled + Huỷ bỏ + Lưu | PageHeader + EditForm with variant fields pre-populated | 13523:68781 + 13523:68831 | ✓ |
| AC-2 | 4 editable fields (Tên + Mô tả + Trạng thái + Thứ tự hiển thị) + validate Tên required | EditForm editable fields set + `validate: required` on TenKyKeToanField | 13523:68781 + 13523:68831 | ✓ (validation error state Figma missing — coverage_gap) |
| AC-3 | 6 locked fields (Loại kỳ + Năm + Thuộc kỳ + Ngày bắt đầu + Ngày kết thúc + Tự động sinh kỳ) | RadioRow disabled + Year Row1Col1 Năm readonly / Q/M Row1Col2 Thuộc kỳ readonly + Row2 dates readonly + Checkbox disabled | 13523:68781 + 13523:68831 | ✓ |
| AC-4 | Đóng kỳ → chặn phiếu (không chặn tính giá lần đầu; chặn RECALC) | TrangThaiField.onChange → SetAccountingPeriodStatus mutation + downstream lock (backend enforcement) | 13523:68781 | ⚠ (side-effect backend; UI shows only Save success toast) |
| AC-5 | Mở lại kỳ → không tự RECALC; user manual per BR-PRC-015 | Same TrangThaiField.onChange (reopen path) + explicit `_side_effects` doc | 13523:68781 | ⚠ (side-effect backend + user-education needed; recommend BR warning banner) |
| AC-6 | Lưu → cập nhật + Ngày sửa/Người sửa + toast success + navigate | SaveButton.onClick + State Table success | — | ✓ |
| AC-7 | Huỷ bỏ → đóng form không lưu | CancelButton.onClick | — | ✓ |
| AC-8 | Phân quyền — chủ garage + kế toán ngang nhau | (backend RBAC) | — | ⚠ (backend) |

## Coverage Gaps

- **Validation error UI**: AC-2 explicit error "Tên kỳ kế toán là bắt buộc" khi Tên empty; Figma frame missing. Implementation dùng shadcn FormField error slot `<p className="text-destructive text-sm mt-1">` dưới input.
- **AC-5 mở lại kỳ RECALC warning**: FEAT explicit "user MUST tự chạy RECALC". Không có UI hint trong form. Đề xuất thêm advisory banner khi user switches Trạng thái Đã đóng → Chưa đóng (deferred BA decision).
- **Trạng thái option wording**: PNG value 'Đã đóng kỳ' (3 chữ) vs FEAT AC-2 options 'Chưa đóng' / 'Đã đóng' (2 chữ). Implementation dùng FEAT wording; BA confirm final.
- **Frame 2 vs Frame 3 delta**: Chỉ Page Header instance selector (Page Header / 3 vs 4). Visual identical; treat as single Q/M variant for implementation.
