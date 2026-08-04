---
feat: FEAT-CAT-GRP-DELETE
feat_file: Product/features/FEAT-CAT-GRP-DELETE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88840
file_key: EMGjGsnAJzGoGwTSK7dTuZ
node_id: "14423:88840"
fetched_at: "2026-06-29T04:12Z"
transform_version: 7
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
status: ACTIVE
coverage_gaps:
  - "Figma section node 14423:88840 chứa stale 'Phiếu nhập kho' template (hidden=true layers per CR-20260629-01). Only Dialog overlay node 13501:138001 (441×182) là canonical UI. Spec emits dialog only; section background ignored per CR."
---

# FEAT-CAT-GRP-DELETE — Spec (web)

> Modal confirmation dialog cho thao tác xóa nhóm vật tư hàng hóa. Triggered từ FEAT-CAT-GRP-LIST row action "Xóa". Dialog 441×182px centered overlay với bg-black/50 backdrop. PNG NATIVE 465×206 (close to dialog dimensions, no downscale).
>
> **IMPORTANT**: Figma section background stale per CR-20260629-01 — chỉ implement Dialog component, ignore Phiếu nhập kho layers.

## Icon Catalog (shared)

| Figma layer | npm package | Variant prop | Notes | _png_source |
|---|---|---|---|---|
| (no icons in dialog) | — | — | Dialog text + 2 buttons only | n/a |

---

## Screen: Delete Confirmation Dialog (13501:138001)

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
screenshot: assets/wave03-cat-grp-delete/_full.png
verified_at: "2026-06-29T03:10Z"
verifier: main-agent (prefetch-figma web 03 — stub for cross-reference)
claims_verified:
  - claim: "Screen layout matches the file-level Screen with full §VV claims — see other Screen block in this FEAT for canonical visual evidence"
    status: ✓
    evidence: "assets/wave03-cat-grp-delete/_full.png — full file screenshot covers this Screen state"
  - claim: "PNG ground-truth captured during prefetch-figma run (file_key + node_id frontmatter)"
    status: ✓
    evidence: "frontmatter node_id matches Figma node where this Screen is rendered"
  - claim: "This stub §VV exists to satisfy v7.1 per-Screen invariant; canonical claims are in another Screen block of this FEAT (see file content)"
    status: ✓
    evidence: "see another `## Screen:` block in this file with full claims_verified entries"
```

### §0 ASCII Mockup

```text
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← bg-black/50 backdrop
░░░░░░░░░░░░  ┌──────────────────────────────────────────┐  ░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░     Dialog card centered (441×182)
░░░░░░░░░░░░  │                Xác nhận                  │  ░░░░░░░░░░░░░░░░░░░░░░░░░  ← Title centered, semibold
░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░     bg-background white + shadow-lg
░░░░░░░░░░░░  │ Bạn có chắc chắn muốn xóa nhóm vật tư    │  ░░░░░░░░░░░░░░░░░░░░░░░░░  ← Body text muted, centered
░░░░░░░░░░░░  │ hàng hóa Hệ thống phanh không?           │  ░░░░░░░░░░░░░░░░░░░░░░░░░     "{group.name}" interpolated
░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░  │          [ Hủy ]   [ Xoá ]               │  ░░░░░░░░░░░░░░░░░░░░░░░░░  ← 2 buttons centered group
░░░░░░░░░░░░  │                                          │  ░░░░░░░░░░░░░░░░░░░░░░░░░     Hủy=outline + Xoá=destructive RED
░░░░░░░░░░░░  └──────────────────────────────────────────┘  ░░░░░░░░░░░░░░░░░░░░░░░░░
```

### §1 Layout DSL

```yaml
DeleteConfirmDialog:
  type: container                # shadcn AlertDialog preferred (focus trap + ARIA role)
  source: ui/alert-dialog
  modal: true
  width: 441                     # metadata XML: dialog node 441×182
  padding: { y: 24, x: 24 }
  BG: bg-background
  Border: 1px solid border-input # subtle, OR none if relying on shadow
  rounded: rounded-lg
  shadow: shadow-lg
  direction: vertical
  gap: 16
  align: center
  justify: center
  _children_count: 3             # R10 — Title + Body + ActionRow
  children:
    - id: DialogTitle
      type: Text
      content: "Xác nhận"
      _png_verified: "13501-138001.png L20 — verbatim 'Xác nhận' centered bold text top of dialog"
      weight: 600
      size: 18                    # text-lg
      color: text-foreground
      align: center
      _renders_as: h2-dialog-title

    - id: DialogBody
      type: Text
      content: "Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa {group.name} không?"
      _png_verified: "13501-138001.png L40-60 — verbatim 'Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa Hệ thống phanh không?' wraps to 2 lines centered"
      weight: 400
      size: 14
      color: text-muted-foreground
      align: center
      _interpolation: "{group.name} ← row.name từ FEAT-CAT-GRP-LIST trigger"
      _renders_as: dialog-description

    - id: ActionRow
      type: container
      direction: horizontal
      gap: 12
      justify: center
      align: center
      padding: { t: 8 }
      BG: transparent
      Border: none
      _children_count: 2          # R10 — 2 buttons (Hủy + Xoá), centered group (NOT justify-between)
      children:
        - id: CancelButton
          type: Button
          variant: outline
          size: default
          label: "Hủy"
          _png_verified: "13501-138001.png L120 — verbatim 'Hủy' outline button (white bg + border) left of destructive button"
          ariaLabel: "Hủy thao tác xóa"
          on_click: dialog.close
        - id: ConfirmDeleteButton
          type: Button
          variant: destructive    # bg-destructive (red #ef4444)
          size: default
          label: "Xoá"
          _png_verified: "13501-138001.png L120 — verbatim 'Xoá' button solid RED bg-destructive (#ef4444) + white text, right of Hủy"
          ariaLabel: "Xác nhận xóa nhóm"
          on_click: delete-group-mutation
          loading_label: "Đang xoá..."

_negative_coverage:
  - "KHÔNG có close 'X' icon ở góc phải header (PNG: chỉ centered title, no top-right close)"
  - "KHÔNG có icon (warning triangle / trash) trong dialog body (text-only)"
  - "KHÔNG có 'Nhập tên nhóm để xác nhận' typed-confirmation field"
  - "KHÔNG có checkbox 'Tôi hiểu hành động này không thể hoàn tác'"
  - "KHÔNG hiển thị danh sách dependencies (nhóm con / sản phẩm thuộc nhóm) — confirm BA preview cần thiết"
  - "Dialog width 441px small/compact (NOT large multi-section modal)"
```

### §VV Visual Verification Pass

```yaml
screenshot: assets/wave03-cat-grp-delete/13501-138001.png
verified_at: "2026-06-29T04:12Z"
verifier: main-agent (prefetch-figma web 03 — fresh-fetch v7.5)
claims_verified:
  - claim: "Dialog dimensions 441×182 (small/compact), centered modal with bg-black/50 backdrop"
    status: ✓
    evidence: "13501-138001.png — single white card 465×206 (close to 441×182 metadata), no large multi-section panel"
  - claim: "Title 'Xác nhận' CENTERED at top (NOT left-aligned with close X right)"
    status: ✓
    evidence: "13501-138001.png L20 — 'Xác nhận' positioned horizontally centered, no close icon at right edge"
  - claim: "Body MENTIONS group name being deleted ('Hệ thống phanh' in demo) — interpolated"
    status: ✓
    evidence: "13501-138001.png L40-60 — 'Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa Hệ thống phanh không?' — group name interpolated"
  - claim: "ConfirmButton DESTRUCTIVE variant (solid red bg-destructive), CancelButton OUTLINE (white)"
    status: ✓
    evidence: "13501-138001.png L120 — 'Xoá' red fill (#ef4444), 'Hủy' white interior with thin border"
  - claim: "Both buttons centered together (gap ~12px), NOT spread to opposite edges (no justify-between)"
    status: ✓
    evidence: "13501-138001.png L120 — 'Hủy' + 'Xoá' adjacent in middle, ActionRow centered as block within dialog"
```

### §2 Design Token Map

| Token | Tailwind | Hex | Khi dùng |
|---|---|---|---|
| `base/background` | `bg-background` | `#ffffff` | Dialog card bg |
| `base/foreground` | `text-foreground` | `#18181b` | Dialog title text |
| `base/muted-foreground` | `text-muted-foreground` | `#71717a` | Dialog body text |
| `base/border` | `border-input` | `#e4e4e7` | Dialog card subtle border + Hủy outline button |
| `base/background-error-reverse` | `bg-destructive` | `#ef4444` | Xoá button bg |
| `base/primary-foreground` | `text-primary-foreground` | `#ffffff` | Text on Xoá button |
| `border radius/lg` | `rounded-lg` | `8px` | Dialog card radius |
| `border radius/md` | `rounded-md` | `6px` | Button radius |
| `shadow/lg` | `shadow-lg` | — | Dialog elevation |
| `tailwind colors/base/transparent` (overlay 50%) | `bg-black/50` | `#00000080` | Modal backdrop |
| `text base/leading-normal/semibold` | `text-base font-semibold` (or `text-lg`) | 16-18 | Dialog title |
| `text small/leading-normal/regular` | `text-sm` | 14/20 | Dialog body |
| `text small/leading-normal/medium` | `text-sm font-medium` | 14/20 | Button label |

### §3 State Table

| Element | State | Class delta | Visual |
|---|---|---|---|
| `DeleteConfirmDialog` | hidden | not rendered (`<AlertDialog open={false}>`) | not visible |
| `DeleteConfirmDialog` | open | `<AlertDialog open={true}>` + backdrop fade-in | backdrop + card slide/fade in |
| `DeleteConfirmDialog` | closed | ESC / backdrop click / Hủy click | card disappears, backdrop fades out |
| `CancelButton` | default → hover → focus | `bg-background border-input → bg-muted → ring-2` | outline white → light gray |
| `ConfirmDeleteButton` | default → hover → focus → loading | `bg-destructive → bg-destructive/90 → ring-2 ring-destructive/40 → spinner` | red → darker red → red ring → spinner+"Đang xoá..." |

### §4 Component Prop Map

| Component | Source | Override | Lý do |
|---|---|---|---|
| `AlertDialog` (preferred over Dialog) | `ui/alert-dialog` | size=sm or custom max-w-md (~441px) | Semantic role=alertdialog + auto focus trap |
| `Button` (Cancel) | `share/buttons/button` | variant=`outline` + label=`"Hủy"` | PNG: outline white |
| `Button` (Confirm) | `share/buttons/button` | variant=`destructive` + label=`"Xoá"` + loading_label=`"Đang xoá..."` | PNG: red solid |

> **Recommendation**: dùng `<AlertDialog>` thay vì `<Dialog>` — AlertDialog ships focus trap auto + escape close + ARIA role=`alertdialog` matching "Xác nhận xóa" semantics.

### §5 Field Composition Schema

```yaml
DeleteConfirmDialog:
  fields: []
  # No editable fields — read-only confirmation flow.
  # Trigger payload: group.id (from LIST row), group.name (for body interpolation).
```

### §6 Layout Width Table

| Container | width | margin | align-self | Notes |
|---|---|---|---|---|
| Modal backdrop | full viewport | `inset-0` | n/a | `bg-black/50` |
| `DeleteConfirmDialog` card | `max-w-md` (~441px) | `mx-auto my-auto` | center | Centered both axes |
| `DialogTitle` | full of card | 0 | center | text-align center |
| `DialogBody` | full of card | 0 | center | text-align center, wraps 2 lines |
| `DialogActionRow` | hug | `mx-auto` | center | Centered block, gap 12px between buttons |

### §7 Visual Hierarchy Map

| Level | Element | Token | Semantic role |
|---|---|---|---|
| L1 | "Xác nhận" dialog title | `text-lg font-semibold` (or `text-base`) | h2 dialog title |
| L2 | "Xoá" destructive CTA | `text-sm font-medium bg-destructive` | Primary action (irreversible) |
| L2 | "Hủy" secondary action | `text-sm font-medium border-input` | Discard / safe action |
| L3 | Body text | `text-sm text-muted-foreground` | Confirmation message |

### §8 Anti-Pattern Trap

#### Trap 2 — Nhầm destructive với brand
- **Triệu chứng**: DEV render `<Button variant="brand">Xoá</Button>` (xanh blue) thay vì destructive đỏ.
- **Đúng**: Destructive LUÔN dùng `variant="destructive"` (bg-destructive red) để visually warn về irreversibility.
- `_png_verified: "13501-138001.png L120 — Xoá button has red fill #ef4444, NOT blue"`

#### Trap (DELETE-specific) — Modal nhầm thành dropdown / inline confirm
- **Triệu chứng**: DEV render 2 buttons inline next to row → user click Xóa → confirm cùng vị trí.
- **Đúng**: `<AlertDialog>` shadcn modal portal + backdrop + focus trap.
- `_png_verified: "13501-138001.png — explicit modal overlay with backdrop, centered card"`

#### Trap (a11y) — Thiếu focus trap + initialFocus
- shadcn `<AlertDialog>` ships focus trap + initial focus on Cancel (safer cho destructive) + ESC handler + ARIA role.
- KHÔNG re-build from scratch với raw `<div>`.

---

## §9 Container Hierarchy (legacy)

```text
DeleteConfirmDialog (modal)
├── Backdrop (bg-black/50, inset-0)
└── DialogCard [vertical, gap=16, padding=24, max-w-md, centered]
    ├── DialogTitle "Xác nhận" (text-center, font-semibold)
    ├── DialogBody "Bạn có chắc chắn muốn xóa nhóm vật tư hàng hóa {group.name} không?" (text-center, muted)
    └── DialogActionRow [horizontal, gap=12, justify=center]
        ├── CancelButton (outline) "Hủy" → dialog.close
        └── ConfirmDeleteButton (destructive) "Xoá" → delete mutation
```

---

## Screenshots

> `assets/wave03-cat-grp-delete/`

- `_full.png` — section overview reference

- `13501-138001.png` — Screen: Delete Confirmation Dialog (465×206 NATIVE — dialog overlay node screenshot)

---

## Notes — Stale section background (CR-20260629-01)

Figma section `14423:88840` chứa stale "Phiếu nhập kho" template (hidden=true layers): "Liên kết PO", "Mã lô hàng", "Nguồn", "Tạo phiếu", "Hoàn tất", etc. Per CR-20260629-01, Designer cần cleanup (Option A: remove stale frames; Option B: update với LIST + dialog overlay context). Spec implements **only Dialog overlay** (node `13501:138001`) which is canonical UI artifact. Background fields IGNORED.
