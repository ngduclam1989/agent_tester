---
feat: FEAT-OB-EDIT
feat_file: Product/features/FEAT-OB-EDIT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14854-94446
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14854:94446"
fetched_at: "2026-07-08T03:41Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
status: ACTIVE
coverage_gaps:
  - "Figma chỉ có 1 frame (default state, filled data). Error state PNG chưa có (inline error messages under each field khi validate fail — AC-5/6/7/8/9). Implementation: shadcn FormField error slot dùng cho ERR-INV-* mã lỗi. Wording error message cần lookup registry `Product/error-code/ERROR-CODE-REGISTRY.md`."
  - "Figma không show blocked-guardrail popup (khi lưu gặp ERR-INV-024 kỳ đóng / ERR-INV-036 tồn âm / ERR-INV-035 tồn đến ngày sau phiếu / ERR-INV-034 trùng mã+kho). Behavior: inline toast / dialog error per mã lỗi. Implementation reuse popup 'Không thể lưu' pattern tương tự OB-DELETE-LINES blocked variant + error code lookup."
---

# FEAT-OB-EDIT — Spec (web)

> Page-level edit form cho 1 dòng tồn đầu kỳ, trigger từ `FEAT-OB-LIST` row Thao tác icon Edit2 ✏️. 6 fields (2 select + 1 readonly select + 2 number input + 1 date input) trong 3-row × 2-col grid. Header có back link + 2 CTA buttons "Huỷ bỏ" outline + "Lưu" brand.
>
> **Icon library**: `iconsax-reactjs` primary (v7.6). Icons: back arrow, chevron-down (Select), calendar (DatePicker).

## Icon Catalog (shared)

| Token name | Figma layer | Source | Name | Variant | _png_source |
|---|---|---|---|---|---|
| icon/back-arrow | vuesax/linear/arrow-left | iconsax-reactjs | ArrowLeft | Linear | assets/wave04-ob-edit/14854-93461.png L143 back chevron leading page title |
| icon/select-chevron | vuesax/linear/arrow-down | iconsax-reactjs | ArrowDown | Linear | assets/wave04-ob-edit/14854-93461.png L268/342 chevron-down trailing each Select input |
| icon/calendar | vuesax/linear/calendar | iconsax-reactjs | Calendar | Linear | assets/wave04-ob-edit/14854-93461.png L416 calendar glyph trailing Tồn đến ngày date input |

---

## Screen: Sửa chi tiết tồn kho vật tư hàng hoá (14854:93461)

### §0 ASCII Mockup

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚗 GMS   Tổng quan   Mua hàng   Sửa chữa & Dịch vụ   ⟨Tồn kho⟩   Khách hàng   Marketing   Nhân viên   Danh mục      🔔● 👤 │  ← Navbar bg-brand #0052ff (⟨⟩ = active top-nav tab; from Navbar instance, not per-page decl)
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phiếu nhập kho   Phiếu xuất kho   [Tồn đầu kỳ]‾‾‾   Tính giá xuất kho   Báo cáo tồn kho   Báo cáo NXT │  ← Sub-nav Tồn đầu kỳ active blue underline
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                       │
│  ← Sửa chi tiết tồn kho vật tư hàng hoá                        [ Huỷ bỏ ]  [ Lưu ]                    │  ← Page header (H1 + back-link + 2 CTA top-right)
│                                                                                                       │
│  Thông tin tồn đầu kỳ                                                                                 │  ← Section title (semibold 16px)
│                                                                                                       │
│  Sản phẩm nội bộ *                                Kho *                                              │  ← Row 1 labels
│  ┌────────────────────────────────────┬─▾┐        ┌────────────────────────────────────┬─▾┐          │
│  │ Sâm                                 │  │        │ K02                                 │  │          │  ← Row 1 inputs (Select 600 + Select 600, gap 16)
│  └─────────────────────────────────────┴──┘        └─────────────────────────────────────┴──┘          │
│                                                                                                       │
│  Đơn vị tính                                     Số lượng tồn *                                     │  ← Row 2 labels
│  ┌────────────────────────────────────┬─▾┐        ┌───────────────────────────────────────┐          │
│  │ kg                                  │  │  (readonly)                                                │
│  └─────────────────────────────────────┴──┘        │ 825,00                                │          │  ← Row 2 inputs
│                                                    └───────────────────────────────────────┘          │
│                                                                                                       │
│  Tồn đến ngày *                                  Giá trị tồn                                         │  ← Row 3 labels
│  ┌───────────────────────────────────────┬📅┐    ┌───────────────────────────────────────┐          │
│  │ 30/04/2026                              │  │    │ 103.125.000                           │          │
│  └─────────────────────────────────────────┴──┘    └───────────────────────────────────────┘          │
│                                                                                                       │
├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Phần mềm quản lý Garage (G.M.S), phiên bản 2.0     Hướng dẫn sử dụng   Hỗ trợ   Hotline: 0985135050 │  ← Section Footer / 2 (48px)
└───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
OpeningBalanceEditPage:
  type: page
  route: "/inventory/opening-balance/edit/:id"
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
      _png_verified: "14854-93461.png L0-104 identical to wave04-ob-list.md Navbar"

    - id: SubNav
      type: container
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px bottom border-input
      direction: horizontal
      gap: 24
      padding: { x: 32, y: 12 }
      _children_count: 6
      _renders_as: sub-navigation-tabs
      children:
        - { type: TabLink, label: "Phiếu nhập kho", state: default, _png_verified: "14854-93461.png L80 verbatim" }
        - { type: TabLink, label: "Phiếu xuất kho", state: default, _png_verified: "14854-93461.png L80 verbatim" }
        - { type: TabLink, label: "Tồn đầu kỳ", state: active, activeUnderlineColor: "#0052ff", _png_verified: "14854-93461.png L80 blue underline active" }
        - { type: TabLink, label: "Tính giá xuất kho", state: default, _png_verified: "14854-93461.png L80 verbatim" }
        - { type: TabLink, label: "Báo cáo tồn kho", state: default, _png_verified: "14854-93461.png L80 verbatim" }
        - { type: TabLink, label: "Báo cáo NXT", state: default, _png_verified: "14854-93461.png L80 verbatim" }

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
          BG: bg-background
          Border: none
          direction: horizontal
          justify: space-between
          align: center
          padding: { x: 32, y: 0 }
          _renders_as: h1-with-back-link-and-action-cta-group
          _children_count: 2
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
                  onClick: "navigate('/inventory/opening-balance')  # back to FEAT-OB-LIST"
                  _renders_as: back-navigation-icon-button
                  _png_verified: "14854-93461.png L143 back chevron ← left-most in header"
                - id: PageTitle
                  type: Text
                  content: "Sửa chi tiết tồn kho vật tư hàng hoá"
                  _png_verified: "14854-93461.png L143 verbatim H1 'Sửa chi tiết tồn kho vật tư hàng hoá' — matches FEAT AC-1 màn tên"
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
                  _png_verified: "14854-93461.png L143 verbatim 'Huỷ bỏ' (dấu hỏi 'ỷ' + dấu hỏi 'ỏ') outline button — matches FEAT AC-4 verbatim"
                  onClick: "navigate('/inventory/opening-balance')  # AC-4 dismiss without save"
                  _renders_as: cancel-button

                - id: SaveButton
                  type: Button
                  variant: brand
                  size: default
                  label: "Lưu"
                  _png_verified: "14854-93461.png L143 verbatim 'Lưu' brand blue button — matches FEAT AC-3 label"
                  onClick: "submitForm() → validate + UpdateOpeningBalance mutation per AC-3"
                  _renders_as: primary-cta-save-button

        - id: FormSection
          type: container
          width: 1216
          padding: { x: 0, y: 0 }
          BG: bg-background
          direction: vertical
          gap: 0
          _children_count: 1
          children:
            - id: OpeningBalanceInfoSection
              type: container
              width: 1216
              direction: vertical
              gap: 0
              BG: bg-background
              Border: none
              _children_count: 2
              children:
                - id: SectionTitle
                  type: Text
                  content: "Thông tin tồn đầu kỳ"
                  _png_verified: "14854-93461.png L198 verbatim section title 'Thông tin tồn đầu kỳ' — matches FEAT AC-2 section name"
                  size: 16
                  weight: 600
                  lineHeight: 24
                  color: text-foreground
                  _renders_as: h2-section-header

                - id: FieldGrid
                  type: container
                  direction: grid
                  cols: 2
                  gap: { x: 16, y: 16 }
                  _children_count: 6
                  _renders_as: form-field-grid-3-rows-2-cols
                  children:

                    - id: SanPhamNoiBoField
                      type: FormField
                      label: "Sản phẩm nội bộ *"
                      _png_verified: "14854-93461.png L232 label 'Sản phẩm nội bộ' + red asterisk required marker"
                      required: true
                      control:
                        type: Select
                        placeholder: "Chọn sản phẩm nội bộ"
                        trailingIcon: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16, color: text-muted-foreground }
                        options: "load từ ProductInternalService — filter 'Đang hoạt động' per AC-2"
                        binding: form.productInternalId
                        default: "row.product.internalId (initial from row being edited)"
                        _png_current_value: "14854-93461.png L268 shows 'Sâm' as selected value"
                        errorCodes: [ERR-INV-010]

                    - id: KhoField
                      type: FormField
                      label: "Kho *"
                      _png_verified: "14854-93461.png L232 label 'Kho' + red asterisk"
                      required: true
                      control:
                        type: Select
                        placeholder: "Chọn kho"
                        trailingIcon: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16, color: text-muted-foreground }
                        options: "load từ WarehouseService — active warehouses của tenant per AC-2"
                        binding: form.warehouseId
                        default: "row.kho.id"
                        _png_current_value: "14854-93461.png L268 shows 'K02' as selected value"
                        errorCodes: [ERR-INV-020]

                    - id: DonViTinhField
                      type: FormField
                      label: "Đơn vị tính"
                      _png_verified: "14854-93461.png L306 label 'Đơn vị tính' — no asterisk (auto-derived, readonly)"
                      required: false
                      control:
                        type: Select
                        readonly: true
                        trailingIcon: { source: iconsax-reactjs, name: ArrowDown, variant: Linear, size: 16, color: text-muted-foreground }
                        placeholder: "(tự đổi theo mã sản phẩm nội bộ)"
                        binding: form.unit
                        default: "computed from selected product.unitChinh per AC-2 'ĐVT chính'"
                        _png_current_value: "14854-93461.png L342 shows 'kg' derived from selected 'Sâm' product"
                        _behavior: "auto-updates when SanPhamNoiBoField changes; visually still shows chevron but disabled interaction"

                    - id: SoLuongTonField
                      type: FormField
                      label: "Số lượng tồn *"
                      _png_verified: "14854-93461.png L306 label 'Số lượng tồn' + red asterisk"
                      required: true
                      control:
                        type: Input
                        inputType: number
                        step: "0.01"                    # cho số lẻ per AC-2
                        placeholder: "0,00"
                        binding: form.quantity
                        default: "row.soLuongTon"
                        _png_current_value: "14854-93461.png L342 shows '825,00' (Vietnamese decimal comma format)"
                        format: "decimal Vietnamese locale (dấu phẩy thập phân)"
                        errorCodes: [ERR-INV-032]           # SL > 0

                    - id: TonDenNgayField
                      type: FormField
                      label: "Tồn đến ngày *"
                      _png_verified: "14854-93461.png L380 label 'Tồn đến ngày' + red asterisk"
                      required: true
                      control:
                        type: DateInput
                        placeholder: "DD/MM/YYYY"
                        trailingIcon: { source: iconsax-reactjs, name: Calendar, variant: Linear, size: 16, color: text-muted-foreground }
                        format: "DD/MM/YYYY"
                        binding: form.tonDenNgay
                        default: "row.tonDenNgay (ISO 2026-04-30)"
                        _png_current_value: "14854-93461.png L416 shows '30/04/2026' format DD/MM/YYYY"
                        errorCodes: [ERR-INV-024, ERR-INV-035]   # kỳ đóng OR sau phiếu

                    - id: GiaTriTonField
                      type: FormField
                      label: "Giá trị tồn"
                      _png_verified: "14854-93461.png L380 label 'Giá trị tồn' — no asterisk (optional)"
                      required: false
                      control:
                        type: Input
                        inputType: number
                        placeholder: "0"
                        binding: form.giaTriTon
                        default: "row.giaTriTon"
                        _png_current_value: "14854-93461.png L416 shows '103.125.000' (Vietnamese thousand-separator dot)"
                        format: "integer Vietnamese thousand-separator (dấu chấm)"
                        errorCodes: [ERR-INV-033]           # ≥ 0

    - id: SectionFooter
      type: instance
      source: share/section-footer/02
      width: 1440
      height: 48
      BG: bg-background
      Border: 1px top border
      _renders_as: version-and-support-links-row
      content:
        - { align: left, text: "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0", _png_verified: "14854-93461.png L1010 verbatim" }
        - { align: right, links: ["Hướng dẫn sử dụng", "Hỗ trợ", "Hotline: 0985135050"] }

_negative_coverage:
  - "không có breadcrumb trên page title (page-header chỉ có back-arrow + title, không breadcrumb path)"
  - "không có tab / accordion trên form (chỉ 1 section 'Thông tin tồn đầu kỳ' không có nhóm khác)"
  - "không có preview / diff panel bên phải (form standalone, không có compare-with-original view)"
  - "không có 'Xem lịch sử thay đổi' link (audit trail out of FEAT scope)"
  - "không có delete button trong edit form (delete flow riêng qua FEAT-OB-LIST row Thao tác icon Trash per AC-11)"
  - "không có 'Lưu và tiếp tục sửa dòng khác' pattern — chỉ 1 Save = quay về list per AC-3"
  - "không có mã lỗi inline visible ở default state PNG — validation error state chưa được Figma cover (coverage_gap flag)"
```

### §2 Design Token Map

| Element | Property | Figma variable | Value | Tailwind token |
|---|---|---|---|---|
| Page BG | background | base/background | #ffffff | `bg-background` |
| Navbar | background | base/background-brand-CD | #0052ff | `bg-brand` |
| PageTitle | color | base/foreground | #18181b | `text-foreground` |
| PageTitle | fontSize | typography/base sizes/2x large/font-size | 24 | `text-2xl` |
| PageTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| CancelButton | border | base/input | #d4d4d8 | `border-input` |
| CancelButton | color | base/foreground | #18181b | `text-foreground` |
| CancelButton | height | height/h-9 | 36 | `h-9` |
| CancelButton | fontWeight | font/weight/medium | 500 | `font-medium` |
| SaveButton | background | base/background-brand-CD | #0052ff | `bg-brand` |
| SaveButton | color | base/primary-foreground | #ffffff | `text-primary-foreground` |
| SaveButton | height | height/h-9 | 36 | `h-9` |
| SectionTitle | color | base/foreground | #18181b | `text-foreground` |
| SectionTitle | fontSize | typography/base sizes/base/font-size | 16 | `text-base` |
| SectionTitle | fontWeight | font/weight/semibold | 600 | `font-semibold` |
| FormField label | color | base/foreground | #18181b | `text-foreground` |
| FormField label | fontSize | typography/base sizes/small/font-size | 14 | `text-sm` |
| FormField label | fontWeight | font/weight/medium | 500 | `font-medium` |
| FormField required asterisk | color | base/destructive | #dc2626 | `text-destructive` |
| Select / Input | border | base/input | #d4d4d8 | `border-input` |
| Select / Input | placeholder-color | base/muted-foreground | #71717a | `placeholder:text-muted-foreground` |
| Select / Input | height | (input h-9 = 36) | 36 | `h-9` (per Select instance metadata 58h = 20 label + 2 gap + 36 input) |
| Select / Input | radius | border radius/md | 6 | `rounded-md` |

### §3 State Table

| State | Trigger | Fields | Actions | Notes |
|---|---|---|---|---|
| `default` | Page mount + row data loaded | All 6 fields pre-filled from row | Save enabled, Cancel enabled | Default state per PNG |
| `dirty` | User edits any field | Same fields, dirty flag set | Save enabled, Cancel prompts confirm-discard if dirty | Cancel behavior per AC-4 |
| `submitting` | User clicks Save + client-side valid | Fields disabled, spinner on Save button | Save disabled, Cancel disabled | Loading state |
| `error_inline` | Server returns ERR-INV-* code post-submit | Fields enabled again, error message below relevant field per errorCodes mapping | Save enabled retry, Cancel enabled | AC-5..AC-9 inline error rendering — Figma frame missing (coverage_gap) |
| `error_blocking` | ERR-INV-024 kỳ đóng OR ERR-INV-036 tồn âm OR ERR-INV-035 sau phiếu OR ERR-INV-034 trùng | Fields enabled again, dialog modal "Không thể lưu" opens per BR-OB-DEL guardrail wording | Dialog Đóng only | Reuse pattern từ OB-DELETE-LINES blocked variant |
| `success` | Backend commit success | (navigate away — form unmounts) | (redirected to FEAT-OB-LIST) | Toast "Đã cập nhật dòng tồn đầu kỳ" |

### §4 Component Prop Map

| Element | shadcn / registry component | Props | Notes |
|---|---|---|---|
| PageHeader | `share/page-header/3` | `{ title, backLink, actions: [cancelBtn, saveBtn] }` | Header variant "3" per Figma "Page Header / 3" instance (no primary CTA icon, có back link) |
| BackLink | `ui/button` variant="ghost" size="icon" | `{ onClick, children: <ArrowLeft /> }` | Ghost icon-only |
| CancelButton | `ui/button` variant="outline" | `{ children: "Huỷ bỏ", onClick }` | shadcn Button outline variant |
| SaveButton | `ui/button` variant="brand" | `{ children: "Lưu", onClick, disabled: !isValid \|\| isSubmitting }` | shadcn Button brand variant (extended shadcn theme) |
| SectionTitle | `share/section/title-text` | `{ text: "Thông tin tồn đầu kỳ" }` | Reuse title-text component from Figma instance |
| FormField | `share/form/form-field` | `{ label, required, error, children: control }` | Wraps Select/Input, renders label + error slot |
| Select | `ui/select` (shadcn) | `{ options, value, onChange, placeholder, disabled }` | shadcn Select |
| Input (number) | `ui/input` | `{ type: "number", step, value, onChange, placeholder }` | shadcn Input |
| DateInput | `share/date-input` | `{ value, onChange, format: "DD/MM/YYYY", trailingIcon: <Calendar /> }` | Custom date input with calendar popover — reuse across features |

### §5 Field Composition Schema

Update mutation payload:

```yaml
UpdateOpeningBalanceInput:
  interface: UpdateOpeningBalanceInput
  fields:
    - name: id
      type: uuid
      binding: route param :id
      combined: false
    - name: productInternalId
      type: uuid
      binding: SanPhamNoiBoField.value
      combined: false
      validate: "server-side check product status = 'Đang hoạt động' per AC-9 → ERR-INV-010 if not"
    - name: warehouseId
      type: uuid
      binding: KhoField.value
      combined: false
      validate: "server-side existence check per AC-9 → ERR-INV-020 if not found"
    - name: quantity
      type: decimal
      binding: SoLuongTonField.value
      combined: false
      validate: "> 0 per AC-9 → ERR-INV-032 if ≤ 0"
    - name: tonDenNgay
      type: date
      binding: TonDenNgayField.value
      combined: false
      validate: "not in closed period (AC-5 → ERR-INV-024) AND before earliest inventory movement of (product, warehouse) (AC-7 → ERR-INV-035)"
    - name: giaTriTon
      type: decimal?
      binding: GiaTriTonField.value
      combined: false
      validate: "≥ 0 per AC-9 → ERR-INV-033 if < 0"
      _optional: "cho = 0 hoặc trống per AC-2"
    # Guardrail cross-field checks (server-side):
    # - AC-6: quantity/warehouse/product/date change không làm tồn lũy kế < 0 tại bất kỳ point-in-time nào → ERR-INV-036
    # - AC-8: (productInternalId + warehouseId) uniqueness (excluding self) → ERR-INV-034
    # Cascade: BR-STKV2-001 — server tự cascade stock table

UpdateOpeningBalanceResult:
  fields:
    - name: opBalance
      type: OpeningBalanceLine
    - name: cascadedStockUpdates
      type: int   # số record cập nhật trong sổ tồn per BR-STKV2-001
```

### §6 Layout Width Table

| Container | Total width | Padding | Child widths | Notes |
|---|---|---|---|---|
| Page | 1440 | — | Navbar(1440) + SubNav(1440) + PageContent(1440) + Footer(1440) | Full-bleed layout |
| PageContent | 1440 | { x: 80, y: 0 } | 1280 content area | Wider content padding than list pages (80 vs 32) |
| PageHeader | 1280 | { x: 32, y: 0 } | TitleGroup(back+title) + ActionRow(2 buttons) | space-between horizontal |
| FormSection | 1216 | 0 | OpeningBalanceInfoSection full-width | (1280 - 64 padding × 2 side of PageContent) |
| FieldGrid | 1216 | 0 | 3 rows × 2 cols; each cell 600 + gap-x 16 = (600 + 16 + 600) = 1216 | Grid gap y between rows: 16 |
| FormField cell | 600 | 0 | Label (20px) + gap(2) + Control (36px input) = 58 vertical stack | Per Figma Select instance metadata 600×58 |

### §7 Visual Hierarchy Map

```
Level 1 (primary):
  - SaveButton "Lưu" (brand blue — primary CTA for save)
  - PageTitle "Sửa chi tiết tồn kho vật tư hàng hoá" (H1 semibold)

Level 2 (secondary):
  - CancelButton "Huỷ bỏ" (outline — secondary CTA)
  - SectionTitle "Thông tin tồn đầu kỳ" (semibold section header)

Level 3 (tertiary):
  - FormField labels + required asterisk (medium 14px)

Level 4 (data):
  - Input control values (visible text 14px foreground)
  - Placeholder text (muted)

Level 5 (utility):
  - Section footer + navbar
```

### §8 Anti-Pattern Trap

| ID | Trap | Correct behavior | Evidence |
|---|---|---|---|
| AP-OB-EDIT-1 | Render form trong modal / dialog (assume edit = modal) | Page-level edit form full-viewport per Figma frame 1440×1024 — navigate `/inventory/opening-balance/edit/:id` route | `_png_verified`: 14854-93461.png shows full page with navbar + subnav + section footer — NOT a modal overlay |
| AP-OB-EDIT-2 | ĐVT (Đơn vị tính) editable | ĐVT MUST readonly + auto-derived from selected product.unitChinh per AC-2 explicit | `_png_verified`: 14854-93461.png DVT field has chevron but disabled state; FEAT AC-2 "Đơn vị tính (readonly — tự đổi theo mã sản phẩm nội bộ đã chọn = ĐVT chính)" |
| AP-OB-EDIT-3 | Save button label "Cập nhật" hoặc "Xác nhận" | Verbatim "Lưu" per PNG + FEAT AC-3 | `_png_verified`: 14854-93461.png button 'Lưu' verbatim |
| AP-OB-EDIT-4 | Cancel button label "Hủy" (drop dấu hỏi + "bỏ") | Verbatim "Huỷ bỏ" (dấu hỏi 'ỷ' + word 'bỏ' with dấu hỏi 'ỏ') per PNG + FEAT AC-4 | `_png_verified`: 14854-93461.png button 'Huỷ bỏ' character-by-character |
| AP-OB-EDIT-5 | Số lượng tồn / Giá trị tồn dùng format quốc tế (dấu chấm thập phân) | Format Vietnamese locale — Số lượng tồn dấu PHẨY thập phân ('825,00'), Giá trị tồn dấu CHẤM thousand-separator ('103.125.000') | `_png_verified`: 14854-93461.png L342 '825,00' + L416 '103.125.000' — mismatched separators intentional per VN convention |
| AP-OB-EDIT-6 | Tồn đến ngày date format ISO (YYYY-MM-DD) | Display format DD/MM/YYYY per PNG (30/04/2026); submit as ISO to backend | `_png_verified`: 14854-93461.png L416 date '30/04/2026' DD/MM/YYYY |
| AP-OB-EDIT-7 | Client-side validate mà không call server pre-check | Client validate cho AC-9 (required + basic bounds); AC-5/6/7/8 guardrails MUST server-side (period lock + running-balance calc + uniqueness check) — client cannot pre-check kỳ đóng/tồn âm accurate | FEAT AC-5..AC-8 → error codes ERR-INV-024/034/035/036 server-side guardrails |
| AP-OB-EDIT-8 | Save success → toast + stay on form | Per AC-3 explicit: save success → cascade tồn cuối ngày + navigate về danh sách + toast success | FEAT AC-3 explicit |
| AP-OB-EDIT-9 | Show × close icon top-right (assume shadcn Dialog pattern) | This is PAGE not modal — không có × close. Cancel dùng "Huỷ bỏ" outline button per PNG | `_png_verified`: 14854-93461.png header row shows title + 2 buttons only, no × icon anywhere |
| AP-OB-EDIT-10 | Use `lucide-react` for icons | Use `iconsax-reactjs` per convention v7.6 — ArrowLeft / ArrowDown / Calendar variant=Linear per §Icon Catalog | `_ref-web-transform-figma.md v7.6 R4.1` |

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave04-ob-edit/14854-93461.png
verified_at: "2026-07-08T03:42Z"
verifier: main-agent (prefetch-figma web 04)
claims_verified:
  - claim: "Page-level edit form (full 1440×1024 viewport) NOT modal — navbar + subnav + section footer all visible"
    status: ✓
    evidence: "14854-93461.png shows full page shell: navbar top, subnav second row, page header + form body, section footer bottom"
  - claim: "PageHeader has back-arrow LEFT of title + 2 buttons top-right (Huỷ bỏ outline + Lưu brand blue) — matches FEAT AC-1 header composition"
    status: ✓
    evidence: "14854-93461.png L143 shows [← Sửa chi tiết tồn kho vật tư hàng hoá] [Huỷ bỏ outline] [Lưu blue] — exact 3-element layout"
  - claim: "Section 'Thông tin tồn đầu kỳ' with 3-row × 2-col field grid — 6 fields total per FEAT AC-2 explicit"
    status: ✓
    evidence: "14854-93461.png shows section title L198 + 3 field rows y=232/306/380 each with 2 columns"
  - claim: "Field labels verbatim: Sản phẩm nội bộ *, Kho *, Đơn vị tính, Số lượng tồn *, Tồn đến ngày *, Giá trị tồn — 4 required (red asterisk) + 2 optional"
    status: ✓
    evidence: "14854-93461.png L232/306/380 labels character-by-character verbatim; red asterisks visible on 4 fields; 2 fields (ĐVT + Giá trị tồn) no asterisk"
  - claim: "Đơn vị tính is Select (has chevron) but readonly/disabled — auto-derived from product per AC-2"
    status: ✓
    evidence: "14854-93461.png L342 ĐVT field renders with chevron trailing like other Selects — indicates Select component reuse, readonly behavior enforced via prop"
  - claim: "Values pre-filled from row: Sâm (product), K02 (kho), kg (ĐVT auto), 825,00 (SL), 30/04/2026 (date), 103.125.000 (giá trị)"
    status: ✓
    evidence: "14854-93461.png L268/342/416 all input values visible + populated — form loads with row data per AC-2"
```

---

## Screenshots

| Node | State | Asset path | Original size |
|---|---|---|---|
| 14854:93461 | default (form pre-filled) | assets/wave04-ob-edit/14854-93461.png | 1440×1024 |

## AC Coverage Matrix

| AC | Description | Covered by §1 | Screen | Status |
|---|---|---|---|---|
| AC-1 | Mở form từ FEAT-OB-LIST edit icon + header có Back + Huỷ bỏ + Lưu | PageHeader with BackLink + CancelButton + SaveButton | 14854:93461 | ✓ |
| AC-2 | 6 fields đổ sẵn dữ liệu hiện tại + ĐVT readonly | FieldGrid 6 FormField children + DonViTinhField readonly | 14854:93461 | ✓ |
| AC-3 | Lưu → validate → cập nhật + cascade + navigate list + toast | SaveButton.onClick + submit flow + State Table success | 14854:93461 | ✓ |
| AC-4 | Huỷ bỏ → navigate list, không lưu | CancelButton.onClick | 14854:93461 | ✓ |
| AC-5 | Chặn khi kỳ đóng → ERR-INV-024 | TonDenNgayField.errorCodes + server-side guardrail | (error state Figma missing — coverage_gap) | ⚠ |
| AC-6 | Chặn khi tồn âm → ERR-INV-036 | Server-side running-balance check + State Table error_blocking | (error state Figma missing) | ⚠ |
| AC-7 | Chặn khi ngày sau phiếu → ERR-INV-035 | TonDenNgayField.errorCodes + server-side check | (error state Figma missing) | ⚠ |
| AC-8 | Chặn khi trùng (mã+kho) → ERR-INV-034 | Server-side uniqueness check | (error state Figma missing) | ⚠ |
| AC-9 | Validate required + bounds → ERR-INV-010/020/032/033 | Each FormField.errorCodes + client validate | (error state Figma missing) | ⚠ (inline error UI needed) |
| AC-10 | Phân quyền — chủ garage + kế toán ngang nhau | (backend RBAC) | — | ⚠ (backend) |

## Coverage Gaps

- **Error state Figma frames missing**: AC-5/6/7/8/9 blocking errors với ERR-INV-* mã lỗi chưa được Figma cover. Implementation cần render (a) inline `<p className="text-destructive text-sm mt-1">` dưới FormField cho validation errors + (b) modal "Không thể lưu" cho guardrail errors (reuse pattern từ wave04-ob-delete-lines.md blocked variant). Wording lookup `Product/error-code/ERROR-CODE-REGISTRY.md`.
- **ĐVT auto-derive behavior**: FEAT AC-2 explicit "tự đổi theo mã sản phẩm nội bộ đã chọn = ĐVT chính". Client-side implementation: khi SanPhamNoiBoField.onChange → fetch product detail → set DonViTinhField.value = product.unitChinh. Loading state khi fetch → not spec'd in Figma; recommend skeleton on ĐVT field during load.
