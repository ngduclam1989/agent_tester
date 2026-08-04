---
feat: FEAT-INS-DOSSIER-CREATE
feat_file: Product/features/FEAT-INS-DOSSIER-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13257-536880&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13257:536880"
fetched_at: 2026-06-24
transform_version: 7.4
transform_mode: fresh-fetch
v74_remediation: applied   # R1-R8 Mandatory Token Carry compliance (2026-06-24, per plan lovely-rolling-willow)
screenshots: true
screens_expected: 6
coverage_gaps:
  - "Per user guidance 'spec modal only' — KHÔNG document underlying STL-DETAIL page (modal overlay). Underlying page = wave01-ins-stl-detail.md baseline + wave02-ins-dossier-view.md tab extension."
  - "Section node 13257:536880 chứa 9 frames. Spec NÀY cover 6 unique screens: 2 collapsed accordion states (13257:536881 = '2/4 sẵn sàng', 13257:555266 = '4/4 sẵn sàng') + 4 expanded accordion states (13257:558976 = Phiếu QT expand, 13257:537243 = Phiếu báo giá expand, 13257:537424 = Biên bản nghiệm thu expand, 13257:537605 = Giấy ủy quyền expand). 3 variant frames (13257:537062, 563286, 564782) = same docs với data variants — pixel-equivalent visual layout, gộp vào 4 unique expanded screens."
  - "AC-3 checkbox 'mặc định bỏ trống' (FEAT) — design screenshots show interactive states (2/4 hoặc 4/4 ticked + per-row expand patterns). DEV theo AC: initial state TẤT CẢ 4 unchecked. Demo populated state KHÔNG phải initial."
  - "AC-8 accordion expand inline = chevron ▾ click toggles body. Mỗi expanded state captures 1 row open + 3 còn lại collapsed."
  - "AC-11 versioning + AC-9 export = backend logic (gf-accounting + S3) + post-export navigation. Modal sau khi xuất thành công đóng + chuyển sang tab 'Hồ sơ BH đã xuất' (FEAT-INS-DOSSIER-VIEW)."
  - "AC-4 Phiếu QT expanded body = template 'PHIẾU QUYẾT TOÁN SỬA CHỮA' read-only, DEV consume via PrintService (gf-accounting SettlementPrintStrategy) — render iframe / inline-print component dùng existing print template (W01 + CR-20260616-01 extension). Spec capture STRUCTURE, không re-define cell-level layout của print template (template = gf-accounting owned, KHÔNG thay đổi qua FE)."
  - "AC-5 Phiếu báo giá expanded body = template 'PHIẾU BÁO GIÁ SỬA CHỮA' read-only, DEV consume via PrintService (gf-sales ServiceOrderPrintStrategy /for-print endpoint). Same pattern as AC-4."
  - "AC-6 Biên bản nghiệm thu + AC-7 Giấy ủy quyền expanded bodies = editable inline templates (rich-text + form-field hybrid). DEV implement với ContentEditable cho clause text + Input/Textarea cho structured fields per §5 schema. Render preview KHÔNG dùng PrintService (vì editable in-line)."
---

## Icon Catalog (shared)

| Figma layer | npm package | name (literal) | Variant prop | `_png_source` | Notes |
|---|---|---|---|---|---|
| chevron-down (▾) accordion arrow | iconsax-reactjs | `ArrowDown` (collapsed) / `ArrowUp` (expanded) — fallback lucide-react `ChevronDown` / `ChevronUp` | Linear | assets/wave02-ins-dossier-create/13257-536881_2-of-4-ready.png L630 — right edge of each accordion row trigger shows ▾ glyph (chevron-down) | Mỗi accordion row trigger right-edge; toggle to `ArrowUp`/`ChevronUp` khi expanded (transform rotate-180 acceptable alternative) |
| ~~close (×) modal~~ | lucide-react `X` | (none — removed) | — | NOT present in any PNG (visual ingest L568-571 §VV claim verifies absence) | _**DEPRECATED per design 2026-06-23**: KHÔNG render close × icon trong modal header — `DialogContent showCloseButton={false}`. Close UX = ESC + backdrop click + "Hủy bỏ" footer button (3 cơ chế đủ). Row giữ làm shared registry reference cho OTHER specs._ |
| checkbox (☐ / ☑) | `@/components/ui/checkbox` (shadcn radix) | `Checkbox` component (not icon glyph — composite control) | — | assets/wave02-ins-dossier-create/13257-555266_4-of-4-ready.png — 4 ☑ blue-filled boxes left of each row | 4 dòng tài liệu — default unchecked per AC-3 |
| printer icon (in body action buttons) | lucide-react | `Printer` | — | assets/wave02-ins-dossier-create/13257-558976_expanded-phieuquyettoan.png L932 — "In phiếu" + "Tải PDF" buttons each leading printer/download glyph | Brand blue button leading icon, 16px |
| download icon (Phiếu QT only) | lucide-react | `Download` | — | assets/wave02-ins-dossier-create/13257-558976_expanded-phieuquyettoan.png L932 — "Tải PDF" button leading download glyph | Only Phiếu QT screen has this (Phiếu BG single button) |
| plus icon ("+ Thêm mục điều khoản") | lucide-react | `Plus` | — | assets/wave02-ins-dossier-create/13257-537424_expanded-bienbannghiemthu.png L1164 + 13257-537605_expanded-giayuyquyen.png L1502 — full-width outline button shows "+" glyph leading label | 16px, text-foreground color, leading position |
| warning icon (HintBanner) | lucide-react | `AlertCircle` | — | assets/wave02-ins-dossier-create/13257-537424_expanded-bienbannghiemthu.png L1140-1141 — orange tinted banner shows ⚠ glyph leading message | Variant warning (orange tint), inside Alert component |

> Garage web component lookup: `Modal` / `Dialog` (share/dialog) + `Accordion` (share/accordion hoặc ui/accordion shadcn-radix) + `Checkbox` (ui/checkbox) + `Button` (share/buttons).

---

## Scope nhắc nhở — đây là CR mở rộng FEAT-STL-DETAIL

> **Spec này document modal "Hồ sơ bảo hiểm - #{mã phiếu QT}"** mở từ nút "+ Tạo hồ sơ bảo hiểm" trên header phiếu QT BH (entry point = FEAT-INS-STL-DETAIL AC-13). Gate hiển thị entry: chỉ enable khi `settlement.payer === 'INSURANCE'` (BR-INS-STL-DET-007).
>
> Modal = full-overlay với backdrop dim. Underlying page (STL-DETAIL) đã spec ở [`wave01-ins-stl-detail.md`](./wave01-ins-stl-detail.md) — KHÔNG re-spec ở đây (per user guidance "spec modal only").
>
> Print template content cho 4 documents (Phiếu QT auto, Phiếu báo giá auto, Biên bản nghiệm thu editable, Giấy ủy quyền editable) — chỉ document **structure outline** trong spec này; nội dung chi tiết theo print templates (gf-sales `ServiceOrderPrintStrategy` + gf-accounting `SettlementPrintStrategy`) + inline-edit form fields (AC-6/AC-7).

---

## Screen: Modal "Hồ sơ bảo hiểm" — state COLLAPSED (default, 13257:536881) — "2/4 sẵn sàng" demo

> Modal mở từ click "Tạo hồ sơ bảo hiểm". Centered, backdrop dim. Title "Hồ sơ bảo hiểm - #SET-20260326-00001" — **KHÔNG có close × icon** (design 2026-06-23 omits; close UX qua ESC + backdrop click + footer "Hủy bỏ"). Body = 4 accordion rows (collapsed). Footer = "Hủy bỏ" outline + "Xuất hồ sơ bảo hiểm" primary blue.
>
> Frame "2/4 sẵn sàng" = demo state capture 2 checkbox đã tick (Phiếu QT + Phiếu báo giá auto-ready) + 2 unchecked (Biên bản + Giấy ủy quyền chưa fill). Per AC-3 default = TẤT CẢ 4 unchecked.

### §0 ASCII Mockup

```
┌─ backdrop dim (full viewport) ─────────────────────────────────────────────┐
│                                                                              │
│        ┌──── Modal (centered, ~720×auto) ──────────────────────────────┐    │
│        │  Hồ sơ bảo hiểm - #SET-20260326-00001                          │    │ ← header title L1 ONLY (no × close per design 2026-06-23)
│        │ ──────────────────────────────────────────────────────────── │    │
│        │  ┌──────────────────────────────────────────────────────┐    │    │
│        │  │ ☑  Phiếu quyết toán                              ▾   │    │ ← accordion row 1 (collapsed)
│        │  │     SET-20260326-00001                                │    │    │
│        │  └──────────────────────────────────────────────────────┘    │    │
│        │  ┌──────────────────────────────────────────────────────┐    │    │
│        │  │ ☑  Phiếu báo giá                                 ▾   │    │ ← accordion row 2
│        │  │     PDV-20260320-00639                                │    │    │
│        │  └──────────────────────────────────────────────────────┘    │    │
│        │  ┌──────────────────────────────────────────────────────┐    │    │
│        │  │ ☐  Biên bản nghiệm thu                           ▾   │    │ ← accordion row 3
│        │  │     Thông tin được sử dụng để lập biên bản nghiệm thu │    │    │
│        │  └──────────────────────────────────────────────────────┘    │    │
│        │  ┌──────────────────────────────────────────────────────┐    │    │
│        │  │ ☐  Giấy ủy quyền nhận tiền bồi thường            ▾   │    │ ← accordion row 4
│        │  │     Áp dụng cho garage chưa ký liên kết với bảo hiểm  │    │    │
│        │  └──────────────────────────────────────────────────────┘    │    │
│        │ ──────────────────────────────────────────────────────────── │    │
│        │                                       [Hủy bỏ]  [Xuất hồ sơ bảo hiểm] │ ← footer right-align
│        └──────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
DossierCreateModal:
  type: container                        # → @/components/share/dialog hoặc ui/dialog (shadcn radix)
  variant: dialog                        # full overlay với backdrop
  width: 720                              # FIXED (default modal max-width — verify với design tokens)
  max_height: 90vh                       # scroll body khi 4 accordion expanded total > viewport
  bg: bg-background
  border: "1px solid border-input"
  rounded: rounded-lg
  shadow: shadow-lg
  open_trigger: "click button '+ Tạo hồ sơ bảo hiểm' (FEAT-INS-STL-DETAIL AC-13)"
  close_triggers:
    - "click 'Hủy bỏ' (footer)"
    - "ESC key"
    - "click backdrop (closeOnOverlay=true default)"
    # NOTE: KHÔNG có 'click X header' — design 2026-06-23 omits close × icon (see Icon Catalog row + §1 ModalHeader comment).
  children:
    - id: ModalHeader
      type: container
      direction: horizontal
      justify: between
      align: center
      padding: { y: 16, x: 24 }
      border_bottom: "1px solid border-input"
      flex-grow: 0
      children:
        - id: ModalTitle
          type: Text
          content: "Hồ sơ bảo hiểm - #{settlementCode}"   # vd "Hồ sơ bảo hiểm - #SET-20260326-00001"
          size: 18
          weight: 600
          color: text-foreground
          flex-grow: 1
        # ⚠️ PNG-verified: KHÔNG có nút × close icon trong header design.
        # Top-right area là chevron toggle hoặc empty space. Close UX qua 3 cơ chế:
        # (1) ESC key, (2) backdrop click, (3) "Hủy bỏ" footer button.
        # DEV dùng `<DialogContent showCloseButton={false}>` để SUPPRESS shadcn default X.
        # _close_button_removed: true (per design 2026-06-23 visual ingest)

    - id: ModalBody
      type: container
      direction: vertical
      gap: 12                              # gap-3 giữa 4 accordion rows
      padding: { y: 16, x: 24 }
      overflow: auto                       # scroll khi content > max-height
      flex-grow: 1
      children:
        - $ref: AccordionRow_PhieuQT       # AC-3 row 1 — Phiếu quyết toán
        - $ref: AccordionRow_PhieuBG       # AC-3 row 2 — Phiếu báo giá
        - $ref: AccordionRow_BBNT          # AC-3 row 3 — Biên bản nghiệm thu
        - $ref: AccordionRow_GUY           # AC-3 row 4 — Giấy ủy quyền

    - id: ModalFooter
      type: container
      direction: horizontal
      justify: end
      align: center
      gap: 12
      padding: { y: 16, x: 24 }
      border_top: "1px solid border-input"
      flex-grow: 0
      children:
        - id: CancelButton
          type: Button
          variant: outline
          size: default
          label: "Hủy bỏ"
          on_click: "closeModal()"
          flex-grow: 0
        - id: ExportButton
          type: Button
          variant: brand                    # primary blue per design
          size: default
          label: "Xuất hồ sơ bảo hiểm"
          disabled_when: "checkedCount === 0"       # AC-9 phải tích ≥1 mới xuất được
          on_click: "exportDossier(checkedDocTypes)"  # → backend gen PDFs + S3 upload + close modal + nav to Hồ sơ BH đã xuất tab
          flex-grow: 0

# ── Accordion row schema (share) ─────────────────────────────────────────────
AccordionRowBase:
  type: Accordion                          # → @/components/ui/accordion (shadcn radix) hoặc share/accordion
  mode: multiple                            # cho phép mở nhiều rows cùng lúc (AC-8 không cấm)
  collapsible: true
  trigger:
    type: container
    direction: horizontal
    align: center
    gap: 12
    padding: { y: 12, x: 16 }
    bg: bg-background
    hover_bg: bg-muted/30
    selected_bg: bg-muted/40                # khi row đang mở
    border: "1px solid border-input"
    rounded: rounded-md
    cursor: pointer
    children:
      - id: RowCheckbox
        type: Checkbox                       # → @/components/ui/checkbox
        default: false                       # AC-3 mặc định bỏ trống
        independent_from_expand: true        # check ≠ expand; click checkbox KHÔNG toggle accordion (stopPropagation)
        flex-grow: 0
      - id: RowTextBlock
        type: container
        direction: vertical
        gap: 2
        flex-grow: 1                         # ← chống bug chevron sát title (TAP-1 baseline)
        children:
          - id: RowTitle
            type: Text
            size: 14
            weight: 500
            color: text-foreground
          - id: RowSubtitle
            type: Text
            size: 14
            weight: 400
            color: text-muted-foreground
      - id: ChevronIcon
        type: Icon
        source: iconsax-reactjs              # hoặc lucide-react
        name: ArrowDown                       # → ArrowUp khi expanded (rotate-180 transform)
        variant: Linear
        size: 20
        color: text-muted-foreground
        flex-grow: 0
  content:                                   # AC-8 expanded body — DEV render inline preview/template per doc type
    type: container
    direction: vertical
    padding: { y: 16, x: 16 }
    border_top: "1px solid border-input"     # divider trong row khi expanded
    children: []                              # child layout per doc type — xem AccordionRow_* overrides below

# ── Per-doc overrides ────────────────────────────────────────────────────────
AccordionRow_PhieuQT:                       # AC-4 — auto-render, read-only print preview
  $ref: AccordionRowBase
  trigger:
    RowTitle.content: "Phiếu quyết toán"
    RowSubtitle.content: "{settlementCode}"  # vd "SET-20260326-00001"
  content.children:
    - $ref: PrintPreview_PhieuQT
    - id: PrintButton_QT
      type: Button
      variant: brand
      size: default
      label: "In phiếu"
      icon_leading: { source: iconsax-reactjs, name: Printer, variant: Linear, size: 20 }
      on_click: "openPrintDialog('SETTLEMENT', settlementCode)"

AccordionRow_PhieuBG:                       # AC-5 — auto-render, read-only print preview
  $ref: AccordionRowBase
  trigger:
    RowTitle.content: "Phiếu báo giá"
    RowSubtitle.content: "{serviceOrderCode}"  # vd "PDV-20260320-00639"
  content.children:
    - $ref: PrintPreview_PhieuBG
    - id: PrintButton_BG
      type: Button
      variant: brand                      # PNG-verified brand blue (NOT outline per 2026-06-23 visual ingest)
      label: "In phiếu"
      icon_leading: { source: iconsax-reactjs, name: Printer, variant: Linear, size: 20 }
      on_click: "openPrintDialog('QUOTATION', serviceOrderCode)"

AccordionRow_BBNT:                          # AC-6 — editable inline template
  $ref: AccordionRowBase
  trigger:
    RowTitle.content: "Biên bản nghiệm thu"
    RowSubtitle.content: "Thông tin được sử dụng để lập biên bản nghiệm thu"
  content.children:
    - id: BBNT_Hint
      type: Alert
      variant: info
      message: "Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."
    - $ref: BBNT_Template                    # template editable per AC-6 field list — xem §5
    - id: PrintButton_BBNT
      type: Button
      variant: brand                      # PNG-verified brand blue
      label: "In biên bản"
      icon_leading: { source: iconsax-reactjs, name: Printer, variant: Linear, size: 20 }

AccordionRow_GUY:                           # AC-7 — editable inline template
  $ref: AccordionRowBase
  trigger:
    RowTitle.content: "Giấy ủy quyền nhận tiền bồi thường"
    RowSubtitle.content: "Áp dụng cho garage chưa ký liên kết với bảo hiểm"
  content.children:
    - id: GUY_Hint
      type: Alert
      variant: info
      message: "Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."
    - $ref: GUY_Template
    - id: PrintButton_GUY
      type: Button
      variant: brand                      # PNG-verified brand blue
      label: "In giấy ủy quyền"
      icon_leading: { source: iconsax-reactjs, name: Printer, variant: Linear, size: 20 }

_negative_coverage:
  # R8 — element class inspected + ruled out (KHÔNG observe trong PNG collapsed state)
  - "KHÔNG có close × icon trong ModalHeader — design 2026-06-23 omits (PNG-verified L568-571 §VV); DEV phải `showCloseButton={false}` (override shadcn Dialog default)"
  - "KHÔNG có search bar / filter trên ModalBody — modal scope = 4 fixed doc types (Phiếu QT / báo giá / BBNT / GUY), không filter"
  - "KHÔNG có icon leading trên RowTitle (Phiếu QT/BG/BBNT/GUY) — chỉ Checkbox + plain text + Chevron 3-zone, không doc-type icon"
  - "KHÔNG có Helper text / Error text dưới Checkbox — Checkbox đứng riêng, KHÔNG có inline validation message ở collapsed state"
  - "KHÔNG có 'Select all' master checkbox ở ModalHeader/ModalBody top — design không cho bulk-toggle (per AC-3 user phải tick từng row)"
  - "KHÔNG có progress indicator / step counter trên ModalHeader — modal đơn step (chọn docs → xuất), không wizard"
  - "KHÔNG có loading spinner / skeleton trong AccordionRow collapsed state — body chỉ render khi expanded"
```

### §2 Design Token Map

| Token | Tailwind | Hex | Khi dùng |
|---|---|---|---|
| `base/foreground` | `text-foreground` | `#18181b` | Modal title, row title text |
| `base/muted-foreground` | `text-muted-foreground` | `#71717a` | Row subtitle, chevron icon |
| `base/border` | `border-input` | `#e4e4e7` | Modal border, row border, divider |
| `base/background` | `bg-background` | `#ffffff` | Modal surface, accordion row surface |
| `base/muted/30` | `bg-muted/30` | `#f4f4f5` (30% opacity) | Row hover bg |
| `base/muted/40` | `bg-muted/40` | — | Row selected (expanded) bg |
| `base/foreground-brand-CD` | `bg-brand` / `text-primary` | `#0052ff` | "Xuất hồ sơ bảo hiểm" primary button + checkbox checked state |
| `border radius/lg` | `rounded-lg` | `8px` | Modal corners |
| `border radius/md` | `rounded-md` | `6px` | Accordion row corners + button corners |
| `shadow/lg` | `shadow-lg` | — | Modal elevation |
| `spacing/3` | `gap-3` | `12px` | Modal body gap giữa 4 rows + footer gap buttons |
| `spacing/4` | `gap-4` / `p-4` | `16px` | Modal header/footer padding-y |
| `spacing/6` | `px-6` | `24px` | Modal header/body/footer padding-x |
| `typography/large/font-size+lh` | `text-lg leading-7` | `18/28` | Modal title |
| `typography/small/font-size+lh` | `text-sm leading-5` | `14/20` | Row title + subtitle |
| `font/weight/semibold` | `font-semibold` | `600` | Modal title |
| `font/weight/medium` | `font-medium` | `500` | Row title |

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `DossierCreateModal` | hidden | `display:none` (Radix Dialog data-state=closed) | initial |
| `DossierCreateModal` | open | overlay + backdrop dim + modal centered | click "+ Tạo hồ sơ bảo hiểm" |
| `AccordionRow` | collapsed (default) | content hidden, chevron ▾ | initial |
| `AccordionRow` | expanded | content visible, chevron ▴ (rotate-180) + selected_bg | click trigger row |
| `RowCheckbox` | unchecked (default per AC-3) | `data-state=unchecked` empty box | initial |
| `RowCheckbox` | checked | `data-state=checked` blue bg + white tick | user click |
| `RowCheckbox` | hover | `bg-muted/40` ring | mouse-enter |
| `ExportButton` | disabled | `opacity-50 cursor-not-allowed` | `checkedCount === 0` |
| `ExportButton` | enabled | brand bg (#0052ff) full opacity | `checkedCount >= 1` |
| `ExportButton` | loading | + spinner + disabled | đang gọi exportDossier (backend gen PDFs) |
| `Modal` | exporting | + overlay loading spinner | `exportInProgress === true` |
| `Modal` | post-export success | close modal + toast "Xuất hồ sơ thành công" + nav to tab "Hồ sơ BH đã xuất" | exportDossier resolve |
| `Modal` | post-export error | error toast `ERR-INS-008` "Không xuất được hồ sơ" + giữ modal open | exportDossier reject |
| `BBNT_Template editable field` | editable | ContentEditable / Textarea inline | AC-6 — click ô để nhập/sửa |
| `GUY_Template editable field` | editable | ContentEditable / Textarea inline | AC-7 |
| `PrefillField` (e.g. Bên A Tên KH) | read-only prefill | `bg-muted text-foreground` | nguồn = phiếu QT BH (Tên KH, garage info) |
| `BlankField` (no prefill source) | editable empty | `placeholder` | AC-6/AC-7 — kế toán nhập tay |

### §4 Component Prop Map

| Component | Layer | Prop | Default | Override (W02-DOSSIER-CREATE) | Lý do |
|---|---|---|---|---|---|
| `Dialog` (Modal) | share/dialog hoặc ui/dialog | `size` | `default` (max-w-md) | `lg` hoặc explicit `max-w-[720px]` | 4 accordion rows + expanded body cần width đủ render preview |
| `Dialog` | — | `closeOnOverlay` | `true` | giữ default | UX standard |
| `Accordion` | share/accordion hoặc ui/accordion | `type` | `single` | `multiple` | AC-8 cho phép mở nhiều rows cùng lúc nếu user muốn so sánh; verify Business |
| `Accordion` | — | `collapsible` | `true` | giữ | UX standard |
| `AccordionTrigger` | — | child layout | shadcn default = label + chevron | custom = checkbox + textBlock + chevron | AC-3 cấu trúc 3-zone trigger |
| `Checkbox` | ui/checkbox | `checked` | depends | `false` default + controlled state | AC-3 mặc định bỏ trống |
| `Checkbox` | — | `onClick` event | propagate | `stopPropagation()` | KHÔNG toggle accordion khi click checkbox |
| `Button` (ExportButton) | share/buttons/button | `variant` | `default` | `brand` | primary CTA xanh #0052ff |
| `Button` (CancelButton) | — | `variant` | `default` | `outline` | secondary action |
| `Button` (PrintButton_*) | — | `variant` | `default` | `brand` | PNG-verified brand blue per design (NOT outline secondary as initially hypothesized) |
| `Alert` (Hint) | share/alert hoặc ui/alert | `variant` | `default` | `info` (blue/grey neutral) | AC-6/AC-7 hint text "Click vào ô để nhập/sửa" |

### §5 Field Composition Schema

```yaml
data_binding_query:
  query: PrepareCreateInsuranceDossier      # backend
  args:
    settlementId: "{currentSettlement.id}"
  response_shape:
    settlement:
      code: string                          # → ModalTitle suffix "#{code}"
      serviceOrderCode: string              # → AccordionRow_PhieuBG.RowSubtitle
      customerName: string                  # → prefill Bên A Tên (BBNT + GUY)
      garageInfo: { name, address, taxId, representative, position, phone, bankAccount, bankName }  # → prefill Bên B
      vehicleInfo: { licensePlate, model, brand }   # → prefill III.GUY
      compensationAmount: { value: number, valueInWords: string }   # → prefill III.GUY "Số tiền bồi thường"
      insurancePolicy: { company, contractNumber }   # → prefill AC-5 Phiếu báo giá header
    quotationPreviewData: {...}             # AC-5 auto-render
    settlementPreviewData: {...}            # AC-4 auto-render

# ── AC-6 Biên bản nghiệm thu — editable inline fields ────────────────────────
BBNT_Template:
  type: container
  direction: vertical
  gap: 16
  children:
    - id: BBNT_Header_Hardcoded
      content: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc / -----o0o-----"
      editable: false
    - id: BBNT_Section_LapBienBan
      title: "Lập biên bản"
      fields:
        - { key: licensePlate, label: "BKS xe", source: blank, editable: true, type: Input }
        - { key: createdDate, label: "Ngày lập biên bản (dd/mm/yyyy)", source: blank, editable: true, type: DateInput }
        - { key: createdLocation, label: "Địa điểm lập biên bản", source: blank, editable: true, type: Input }
        - { key: quotationRef, label: "Căn cứ phiếu báo giá (số + ngày)", source: prefill_from_quotation, editable: true, type: Input }
    - id: BBNT_Section_TwoParties
      title: "Thông tin các bên"
      # PNG-verified 2026-06-23 (Image 1): LIST 6 row dạng [Label trái w-140 | Input full-width phải]. 
      # Mỗi field 1 row riêng. KHÔNG phải table 2-row gộp Bên A/B.
      layout: { type: vertical, gap: 12, row_layout: "label_left_width-140 | input_flex-1" }
      fields:
        - { key: partyA_name, label: "Bên A", source: prefill_from_settlement.customerName, editable: true, type: Input,
            _example: "Công ty CP XD Smart Building Việt Nam" }
        - { key: partyB_name, label: "Bên B", source: prefill_from_garage.name, editable: true, type: Input,
            _example: "Công ty TNHH Tư vấn Thương mại và Dịch vụ Sơn Quân (Green Auto)" }
        - { key: representative, label: "Đại diện", source: prefill_from_garage.representative, editable: true, type: Input,
            _example: "Ông: Vũ Sơn Quân" }
        - { key: position, label: "Chức vụ", source: prefill_from_garage.position, editable: true, type: Input,
            _example: "Tổng Giám Đốc" }
        - { key: companyAddress, label: "Địa chỉ Công ty", source: prefill_from_garage.address, editable: true, type: Input,
            _example: "Thôn Úc Gián - Xã Thuận Thiên - Kiến Thụy - Hải Phòng" }
        - { key: bankInfo, label: "MST / STK / NH", combined: true, source: "composite: {garage.taxId} - STK {garage.bankAccount} - {garage.bankName}", editable: true, type: Input,
            _example: "MST 0201972206 - STK 19134464547018 - Techcombank Kiến An",
            _note: "Composite field (combined: true) — slash label '/' ngụ ý gộp 3 phần MST + STK + NH ghép bằng ' - ' separator vào 1 Input row. Backend có thể split persist 3 trường riêng (taxId/bankAccount/bankName); UI render gộp 1 row." }
    - id: BBNT_Section_NoiDungIntro
      type: Text
      # PNG-verified 2026-06-23: paragraph intro TRƯỚC clauses, KHÔNG dùng "Nội dung nghiệm thu" làm section header
      content: "Hôm nay, tại đơn vị sửa chữa nêu trên, hai bên cùng làm việc và thống nhất nghiệm thu, thanh lý hợp đồng sửa chữa xe theo các nội dung sau:"
      size: 14
      weight: 400
      color: text-foreground
    - id: BBNT_Section_NoiDungNghiemThu
      title: null                              # KHÔNG có "Nội dung nghiệm thu" section title — intro paragraph trên thay thế
      type: ClauseList                      # editable list, prefill 4 default clauses
      default_clauses:
        - "Bên A đã hoàn thành sửa chữa xe theo phiếu báo giá đã duyệt."
        - "Bên B (khách hàng) đã nhận bàn giao xe trong tình trạng kỹ thuật đảm bảo."
        - "Bảo hành theo quy định của garage."
        - "Biên bản này được lập thành 02 bản — mỗi bên giữ 01 bản, có giá trị pháp lý như nhau."
      add_button:
        label: "+ Thêm mục điều khoản"
        variant: outline
        full_width: true
        align: center
        icon_leading: { source: lucide-react, name: Plus, size: 16, color: text-foreground }   # icon "+" tường minh cho DEV
        _png_verified: "Full-width row button với leading Plus icon + label centered"
      editable_per_clause: true
      reorderable: false
    - id: BBNT_Section_KhoiKy
      title: ""                              # no header
      type: SignatureBlock
      children:
        - { label: "Đại diện khách hàng (Ký, ghi rõ họ tên)", placeholder: "_____________________" }
        - { label: "Đại diện xưởng sửa chữa (Ký, ghi rõ họ tên)", placeholder: "_____________________" }
      _note: "Ký tay ngoài hệ thống — render placeholder area khi in"

# ── AC-7 Giấy ủy quyền — editable inline fields ───────────────────────────────
GUY_Template:
  type: container
  direction: vertical
  gap: 16
  children:
    - id: GUY_Header_Hardcoded
      content: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc / -----o0o-----"
      editable: false
    - id: GUY_LocationDate
      content_template: "{location}, ngày {dd}/{mm}/{yyyy}"
      editable: true
      type: Input                            # single line input — kế toán nhập "An Lão, ngày 26/03/2026"
    - id: GUY_Section_I_BenUyQuyen
      title: "I. Bên ủy quyền (KH)"
      fields:
        - { key: party_name, label: "Họ tên / Tên đơn vị", combined: true, source: prefill_from_settlement.customerName, editable: true, readonly_prefill: true,
            _note: "Composite (combined: true) — 1 Input render cả 'Họ tên' cá nhân HOẶC 'Tên đơn vị' tổ chức (mutually exclusive value) tùy customer type" }
        - { key: party_address, label: "Địa chỉ", combined: false, source: blank, editable: true }
        - { key: party_nationality, label: "Quốc tịch", combined: false, source: blank, editable: true }
        - { key: party_representative, label: "Đại diện / Chức vụ", combined: true, source: blank, editable: true,
            _note: "Composite (combined: true) — slash label '/' ngụ ý 1 Input gộp tên đại diện + chức vụ (vd 'Nguyễn Văn A - Giám đốc'). KHÔNG split 2 Input." }
        - { key: party_gcn, label: "GCN bảo hiểm tự nguyện / bắt buộc", combined: true, source: blank, editable: true,
            _note: "Composite (combined: true) — slash label '/' = single Input nhập GCN BH (loại 'tự nguyện' HOẶC 'bắt buộc' tùy ngữ cảnh). Không phải 2 Input." }
        - { key: party_id, label: "Số CMND/CCCD · Ngày cấp · Nơi cấp", combined: true, source: blank, editable: true,
            _note: "Composite (combined: true) — 1 Input gộp 3 trường ngăn bằng ' · ' separator (số CMND, ngày cấp, nơi cấp)." }
    - id: GUY_Section_II_DuocUyQuyen
      title: "II. Bên được ủy quyền (garage)"
      # PNG-verified 2026-06-23 (Image 2): 8 fields in grid 2-col × 4-row, all prefill từ garage profile + editable
      type: container
      direction: grid
      cols: 2
      gap: { col: 24, row: 16 }
      fields:                                  # explicit field schema (KHÔNG dùng shorthand `fields: [...]`)
        - { key: garage_name, label: "Tên garage / Công ty", combined: true, source: prefill_from_garage.name, editable: true,
            _note: "Composite (combined: true) — 1 Input render 'Tên garage' HOẶC 'Tên công ty' (mutually exclusive label semantics, single value)" }
        - { key: garage_representative, label: "Đại diện", combined: false, source: prefill_from_garage.representative, editable: true }
        - { key: garage_address, label: "Địa chỉ", combined: false, source: prefill_from_garage.address, editable: true, text_overflow: ellipsis }
        - { key: garage_position, label: "Chức vụ", combined: false, source: prefill_from_garage.position, editable: true }
        - { key: garage_taxId, label: "Mã số thuế", combined: false, source: prefill_from_garage.taxId, editable: true, format: numeric }
        - { key: garage_bankAccount, label: "Số tài khoản", combined: false, source: prefill_from_garage.bankAccount, editable: true, format: numeric }
        - { key: garage_phone, label: "Điện thoại", combined: false, source: prefill_from_garage.phone, editable: true, format: phone }
        - { key: garage_bankName, label: "Ngân hàng", combined: false, source: prefill_from_garage.bankName, editable: true }
    - id: GUY_Section_III_NoiDung
      title: "III. Nội dung ủy quyền"
      fields:
        - { key: vehicle_brand, source: prefill_from_settlement.vehicleInfo.brand, label: "Loại xe" }
        - { key: vehicle_plate, source: prefill_from_settlement.vehicleInfo.licensePlate, label: "Biển kiểm soát" }
        - { key: compensation_value, source: prefill_from_settlement.compensationAmount.value, label: "Số tiền bồi thường (VND)", format: vnd }
        - { key: compensation_words, source: prefill_from_settlement.compensationAmount.valueInWords, label: "Bằng chữ" }
        - { key: accident_date, source: blank, label: "Ngày tai nạn", type: DateInput }
        - { key: accident_content, source: blank, label: "Nội dung", type: Textarea }
    - id: GUY_Section_IV_CamKet
      title: "IV. Cam kết"
      type: ClauseList
      default_clauses:
        - "Bên ủy quyền cam kết các thông tin trên là chính xác."
        - "Bên được ủy quyền cam kết sử dụng số tiền bồi thường đúng mục đích sửa chữa xe."
        - "Cả hai bên cùng cam kết tuân thủ quy định pháp luật hiện hành."
      add_button:
        label: "+ Thêm mục điều khoản"
        variant: outline
        full_width: true
        align: center
        icon_leading: { source: lucide-react, name: Plus, size: 16, color: text-foreground }
        _png_verified: "Full-width row button với leading Plus icon + label centered"
      editable_per_clause: true
    - id: GUY_Section_KhoiKy
      type: SignatureBlock
      children:
        - { label: "Đại diện khách hàng (Ký, ghi rõ họ tên)" }
        - { label: "Đại diện xưởng sửa chữa (Ký, ghi rõ họ tên)" }

# ── Export mutation ──────────────────────────────────────────────────────────
mutation:
  name: ExportInsuranceDossier
  args:
    settlementId: "{currentSettlement.id}"
    checkedDocTypes: [string]               # ["SETTLEMENT", "QUOTATION", "ACCEPTANCE", "AUTHORIZATION"]
    acceptanceData: {...}                   # BBNT field values nếu ACCEPTANCE checked
    authorizationData: {...}                # GUY field values nếu AUTHORIZATION checked
  on_success:
    - close modal
    - toast.success "Xuất hồ sơ thành công"
    - switch tab to "Hồ sơ bảo hiểm đã xuất" (FEAT-INS-DOSSIER-VIEW)
    - refetch ListInsuranceDossierSets
  on_error:
    - toast.error ERR-INS-008 "Không xuất được hồ sơ"
    - keep modal open + retain user input (don't clear acceptanceData / authorizationData)
```

### §6 Layout Width Table

| Container | Max-width | Margin | Align-self | Notes |
|---|---|---|---|---|
| `DossierCreateModal` (root) | 720px | center | center | viewport-centered modal |
| `ModalHeader` | FILL (720) | 0 | stretch | title row ONLY (no close button per design 2026-06-23 — only ModalTitle child, `justify=start`) |
| `ModalBody` | FILL (720 - 48 padding-x = 672) | 0 | stretch | accordion rows full-width |
| `AccordionRow trigger` | FILL (672) | 0 | stretch | clickable row full-width |
| `AccordionRow content` | FILL (672 - 32 padding-x = 640) | 0 | stretch | expanded body padding-y/x |
| `ModalFooter` | FILL | 0 | stretch | buttons right-aligned |
| `CancelButton` / `ExportButton` | HUG (auto) | 0 | end | size default per shadcn |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | Modal title "Hồ sơ bảo hiểm - #SET-..." | text-lg/600 text-foreground | Modal header — context settlement |
| L1 (action) | ExportButton "Xuất hồ sơ bảo hiểm" | bg-brand text-primary-foreground | Primary CTA |
| L2 | AccordionRow trigger | bg-background border rounded-md | List item — 1 document |
| L3 | RowTitle (Phiếu QT / Phiếu báo giá / etc.) | text-sm/500 text-foreground | Document name |
| L4 | RowSubtitle (mã / mô tả) | text-sm/400 text-muted-foreground | Document metadata |
| L4 | Checkbox + Chevron icons | size-5 + size-5 | Interactive controls (independent) |
| L3 (expanded) | AccordionRow content | bg-background padding-4 | Preview/template body |
| L4 | Section header (BBNT/GUY "Lập biên bản", "Bên A", etc.) | text-sm/600 | Sub-section in template |
| L5 | Form field (label + input) | label text-sm/500 + input baseline | Editable form fields per AC-6/AC-7 |
| L5 | Hint Alert | bg-muted text-muted-foreground | Editing hint "Click vào ô để nhập/sửa" |
| L2 (footer) | CancelButton | outline | Secondary action |

### §8 Anti-Pattern Trap

| # | Trap | Triệu chứng | Root cause | Đúng |
|---|---|---|---|---|
| AP-1 | **Render checkbox default = checked (theo design demo)** | Tất cả 4 checkboxes tự tick khi mở modal → kế toán xuất luôn 4 PDF không cần | DEV copy design state mà bỏ qua AC-3 "mặc định bỏ trống" | Initial state: `checked={false}` cho tất cả 4 RowCheckbox; user phải tự tick |
| AP-2 | **Click checkbox cũng toggle accordion** | User click ☐ → row expand → ngạc nhiên | DEV không stopPropagation event onClick từ Checkbox lên AccordionTrigger | `<Checkbox onClick={(e) => e.stopPropagation()} />` |
| AP-3 | **ExportButton enabled khi checkedCount=0** | User click "Xuất hồ sơ" với 0 docs → backend nhận empty array → tạo bộ rỗng | DEV không gate `disabled` | `<Button disabled={checkedDocTypes.length === 0}>...</Button>` |
| AP-4 | **Modal width responsive (max-w-md ~448px)** | Modal quá nhỏ, accordion body bị nén → preview/template scroll horizontal | DEV dùng default `max-w-md` shadcn | Override `max-w-[720px]` hoặc explicit width 720 |
| AP-5 | **AC-4/AC-5 preview render rỗng / static dummy text thay vì call print service** | Accordion expand show static "Phiếu QT" text node hoặc empty div thay vì render actual print HTML | DEV chưa wire up to existing `PrintService` (ServiceOrderPrintStrategy + SettlementPrintStrategy) | Render iframe / inline-print component dùng existing print HTML template (gf-sales `for-print/{code}` + gf-accounting equivalent) |
| AP-6 | **AC-6/AC-7 prefill fields editable mà KHÔNG mark visually** | KH ko biết Tên đã prefill có thể sửa | Per AC, prefill fields editable → DEV render Input bình thường (giống blank) — drift | Token visual subtle: `bg-muted/30` cho prefill fields + `border-dashed` hover hint. Verify với BA. |
| AP-7 | **BBNT/GUY field-level data persist sai timing** | App user nhập, đóng app → backend nhận data trống → mất | Per AC-6/AC-7 + EC-1: persist CHỈ khi click "Xuất hồ sơ bảo hiểm" | Web: useState local form state; chỉ submit khi ExportButton click. App: localStorage temporary; persist server-side only on export |
| AP-8 | **ClauseList (Nội dung nghiệm thu / Cam kết) reorderable** | User drag clauses thay đổi thứ tự | Per AC-6/AC-7: chỉ Add/Remove + Edit text, KHÔNG reorder | `<ClauseList reorderable={false} />` |
| AP-9 | **Modal close trên success xuất → user mất context** | Sau khi xuất, modal đóng đột ngột không feedback | Cần toast + nav to tab "Hồ sơ BH đã xuất" | `on_success: [toast, switchTab, refetch]` |
| AP-10 | **Modal close trên backdrop click trong khi user đang nhập BBNT/GUY → mất data** | Accidental click outside → data loss | Standard dialog UX | Confirm dialog: "Có nội dung chưa lưu — bạn có muốn thoát?" khi `acceptanceData || authorizationData` non-empty |

#### AP-1 (Render checkbox default = checked) — PNG evidence
_png_verified: "assets/wave02-ins-dossier-create/13257-536881_2-of-4-ready.png L562-566 §VV claim 'Demo state 2/4: rows 1+2 ticked; rows 3+4 unticked' — confirms PNG captures POPULATED state, KHÔNG phải initial render. AC-3 mandate initial = ALL unchecked → DEV không copy populated state. PNG-verified contradicts default-checked anti-pattern."

#### AP-3 (ExportButton enabled when checkedCount=0) — PNG evidence
_png_verified: "Both PNGs (13257-536881, 13257-555266) — ExportButton visual identical (brand blue, no opacity reduction). PNG doesn't capture explicit disabled state, nhưng spec mandates `disabled={checkedCount===0}` per AC-9. Inferred from absence of any 0-checked PNG variant (all design states show ≥2 checked)."

#### AP-4 (Modal width responsive max-w-md) — PNG evidence
_png_verified: "assets/wave02-ins-dossier-create/13257-536881_2-of-4-ready.png — Modal visibly wider than default shadcn max-w-md (~448px); spans ~720px relative to 1440 viewport. Title 'Hồ sơ bảo hiểm - #SET-20260326-00001' đầy đủ visible mà không truncate. Confirms custom width override required."

#### AP-9 (Modal close trên success → user mất context) — PNG evidence
_png_verified: "Visual ingest verifies modal stays open in all 6 frames captured (collapsed + 4 expanded variants). No 'post-export success state' frame captured — design implies modal closes + navigates per AC-9 description, không có PNG showing toast/nav overlay. SOFT advisory."

#### AP-2, AP-5, AP-6, AP-7, AP-8, AP-10 (Interactive behaviors) — PNG evidence
_png_verified: "These traps describe INTERACTIVE behaviors (event propagation, persistence timing, ContentEditable, reorder) not capturable in static PNG. SOFT trap status — advisory per FEAT AC-3/AC-6/AC-7/EC-1, không phải PNG-verified visual claim."

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-dossier-create/13257-536881_2-of-4-ready.png   # demo state 2/4 checked
  pngs_read:
    - assets/wave02-ins-dossier-create/13257-536881_2-of-4-ready.png   # demo state 2/4 checked
    - assets/wave02-ins-dossier-create/13257-555266_4-of-4-ready.png   # demo state 4/4 checked
  claims_verified:
    - claim: "Modal centered with backdrop dim (underlying STL-DETAIL page visible but faded). Modal width ~720px (slim relative to viewport 1440)."
      evidence: "Both PNGs — modal sits in center with grey-tinted backdrop, underlying tabs/header faintly visible at edges"
    - claim: "Modal header: title 'Hồ sơ bảo hiểm - #SET-20260326-00001' ONLY (left-aligned, `justify=start`). KHÔNG có close × icon (design 2026-06-23 omits — close UX qua ESC + backdrop click + footer Hủy bỏ). Underline divider below header."
      evidence: "Both PNGs — title left-aligned, header right area EMPTY (no × icon visible), horizontal divider below — confirms `DialogContent showCloseButton={false}` directive in §1"
    - claim: "4 accordion rows stacked vertically (gap ~12px), each = bordered card với rounded-md, padding ~12px-16px"
      evidence: "Both PNGs — 4 distinct boxes visible, equal spacing"
    - claim: "Each accordion row layout: [Checkbox left] [Title + Subtitle vertical middle, flex-1] [Chevron ▾ right]"
      evidence: "Both PNGs — every row consistent 3-zone horizontal layout"
    - claim: "Demo state 2/4: rows 1+2 (Phiếu QT + Phiếu báo giá) ĐÃ tick (blue checkbox); rows 3+4 (Biên bản + Giấy ủy quyền) chưa tick"
      evidence: "13257-536881_2-of-4-ready.png — first 2 checkboxes filled blue, last 2 empty"
    - claim: "Demo state 4/4: tất cả 4 checkboxes ĐÃ tick (blue)"
      evidence: "13257-555266_4-of-4-ready.png — all 4 checkboxes blue filled"
    - claim: "Subtitle text: row 1 = 'SET-20260326-00001', row 2 = 'PDV-20260326-00639', row 3 = 'Thông tin được sử dụng để lập biên bản nghiệm thu', row 4 = 'Áp dụng cho garage chưa ký liên kết với bảo hiểm'"
      evidence: "Both PNGs — subtitle text matches AC-3 spec"
    - claim: "Footer right-aligned: [Hủy bỏ outline] + [Xuất hồ sơ bảo hiểm primary blue]. Footer divider above."
      evidence: "Both PNGs — bottom row has 2 buttons, 'Xuất hồ sơ bảo hiểm' blue background visible"
    - claim: "All 4 rows COLLAPSED — no preview/template body visible inline. Chevron points DOWN (▾) for all rows."
      evidence: "Both PNGs — modal height same (~600px) regardless of checked state; no expanded content visible"
```

### §9 Container Hierarchy (legacy)

```
DossierCreateModal (overlay) [Dialog]
├── BackdropOverlay [absolute, bg-black/50]
└── ModalSurface (720×auto) [vertical] bg-background rounded-lg shadow-lg
    ├── ModalHeader (FILL × 56) [horizontal, justify=start, padding=16_24]
    │   └── ModalTitle "Hồ sơ bảo hiểm - #SET-20260326-00001" (text-lg/600)
    │   # no CloseButton per design 2026-06-23 — DialogContent showCloseButton={false}
    ├── ModalBody (FILL × auto, max-h=90vh-headerFooter) [vertical, gap=12, padding=16_24, overflow=auto]
    │   ├── AccordionRow_PhieuQT (FILL × 64 collapsed)
    │   │   └── trigger [horizontal, gap=12, padding=12_16, border, rounded-md]
    │   │       ├── Checkbox (size-5)
    │   │       ├── TextBlock [vertical, gap=2, flex-1]
    │   │       │   ├── Title "Phiếu quyết toán" (text-sm/500)
    │   │       │   └── Subtitle "SET-20260326-00001" (text-sm/400 muted)
    │   │       └── ChevronIcon ▾ (size-5)
    │   ├── AccordionRow_PhieuBG (same anatomy)
    │   ├── AccordionRow_BBNT (same anatomy + expanded body = BBNT_Template editable)
    │   └── AccordionRow_GUY (same anatomy + expanded body = GUY_Template editable)
    └── ModalFooter (FILL × 56) [horizontal, justify=end, gap=12, padding=16_24, border-top]
        ├── CancelButton "Hủy bỏ" (outline default)
        └── ExportButton "Xuất hồ sơ bảo hiểm" (brand default, disabled when checkedCount=0)
```

---

## Screen: Modal "Hồ sơ bảo hiểm" — state ALL CHECKED demo (13257:555266)

> Same modal structure, all 4 checkboxes pre-checked (demo populated). Per AC-3 default state = unchecked; this frame captures "user has ticked all 4" → ExportButton enabled.
>
> Only delta vs screen 1 = checkbox visual state. Reuse all §1-§8 from main screen.

### §0 ASCII Mockup

```
(Same as screen 1, but rows 3 + 4 checkboxes now ☑ instead of ☐)

  ┌── Modal ──────────────────────────────────────────────────────────┐
  │  Hồ sơ bảo hiểm - #SET-20260326-00001                              │
  │ ──────────────────────────────────────────────────────────────── │
  │  ☑  Phiếu quyết toán              ▾                                │
  │  ☑  Phiếu báo giá                 ▾                                │
  │  ☑  Biên bản nghiệm thu           ▾   ← now CHECKED (was ☐ in S1) │
  │  ☑  Giấy ủy quyền nhận tiền BT    ▾   ← now CHECKED (was ☐ in S1) │
  │ ──────────────────────────────────────────────────────────────── │
  │                                       [Hủy bỏ]  [Xuất hồ sơ BH]   │ ← ExportButton enabled (was disabled if 0)
  └──────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

Reuse identical anatomy from Screen 1 (`DossierCreateModal` + 4 `AccordionRow` rows + Footer). Only delta = `RowCheckbox.checked = true` for all 4 rows + `ExportButton.disabled = false` (since `checkedCount === 4 >= 1`).

```yaml
_negative_coverage:
  # R8 — element class inspected + ruled out for "all-checked" state
  - "KHÔNG có 'Đã chọn 4/4' counter text bên cạnh ExportButton — design không render explicit count, chỉ visual via 4 checked boxes"
  - "KHÔNG có success toast / inline confirmation khi user tick checkbox — checkbox state change là silent UI update"
  - "KHÔNG có CTA color change trên ExportButton giữa enabled/disabled — same brand blue (per PNG observed identical visual), DEV opacity-50 + cursor-not-allowed cho disabled"
  - "KHÔNG có 'Bỏ chọn tất cả' / 'Chọn tất cả' bulk action button bên cạnh ExportButton"
  - "KHÔNG có badge/indicator trên Checkbox khi prefilled checked (no 'auto-ready' label) — state only visual via checked color"
```

### §2 Design Token Map

Reuse Screen 1 §2 — no token unique to all-checked state.

### §3 State Table

Same as Screen 1 §3 with state values flipped:
- `RowCheckbox` (all 4) → `checked=true` (blue bg + white tick)
- `ExportButton` → `disabled=false`, brand bg active

### §4 Component Prop Map

Reuse Screen 1 §4. No prop override unique to all-checked state.

### §5 Field Composition Schema

Reuse Screen 1 §5. On `ExportButton` click → `exportDossier(checkedDocTypes = [SETTLEMENT, QUOTATION, ACCEPTANCE, AUTHORIZATION])` → backend gen 4 PDFs → upload S3 → close modal + nav to tab "Hồ sơ BH đã xuất".

### §6 Layout Width Table

Reuse Screen 1 §6 (modal width + accordion row widths unchanged).

### §7 Visual Hierarchy Map

Reuse Screen 1 §7 (visual hierarchy identical, only checkbox states change).

### §8 Anti-Pattern Trap

Reuse Screen 1 §8 (all 10 anti-pattern traps apply to both screens). Highlighted relevant traps for this all-checked state:
- AP-1 (default checked vs AC-3 unchecked): not triggered here since this is interactive demo state, not initial render
- AP-3 (ExportButton enabled gating): correctly enabled when checkedCount >= 1
- AP-9 (post-export navigation): expected after clicking ExportButton

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-dossier-create/13257-555266_4-of-4-ready.png
  pngs_read:
    - assets/wave02-ins-dossier-create/13257-555266_4-of-4-ready.png
  claims_verified:
    - claim: "Modal identical to screen 1, only difference = all 4 checkboxes blue-filled (checked)"
      evidence: "13257-555266 — checkbox column shows 4× blue squares with white tick vs screen 1 (2 blue + 2 empty)"
    - claim: "ExportButton 'Xuất hồ sơ bảo hiểm' maintains brand blue background = enabled (checkedCount=4>=1)"
      evidence: "Both screens — button visually identical; per spec disabled state = opacity-50 (not observed in either screen)"
    - claim: "All 4 rows still COLLAPSED — chevron ▾ pointing down, no expanded body visible"
      evidence: "13257-555266 — modal body height matches screen 1; no preview content visible"
```

### §9 Container Hierarchy

Identical to Screen 1 — only `RowCheckbox.checked` state differs.

---

---

## Screen: Modal — Phiếu quyết toán EXPANDED (AC-4) (13257:558976)

> Row 1 "Phiếu quyết toán" expanded inline; rows 2/3/4 collapsed. Body = PrintPreview "PHIẾU QUYẾT TOÁN SỬA CHỮA" template render (read-only, auto-generated from settlement snapshot). Action: "In phiếu" outline + "Tải PDF" outline.

### §0 ASCII Mockup

```
┌─ Modal (centered, 720×auto, content scrollable) ─────────────────────────────────────┐
│  Hồ sơ bảo hiểm - #SET-20260326-00001                                                │
│ ─────────────────────────────────────────────────────────────────────────────────── │
│  ┌─ Row 1: Phiếu quyết toán EXPANDED ──────────────────────────────────────────┐    │
│  │ ☑  Phiếu quyết toán                                                    ▴   │    │ ← chevron-up
│  │     SET-20260326-00001                                                       │    │
│  │ ─────────────────────────────────────────────────────────────────────────── │    │
│  │                       PHIẾU QUYẾT TOÁN SỬA CHỮA                  (centered)  │    │
│  │                       SET-20260326-00001                          (subtitle) │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │  Garage         │ Ngày quyết toán │ Khách hàng        │ Biển số xe          │    │ ← 4-col header
│  │  Mỹ Đình – Chi…│ 26/03/2026      │ Chungntt – …      │ 30A1234 – ACURA TSX │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │  Dịch vụ thực hiện                                                            │    │
│  │  ┌──────────────────────────────────────────────────────────────────────┐  │    │
│  │  │ STT │ Nội dung │ ĐVT │ SL │ Đơn giá │ Thành tiền  (header bg-accent) │  │    │
│  │  │  1  │ …        │ Lần │ 1  │ 700.000 │ 700.000                          │  │    │
│  │  │                                                                          │  │    │
│  │  │ Tổng                                                          700.000   │  │    │
│  │  └──────────────────────────────────────────────────────────────────────┘  │    │
│  │  Phụ tùng sử dụng                                                             │    │
│  │  ┌────── same 6-col table + Tổng row ───────────────────────────────────┐  │    │
│  │  ──────────────────────────────────────────────────────────────────────  │    │
│  │  Phân bổ Bảo hiểm                                                             │    │
│  │  ┌──────────────────────────────────────────────────────────────────────┐  │    │
│  │  │ CK liên kết BH – Vật tư                                       -50.000 │  │    │
│  │  │ CK liên kết BH – Công dịch vụ                                 -50.000 │  │    │
│  │  │ Giảm trừ bồi thường                                            +50.000│  │    │
│  │  │ Khấu hao vật tư / thay mới                                    -50.000 │  │    │
│  │  │ Khấu trừ bảo hiểm                                             -95.040 │  │    │
│  │  │ Tổng thanh toán                                              700.000  │  │    │ ← bold
│  │  └──────────────────────────────────────────────────────────────────────┘  │    │
│  │                                                       [In phiếu] [Tải PDF]   │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│  ┌─ Row 2: Phiếu báo giá ▾ collapsed (☑ checked)                          ──┐    │
│  ┌─ Row 3: Biên bản nghiệm thu ▾ collapsed (☐ unchecked)                   ──┐    │
│  ┌─ Row 4: Giấy ủy quyền ▾ collapsed (☐ unchecked)                          ──┐    │
│ ─────────────────────────────────────────────────────────────────────────────────── │
│                                            [Hủy bỏ]  [Xuất hồ sơ bảo hiểm]          │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
AccordionRow_PhieuQT_Expanded:
  $ref: AccordionRow_PhieuQT   # extend Screen 1 collapsed
  expanded: true
  trigger.chevron: ChevronUp   # rotate-180
  content:
    type: container
    direction: vertical
    gap: 16
    padding: { y: 24, x: 16 }
    border_top: "1px solid border-input"
    bg: bg-background
    children:
      - id: PrintPreview_PhieuQT_Header
        type: container
        direction: vertical
        align: center
        gap: 4
        children:
          - { type: Text, content: "PHIẾU QUYẾT TOÁN SỬA CHỮA", size: 18, weight: 600 }
          - { type: Text, content: "{settlementCode}", size: 14, weight: 400, color: text-muted-foreground }
      - id: PrintPreview_PhieuQT_HeaderInfo
        type: container
        direction: grid
        cols: 4
        gap: 16
        padding: { y: 16, x: 0 }
        border_y: "1px solid border-input"
        children:
          - { id: garage, label: "Garage", value: "{settlement.garageName}" }
          - { id: date, label: "Ngày quyết toán", value: "{settlement.settledAt}", format: date }
          - { id: customer, label: "Khách hàng", value: "{settlement.customerName}" }
          - { id: vehicle, label: "Biển số xe", value: "{settlement.vehicleLabel}" }
      - id: ServicesTable
        type: Table
        title: "Dịch vụ thực hiện"
        _renders_as: "section-label text-sm/500 placed above Table block"   # R7 — title RENDERS visually trên header bảng (PNG-verified L720 §0 ASCII)
        columns:
          - { key: index, label: "STT", width: 50, align: center }
          - { key: name, label: "Nội dung", flex: 1, align: left }
          - { key: unit, label: "ĐVT", width: 60, align: center }
          - { key: qty, label: "SL", width: 50, align: right }
          - { key: unitPrice, label: "Đơn giá", width: 100, align: right, format: vnd }
          - { key: amount, label: "Thành tiền", width: 100, align: right, format: vnd }
        data_source: "settlement.services"
        footer_row:
          - { colSpan: 5, content: "Tổng", align: right }
          - { content: "{settlement.servicesTotal}", align: right, format: vnd, emphasis: bold }
      - id: PartsTable
        $ref: ServicesTable
        title: "Phụ tùng sử dụng"
        _renders_as: "section-label text-sm/500 placed above Table block"   # R7 — title RENDERS visually
        data_source: "settlement.parts"
        footer_row.last_cell.content: "{settlement.partsTotal}"
      - id: AllocationSection
        type: Table
        title: "Phân bổ Bảo hiểm"
        _renders_as: "section-label text-sm/500 placed above Table block"   # R7 — title RENDERS visually (PNG-verified L730 §0 ASCII)
        columns:
          - { key: label, label: "", flex: 1 }
          - { key: amount, label: "", width: 120, align: right, format: signed_vnd }
        rows:
          - { label: "CK liên kết BH – Vật tư",        amount: "{adjustments.ckLinkedParts.signedTotal}" }
          - { label: "CK liên kết BH – Công dịch vụ",  amount: "{adjustments.ckLinkedService.signedTotal}" }
          - { label: "Giảm trừ bồi thường",            amount: "{adjustments.compensationReduction.signedTotal}" }
          - { label: "Khấu hao vật tư / thay mới", combined: false, amount: "{adjustments.depreciation.signedTotal}",
              _note: "combined: false — đây là display LABEL của data row trong AllocationSection table (read-only), KHÔNG phải form Input. Slash '/' chỉ là copy text trong label, không cần composite Input handling." }
          - { label: "Khấu trừ bảo hiểm",              amount: "{adjustments.deductible.signedTotal}" }
        footer_row:
          - { content: "Tổng thanh toán", emphasis: bold }
          - { content: "{settlement.totalPayment}", emphasis: bold, format: vnd }
      - id: ActionBar
        type: container
        direction: horizontal
        justify: end
        gap: 12
        children:
          - { id: PrintBtn, type: Button, variant: brand, label: "In phiếu", icon_leading: { source: lucide-react, name: Printer, size: 16 } }
          - { id: DownloadBtn, type: Button, variant: brand, label: "Tải PDF", icon_leading: { source: lucide-react, name: Download, size: 16 } }

_negative_coverage:
  # R8 — element class inspected + ruled out cho Phiếu QT expanded
  - "KHÔNG có Edit / Save button trong expanded body — AC-4 read-only mandate, KHÔNG cho user modify số liệu"
  - "KHÔNG có Comment / Note input field — read-only preview, không cho annotate"
  - "KHÔNG có sort/filter trên ServicesTable + PartsTable — fixed snapshot data từ settlement"
  - "KHÔNG có column show/hide toggle — 6 cột固定 cho 2 tables (STT/Nội dung/ĐVT/SL/Đơn giá/Thành tiền)"
  - "KHÔNG có pagination cho ServicesTable + PartsTable — print preview render full list inline (scroll modal nếu cần)"
  - "KHÔNG có 'View source' link đến gf-accounting backend — preview render qua PrintService transparent với user"
  - "KHÔNG có collapse button trên 2 sub-tables — chỉ expand/collapse ở accordion row level (1 cấp)"
```

### §2 Design Token Map

Reuse Screen 1 §2. Thêm:
| Token | Tailwind | Hex | Khi dùng |
|---|---|---|---|
| `bg-accent` | `bg-accent` | `#f4f4f5` | ServicesTable + PartsTable header row |
| `text-foreground` xxlarge | `text-lg` (18) `font-semibold` | — | "PHIẾU QUYẾT TOÁN SỬA CHỮA" title |

### §3 State Table

| Element | State | Class delta | Trigger |
|---|---|---|---|
| `AccordionRow_PhieuQT` | expanded | content visible + chevron ▴ rotate-180 + bg-muted/40 trigger | click trigger row |
| `PrintPreview body` | always | render từ settlement snapshot (read-only) | row expanded |
| `PrintBtn`/`DownloadBtn` | enabled | brand secondary | always khi row expanded |

### §4 Component Prop Map

| Component | Layer | Prop | Override |
|---|---|---|---|
| `Table` (ServicesTable + PartsTable) | share/tables | `headerBg` | `bg-accent` |
| `Table` | — | `footerRow.emphasis` | `bold` cho Tổng |
| `Button` (PrintBtn + DownloadBtn) | share/buttons | `variant` | `brand` (per PNG: brand blue, NOT outline secondary as initially hypothesized) |
| `PrintPreview` wrapper | — | content source | `PrintService.getSettlementPreview(settlementId)` (gf-accounting SettlementPrintStrategy) |

### §5 Field Composition Schema

```yaml
data_binding:
  source: settlement (read-only snapshot, AC-4 auto-generated)
  binding: PrepareCreateInsuranceDossier.settlementPreviewData   # backend pre-rendered HTML or structured JSON
  fields:
    header:
      title: "PHIẾU QUYẾT TOÁN SỬA CHỮA"   # hardcoded
      subtitle: "{settlement.code}"          # SET-20260326-00001
    headerInfo:
      garage: prefill from settlement.garageInfo
      settledAt: prefill from settlement.settledAt
      customer: prefill from settlement.customerName + phone
      vehicle: prefill from settlement.vehiclePlate + brand-model
    servicesTable:
      data: settlement.services[]
      footerTotal: settlement.servicesTotal
    partsTable:
      data: settlement.parts[]
      footerTotal: settlement.partsTotal
    allocationSection:
      rows: 5 fixed (CK Vật tư / CK Công DV / Giảm trừ bồi thường / Khấu hao / Khấu trừ BH)
      footerTotal: settlement.totalPayment    # = grand total after allocation
  read_only: true (AC-4 — KHÔNG cho sửa)
  print_template: gf-accounting SettlementPrintStrategy
```

### §6 Layout Width Table

| Container | Max-width | Notes |
|---|---|---|
| AccordionRow_PhieuQT content | FILL (~640px = modal body - padding) | inherit modal body |
| PrintPreview_PhieuQT_HeaderInfo | FILL grid 4-col | 4 equal columns, gap-4 |
| ServicesTable / PartsTable | FILL | full-width tables |
| AllocationSection | FILL | 2-col (label flex + amount 120) |
| ActionBar | HUG, justify-end | right-aligned buttons |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | Title "PHIẾU QUYẾT TOÁN SỬA CHỮA" | text-lg/600 centered | Document title |
| L2 | Subtitle settlement code | text-sm/400 muted centered | Document ref |
| L3 | HeaderInfo 4-col fields | label text-xs muted + value text-sm | Document metadata |
| L3 | Table section titles | text-sm/500 | Sub-section labels |
| L4 | Table header row | text-sm/500 bg-accent | Column labels |
| L5 | Table data rows | text-sm/400 | Item data |
| L4 (emphasis) | Table Tổng row + Phân bổ Tổng thanh toán | text-sm/600 bold | Subtotal/total |

### §8 Anti-Pattern Trap

| # | Trap | Đúng |
|---|---|---|
| AP-QT-1 | DEV implement custom Phiếu QT layout thay vì reuse PrintService | Consume `SettlementPrintStrategy.preview()` render — KHÔNG re-code table layout |
| AP-QT-2 | Cho user sửa content (Tổng / số tiền / hạng mục) | AC-4 read-only mandate — render `<iframe srcDoc={previewHtml} sandbox>` hoặc display-only Tables |
| AP-QT-3 | "In phiếu" + "Tải PDF" gọi browser print() trực tiếp thay vì tải PDF chuẩn | "In phiếu" = `window.print()` trên iframe nội dung; "Tải PDF" = `GET /settlements/{id}/pdf` download endpoint (gf-accounting) |
| AP-QT-4 | Quên render header info 4-col grid | Use `grid grid-cols-4 gap-4` cho HeaderInfo; KHÔNG flatten thành vertical list |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-dossier-create/13257-558976_expanded-phieuquyettoan.png
  pngs_read:
    - assets/wave02-ins-dossier-create/13257-558976_expanded-phieuquyettoan.png
  claims_verified:
    - claim: "Row 1 expanded với chevron ▴ + content inline; rows 2 (Phiếu báo giá checked), 3 (Biên bản unchecked), 4 (Giấy ủy quyền unchecked) collapsed"
      evidence: "13257-558976 — first row tall (~700px), rows 2-4 short (~64px each); chevron up vs chevron down clearly distinguishable"
    - claim: "Body header 'PHIẾU QUYẾT TOÁN SỬA CHỮA' centered + subtitle 'SET-20260326-00001' below"
      evidence: "13257-558976 — bold centered title + smaller centered code below"
    - claim: "HeaderInfo 4-col: Garage / Ngày quyết toán / Khách hàng / Biển số xe (each label-on-top + value-below pattern)"
      evidence: "13257-558976 — horizontal row with 4 equal-width info blocks"
    - claim: "2 tables 'Dịch vụ thực hiện' + 'Phụ tùng sử dụng' với 6 cols (STT|Nội dung|ĐVT|SL|Đơn giá|Thành tiền) + Tổng footer"
      evidence: "13257-558976 — đếm rõ 2 separate tables with bg-accent header rows, each followed by Tổng row"
    - claim: "Section 'Phân bổ Bảo hiểm' 5 rows + 'Tổng thanh toán' bold row at bottom"
      evidence: "13257-558976 — 5 labeled rows (CK Vật tư, CK Công DV, Giảm trừ bồi thường, Khấu hao, Khấu trừ BH) + final Tổng row bold"
    - claim: "Action bar right-aligned: 'In phiếu' brand blue + 'Tải PDF' brand blue (both with leading icons)"
      evidence: "13257-558976 — bottom right of expanded body, 2 brand-blue buttons side-by-side với Printer + Download icons"
```

### §9 Container Hierarchy (legacy)

```
AccordionRow_PhieuQT EXPANDED (13257:558976)
└── trigger [horizontal collapsed-style with chevron ▴]
└── content [vertical, gap=16, padding=24_16]
    ├── PrintPreview_Header [centered text vertical] — "PHIẾU QUYẾT TOÁN SỬA CHỮA" + code
    ├── HeaderInfo grid [4 cols × 1 row] — garage / date / customer / vehicle
    ├── ServicesTable [Table 6-col + Tổng row]
    ├── PartsTable [Table 6-col + Tổng row]
    ├── AllocationSection [Table 2-col, 5 rows + Tổng thanh toán bold]
    └── ActionBar [horizontal, justify=end, gap=12] — In phiếu + Tải PDF
```

---

## Screen: Modal — Phiếu báo giá EXPANDED (AC-5) (13257:537243)

> Row 2 "Phiếu báo giá" expanded; rows 1/3/4 collapsed. Body = PrintPreview "PHIẾU BÁO GIÁ SỬA CHỮA" template render (read-only, auto-generated). Action: "In phiếu" outline.

### §0 ASCII Mockup

```
┌─ Modal ──────────────────────────────────────────────────────────────────┐
│  Hồ sơ bảo hiểm - #SET-20260326-00001                                    │
│ ─────────────────────────────────────────────────────────────────────── │
│  ┌─ Row 1: Phiếu quyết toán ▾ collapsed (☑)                          ──┐ │
│  ┌─ Row 2: Phiếu báo giá EXPANDED ──────────────────────────────────┐  │
│  │ ☑  Phiếu báo giá                                              ▴ │  │
│  │     PDV-20260326-00639                                            │  │
│  │ ───────────────────────────────────────────────────────────────── │  │
│  │                       PHIẾU BÁO GIÁ SỬA CHỮA            (centered)│  │
│  │                       PDV-20260326-00639                 (subtitle)│  │
│  │  ───────────────────────────────────────────────────────────────  │  │
│  │  Garage         │ Ngày báo giá  │ Công ty bảo hiểm │ Số HĐ BH    │  │ ← 4-col header
│  │  Mỹ Đình - …    │ 26/03/2026    │ Bảo hiểm Bảo Việt│ BV-29038-…  │  │
│  │  ───────────────────────────────────────────────────────────────  │  │
│  │  ┌─────────────────────────────────────────────────────────────┐│  │
│  │  │ STT │ Nội dung sửa chữa │ Phụ tùng │ Đơn giá │ Thành tiền   ││  │ ← single 5-col table
│  │  │  1  │ Thay đồ điện thoại│       1  │ 700.000 │ 700.000      ││  │
│  │  │ Tổng                                                700.000  ││  │ ← bold
│  │  └─────────────────────────────────────────────────────────────┘│  │
│  │                                                       [In phiếu] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌─ Row 3: Biên bản nghiệm thu ▾ (☐)                                ──┐ │
│  ┌─ Row 4: Giấy ủy quyền ▾ (☐)                                       ──┐ │
│ ─────────────────────────────────────────────────────────────────────── │
│                                            [Hủy bỏ]  [Xuất hồ sơ BH]    │
└──────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
AccordionRow_PhieuBG_Expanded:
  $ref: AccordionRow_PhieuBG       # Screen 1 collapsed base
  expanded: true
  content:
    type: container
    direction: vertical
    gap: 16
    padding: { y: 24, x: 16 }
    children:
      - id: PrintPreview_BG_Header
        type: container
        direction: vertical
        align: center
        gap: 4
        children:
          - { type: Text, content: "PHIẾU BÁO GIÁ SỬA CHỮA", size: 18, weight: 600 }
          - { type: Text, content: "{quotation.code}", size: 14, color: text-muted-foreground }
      - id: PrintPreview_BG_HeaderInfo
        type: container
        direction: grid
        cols: 4
        gap: 16
        children:
          - { id: garage, label: "Garage", value: "{garageName}" }
          - { id: date, label: "Ngày báo giá", value: "{quotation.createdAt}", format: date }
          - { id: insuranceCompany, label: "Công ty bảo hiểm", value: "{settlement.insuranceCompany}" }
          - { id: insurancePolicy, label: "Số hợp đồng BH", value: "{settlement.insuranceContractNumber}" }
      - id: QuotationTable
        type: Table
        columns:
          - { key: index, label: "STT", width: 50, align: center }
          - { key: name, label: "Nội dung sửa chữa", flex: 2, align: left }
          - { key: parts, label: "Phụ tùng", width: 80, align: right }
          - { key: unitPrice, label: "Đơn giá", width: 100, align: right, format: vnd }
          - { key: amount, label: "Thành tiền", width: 100, align: right, format: vnd }
        data_source: "quotation.items"
        footer_row:
          - { colSpan: 4, content: "Tổng", align: right }
          - { content: "{quotation.total}", align: right, format: vnd, emphasis: bold }
      - id: ActionBar
        type: container
        direction: horizontal
        justify: end
        children:
          - { id: PrintBtn, type: Button, variant: brand, label: "In phiếu", icon_leading: { source: lucide-react, name: Printer, size: 16 } }

_negative_coverage:
  # R8 — element class inspected + ruled out cho Phiếu BG expanded
  - "KHÔNG có 'Tải PDF' button — chỉ 'In phiếu' single action (PNG-verified L1100, distinguishes vs Phiếu QT 2-button)"
  - "KHÔNG có Edit / Save button — AC-5 read-only mandate"
  - "KHÔNG có quotation version selector / history dropdown — preview = current snapshot only"
  - "KHÔNG có inline price edit — pricing data từ ServiceOrderPrintStrategy fixed"
  - "KHÔNG có 'Phụ tùng sử dụng' separate table như Phiếu QT — Phiếu báo giá gộp Nội dung + Phụ tùng vào single 5-col table (PNG-verified L1099)"
  - "KHÔNG có sub-total breakdown per category — chỉ Tổng row cuối"
  - "KHÔNG có collapse/expand chevron on individual rows trong QuotationTable"
```

### §2 Design Token Map

Reuse Screen "Phiếu QT EXPANDED" §2.

### §3 State Table

| Element | State | Trigger |
|---|---|---|
| Row 2 expanded | content visible + chevron ▴ | click row 2 trigger |
| QuotationTable | render from quotation snapshot | row expanded |
| PrintBtn enabled | always (no download — chỉ in phiếu trong design) | row expanded |

### §4 Component Prop Map

Same pattern as Phiếu QT — `PrintService.getQuotationPreview(serviceOrderId)` từ gf-sales `ServiceOrderPrintStrategy` `/for-print/{code}` endpoint.

### §5 Field Composition Schema

```yaml
data_binding:
  source: serviceOrder + quotation (read-only)
  binding: PrepareCreateInsuranceDossier.quotationPreviewData
  fields:
    header.title: "PHIẾU BÁO GIÁ SỬA CHỮA"
    header.subtitle: "{quotation.code}"   # PDV-... 
    headerInfo: garage / date / insuranceCompany / insuranceContractNumber
    quotationTable.data: quotation.items[]
    quotationTable.footerTotal: quotation.total
  read_only: true (AC-5)
  print_template: gf-sales ServiceOrderPrintStrategy
```

### §6 Layout Width Table

| Container | Max-width | Notes |
|---|---|---|
| Expanded body | FILL (~640px) | inherit |
| HeaderInfo grid | 4 cols | gap-4 |
| QuotationTable | FILL | 5-col |

### §7 Visual Hierarchy Map

Same pattern as Phiếu QT — L1 title centered + L3 header info + L4 table.

### §8 Anti-Pattern Trap

| # | Trap | Đúng |
|---|---|---|
| AP-BG-1 | Phiếu báo giá render từ gf-accounting thay vì gf-sales | Source = gf-sales ServiceOrderPrintStrategy (Phiếu QT = gf-accounting; KHÔNG nhầm boundary) |
| AP-BG-2 | KHÔNG có "Tải PDF" trong design — DEV thêm gây inconsistency | Chỉ có "In phiếu" outline (single action) per design — KHÔNG add Download button |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-dossier-create/13257-537243_expanded-phieubaogia.png
  pngs_read:
    - assets/wave02-ins-dossier-create/13257-537243_expanded-phieubaogia.png
  claims_verified:
    - claim: "Row 2 (Phiếu báo giá) expanded; row 1 collapsed checked + rows 3/4 collapsed unchecked"
      evidence: "13257-537243 — row 2 tall body visible, others compact"
    - claim: "Body title 'PHIẾU BÁO GIÁ SỬA CHỮA' centered + subtitle 'PDV-20260326-00639'"
      evidence: "13257-537243 — bold centered + smaller code"
    - claim: "Single 5-col table (STT | Nội dung sửa chữa | Phụ tùng | Đơn giá | Thành tiền) + Tổng footer row bold (KHÔNG phải 2 tables như Phiếu QT)"
      evidence: "13257-537243 — single table block, distinct from Phiếu QT 2-table layout"
    - claim: "Action bar only 'In phiếu' brand blue button (no 'Tải PDF' second button — distinguishes Phiếu báo giá from Phiếu QT 2-button action bar)"
      evidence: "13257-537243 — single brand-blue button right-aligned at bottom với Printer icon"
```

### §9 Container Hierarchy

```
AccordionRow_PhieuBG EXPANDED (13257:537243)
└── content [vertical, gap=16, padding=24_16]
    ├── PrintPreview_BG_Header [centered] — "PHIẾU BÁO GIÁ SỬA CHỮA" + code
    ├── HeaderInfo [grid 4-col] — garage / date / insuranceCompany / insuranceContractNumber
    ├── QuotationTable [Table 5-col + Tổng row]
    └── ActionBar [horizontal, justify=end] — In phiếu (single button)
```

---

## Screen: Modal — Biên bản nghiệm thu EXPANDED (AC-6) (13257:537424)

> Row 3 "Biên bản nghiệm thu" expanded; rows 1/2 collapsed checked, row 4 collapsed unchecked. Body = EDITABLE TEMPLATE (form-field hybrid) — kế toán điền inline. Action: "In biên bản" outline.

### §0 ASCII Mockup

```
┌─ Modal ─────────────────────────────────────────────────────────────────┐
│  Hồ sơ bảo hiểm - #SET-20260326-00001                                    │
│ ─────────────────────────────────────────────────────────────────────── │
│  Row 1: Phiếu quyết toán ▾ (☑)                                          │
│  Row 2: Phiếu báo giá ▾ (☑)                                              │
│  ┌─ Row 3: Biên bản nghiệm thu EXPANDED ────────────────────────────┐  │
│  │ ☐  Biên bản nghiệm thu                                       ▴   │  │
│  │     Thông tin được sử dụng để lập biên bản nghiệm thu             │  │
│  │ ───────────────────────────────────────────────────────────────── │  │
│  │           CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM            (centered)│  │
│  │           Độc lập - Tự do - Hạnh phúc                              │  │
│  │           -----o0o-----                                            │  │
│  │           BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG       (title L1)  │  │
│  │  ╔════════════════════════════════════════════════════════════╗   │  │
│  │  ║ ⚠ Các trường thông tin có thể chỉnh sửa trực tiếp.         ║   │  │ ← hint banner (warning)
│  │  ║   Click vào ô để nhập/sửa thông tin.                       ║   │  │
│  │  ╚════════════════════════════════════════════════════════════╝   │  │
│  │   ┌──────────────┬──────────────────┬──────────────────────┐     │  │
│  │   │ BKS xe       │ Ngày lập biên... │ Địa điểm lập biên... │     │  │ ← 3-col form fields
│  │   └──────────────┴──────────────────┴──────────────────────┘     │  │
│  │   Căn cứ phiếu báo giá [_______________________________]          │  │
│  │   ─────────────────────────────────────────────────────────────── │  │
│  │   Thông tin các bên:                                               │  │
│  │   ┌──────────────────┬───────────────────────────────────────────┐ │  │ ← 6 row [Label w-140 | Input flex-1]
│  │   │ Bên A            │ Công ty CP XD Smart Building Việt Nam     │ │  │
│  │   │ Bên B            │ Công ty TNHH TM & DV Sơn Quân (Green Auto)│ │  │
│  │   │ Đại diện         │ Ông: Vũ Sơn Quân                          │ │  │
│  │   │ Chức vụ          │ Tổng Giám Đốc                             │ │  │
│  │   │ Địa chỉ Công ty  │ Thôn Úc Gián - Xã Thuận Thiên - Kiến Thụy │ │  │
│  │   │ MST / STK / NH   │ MST 0201972206 - STK 191344... - Techcom..│ │  │
│  │   └──────────────────┴───────────────────────────────────────────┘ │  │
│  │   Hôm nay, tại đơn vị sửa chữa nêu trên, hai bên cùng làm việc và  │  │ ← intro paragraph (NOT a section header)
│  │   thống nhất nghiệm thu, thanh lý hợp đồng sửa chữa xe theo các     │  │
│  │   nội dung sau:                                                     │  │
│  │   1. [Bên A đã hoàn thành sửa chữa xe…]      (editable)            │  │
│  │   2. [Bên B đã nhận bàn giao xe…]                                  │  │
│  │   3. [Bảo hành theo quy định…]                                     │  │
│  │   4. [Biên bản lập thành 02 bản…]                                  │  │
│  │   ┌────────────── [+ Thêm mục điều khoản] full-width ────────────┐ │  │ ← outline row button, leading Plus icon
│  │   └─────────────────────────────────────────────────────────────┘ │  │
│  │   ─────────────────────────────────────────────────────────────── │  │
│  │   ┌─────────────────────────┬─────────────────────────┐           │  │
│  │   │ Đại diện khách hàng     │ Đại diện xưởng sửa chữa │           │  │ ← signature blocks
│  │   │ (Ký, ghi rõ họ tên)     │ (Ký, ghi rõ họ tên)     │           │  │
│  │   └─────────────────────────┴─────────────────────────┘           │  │
│  │                                                  [In biên bản]    │  │
│  └────────────────────────────────────────────────────────────────────┘ │
│  Row 4: Giấy ủy quyền ▾ (☐)                                              │
│ ─────────────────────────────────────────────────────────────────────── │
│                                            [Hủy bỏ]  [Xuất hồ sơ BH]    │
└──────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
AccordionRow_BBNT_Expanded:
  $ref: AccordionRow_BBNT
  expanded: true
  content:
    type: container
    direction: vertical
    gap: 16
    padding: { y: 24, x: 16 }
    children:
      - id: BBNT_HardcodedHeader
        type: container
        direction: vertical
        align: center
        children:
          - { type: Text, content: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", size: 14, weight: 600 }
          - { type: Text, content: "Độc lập - Tự do - Hạnh phúc", size: 14, weight: 400 }
          - { type: Text, content: "-----o0o-----", size: 14, weight: 400 }
          - { type: Text, content: "BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG", size: 18, weight: 700, mt: 12 }
      - id: HintBanner
        type: Alert
        variant: warning              # orange/yellow tint per design
        icon: AlertCircle
        message: "Các trường thông tin có thể chỉnh sửa trực tiếp. Click vào ô để nhập/sửa thông tin."
      - id: LapBienBan_Row1
        type: container
        direction: grid
        cols: 3
        gap: 16
        children:
          - { id: licensePlate, type: Input, label: "BKS xe", placeholder: "Nhập biển số", source: blank }
          - { id: createdDate, type: DateInput, label: "Ngày lập biên bản", placeholder: "dd/mm/yyyy", source: blank }
          - { id: createdLocation, type: Input, label: "Địa điểm lập biên bản", source: blank }
      - id: QuotationRef
        type: Input
        label: "Căn cứ phiếu báo giá"
        prefill_key: "quotation.codeAndDate"
        editable: true
      - id: TwoPartiesSection
        type: container
        direction: vertical
        gap: 8
        # R1/R2 v7.4 (post-reviewer remediation 2026-06-24): CARD wrap per PNG L46-48
        # Heading "Thông tin các bên" rendered INSIDE card (same gray bg) — KHÔNG outside as plain text
        BG: bg-muted/30
        Border: 1px solid border-input
        rounded: rounded-md
        padding: { y: 12, x: 16 }
        _png_verified: "assets/wave02-ins-dossier-create/13257-537424_expanded-bienbannghiemthu.png L46-48 shows gray-tinted card with visible border + rounded corners wrapping heading + 6 horizontal rows"
        children:
          - { type: Text, content: "Thông tin các bên", size: 14, weight: 600 }
          # PNG-verified anatomy 2026-06-23: section là LIST 6 row dạng [Label trái | Input full-width phải]
          # KHÔNG phải table 2-row gộp (sai trong v6 trước đây). Mỗi field 1 row riêng.
          - id: PartyForm_BBNT
            type: container
            direction: vertical
            gap: 12
            BG: transparent           # R1 — proof inspected: inner stack inherits card bg, no own fill
            Border: none              # R2 — proof inspected: no inner border (parent TwoPartiesSection has border)
            children:
              - id: partyA_name
                type: Input
                label: "Bên A"
                prefill: "settlement.customerName"          # KH (vd "Công ty CP XD Smart Building Việt Nam")
                editable: true
                layout: { label_position: left, label_width: 140, input_flex: 1 }
              - id: partyB_name
                type: Input
                label: "Bên B"
                prefill: "garage.name"                       # vd "Công ty TNHH Tư vấn Thương mại và Dịch vụ Sơn Quân (Green Auto)"
                editable: true
                layout: { label_position: left, label_width: 140, input_flex: 1 }
              - id: representative
                type: Input
                label: "Đại diện"
                prefill: "garage.representative"             # vd "Ông: Vũ Sơn Quân"
                editable: true
                layout: { label_position: left, label_width: 140, input_flex: 1 }
              - id: position
                type: Input
                label: "Chức vụ"
                prefill: "garage.position"                   # vd "Tổng Giám Đốc"
                editable: true
                layout: { label_position: left, label_width: 140, input_flex: 1 }
              - id: companyAddress
                type: Input
                label: "Địa chỉ Công ty"
                prefill: "garage.address"                    # vd "Thôn Úc Gián - Xã Thuận Thiên - Kiến Thụy - Hải Phòng"
                editable: true
                layout: { label_position: left, label_width: 140, input_flex: 1 }
              - id: bankInfo
                type: Input
                label: "MST / STK / NH"
                combined: true                              # slash label '/' = 1 Input gộp 3 phần
                prefill: "{garage.taxId} - STK {garage.bankAccount} - {garage.bankName}"   # vd "MST 0201972206 - STK 19134464547018 - Techcombank Kiến An"
                editable: true
                layout: { label_position: left, label_width: 140, input_flex: 1 }
                _note: "Composite field (combined: true) — 3 phần ghép bằng ' - ' separator. Có thể split ra 3 Input riêng (taxId / bankAccount / bankName) khi backend persist; UI render gộp 1 row."
      - id: NoiDungNghiemThu_Intro
        type: Text
        # PNG-verified: paragraph intro TRƯỚC list clauses (NOT a section header).
        content: "Hôm nay, tại đơn vị sửa chữa nêu trên, hai bên cùng làm việc và thống nhất nghiệm thu, thanh lý hợp đồng sửa chữa xe theo các nội dung sau:"
        size: 14
        weight: 400
        color: text-foreground
      - id: NoiDungNghiemThu
        type: ClauseList
        # title KHÔNG dùng "Nội dung nghiệm thu" như section header — design dùng intro paragraph trên (NoiDungNghiemThu_Intro)
        title: null
        default_clauses:
          - "Bên A đã hoàn thành sửa chữa xe theo phiếu báo giá đã duyệt."
          - "Bên B (khách hàng) đã nhận bàn giao xe trong tình trạng kỹ thuật đảm bảo."
          - "Bảo hành theo quy định của garage."
          - "Biên bản này được lập thành 02 bản — mỗi bên giữ 01 bản, có giá trị pháp lý như nhau."
        add_button:
          label: "+ Thêm mục điều khoản"
          variant: outline
          full_width: true
          align: center
          icon_leading: { source: lucide-react, name: Plus, size: 16, color: text-foreground }   # icon "+" tường minh
          _png_verified: "BBNT + GUY PNGs render full-width row button với leading Plus icon + label centered — KHÔNG inline link"
        editable_per_clause: true
        reorderable: false
      - id: SignatureBlock
        type: container
        direction: grid
        cols: 2
        gap: 16
        children:
          - { type: Text, content: "Đại diện khách hàng (Ký, ghi rõ họ tên)", align: center, size: 14, weight: 500 }
          - { type: Text, content: "Đại diện xưởng sửa chữa (Ký, ghi rõ họ tên)", align: center, size: 14, weight: 500 }
      - id: ActionBar
        type: container
        direction: horizontal
        justify: end
        children:
          - { id: PrintBtn_BBNT, type: Button, variant: brand, label: "In biên bản", icon_leading: { source: lucide-react, name: Printer, size: 16 } }

_negative_coverage:
  # R8 — element class inspected + ruled out cho BBNT expanded
  - "KHÔNG có 'Lập biên bản' section heading text trên LapBienBan_Row1 — design dùng 3 inline labeled inputs (BKS xe / Ngày / Địa điểm), KHÔNG render heading text 'Lập biên bản' phía trên (PNG L1144-1145 §0 ASCII chỉ show 3 inputs)"
  - "KHÔNG có separate header text outside card — 'Thông tin các bên' heading nằm INSIDE card (cùng gray bg) per PNG L46-48"
  - "KHÔNG có Save button trong expanded body — EC-1: persist chỉ on Export click, KHÔNG có inline Save"
  - "KHÔNG có 'Reset' / 'Clear form' button — once user edit, không có revert action"
  - "KHÔNG có drag handle / reorder icon trên ClauseList items — reorderable: false (AP-8)"
  - "KHÔNG có Delete button visible per ClauseList row at default state — có thể hover-only (DEV verify)"
  - "KHÔNG có rich-text formatting toolbar (bold/italic/list) — ClauseList = plain text editable, không có WYSIWYG"
  - "KHÔNG có 'Lưu nháp' button — toàn bộ data trong session state, không có draft persistence"
  - "KHÔNG có character count / word count indicator — clause length không hạn chế (validate backend)"
  - "KHÔNG có signature pad / canvas widget — ký ngoài hệ thống (AP-BBNT-6), chỉ render label placeholder text"
```

### §2 Design Token Map

Reuse Screen 1 §2. Thêm:
| Token | Tailwind | Hex | Khi dùng |
|---|---|---|---|
| `bg-background-warning` | `bg-background-warning` | `#fff7ed` | HintBanner background |
| `text-foreground-warning` | `text-foreground-warning` | `#f97316` | HintBanner icon + text emphasis |
| `border-warning` | `border-warning` | `#fed7aa` | HintBanner border |

### §3 State Table

| Element | State | Trigger |
|---|---|---|
| Row 3 expanded | content visible + chevron ▴ | click row 3 trigger |
| Input fields (BKS xe / Ngày / Địa điểm) | empty editable | initial — kế toán nhập tay |
| PartyTable Bên A name | prefilled but editable | from settlement.customerName |
| PartyTable Bên B fields | prefilled but editable | from garage profile |
| ClauseList | 4 default clauses editable | prefill on row open |
| ClauseList add new | append empty editable clause | click "+ Thêm mục điều khoản" |
| HintBanner | always visible | row 3 expanded |

### §4 Component Prop Map

| Component | Layer | Prop | Override |
|---|---|---|---|
| `Alert` (HintBanner) | share/alert | `variant` | `warning` (orange tint) |
| `Input` (form fields) | ui/input | `editable_inline` | `true` (ContentEditable behavior) |
| `ClauseList` | customs/clause-list (nếu có) hoặc inline compose | `numbering` | `decimal` (1./2./3./...) |
| `ClauseList` | — | `add_button.variant` | `outline` + `full_width: true` (PNG-verified centered row button, NOT inline link) |
| `DateInput` | ui/date-input | `format` | `dd/mm/yyyy` |
| `Button` (PrintBtn_BBNT) | share/buttons | `variant` | `brand` (PNG-verified brand blue) |

### §5 Field Composition Schema

```yaml
data_binding:
  source: editable in-session (KHÔNG persist server until export — AC-6 + EC-1)
  prefill:
    partyA.name: from settlement.customerName
    partyB.*: from garage profile (name/representative/position/address/taxId/bankAccount/bankName)
    quotationRef: from quotation (code + date concatenated)
  editable_fields:
    - licensePlate (blank → user input)
    - createdDate (blank → user input)
    - createdLocation (blank → user input)
    - partyA.representative/address/CCCD (blank → user input)
    - all clauseList items (4 prefilled, editable)
  persistence: localStorage trong session; submit to backend only on Export click
```

### §6 Layout Width Table

| Container | Max-width | Notes |
|---|---|---|
| Expanded body | FILL (~640px) | inherit |
| HardcodedHeader | FILL centered | mb-12 |
| HintBanner | FILL | full-width Alert |
| LapBienBan_Row1 | FILL grid 3-col | gap-4 |
| PartyTable | FILL | 2-col table (party 80 + content flex) |
| ClauseList | FILL | 1-col numbered list |
| SignatureBlock | FILL grid 2-col | gap-4 centered |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | Hardcoded NationalHeader + Title "BIÊN BẢN NGHIỆM THU…" | text-sm/600 + text-lg/700 centered | Document official header |
| L2 | HintBanner | bg-warning/30 text-foreground-warning | Editing hint |
| L3 | Section label ("Thông tin các bên") | text-sm/600 | Sub-section (Nội dung nghiệm thu KHÔNG còn là section header — thay bằng intro paragraph 14/400) |
| L4 | Form field label | text-xs muted | Field name |
| L5 | Form field value (Input) | text-sm border-b | Editable inline |
| L4 | Clause numbered text | text-sm/400 | Clause content |
| L3 | SignatureBlock labels | text-sm/500 centered | Signature placeholders |

### §8 Anti-Pattern Trap

| # | Trap | Đúng |
|---|---|---|
| AP-BBNT-1 | DEV render TwoPartiesSection as plain stack (no card wrap) → drift vs PNG | Per PNG (`assets/wave02-ins-dossier-create/13257-537424_expanded-bienbannghiemthu.png` L46-48) = **CARD wrap** với `bg-muted/30` + `border-input` + `rounded-md` + `padding y=12 x=16` around 6 party fields. Heading "Thông tin các bên" rendered INSIDE card top. `_png_verified: "PNG L46 shows gray-tinted card with visible border + rounded corners wrapping 6 horizontal rows; heading inside card same gray bg"` |
| AP-BBNT-2 | HintBanner variant=info (blue) thay vì warning (orange) | PNG renders với orange/yellow tint → `variant="warning"`; KHÔNG dùng `variant="info"` |
| AP-BBNT-3 | Clauses không cho edit text | AC-6 mandate editable_per_clause: kế toán click clause → edit text inline (ContentEditable hoặc Textarea) |
| AP-BBNT-4 | "+ Thêm mục điều khoản" inline link-style hoặc primary brand button | Per PNG BBNT/GUY = **full-width row OUTLINE button** với icon + label centered. DEV apply `<Button variant="outline" className="w-full justify-center">+ Thêm mục điều khoản</Button>` — KHÔNG dùng variant=link (inline subtle) hoặc variant=brand (primary) |
| AP-BBNT-5 | Persist user input immediately on every keystroke | EC-1: persist CHỈ on Export click — local state in modal, KHÔNG server roundtrip per keystroke |
| AP-BBNT-6 | Signature block render input cho ký tên | Per AC-6: KÝ NGOÀI HỆ THỐNG — render placeholder text "Đại diện khách hàng (Ký, ghi rõ họ tên)" + empty space; KHÔNG có Input field |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-dossier-create/13257-537424_expanded-bienbannghiemthu.png
  pngs_read:
    - assets/wave02-ins-dossier-create/13257-537424_expanded-bienbannghiemthu.png
  claims_verified:
    - claim: "Row 3 expanded; rows 1/2 collapsed checked + row 4 collapsed unchecked"
      evidence: "13257-537424 — row 3 takes most modal height, others compact"
    - claim: "Hardcoded national header centered: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM' + 'Độc lập - Tự do - Hạnh phúc' + '-----o0o-----' + title 'BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG'"
      evidence: "13257-537424 — 4-line centered block at top of expanded body, bold title largest"
    - claim: "HintBanner orange/warning bg với icon + text 'Các trường thông tin có thể chỉnh sửa trực tiếp...'"
      evidence: "13257-537424 — orange/peach colored banner with icon below national header"
    - claim: "3-col form row (BKS xe / Ngày lập biên bản / Địa điểm lập biên bản) all empty inputs"
      evidence: "13257-537424 — 3 equal-width input boxes side-by-side"
    - claim: "Thông tin các bên = LIST 6 row dạng [Label w-140 trái | Input full-width phải] — KHÔNG phải table 2-row gộp. Rows: Bên A (KH name) / Bên B (garage name) / Đại diện / Chức vụ / Địa chỉ Công ty / MST/STK/NH (composite)"
      evidence: "13257-537424 + user-supplied Image 1 — 6 distinct rows, mỗi row 1 label trái 1 input phải; field examples: 'Công ty CP XD Smart Building Việt Nam', 'Ông: Vũ Sơn Quân', 'Tổng Giám Đốc', 'MST 0201972206 - STK 19134464547018 - Techcombank Kiến An'"
    - claim: "Intro paragraph 'Hôm nay, tại đơn vị sửa chữa nêu trên, hai bên cùng làm việc và thống nhất nghiệm thu, thanh lý hợp đồng sửa chữa xe theo các nội dung sau:' đứng RIÊNG (NOT a section header) — followed by numbered ClauseList"
      evidence: "13257-537424 — paragraph 14/400 text-foreground, không bold không section-header style; ngay sau là 1.2.3.4 clauses"
    - claim: "ClauseList 4 default items (1./2./3./4.) + '+ Thêm mục điều khoản' as full-width OUTLINE row button (centered, with leading Plus icon) — NOT inline link"
      evidence: "13257-537424 — 4 numbered clauses, full-width add-clause row button below spanning form width, có Plus '+' icon ở trước label"
    - claim: "Signature block grid 2-col: 'Đại diện khách hàng (Ký, ghi rõ họ tên)' | 'Đại diện xưởng sửa chữa (Ký, ghi rõ họ tên)' — placeholder text only, no inputs"
      evidence: "13257-537424 — 2 labeled cells, empty space below cho ký tay"
    - claim: "Action bar right: 'In biên bản' brand blue button only with Printer icon (no Tải PDF — single primary action)"
      evidence: "13257-537424 — single brand-blue button bottom right"
```

### §9 Container Hierarchy

```
AccordionRow_BBNT EXPANDED (13257:537424)
└── content [vertical, gap=16, padding=24_16]
    ├── HardcodedHeader [centered vertical] — National header + title
    ├── HintBanner [Alert variant=warning full-width]
    ├── LapBienBan_Row1 [grid 3-col] — BKS xe / Ngày lập / Địa điểm
    ├── QuotationRef [Input full-width]
    ├── TwoPartiesSection [vertical list, 6 rows × (Label w-140 | Input flex-1)]   # PNG-verified 2026-06-23
    │   ├── Bên A          (prefill settlement.customerName)        # vd "Công ty CP XD Smart Building Việt Nam"
    │   ├── Bên B          (prefill garage.name)                    # vd "Công ty TNHH TM & DV Sơn Quân (Green Auto)"
    │   ├── Đại diện       (prefill garage.representative)          # vd "Ông: Vũ Sơn Quân"
    │   ├── Chức vụ        (prefill garage.position)                # vd "Tổng Giám Đốc"
    │   ├── Địa chỉ Công ty (prefill garage.address)                # vd "Thôn Úc Gián - Xã Thuận Thiên - Kiến Thụy - Hải Phòng"
    │   └── MST / STK / NH (composite: {taxId} - STK {bankAccount} - {bankName})
    ├── BBNT_Section_NoiDungIntro [Text 14/400] — intro paragraph "Hôm nay, tại đơn vị sửa chữa..."
    │   # NOT a section header; directly precedes ClauseList
    ├── NoiDungNghiemThu [ClauseList numbered editable]
    │   └── + Thêm mục điều khoản (link button)
    ├── SignatureBlock [grid 2-col centered]
    └── ActionBar [horizontal, justify=end] — In biên bản (single button)
```

---

## Screen: Modal — Giấy ủy quyền EXPANDED (AC-7) (13257:537605)

> Row 4 "Giấy ủy quyền nhận tiền bồi thường" expanded; rows 1/2 collapsed checked, row 3 collapsed unchecked. Body = EDITABLE TEMPLATE (form-field hybrid). Action: "In giấy ủy quyền" outline.

### §0 ASCII Mockup

```
┌─ Modal ─────────────────────────────────────────────────────────────────┐
│  Hồ sơ bảo hiểm - #SET-20260326-00001                                    │
│ ─────────────────────────────────────────────────────────────────────── │
│  Row 1: Phiếu quyết toán ▾ (☑)                                          │
│  Row 2: Phiếu báo giá ▾ (☑)                                              │
│  Row 3: Biên bản nghiệm thu ▾ (☐)                                       │
│  ┌─ Row 4: Giấy ủy quyền EXPANDED ────────────────────────────────────┐ │
│  │ ☐  Giấy ủy quyền nhận tiền bồi thường                          ▴   │ │
│  │     Áp dụng cho garage chưa ký liên kết với bảo hiểm                │ │
│  │ ───────────────────────────────────────────────────────────────────── │
│  │           CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM            (centered)│ │
│  │           Độc lập - Tự do - Hạnh phúc                              │ │
│  │           -----o0o-----                                            │ │
│  │           GIẤY ỦY QUYỀN                          (title L1)         │ │
│  │  ╔═══════════════════════════════════════════════════════════════╗ │ │
│  │  ║ ⚠ Các trường thông tin có thể chỉnh sửa trực tiếp.            ║ │ │ ← hint warning
│  │  ╚═══════════════════════════════════════════════════════════════╝ │ │
│  │  [An Lão, ngày dd/mm/yyyy___________________________]               │ │
│  │   I. Bên ủy quyền:                                                  │ │
│  │   ┌──────────────────────────┬──────────────────────────────┐     │ │
│  │   │ Họ tên / Tên đơn vị      │ GCN bảo hiểm tự nguyện       │     │ │ ← 2-col grid
│  │   │ (prefill: Cô CP Khế-…)   │ (blank)                       │     │ │
│  │   ├──────────────────────────┼──────────────────────────────┤     │ │
│  │   │ Địa chỉ                  │ Số CCCD                       │     │ │
│  │   │ (blank)                  │ (blank)                       │     │ │
│  │   ├──────────────────────────┼──────────────────────────────┤     │ │
│  │   │ Quốc tịch                │ Đại diện / Chức vụ            │     │ │
│  │   └──────────────────────────┴──────────────────────────────┘     │ │
│  │   II. Bên được ủy quyền:                                             │ │
│  │   ┌──────────────────────────────┬─────────────────────────────────┐│ │ ← grid 2-col × 4-row = 8 fields
│  │   │ Tên garage/Công ty           │ Đại diện                        ││ │
│  │   │ CÔNG TY TNHH TM & DV SƠN QUÂN│ Ông: Vũ Sơn Quân                ││ │ ← prefilled
│  │   │ Địa chỉ                      │ Chức vụ                         ││ │
│  │   │ Thôn Úc Gián - Xã Thuận...   │ Tổng giám đốc                   ││ │
│  │   │ Mã số thuế                   │ Số tài khoản                    ││ │
│  │   │ 0201972206                   │ 19134464547018                  ││ │
│  │   │ Điện thoại                   │ Ngân hàng                       ││ │
│  │   │ 0971.863.090                 │ Techcombank Kiến An             ││ │
│  │   └──────────────────────────────┴─────────────────────────────────┘│ │
│  │   III. Nội dung ủy quyền:                                            │ │
│  │   ┌────── vehicle + compensation 2-col grid (6 fields) ─────────┐   │ │
│  │   IV. Cam kết:                                                      │ │
│  │   1. [Bên ủy quyền cam kết các thông tin trên là chính xác.]       │ │ ← editable clauses
│  │   2. [Bên được ủy quyền cam kết sử dụng số tiền…]                  │ │
│  │   3. [Cả hai bên cùng cam kết tuân thủ quy định…]                  │ │
│  │   [+ Thêm mục điều khoản]                                          │ │
│  │   ───────────────────────────────────────────────────────────────── │
│  │   ┌────────────────────────┬────────────────────────┐              │ │
│  │   │ Đại diện khách hàng    │ Đại diện xưởng sửa chữa│              │ │ ← signatures
│  │   │ (Ký, ghi rõ họ tên)    │ (Ký, ghi rõ họ tên)    │              │ │
│  │   └────────────────────────┴────────────────────────┘              │ │
│  │                                              [In giấy ủy quyền]    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│ ─────────────────────────────────────────────────────────────────────── │
│                                            [Hủy bỏ]  [Xuất hồ sơ BH]    │
└──────────────────────────────────────────────────────────────────────────┘
```

### §1 Layout DSL

```yaml
AccordionRow_GUY_Expanded:
  $ref: AccordionRow_GUY
  expanded: true
  content:
    type: container
    direction: vertical
    gap: 16
    padding: { y: 24, x: 16 }
    children:
      - id: GUY_HardcodedHeader
        type: container
        direction: vertical
        align: center
        children:
          - { type: Text, content: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", size: 14, weight: 600 }
          - { type: Text, content: "Độc lập - Tự do - Hạnh phúc", size: 14 }
          - { type: Text, content: "-----o0o-----", size: 14 }
          - { type: Text, content: "GIẤY ỦY QUYỀN", size: 18, weight: 700, mt: 12 }
      - id: HintBanner
        $ref: BBNT_HintBanner   # same orange warning Alert
      - id: GUY_DateLocation
        type: Input
        placeholder: "An Lão, ngày dd/mm/yyyy"
        editable: true
        source: blank

      - id: Section_I_BenUyQuyen
        type: container
        direction: vertical
        gap: 8
        # R1/R2 v7.4 (post-reviewer remediation 2026-06-24): CARD wrap per PNG L100-130
        BG: bg-muted/30
        Border: 1px solid border-input
        rounded: rounded-md
        padding: { y: 12, x: 16 }
        _png_verified: "assets/wave02-ins-dossier-create/13257-537605_expanded-giayuyquyen.png L100-115 shows gray-tinted card with visible border + rounded corners wrapping Section I heading + 2-col grid form"
        children:
          - { type: Text, content: "I. Bên ủy quyền:", size: 14, weight: 600 }
          - id: PartyForm_I
            type: container
            direction: grid
            cols: 2
            gap: 12
            children:
              - { id: party_name, type: Input, label: "Họ tên / Tên đơn vị", combined: true, prefill: "settlement.customerName", editable: true,
                  _note: "Composite (combined: true) — 1 Input render 'Họ tên' cá nhân HOẶC 'Tên đơn vị' tổ chức (mutually exclusive value)" }
              - { id: party_gcn, type: Input, label: "GCN bảo hiểm tự nguyện / bắt buộc", combined: true, source: blank,
                  _note: "Composite (combined: true) — slash '/' = 1 Input nhập GCN BH 'tự nguyện' hoặc 'bắt buộc'. Không split 2 Input." }
              - { id: party_address, type: Input, label: "Địa chỉ", combined: false, source: blank }
              - { id: party_cccd, type: Input, label: "Số CMND/CCCD · Ngày cấp · Nơi cấp", combined: true, source: blank,
                  _note: "Composite (combined: true) — 1 Input gộp 3 phần ngăn bằng ' · ': số CCCD, ngày cấp, nơi cấp" }
              - { id: party_nationality, type: Input, label: "Quốc tịch", combined: false, source: blank }
              - { id: party_representative, type: Input, label: "Đại diện / Chức vụ", combined: true, source: blank,
                  _note: "Composite (combined: true) — slash '/' = 1 Input gộp tên đại diện + chức vụ. Không split 2 Input." }

      - id: Section_II_DuocUyQuyen
        type: container
        direction: vertical
        gap: 8
        # R1/R2 v7.4 (post-reviewer remediation 2026-06-24): CARD wrap per PNG L115-130
        BG: bg-muted/30
        Border: 1px solid border-input
        rounded: rounded-md
        padding: { y: 12, x: 16 }
        _png_verified: "PNG L115-130 shows gray-tinted card with visible border wrapping Section II heading + 2-col×4-row grid"
        children:
          - { type: Text, content: "II. Bên được ủy quyền:", size: 14, weight: 600 }
          # PNG-verified anatomy 2026-06-23 (Image 2): grid 2-col × 4-row = 8 fields (KHÔNG dùng shorthand `fields: [...]`)
          # Row 1: Tên garage/Công ty (prefill, span full input) | Đại diện (prefill)
          # Row 2: Địa chỉ (prefill, text dài có thể truncate "...") | Chức vụ (prefill)
          # Row 3: Mã số thuế (prefill, numeric) | Số tài khoản (prefill, numeric)
          # Row 4: Điện thoại (prefill, formatted "0971.863.090") | Ngân hàng (prefill, vd "Techcombank Kiến An")
          - id: PartyForm_II
            type: container
            direction: grid
            cols: 2
            gap: { col: 24, row: 16 }
            children:
              - id: garage_name
                type: Input
                label: "Tên garage / Công ty"
                combined: true                              # slash '/' = 1 Input render 'Tên garage' HOẶC 'Tên công ty' (single value)
                prefill: "garage.name"                       # vd "CÔNG TY TNHH TƯ VẤN TM & DV SƠN QUÂN"
                editable: true
                _note: "Composite (combined: true) — slash separator label ngụ ý mutually exclusive semantics (garage HOẶC công ty), KHÔNG split 2 Input."
              - id: garage_representative
                type: Input
                label: "Đại diện"
                prefill: "garage.representative"             # vd "Ông: Vũ Sơn Quân"
                editable: true
              - id: garage_address
                type: Input
                label: "Địa chỉ"
                prefill: "garage.address"                    # vd "Thôn Úc Gián - Xã Thuận Thiên - Kiến Thụy - Hải P..."
                editable: true
                text_overflow: ellipsis                       # design hiển thị "..." khi text dài hơn input width
              - id: garage_position
                type: Input
                label: "Chức vụ"
                prefill: "garage.position"                   # vd "Tổng giám đốc"
                editable: true
              - id: garage_taxId
                type: Input
                label: "Mã số thuế"
                prefill: "garage.taxId"                      # vd "0201972206"
                editable: true
                format: numeric
              - id: garage_bankAccount
                type: Input
                label: "Số tài khoản"
                prefill: "garage.bankAccount"                # vd "19134464547018"
                editable: true
                format: numeric
              - id: garage_phone
                type: Input
                label: "Điện thoại"
                prefill: "garage.phone"                      # vd "0971.863.090" (formatted with dots)
                editable: true
                format: phone
              - id: garage_bankName
                type: Input
                label: "Ngân hàng"
                prefill: "garage.bankName"                   # vd "Techcombank Kiến An"
                editable: true

      - id: Section_III_NoiDung
        type: container
        direction: vertical
        gap: 8
        # R1/R2 v7.4 (post-reviewer remediation 2026-06-24): CARD wrap per PNG L130-150
        BG: bg-muted/30
        Border: 1px solid border-input
        rounded: rounded-md
        padding: { y: 12, x: 16 }
        _png_verified: "PNG L130-150 shows gray-tinted card with visible border wrapping Section III heading + 2-col grid form"
        children:
          - { type: Text, content: "III. Nội dung ủy quyền:", size: 14, weight: 600 }
          - id: NoiDungForm
            type: container
            direction: grid
            cols: 2
            gap: 12
            children:
              - { id: vehicle_brand, type: Input, label: "Loại xe", prefill: "settlement.vehicleBrand" }
              - { id: vehicle_plate, type: Input, label: "Biển kiểm soát", prefill: "settlement.vehiclePlate" }
              - { id: compensation_value, type: Input, label: "Số tiền bồi thường (VND)", prefill: "settlement.compensationAmount", format: vnd }
              - { id: compensation_words, type: Input, label: "Bằng chữ", prefill: "settlement.compensationWords" }
              - { id: accident_date, type: DateInput, label: "Ngày tai nạn", source: blank }
              - { id: accident_content, type: Textarea, label: "Nội dung", source: blank }

      - id: Section_IV_CamKet
        type: ClauseList
        title: "IV. Cam kết:"
        _renders_as: "h3 text-sm/600 roman-numeral section header"   # R7 — title RENDERS visually (PNG L1498 §0 ASCII shows "IV. Cam kết:")
        default_clauses:
          - "Bên ủy quyền cam kết các thông tin trên là chính xác."
          - "Bên được ủy quyền cam kết sử dụng số tiền bồi thường đúng mục đích sửa chữa xe."
          - "Cả hai bên cùng cam kết tuân thủ quy định pháp luật hiện hành."
        add_button:
          label: "+ Thêm mục điều khoản"
          variant: outline
          full_width: true
          align: center
          icon_leading: { source: lucide-react, name: Plus, size: 16, color: text-foreground }   # icon "+" tường minh
          _png_verified: "Full-width row button với leading Plus icon + label centered"
        editable_per_clause: true

      - id: SignatureBlock
        $ref: BBNT_SignatureBlock     # same 2-col layout, KH | garage
      - id: ActionBar
        type: container
        direction: horizontal
        justify: end
        children:
          - { id: PrintBtn_GUY, type: Button, variant: brand, label: "In giấy ủy quyền", icon_leading: { source: lucide-react, name: Printer, size: 16 } }

_negative_coverage:
  # R8 — element class inspected + ruled out cho GUY expanded
  - "Section I/II/III RENDER as CARDS (bg-muted/30 + border-input + rounded-md) per PNG L100-130; Section IV CamKet là exception duy nhất — prose numbered list, no card (AP-GUY-1 polarity inverted post-reviewer 2026-06-24)"
  - "KHÔNG có 'thanh lý hợp đồng' suffix on title — chỉ 'GIẤY ỦY QUYỀN' (PNG L1471, distinguishes vs BBNT 'BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG')"
  - "KHÔNG có split 'An Lão' location + ngày separately — single Input free-text với placeholder 'An Lão, ngày dd/mm/yyyy' (AP-GUY-3)"
  - "KHÔNG có VND auto-convert button (compensation value → Bằng chữ) — user nhập tay HOẶC backend prefill (DEV verify with BA)"
  - "KHÔNG có Save / Lưu nháp button trong body — persist on Export only"
  - "KHÔNG có signature pad / canvas — ký ngoài hệ thống, render label placeholder only"
  - "KHÔNG có 'In + xuất PDF cùng lúc' button — chỉ 1 'In giấy ủy quyền' brand button"
  - "KHÔNG có 'Save as template' / 'Use saved template' button — không có template management UI in scope"
  - "KHÔNG có drag handle trên Section IV ClauseList items — reorder không cho phép (AP-8 pattern)"
  - "KHÔNG có Section header collapse/expand toggle (I/II/III/IV) — sections luôn expanded khi accordion row 4 mở"
```

### §2 Design Token Map

Reuse BBNT screen §2 (same hint banner + form field tokens). No unique tokens.

### §3 State Table

| Element | State | Trigger |
|---|---|---|
| Row 4 expanded | content visible + chevron ▴ | click row 4 trigger |
| Section I "Bên ủy quyền" — party_name | prefilled but editable | from settlement.customerName |
| Other Section I fields | blank editable | user input |
| Section II "Bên được ủy quyền" — all fields | prefilled editable | from garage profile |
| Section III — vehicle / compensation fields | prefilled editable | from settlement.vehicle + compensation |
| Section III — accident_date / accident_content | blank editable | user input |
| Section IV ClauseList | 3 default clauses editable | prefill on expand |

### §4 Component Prop Map

Reuse BBNT screen §4 (Alert warning, Input editable, ClauseList numbering). 

| Component | Override (GUY-specific) |
|---|---|
| Section headers | I./II./III./IV. roman numeral prefix |
| `PrintBtn` | label = "In giấy ủy quyền" (vs "In biên bản") |

### §5 Field Composition Schema

```yaml
data_binding:
  source: editable in-session (KHÔNG persist server until export)
  prefill:
    party_name: from settlement.customerName (Section I)
    Section_II_fields: from garage profile (8 fields)
    vehicle_brand/plate: from settlement.vehicle
    compensation_value/words: from settlement.compensationAmount
  editable_fields:
    - GUY_DateLocation (blank → user input)
    - Section I: address / nationality / representative / GCN / CCCD (blank)
    - Section II: all 8 garage fields (prefilled but editable)
    - Section III: accident_date / accident_content (blank)
    - all Section IV clauses (3 prefilled, editable)
  persistence: localStorage trong session; submit on Export
  print_template: NO template service — render từ form state on print/export
```

### §6 Layout Width Table

| Container | Max-width | Notes |
|---|---|---|
| Expanded body | FILL (~640px) | inherit |
| HardcodedHeader | FILL centered | mb-12 |
| HintBanner | FILL | full-width Alert |
| GUY_DateLocation | FILL | single-line Input |
| Section_I/II/III forms | FILL grid 2-col | gap-3 |
| Section_IV ClauseList | FILL | numbered list |
| SignatureBlock | FILL grid 2-col | centered labels |

### §7 Visual Hierarchy Map

Reuse BBNT §7 với differences:
| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | Title "GIẤY ỦY QUYỀN" | text-lg/700 centered | Document title |
| L3 | Section headers "I. ... II. ... III. ... IV. ..." | text-sm/600 with roman numeral | Numbered sections |
| L4-L5 | Form field grid + values | label text-xs muted + input text-sm | Editable field groups |

### §8 Anti-Pattern Trap

| # | Trap | Đúng |
|---|---|---|
| AP-GUY-1 | DEV render Sections I/II/III as plain stack (no card chrome) → drift vs PNG | Per PNG (`assets/wave02-ins-dossier-create/13257-537605_expanded-giayuyquyen.png` L100-130) = **CARD wrap per Section I/II/III** với `bg-muted/30` + `border-input` + `rounded-md` containing 2-col grid form. **Section IV CamKet là exception duy nhất** — prose numbered list, no card. `_png_verified: "PNG L100-130 shows 3 gray-tinted cards (I/II/III) each with border + rounded; Section IV below sections renders as plain numbered list without card"` |
| AP-GUY-2 | Section I party_name không prefill từ settlement.customerName | AC-7 + BR-INS-DOSSIER-003: Họ tên/Tên đơn vị **prefill from settlement.customerName** (RO-ish — editable nhưng nguồn rõ ràng) |
| AP-GUY-3 | Date input "An Lão, ngày..." render thành 2 separate inputs (location + date) thay vì 1 free-text Input | Per design = single Input field với placeholder "An Lão, ngày dd/mm/yyyy" — kế toán nhập toàn bộ string |
| AP-GUY-4 | Section IV cam kết render numbered ordered list từ HTML <ol> mà KHÔNG cho edit text | Per AC-7: editable_per_clause = true; ContentEditable per clause |
| AP-GUY-5 | Persist on every keystroke | EC-1 — chỉ persist when Export click |
| AP-GUY-6 | Compensation value KHÔNG format VND | Apply `format: vnd` (1,234,567đ) cho input + auto-derive "Bằng chữ" hoặc cho user nhập tay |

### §VV Visual Verification Pass

```yaml
visual_ingest:
  reviewer: main-orchestrator
  screenshot: assets/wave02-ins-dossier-create/13257-537605_expanded-giayuyquyen.png
  pngs_read:
    - assets/wave02-ins-dossier-create/13257-537605_expanded-giayuyquyen.png
  claims_verified:
    - claim: "Row 4 (Giấy ủy quyền) expanded; rows 1/2 collapsed checked + row 3 collapsed unchecked"
      evidence: "13257-537605 — row 4 tall body visible at bottom of modal, rows 1-3 compact above"
    - claim: "Hardcoded national header centered + title 'GIẤY ỦY QUYỀN' (no full thanh lý hợp đồng suffix like BBNT)"
      evidence: "13257-537605 — 4-line centered header, last line is just 'GIẤY ỦY QUYỀN' bold"
    - claim: "Same HintBanner orange/warning pattern as BBNT"
      evidence: "13257-537605 — orange banner with edit hint right below national header"
    - claim: "Single 'An Lão, ngày dd/mm/yyyy' input single-line (NOT split into location + date)"
      evidence: "13257-537605 — single text input row before sections"
    - claim: "Sections I/II/III RENDER as CARDS (bg-muted/30 + border-input + rounded-md) containing 2-col grid form; Section IV CamKet is the ONLY section without card (prose numbered list)"
      evidence: "13257-537605 — 3 gray-tinted cards stacked vertically (Sections I/II/III) with visible border + rounded corners; Section IV below appears as plain numbered list, no card chrome (polarity corrected 2026-06-24 post-reviewer)"
    - claim: "Section I fields layout 2-col grid: Họ tên/Tên đơn vị (prefilled) + GCN BH + Địa chỉ + Số CCCD + Quốc tịch + Đại diện/Chức vụ (6 fields total)"
      evidence: "13257-537605 — Section I has 6 form fields in 2-col grid"
    - claim: "Section II 'Bên được ủy quyền' = grid 2-col × 4-row = 8 fields all prefilled garage profile: Tên garage/Công ty | Đại diện · Địa chỉ | Chức vụ · Mã số thuế | Số tài khoản · Điện thoại | Ngân hàng"
      evidence: "User-supplied Image 2 — 8 distinct prefilled fields in 4-row 2-col grid; field values 'CÔNG TY TNHH TƯ VẤN TM & DV SƠN QUÂN', 'Ông: Vũ Sơn Quân', 'Thôn Úc Gián - Xã Thuận Thiên - Kiến Thụy - Hải P...', 'Tổng giám đốc', '0201972206', '19134464547018', '0971.863.090', 'Techcombank Kiến An'"
    - claim: "Section IV cam kết = numbered list (1./2./3.) with editable clauses + '+ Thêm mục điều khoản' as full-width OUTLINE row button (centered, with leading Plus icon) — NOT inline link"
      evidence: "13257-537605 — 3 numbered clauses + full-width add-clause row button spanning form width với Plus '+' icon"
    - claim: "Signature block grid 2-col same as BBNT — KH | garage labels only, no inputs"
      evidence: "13257-537605 — 2 labeled signature cells at bottom"
    - claim: "Action bar right: 'In giấy ủy quyền' brand blue button only with Printer icon"
      evidence: "13257-537605 — single brand-blue button bottom right with Printer icon"
```

### §9 Container Hierarchy

```
AccordionRow_GUY EXPANDED (13257:537605)
└── content [vertical, gap=16, padding=24_16]
    ├── HardcodedHeader [centered] — National + "GIẤY ỦY QUYỀN" title
    ├── HintBanner [Alert variant=warning full-width]
    ├── GUY_DateLocation [Input single-line]
    ├── Section_I_BenUyQuyen
    │   ├── Section header "I. Bên ủy quyền:"
    │   └── PartyForm_I [grid 2-col, 6 fields]
    ├── Section_II_DuocUyQuyen
    │   ├── Section header "II. Bên được ủy quyền:"
    │   └── PartyForm_II [grid 2-col, 8 garage fields]
    ├── Section_III_NoiDung
    │   ├── Section header "III. Nội dung ủy quyền:"
    │   └── NoiDungForm [grid 2-col, 6 fields]
    ├── Section_IV_CamKet [ClauseList numbered editable]
    │   └── + Thêm mục điều khoản (link)
    ├── SignatureBlock [grid 2-col centered]
    └── ActionBar [horizontal, justify=end] — In giấy ủy quyền
```

---

## Screenshots

| Path | Node | Purpose |
|---|---|---|
| `assets/wave02-ins-dossier-create/13257-536881_2-of-4-ready.png` | Frame 13257:536881 (1440×1983) | Demo state: 2/4 checkboxes checked (Phiếu QT + Phiếu báo giá auto-ready); modal all collapsed |
| `assets/wave02-ins-dossier-create/13257-555266_4-of-4-ready.png` | Frame 13257:555266 (1440×1983) | Demo state: 4/4 checkboxes checked; ExportButton enabled |
| `assets/wave02-ins-dossier-create/13257-558976_expanded-phieuquyettoan.png` | Frame 13257:558976 (1440×1983) | Row 1 EXPANDED — Phiếu quyết toán print preview (read-only, AC-4) |
| `assets/wave02-ins-dossier-create/13257-537243_expanded-phieubaogia.png` | Frame 13257:537243 (1440×1983) | Row 2 EXPANDED — Phiếu báo giá print preview (read-only, AC-5) |
| `assets/wave02-ins-dossier-create/13257-537424_expanded-bienbannghiemthu.png` | Frame 13257:537424 (1440×2232) | Row 3 EXPANDED — Biên bản nghiệm thu editable template (AC-6) |
| `assets/wave02-ins-dossier-create/13257-537605_expanded-giayuyquyen.png` | Frame 13257:537605 (1440×2560) | Row 4 EXPANDED — Giấy ủy quyền editable template (AC-7) |

> Note: variant frames (13257:537062 Phiếu QT v2, 13257:563286 Biên bản v2, 13257:564782 Giấy ủy quyền v2) chứa SAME visual layout với data variants — gộp vào 4 unique expanded screens trên. Không capture riêng (pixel-equivalent layout per visual ingest comparison).
